import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';

/**
 * Middleware to authenticate JWT tokens
 * Verifies the token from Authorization header and attaches userId to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7);
        const payload = authService.verifyToken(token);

        (req as any).userId = payload.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
