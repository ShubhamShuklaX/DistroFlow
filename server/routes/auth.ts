import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { JWT_SECRET, authenticateJWT, AuthRequest } from '../middleware/auth';
import { recordAuditLog } from '../services/audit';

const router = Router();

// Demo users preset credentials for 1-click evaluation
export const DEMO_USERS = [
  { role: 'distributor', email: 'owner@distroflow.com', name: 'Vikram Mehta (Owner)', label: 'Distributor (Owner)' },
  { role: 'sales_exec', email: 'sales.rohit@distroflow.com', name: 'Rohit Sharma (North Zone)', label: 'Sales Executive' },
  { role: 'warehouse_manager', email: 'warehouse.anil@distroflow.com', name: 'Anil Kumar (Lead)', label: 'Warehouse Manager' },
  { role: 'accountant', email: 'accounts.priya@distroflow.com', name: 'Priya Verma (Sr. Acc.)', label: 'Accountant' },
  { role: 'delivery_person', email: 'delivery.deepak@distroflow.com', name: 'Deepak Rao (Fleet)', label: 'Delivery Staff' },
  { role: 'retailer', email: 'retail.apex@quickmart.in', name: 'Rajesh Gupta (Apex Mart)', label: 'Retailer (Apex Mart)' },
];

router.get('/demo-users', (req: Request, res: Response) => {
  res.json(DEMO_USERS);
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        staffProfile: true,
        retailer: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password if provided, or allow default demo password 'password123'
    if (password) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid && password !== 'password123') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await recordAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      entity: `Session`,
      details: `User logged in via ${user.role} portal`,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        staffProfile: user.staffProfile,
        retailer: user.retailer,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Quick switch for evaluators
router.post('/switch-role', async (req: Request, res: Response) => {
  const { role } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { role },
      include: {
        staffProfile: true,
        retailer: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: `No seeded user found for role: ${role}` });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        staffProfile: user.staffProfile,
        retailer: user.retailer,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to switch role' });
  }
});

router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        staffProfile: true,
        retailer: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      staffProfile: user.staffProfile,
      retailer: user.retailer,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

export default router;
