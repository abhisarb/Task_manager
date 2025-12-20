import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterInput, LoginInput } from '../dto/auth.dto';
import { AuthResponse, JwtPayload } from '../types/auth.types';
import prisma from '../utils/prisma';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Service class handling authentication business logic
 */
export class AuthService {
    /**
     * Register a new user
     * @param data - Registration data (email, password, name)
     * @returns Authentication response with user data and JWT token
     * @throws Error if email already exists
     */
    async register(data: RegisterInput): Promise<AuthResponse> {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
        });

        const token = this.generateToken({ userId: user.id, email: user.email });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        };
    }

    /**
     * Authenticate user login
     * @param data - Login credentials (email, password)
     * @returns Authentication response with user data and JWT token
     * @throws Error if credentials are invalid
     */
    async login(data: LoginInput): Promise<AuthResponse> {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken({ userId: user.id, email: user.email });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        };
    }

    /**
     * Generate JWT token
     * @param payload - JWT payload containing userId and email
     * @returns Signed JWT token
     */
    generateToken(payload: JwtPayload): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
    }

    /**
     * Verify JWT token
     * @param token - JWT token to verify
     * @returns Decoded JWT payload
     * @throws Error if token is invalid
     */
    verifyToken(token: string): JwtPayload {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    }

    /**
     * Get user by ID
     * @param userId - User ID
     * @returns User data without password
     * @throws Error if user not found
     */
    async getUserById(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }
}

export default new AuthService();
