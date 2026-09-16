import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { recordAuditLog, createNotification } from '../services/audit';

const router = Router();

// List all staff (Distributor only)
router.get('/', authenticateJWT, requireRoles(['distributor']), async (req: AuthRequest, res: Response) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          in: ['sales_exec', 'warehouse_manager', 'accountant', 'delivery_person'],
        },
      },
      include: {
        staffProfile: true,
        placedOrders: { select: { id: true, totalAmount: true, status: true } },
        packedOrders: { select: { id: true } },
        deliveredOrders: { select: { id: true } },
        paymentsCollected: { select: { id: true, amount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedStaff = staff.map((u) => {
      const ordersClosed = u.placedOrders.filter((o) => o.status !== 'Cancelled').length;
      const salesValue = u.placedOrders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);
      const commissionRate = u.staffProfile?.commissionPercent || 0;
      const commissionEarned = (salesValue * commissionRate) / 100;
      const deliveriesDone = u.deliveredOrders.length;
      const packsDone = u.packedOrders.length;
      const collectionsTotal = u.paymentsCollected.reduce((sum, p) => sum + p.amount, 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        zone: u.staffProfile?.zone || 'Central',
        salary: u.staffProfile?.salary || 0,
        commissionPercent: commissionRate,
        commissionEarned,
        status: u.staffProfile?.status || 'active',
        hiredOn: u.staffProfile?.hiredOn,
        metrics: {
          ordersClosed,
          salesValue,
          deliveriesDone,
          packsDone,
          collectionsTotal,
        },
      };
    });

    res.json(enrichedStaff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff list' });
  }
});

// Add new staff member (Distributor only)
router.post('/', authenticateJWT, requireRoles(['distributor']), async (req: AuthRequest, res: Response) => {
  const { name, email, phone, role, zone, salary, commissionPercent } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const validRoles = ['sales_exec', 'warehouse_manager', 'accountant', 'delivery_person'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid staff role specified' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        role,
        staffProfile: {
          create: {
            zone: zone || 'Central',
            salary: Number(salary) || 35000,
            commissionPercent: Number(commissionPercent) || 0,
            status: 'active',
          },
        },
      },
      include: {
        staffProfile: true,
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'STAFF_CREATED',
      entity: `Staff: ${name}`,
      details: `Hired ${name} as ${role} for ${zone || 'Central'} zone`,
    });

    await createNotification({
      targetRole: 'distributor',
      title: 'New Staff Onboarded',
      message: `${name} has been added as ${role.replace('_', ' ')} in ${zone || 'Central'} zone.`,
      type: 'system',
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// Toggle active/inactive status (Distributor only - deactivates instead of deleting to keep audit trail)
router.patch('/:id/status', authenticateJWT, requireRoles(['distributor']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' | 'inactive'

  try {
    const profile = await prisma.staffProfile.findUnique({ where: { userId: id } });
    if (!profile) {
      return res.status(404).json({ error: 'Staff profile not found' });
    }

    const updated = await prisma.staffProfile.update({
      where: { userId: id },
      data: { status },
      include: { user: true },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'STAFF_STATUS_UPDATED',
      entity: `Staff: ${updated.user.name}`,
      details: `Staff status updated to ${status}`,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update staff status' });
  }
});

// Staff personal performance stats (for Sales Exec, Delivery, etc.)
router.get('/my-stats', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        staffProfile: true,
        placedOrders: { include: { retailer: true } },
        packedOrders: true,
        deliveredOrders: { include: { retailer: true } },
        paymentsCollected: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalSales = user.placedOrders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const commissionPercent = user.staffProfile?.commissionPercent || 0;
    const commissionEarned = (totalSales * commissionPercent) / 100;

    res.json({
      ordersPlaced: user.placedOrders.length,
      totalSales,
      commissionPercent,
      commissionEarned,
      deliveriesCount: user.deliveredOrders.length,
      packsCount: user.packedOrders.length,
      paymentsCollectedCount: user.paymentsCollected.length,
      paymentsTotal: user.paymentsCollected.reduce((sum, p) => sum + p.amount, 0),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
