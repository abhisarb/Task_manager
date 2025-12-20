import bcrypt from 'bcrypt';
import authService from '../src/services/auth.service';

describe('AuthService', () => {
    describe('Password Hashing', () => {
        it('should hash password correctly', async () => {
            const password = 'testpassword123';
            const hashedPassword = await bcrypt.hash(password, 10);

            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword.length).toBeGreaterThan(0);
        });

        it('should verify hashed password correctly', async () => {
            const password = 'testpassword123';
            const hashedPassword = await bcrypt.hash(password, 10);

            const isValid = await bcrypt.compare(password, hashedPassword);
            expect(isValid).toBe(true);

            const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
            expect(isInvalid).toBe(false);
        });
    });

    describe('JWT Token Generation', () => {
        it('should generate valid JWT token', () => {
            const payload = { userId: 'test-user-id', email: 'test@example.com' };
            const token = authService.generateToken(payload);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3);
        });

        it('should verify JWT token correctly', () => {
            const payload = { userId: 'test-user-id', email: 'test@example.com' };
            const token = authService.generateToken(payload);

            const decoded = authService.verifyToken(token);
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.email).toBe(payload.email);
        });

        it('should throw error for invalid token', () => {
            expect(() => {
                authService.verifyToken('invalid-token');
            }).toThrow();
        });
    });
});
