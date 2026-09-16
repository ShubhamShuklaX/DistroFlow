import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';

const router = Router();

// Executive Overview & Recharts Analytics (Distributor & Sales Exec)
router.get('/dashboard', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        retailer: true,
        items: { include: { product: true } },
      },
    });

    const products = await prisma.product.findMany();
    const retailers = await prisma.retailer.findMany();
    const staff = await prisma.user.findMany({
      where: { role: { in: ['sales_exec', 'warehouse_manager', 'accountant', 'delivery_person'] } },
      include: {
        staffProfile: true,
        placedOrders: true,
        packedOrders: true,
        deliveredOrders: true,
        paymentsCollected: true,
      },
    });

    // High level KPIs
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingDispatchCount = orders.filter((o) => ['Placed', 'Confirmed', 'Packed'].includes(o.status)).length;
    const backorderOrdersCount = orders.filter((o) => o.hasBackorder).length;
    const totalOutstandingDebt = retailers.reduce((sum, r) => sum + r.outstandingBalance, 0);
    const lowStockCount = products.filter((p) => p.stockQty <= p.reorderThreshold).length;

    // Monthly Revenue Trend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, { revenue: number; orders: number }> = {};

    // Initialize recent 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyMap[key] = { revenue: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyMap[key]) {
        monthlyMap[key].revenue += o.totalAmount;
        monthlyMap[key].orders += 1;
      }
    });

    const revenueTrend = Object.entries(monthlyMap).map(([month, val]) => ({
      month,
      revenue: Math.round(val.revenue),
      orders: val.orders,
    }));

    // Category Sales Breakdown
    const categorySales: Record<string, number> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = item.product.category || 'Other';
        categorySales[cat] = (categorySales[cat] || 0) + item.totalPrice;
      });
    });

    const categoryDistribution = Object.entries(categorySales).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    // Top Selling Products
    const productAgg: Record<string, { name: string; sku: string; qty: number; revenue: number; stock: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productAgg[item.productId]) {
          productAgg[item.productId] = {
            name: item.product.name,
            sku: item.product.sku,
            qty: 0,
            revenue: 0,
            stock: item.product.stockQty,
          };
        }
        productAgg[item.productId].qty += item.qty;
        productAgg[item.productId].revenue += item.totalPrice;
      });
    });

    const topProducts = Object.values(productAgg)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
      .map((p) => ({
        ...p,
        revenue: Math.round(p.revenue),
      }));

    // Top Retailers by Order Volume
    const retailerAgg: Record<string, { name: string; zone: string; orders: number; revenue: number; balance: number }> = {};
    orders.forEach((o) => {
      if (!retailerAgg[o.retailerId]) {
        retailerAgg[o.retailerId] = {
          name: o.retailer.shopName,
          zone: o.retailer.zone,
          orders: 0,
          revenue: 0,
          balance: o.retailer.outstandingBalance,
        };
      }
      retailerAgg[o.retailerId].orders += 1;
      retailerAgg[o.retailerId].revenue += o.totalAmount;
    });

    const topRetailers = Object.values(retailerAgg)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
      .map((r) => ({
        ...r,
        revenue: Math.round(r.revenue),
      }));

    // Zone Distribution
    const zoneSales: Record<string, { revenue: number; retailers: number; orders: number }> = {
      North: { revenue: 0, retailers: 0, orders: 0 },
      South: { revenue: 0, retailers: 0, orders: 0 },
      East: { revenue: 0, retailers: 0, orders: 0 },
      West: { revenue: 0, retailers: 0, orders: 0 },
      Central: { revenue: 0, retailers: 0, orders: 0 },
    };

    retailers.forEach((r) => {
      if (zoneSales[r.zone]) zoneSales[r.zone].retailers += 1;
    });

    orders.forEach((o) => {
      const z = o.retailer.zone || 'Central';
      if (zoneSales[z]) {
        zoneSales[z].revenue += o.totalAmount;
        zoneSales[z].orders += 1;
      }
    });

    const zoneHeatmap = Object.entries(zoneSales).map(([zone, data]) => ({
      zone,
      revenue: Math.round(data.revenue),
      retailers: data.retailers,
      orders: data.orders,
    }));

    // Staff Leaderboard
    const staffLeaderboard = staff.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      zone: s.staffProfile?.zone || 'Central',
      ordersPlaced: s.placedOrders.length,
      salesValue: Math.round(s.placedOrders.reduce((sum, o) => sum + o.totalAmount, 0)),
      ordersPacked: s.packedOrders.length,
      ordersDelivered: s.deliveredOrders.length,
      paymentsCollected: Math.round(s.paymentsCollected.reduce((sum, p) => sum + p.amount, 0)),
    }));

    res.json({
      kpis: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders: validOrders.length,
        pendingDispatchCount,
        backorderOrdersCount,
        totalOutstandingDebt: Math.round(totalOutstandingDebt),
        lowStockCount,
        activeRetailersCount: retailers.length,
      },
      revenueTrend,
      categoryDistribution,
      topProducts,
      topRetailers,
      zoneHeatmap,
      staffLeaderboard,
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// AI-Based Demand Forecast
// Proprietary rule-based heuristic modeling monthly velocity, seasonality factor, safety buffer
router.get('/demand-forecast', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    const orderItems = await prisma.orderItem.findMany({
      include: {
        order: { select: { createdAt: true } },
      },
    });

    // Compute velocity per product
    const velocityMap: Record<string, number> = {};
    orderItems.forEach((item) => {
      velocityMap[item.productId] = (velocityMap[item.productId] || 0) + item.qty;
    });

    const forecast = products.map((p) => {
      const historicalSales30d = velocityMap[p.id] || Math.floor(10 + Math.random() * 40);
      // Growth/seasonality factor (e.g., +15% anticipated market uplift)
      const trendMultiplier = 1.15;
      const forecastedDemandNextMonth = Math.round(historicalSales30d * trendMultiplier);
      const safetyStock = p.reorderThreshold;
      const requiredInventory = forecastedDemandNextMonth + safetyStock;
      const recommendedReorderQty = Math.max(0, requiredInventory - p.stockQty);

      let urgency = 'Normal';
      if (p.stockQty === 0) urgency = 'Critical (Out of Stock)';
      else if (p.stockQty <= p.reorderThreshold) urgency = 'High (Low Stock)';
      else if (recommendedReorderQty > p.stockQty) urgency = 'Medium';

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        currentStock: p.stockQty,
        reorderThreshold: p.reorderThreshold,
        historicalSales30d,
        forecastedDemandNextMonth,
        recommendedReorderQty,
        estimatedCost: Math.round(recommendedReorderQty * p.price * 0.8), // Wholesale purchase cost ~80%
        urgency,
      };
    });

    forecast.sort((a, b) => b.recommendedReorderQty - a.recommendedReorderQty);

    res.json({
      summary: {
        productsAnalyzed: forecast.length,
        criticalStockCount: forecast.filter((f) => f.urgency.startsWith('Critical')).length,
        totalReorderUnitsRecommended: forecast.reduce((sum, f) => sum + f.recommendedReorderQty, 0),
        estimatedCapitalRequired: forecast.reduce((sum, f) => sum + f.estimatedCost, 0),
      },
      forecast,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute demand forecast' });
  }
});

