import userRepository from '../repositories/user.repository';

/**
 * Service layer for User business logic
 */
export class UserService {
    /**
     * Get all users
     */
    async getAllUsers() {
        return await userRepository.findAll();
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

export default new UserService();
