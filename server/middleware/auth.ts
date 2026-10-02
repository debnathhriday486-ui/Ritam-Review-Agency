import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.ts';
import { db } from '../../database/db.ts';

export interface AuthRequest extends Request {
  auth?: TokenPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }

  req.auth = payload;
  next();
}

export function requireUser(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.auth?.userId) {
      return res.status(403).json({ error: 'User access required.' });
    }

    const user = db.getUserById(req.auth.userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended by administration.' });
    }

    next();
  });
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.auth?.adminId || (req.auth.role !== 'admin' && req.auth.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Administrator access required.' });
    }
    next();
  });
}
