import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validate(RegisterDto), (req, res, next) => {
    authController.register(req, res).catch(next);
});

router.post('/login', validate(LoginDto), (req, res, next) => {
    authController.login(req, res).catch(next);
});

router.get('/me', authenticate, (req, res, next) => {
    authController.getProfile(req, res).catch(next);
});

export default router;
