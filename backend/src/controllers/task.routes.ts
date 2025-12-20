import { Router } from 'express';
import taskController from '../controllers/task.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';

const router = Router();

router.use(authenticate);

router.get('/dashboard/assigned', (req, res, next) => {
    taskController.getAssigned(req, res).catch(next);
});

router.get('/dashboard/created', (req, res, next) => {
    taskController.getCreated(req, res).catch(next);
});

router.get('/dashboard/overdue', (req, res, next) => {
    taskController.getOverdue(req, res).catch(next);
});

router.post('/', validate(CreateTaskDto), (req, res, next) => {
    taskController.create(req, res).catch(next);
});

router.get('/', (req, res, next) => {
    taskController.getAll(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
    taskController.getById(req, res).catch(next);
});

router.patch('/:id', validate(UpdateTaskDto), (req, res, next) => {
    taskController.update(req, res).catch(next);
});

router.delete('/:id', (req, res, next) => {
    taskController.delete(req, res).catch(next);
});

export default router;