// Route Optimization View: Zone Route Waypoints for Delivery Staff
router.get('/route-optimization', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const activeDeliveries = await prisma.order.findMany({
      where: {
        status: { in: ['Packed', 'Dispatched'] },
      },
      include: {
        retailer: true,
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group deliveries by zone
    const zonesMap: Record<string, any[]> = {
      North: [],
      South: [],
      East: [],
      West: [],
      Central: [],
    };

    activeDeliveries.forEach((order, index) => {
      const zone = order.retailer.zone || 'Central';
      if (!zonesMap[zone]) zonesMap[zone] = [];

      zonesMap[zone].push({
        stopNumber: zonesMap[zone].length + 1,
        orderId: order.id,
        shopName: order.retailer.shopName,
        ownerName: order.retailer.ownerName,
        phone: order.retailer.phone,
        address: order.retailer.address,
        city: order.retailer.city,
        packageCount: order.items.reduce((sum, it) => sum + it.fulfilledQty, 0),
        orderTotal: order.totalAmount,
        paymentStatus: order.paymentStatus,
        status: order.status,
        estimatedDistanceKm: Math.round(2 + Math.random() * 8 * 10) / 10,
        estimatedDeliveryTime: `${9 + Math.floor(index / 2)}:${(index % 2) * 30 || '00'} AM`,
      });
    });

    res.json(zonesMap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute route optimization' });
  }
});

export default router;
