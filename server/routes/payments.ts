import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { recordAuditLog, createNotification } from '../services/audit';

const router = Router();

function generatePaymentId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${rand}`;
}

// Get payments list
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { retailerId } = req.query;

  try {
    let where: any = {};
    if (retailerId) where.retailerId = String(retailerId);

    if (user.role === 'retailer') {
      const retailer = await prisma.retailer.findUnique({ where: { userId: user.id } });
      if (!retailer) return res.json([]);
      where.retailerId = retailer.id;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        retailer: true,
        order: true,
        collectedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { date: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Record new payment (Accountant & Distributor)
router.post('/', authenticateJWT, requireRoles(['accountant', 'distributor']), async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { retailerId, orderId, amount, mode, referenceNo } = req.body;

  if (!retailerId || !amount || Number(amount) <= 0 || !mode) {
    return res.status(400).json({ error: 'Retailer, positive amount, and payment mode are required' });
  }

  const paymentAmount = Number(amount);

  try {
    const retailer = await prisma.retailer.findUnique({ where: { id: retailerId } });
    if (!retailer) return res.status(404).json({ error: 'Retailer not found' });

    const paymentId = generatePaymentId();

    const payment = await prisma.payment.create({
      data: {
        id: paymentId,
        retailerId,
        orderId: orderId || null,
        amount: paymentAmount,
        mode,
        referenceNo: referenceNo || null,
        status: 'Completed',
        collectedByStaffId: user.id,
      },
      include: {
        retailer: true,
        order: true,
      },
    });

    // 1. Update Retailer outstanding balance
    const newOutstanding = Math.max(0, retailer.outstandingBalance - paymentAmount);
    await prisma.retailer.update({
      where: { id: retailerId },
      data: { outstandingBalance: newOutstanding },
    });

    // 2. If orderId is linked, update order paid amount & payment status
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order) {
        const newPaid = order.paidAmount + paymentAmount;
        let newPaymentStatus = order.paymentStatus;
        if (newPaid >= order.totalAmount) {
          newPaymentStatus = 'Paid';
        } else if (newPaid > 0) {
          newPaymentStatus = 'Partial';
        }

        await prisma.order.update({
          where: { id: orderId },
          data: {
            paidAmount: newPaid,
            paymentStatus: newPaymentStatus,
          },
        });
      }
    }

    // 3. Audit Log & Notifications
    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'PAYMENT_RECORDED',
      entity: `Payment: ${payment.id}`,
      details: `Recorded ₹${paymentAmount.toLocaleString()} via ${mode} from ${retailer.shopName}. New outstanding: ₹${newOutstanding.toLocaleString()}`,
    });

    await createNotification({
      targetRole: 'distributor',
      title: 'Payment Received',
      message: `₹${paymentAmount.toLocaleString()} received from ${retailer.shopName} (${mode}). Handled by ${user.name}.`,
      type: 'payment',
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Accounts Aging Report (0-30, 31-60, 61-90, 90+ days)
router.get('/reports/aging', authenticateJWT, requireRoles(['accountant', 'distributor']), async (req: AuthRequest, res: Response) => {
  try {
    const retailers = await prisma.retailer.findMany({
      where: { outstandingBalance: { gt: 0 } },
      include: {
        orders: {
          where: { paymentStatus: { in: ['Unpaid', 'Partial', 'Overdue'] } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const now = new Date().getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    let total0to30 = 0;
    let total31to60 = 0;
    let total61to90 = 0;
    let total90Plus = 0;

    const retailerBreakdown = retailers.map((r) => {
      let b0to30 = 0;
      let b31to60 = 0;
      let b61to90 = 0;
      let b90Plus = 0;

      for (const ord of r.orders) {
        const orderAgeDays = Math.floor((now - new Date(ord.createdAt).getTime()) / dayMs);
        const unpaidAmount = ord.totalAmount - ord.paidAmount;

        if (orderAgeDays <= 30) {
          b0to30 += unpaidAmount;
        } else if (orderAgeDays <= 60) {
          b31to60 += unpaidAmount;
        } else if (orderAgeDays <= 90) {
          b61to90 += unpaidAmount;
        } else {
          b90Plus += unpaidAmount;
        }
      }

      total0to30 += b0to30;
      total31to60 += b31to60;
      total61to90 += b61to90;
      total90Plus += b90Plus;

      return {
        id: r.id,
        shopName: r.shopName,
        ownerName: r.ownerName,
        phone: r.phone,
        zone: r.zone,
        creditLimit: r.creditLimit,
        outstandingBalance: r.outstandingBalance,
        tag: r.tag,
        buckets: {
          current: Math.round(b0to30),
          days31to60: Math.round(b31to60),
          days61to90: Math.round(b61to90),
          days90Plus: Math.round(b90Plus),
        },
      };
    });

    res.json({
      summary: {
        current: Math.round(total0to30),
        days31to60: Math.round(total31to60),
        days61to90: Math.round(total61to90),
        days90Plus: Math.round(total90Plus),
        totalOutstanding: Math.round(total0to30 + total31to60 + total61to90 + total90Plus),
      },
      retailers: retailerBreakdown,
    });
  } catch (error) {
    console.error('Aging report error:', error);
    res.status(500).json({ error: 'Failed to compute aging report' });
  }
});

// Simulate sending payment reminder
router.post('/remind', authenticateJWT, requireRoles(['accountant', 'distributor']), async (req: AuthRequest, res: Response) => {
  const { retailerId, message } = req.body;
  const user = req.user!;

  try {
    const retailer = await prisma.retailer.findUnique({ where: { id: retailerId } });
    if (!retailer) return res.status(404).json({ error: 'Retailer not found' });

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'PAYMENT_REMINDER_SENT',
      entity: `Retailer: ${retailer.shopName}`,
      details: `Dispatched payment reminder for outstanding balance ₹${retailer.outstandingBalance.toLocaleString()} to ${retailer.phone}`,
    });

    res.json({
      success: true,
      message: `Reminder sent to ${retailer.shopName} (${retailer.phone})`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

export default router;
