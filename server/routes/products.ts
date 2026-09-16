import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { recordAuditLog, createNotification } from '../services/audit';

const router = Router();

// Get all products (accessible to all authenticated users)
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { category, lowStock } = req.query;

  try {
    const where: any = {};
    if (category) {
      where.category = String(category);
    }
    if (lowStock === 'true') {
      // In SQLite, raw or post-filter for stockQty <= reorderThreshold
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const enriched = products.map((p) => ({
      ...p,
      isLowStock: p.stockQty <= p.reorderThreshold,
      isOutOfStock: p.stockQty <= 0,
    }));

    res.json(lowStock === 'true' ? enriched.filter((p) => p.isLowStock) : enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add single product (Distributor only)
router.post('/', authenticateJWT, requireRoles(['distributor']), async (req: AuthRequest, res: Response) => {
  const {
    sku,
    name,
    category,
    unit,
    price,
    taxPercent,
    stockQty,
    reorderThreshold,
    warehouseLocation,
    imageUrl,
  } = req.body;

  if (!sku || !name || !category || price === undefined) {
    return res.status(400).json({ error: 'SKU, name, category, and price are required' });
  }

  try {
    const existing = await prisma.product.findUnique({ where: { sku: sku.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ error: `Product with SKU ${sku} already exists` });
    }

    const product = await prisma.product.create({
      data: {
        sku: sku.toUpperCase(),
        name,
        category,
        unit: unit || 'Case',
        price: Number(price),
        taxPercent: Number(taxPercent) || 18,
        stockQty: Number(stockQty) || 0,
        reorderThreshold: Number(reorderThreshold) || 20,
        warehouseLocation: warehouseLocation || 'Bay 1',
        imageUrl: imageUrl || null,
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'PRODUCT_CREATED',
      entity: `Product: ${product.name} (${product.sku})`,
      details: `Created product at price ₹${product.price} with initial stock ${product.stockQty}`,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Adjust stock / Restock inventory (Warehouse Manager & Distributor)
// Key Business Logic: When stock is increased, check for pending backorders and notify/fulfill!
router.patch('/:id/stock', authenticateJWT, requireRoles(['warehouse_manager', 'distributor']), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { quantity, mode, notes } = req.body; // mode: 'add' (replenish) | 'set' (count adjustment)

  if (quantity === undefined) {
    return res.status(400).json({ error: 'Quantity is required' });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let newStock = product.stockQty;
    if (mode === 'add') {
      newStock += Number(quantity);
    } else {
      newStock = Number(quantity);
    }

    if (newStock < 0) newStock = 0;

    const updated = await prisma.product.update({
      where: { id },
      data: { stockQty: newStock },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'STOCK_ADJUSTED',
      entity: `Product: ${updated.name} (${updated.sku})`,
      details: `Stock updated from ${product.stockQty} to ${newStock} (${mode === 'add' ? `+${quantity}` : `set to ${quantity}`}). Note: ${notes || 'Standard cycle count'}`,
    });

    // Check if there were backorders waiting for this product!
    const pendingBackorderItems = await prisma.orderItem.findMany({
      where: {
        productId: id,
        backorderedQty: { gt: 0 },
        order: {
          status: { in: ['Placed', 'Confirmed'] },
        },
      },
      include: {
        order: { include: { retailer: true } },
      },
    });

    if (pendingBackorderItems.length > 0 && mode === 'add' && Number(quantity) > 0) {
      await createNotification({
        targetRole: 'warehouse_manager',
        title: 'Backorder Stock Available',
        message: `${updated.name} restocked (+${quantity}). ${pendingBackorderItems.length} order(s) waiting for backorder fulfillment.`,
        type: 'stock',
      });
      await createNotification({
        targetRole: 'distributor',
        title: 'Restock Alert',
        message: `${updated.name} received +${quantity} units. Backorder orders can now be packed.`,
        type: 'stock',
      });
    }

    res.json({
      product: updated,
      pendingBackordersFound: pendingBackorderItems.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
});

// Bulk import CSV simulation (Distributor only)
router.post('/bulk-import', authenticateJWT, requireRoles(['distributor']), async (req: AuthRequest, res: Response) => {
  const { products } = req.body; // array of products

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Array of products required' });
  }

  try {
    let importedCount = 0;
    for (const p of products) {
      const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
      if (!existing) {
        await prisma.product.create({
          data: {
            sku: p.sku,
            name: p.name,
            category: p.category || 'General',
            unit: p.unit || 'Case',
            price: Number(p.price) || 100,
            taxPercent: Number(p.taxPercent) || 18,
            stockQty: Number(p.stockQty) || 50,
            reorderThreshold: Number(p.reorderThreshold) || 15,
            warehouseLocation: p.warehouseLocation || 'Bay 1',
          },
        });
        importedCount++;
      }
    }

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'BULK_PRODUCT_IMPORT',
      entity: 'Inventory',
      details: `Bulk imported ${importedCount} new products into catalog`,
    });

    res.json({ success: true, count: importedCount });
  } catch (error) {
    res.status(500).json({ error: 'Bulk import failed' });
  }
});

export default router;
