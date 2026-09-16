import { Router, Response } from "express";
import { prisma } from "../db";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { requireRoles } from "../middleware/rbac";
import { recordAuditLog, createNotification } from "../services/audit";

const router = Router();

// List retailers (filtered by zone if sales_exec, distributor sees all)
router.get("/", authenticateJWT, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  try {
    let whereClause: any = {};

    if (user.role === "sales_exec") {
      const staff = await prisma.staffProfile.findUnique({
        where: { userId: user.id },
      });
      if (staff) {
        whereClause = {
          OR: [{ assignedSalesExecId: user.id }, { zone: staff.zone }],
        };
      }
    } else if (user.role === "retailer") {
      whereClause = { userId: user.id };
    }

    const retailers = await prisma.retailer.findMany({
      where: whereClause,
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        payments: {
          select: {
            id: true,
            amount: true,
            date: true,
          },
          orderBy: { date: "desc" },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = retailers.map((r) => {
      const totalOrdersCount = r.orders.length;
      const creditUtilizationPercent =
        r.creditLimit > 0
          ? Math.min(
              100,
              Math.round((r.outstandingBalance / r.creditLimit) * 100),
            )
          : 0;

      return {
        ...r,
        creditUtilizationPercent,
        totalOrdersCount,
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error("Error fetching retailers:", error);
    res.status(500).json({ error: "Failed to fetch retailers" });
  }
});

// Single retailer profile + ledger + order history
router.get("/:id", authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const retailer = await prisma.retailer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: { include: { product: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!retailer) {
      return res.status(404).json({ error: "Retailer not found" });
    }

    res.json(retailer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch retailer profile" });
  }
});

// Add new retailer (Distributor only)
router.post(
  "/",
  authenticateJWT,
  requireRoles(["distributor"]),
  async (req: AuthRequest, res: Response) => {
    const {
      shopName,
      ownerName,
      email,
      phone,
      gstNo,
      address,
      city,
      zone,
      creditLimit,
      tag,
      assignedSalesExecId,
    } = req.body;

    if (!shopName || !ownerName || !email || !phone || !gstNo) {
      return res
        .status(400)
        .json({
          error: "Shop name, owner name, email, phone, and GSTIN are required",
        });
    }

    try {
      const existing = await prisma.retailer.findFirst({
        where: {
          OR: [{ email: email.toLowerCase() }, { gstNo: gstNo.toUpperCase() }],
        },
      });

      if (existing) {
        return res
          .status(400)
          .json({
            error: "A retailer with this email or GSTIN already exists",
          });
      }

      const retailer = await prisma.retailer.create({
        data: {
          shopName,
          ownerName,
          email: email.toLowerCase(),
          phone,
          gstNo: gstNo.toUpperCase(),
          address: address || "",
          city: city || "Mumbai",
          zone: zone || "North",
          creditLimit: Number(creditLimit) || 150000,
          outstandingBalance: 0,
          tag: tag || "New",
          status: "active",
          assignedSalesExecId,
        },
      });

      await recordAuditLog({
        userId: req.user!.id,
        userName: req.user!.name,
        userRole: req.user!.role,
        action: "RETAILER_CREATED",
        entity: `Retailer: ${shopName}`,
        details: `Onboarded ${shopName} (${ownerName}) with credit limit ₹${creditLimit || 150000}`,
      });

      await createNotification({
        targetRole: "sales_exec",
        title: "New Retailer Onboarded",
        message: `${shopName} in ${zone || "North"} zone is now active.`,
        type: "system",
      });

      res.status(201).json(retailer);
    } catch (error) {
      console.error("Error creating retailer:", error);
      res.status(500).json({ error: "Failed to create retailer" });
    }
  },
);

// Update retailer (credit limit, tag, zone, status) - Distributor & Accountant
router.patch(
  "/:id",
  authenticateJWT,
  requireRoles(["distributor", "accountant"]),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { creditLimit, tag, zone, status, assignedSalesExecId } = req.body;

    try {
      const existing = await prisma.retailer.findUnique({ where: { id } });
      if (!existing)
        return res.status(404).json({ error: "Retailer not found" });

      const updated = await prisma.retailer.update({
        where: { id },
        data: {
          ...(creditLimit !== undefined && {
            creditLimit: Number(creditLimit),
          }),
          ...(tag !== undefined && { tag }),
          ...(zone !== undefined && { zone }),
          ...(status !== undefined && { status }),
          ...(assignedSalesExecId !== undefined && { assignedSalesExecId }),
        },
      });

      await recordAuditLog({
        userId: req.user!.id,
        userName: req.user!.name,
        userRole: req.user!.role,
        action: "RETAILER_UPDATED",
        entity: `Retailer: ${updated.shopName}`,
        details: `Updated parameters: creditLimit=₹${updated.creditLimit}, status=${updated.status}, tag=${updated.tag}`,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update retailer" });
    }
  },
);

export default router;
