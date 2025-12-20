import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate HTTP responses
 */
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error:', err);

    if (err.message === 'Email already registered') {
        res.status(409).json({ error: err.message });
        return;
    }

    if (err.message === 'Invalid credentials') {
        res.status(401).json({ error: err.message });
        return;
    }

    if (err.message.includes('not found')) {
        res.status(404).json({ error: err.message });
        return;
    }

    if (err.message.includes('not authorized')) {
        res.status(403).json({ error: err.message });
        return;
    }

    res.status(500).json({ error: 'Internal server error' });
};
