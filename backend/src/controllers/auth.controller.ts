import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { RegisterInput, LoginInput } from '../dto/auth.dto';

/**
 * Controller handling authentication endpoints
 */
export class AuthController {
    /**
     * Handle user registration
     * POST /api/v1/auth/register
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const data: RegisterInput = req.body;
            const result = await authService.register(data);
            res.status(201).json(result);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Handle user login
     * POST /api/v1/auth/login
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const data: LoginInput = req.body;
            const result = await authService.login(data);
            res.status(200).json(result);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get current user profile
     * GET /api/v1/auth/me
     */
    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId;
            const user = await authService.getUserById(userId);
            res.status(200).json(user);
        } catch (error) {
            throw error;
        }
    }
}

export default new AuthController();
