import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Role-Based Access Control middleware.
 * Pass allowed roles: e.g. requireRoles(['distributor', 'accountant'])
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' does not have permission to access this resource. Required: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};
