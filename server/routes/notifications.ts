import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Get notifications for the user's role or targeted directly
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { targetRole: 'all' },
          { targetRole: user.role },
          { userId: user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark all as read
router.patch('/mark-read', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  try {
    await prisma.notification.updateMany({
      where: {
        OR: [
          { targetRole: 'all' },
          { targetRole: user.role },
          { userId: user.id },
        ],
        read: false,
      },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

export default router;
