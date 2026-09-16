import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { recordAuditLog, createNotification } from '../services/audit';

const router = Router();

// Helper to generate readable Order ID: ORD-YYYYMM-XXXX
function generateOrderId(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomSuffix}`;
}

// List orders with role-based filtering
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { status, paymentStatus, hasBackorder, retailerId } = req.query;

  try {
    let where: any = {};

    if (status) where.status = String(status);
    if (paymentStatus) where.paymentStatus = String(paymentStatus);
    if (hasBackorder === 'true') where.hasBackorder = true;
    if (retailerId) where.retailerId = String(retailerId);

    // Role-specific scoping
    if (user.role === 'retailer') {
      const retailer = await prisma.retailer.findUnique({ where: { userId: user.id } });
      if (!retailer) return res.json([]);
      where.retailerId = retailer.id;
    } else if (user.role === 'sales_exec') {
      const staff = await prisma.staffProfile.findUnique({ where: { userId: user.id } });
      where.retailer = {
        OR: [
          { assignedSalesExecId: user.id },
          ...(staff ? [{ zone: staff.zone }] : []),
        ],
      };
    } else if (user.role === 'warehouse_manager') {
      // Warehouse manager primarily works with Placed, Confirmed, Packed
      if (!status) {
        where.status = { in: ['Placed', 'Confirmed', 'Packed', 'Dispatched'] };
      }
    } else if (user.role === 'delivery_person') {
      // Delivery staff focuses on Packed, Dispatched, Delivered
      if (!status) {
        where.status = { in: ['Packed', 'Dispatched', 'Delivered'] };
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        retailer: true,
        items: {
          include: {
            product: true,
          },
        },
        placedBy: { select: { id: true, name: true, role: true } },
        packedBy: { select: { id: true, name: true, role: true } },
        deliveredBy: { select: { id: true, name: true, role: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Single order details
router.get('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        retailer: true,
        items: {
          include: { product: true },
        },
        placedBy: { select: { id: true, name: true, role: true } },
        packedBy: { select: { id: true, name: true, role: true } },
        deliveredBy: { select: { id: true, name: true, role: true } },
        payments: true,
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Place order with Credit-Limit Enforcement & Automated Backordering
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { retailerId, items, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }

  try {
    let targetRetailerId = retailerId;

    if (user.role === 'retailer') {
      const retailer = await prisma.retailer.findUnique({ where: { userId: user.id } });
      if (!retailer) return res.status(400).json({ error: 'Retailer profile not found' });
      targetRetailerId = retailer.id;
    }

    if (!targetRetailerId) {
      return res.status(400).json({ error: 'Target retailer is required' });
    }

    const retailer = await prisma.retailer.findUnique({ where: { id: targetRetailerId } });
    if (!retailer) return res.status(404).json({ error: 'Retailer not found' });

    if (retailer.status === 'blocked') {
      return res.status(400).json({
        error: `Order blocked: Retailer ${retailer.shopName} account is currently on hold/blocked due to credit compliance.`,
      });
    }

    // 1. Calculate totals and check stock for backorders
    let subtotal = 0;
    let taxAmount = 0;
    let hasBackorder = false;
    const processedItems: Array<{
      productId: string;
      qty: number;
      fulfilledQty: number;
      backorderedQty: number;
      unitPrice: number;
      totalPrice: number;
      taxPercent: number;
    }> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      const requestedQty = Number(item.qty);
      const availableStock = product.stockQty;

      let fulfilledQty = 0;
      let backorderedQty = 0;

      if (availableStock >= requestedQty) {
        fulfilledQty = requestedQty;
        backorderedQty = 0;
        // Decrement stock
        await prisma.product.update({
          where: { id: product.id },
          data: { stockQty: product.stockQty - fulfilledQty },
        });
      } else {
        // Partial or zero stock -> Automatic Backorder!
        hasBackorder = true;
        fulfilledQty = Math.max(0, availableStock);
        backorderedQty = requestedQty - fulfilledQty;
        // Exhaust remaining stock
        await prisma.product.update({
          where: { id: product.id },
          data: { stockQty: 0 },
        });
      }

      const itemTotal = requestedQty * product.price;
      const itemTax = (itemTotal * product.taxPercent) / 100;
      subtotal += itemTotal;
      taxAmount += itemTax;

      processedItems.push({
        productId: product.id,
        qty: requestedQty,
        fulfilledQty,
        backorderedQty,
        unitPrice: product.price,
        totalPrice: itemTotal,
        taxPercent: product.taxPercent,
      });
    }

    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    // 2. Check Credit Limit
    const newProjectedOutstanding = retailer.outstandingBalance + totalAmount;
    if (newProjectedOutstanding > retailer.creditLimit) {
      // Revert product stocks if credit limit fails
      for (const pi of processedItems) {
        if (pi.fulfilledQty > 0) {
          await prisma.product.update({
            where: { id: pi.productId },
            data: { stockQty: { increment: pi.fulfilledQty } },
          });
        }
      }

      return res.status(400).json({
        error: `Credit limit exceeded. Current outstanding: ₹${retailer.outstandingBalance.toLocaleString()}, Order: ₹${totalAmount.toLocaleString()}, Limit: ₹${retailer.creditLimit.toLocaleString()}. Payment required before new orders can be processed.`,
        creditLimit: retailer.creditLimit,
        currentOutstanding: retailer.outstandingBalance,
        orderTotal: totalAmount,
      });
    }

    // 3. Create the Order
    const orderId = generateOrderId();
    const order = await prisma.order.create({
      data: {
        id: orderId,
        retailerId: retailer.id,
        status: 'Placed',
        paymentStatus: 'Unpaid',
        subtotal,
        taxAmount,
        totalAmount,
        hasBackorder,
        notes,
        deliveryZone: retailer.zone,
        placedByStaffId: user.role === 'sales_exec' ? user.id : null,
        items: {
          create: processedItems.map((pi) => ({
            productId: pi.productId,
            qty: pi.qty,
            fulfilledQty: pi.fulfilledQty,
            backorderedQty: pi.backorderedQty,
            unitPrice: pi.unitPrice,
            totalPrice: pi.totalPrice,
          })),
        },
      },
      include: {
        retailer: true,
        items: { include: { product: true } },
      },
    });

    // 4. Update Retailer Outstanding Balance
    await prisma.retailer.update({
      where: { id: retailer.id },
      data: { outstandingBalance: { increment: totalAmount } },
    });

    // 5. Audit Log & Notifications
    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'ORDER_PLACED',
      entity: `Order: ${order.id}`,
      details: `Placed order of ₹${totalAmount.toLocaleString()} for ${retailer.shopName}${hasBackorder ? ' (Includes Backorders)' : ''}`,
    });

    if (hasBackorder) {
      await createNotification({
        targetRole: 'warehouse_manager',
        title: 'New Backorder Generated',
        message: `Order #${order.id} for ${retailer.shopName} contains items pending restock.`,
        type: 'stock',
      });
      await createNotification({
        targetRole: 'distributor',
        title: 'Backorder Notice',
        message: `Order #${order.id} automatically split into backorders. Check procurement queue.`,
        type: 'stock',
      });
    } else {
      await createNotification({
        targetRole: 'warehouse_manager',
        title: 'New Order Ready to Pack',
        message: `Order #${order.id} (${retailer.shopName}) is ready for picking and packing.`,
        type: 'order',
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Update Pipeline Status with strict Role Ownership
// Placed -> Confirmed -> Packed (Warehouse) -> Dispatched (Delivery) -> Delivered (Delivery)
router.patch('/:id/status', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Placed', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status: ${status}` });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { retailer: true },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Enforce role-based pipeline permissions
    if (status === 'Packed') {
      if (user.role !== 'warehouse_manager' && user.role !== 'distributor') {
        return res.status(403).json({ error: 'Only Warehouse Managers or Distributor can mark orders as Packed' });
      }
    } else if (status === 'Dispatched') {
      if (user.role !== 'delivery_person' && user.role !== 'distributor') {
        return res.status(403).json({ error: 'Only Delivery Personnel or Distributor can dispatch orders' });
      }
    } else if (status === 'Delivered') {
      if (user.role !== 'delivery_person' && user.role !== 'distributor') {
        return res.status(403).json({ error: 'Only Delivery Personnel or Distributor can mark orders as Delivered' });
      }
    }

    const updateData: any = { status };
    if (status === 'Packed') {
      updateData.packedByStaffId = user.id;
    } else if (status === 'Delivered') {
      updateData.deliveredByStaffId = user.id;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { retailer: true, items: true },
    });

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: `ORDER_${status.toUpperCase()}`,
      entity: `Order: ${order.id}`,
      details: `Status changed from ${order.status} to ${status} by ${user.name} (${user.role})`,
    });

    // Notify retailer and team
    await createNotification({
      targetRole: 'retailer',
      userId: order.retailer.userId || undefined,
      title: `Order Update: #${order.id}`,
      message: `Your order is now marked as ${status}.`,
      type: 'order',
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Dedicated Backorders Queue
router.get('/pipeline/backorders', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const backorderItems = await prisma.orderItem.findMany({
      where: {
        backorderedQty: { gt: 0 },
      },
      include: {
        product: true,
        order: {
          include: { retailer: true },
        },
      },
      orderBy: { order: { createdAt: 'desc' } },
    });

    res.json(backorderItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch backorders' });
  }
});

export default router;
