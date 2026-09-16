import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';

const router = Router();

// Full audit log trail (Distributor only)
router.get('/', authenticateJWT, requireRoles(['distributor']), async (req: AuthRequest, res: Response) => {
  const { search, action, role } = req.query;

  try {
    const where: any = {};
    if (action) where.action = String(action);
    if (role) where.userRole = String(role);
    if (search) {
      where.OR = [
        { userName: { contains: String(search) } },
        { entity: { contains: String(search) } },
        { details: { contains: String(search) } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
