import { Request, Response } from 'express';
import userService from '../services/user.service';

/**
 * Controller handling user endpoints
 */
export class UserController {
    /**
     * Get all users
     * GET /api/v1/users
     */
    async getAll(_req: Request, res: Response): Promise<void> {
        try {
            const users = await userService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user by ID
     * GET /api/v1/users/:id
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);
            res.status(200).json(user);
        } catch (error) {
            throw error;
        }
    }
}

export default new UserController();
