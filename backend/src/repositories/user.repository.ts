import prisma from '../utils/prisma';

/**
 * Repository layer for User data access
 * Handles all database operations for users
 */
export class UserRepository {
    /**
     * Find all users
     */
    async findAll() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    /**
     * Find user by ID
     */
    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
    }
}

export default new UserRepository();
