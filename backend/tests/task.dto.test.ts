import { CreateTaskDto } from '../src/dto/task.dto';
import { Priority, Status } from '@prisma/client';

describe('Task DTO Validation', () => {
    describe('CreateTaskDto', () => {
        it('should validate valid task data', () => {
            const validData = {
                title: 'Test Task',
                description: 'This is a test task description',
                dueDate: new Date().toISOString(),
                priority: Priority.HIGH,
                status: Status.TODO,
                assignedToId: '123e4567-e89b-12d3-a456-426614174000',
            };

            const result = CreateTaskDto.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject title longer than 100 characters', () => {
            const invalidData = {
                title: 'a'.repeat(101),
                description: 'Test description',
                dueDate: new Date().toISOString(),
            };

            const result = CreateTaskDto.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject empty title', () => {
            const invalidData = {
                title: '',
                description: 'Test description',
                dueDate: new Date().toISOString(),
            };

            const result = CreateTaskDto.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject invalid date format', () => {
            const invalidData = {
                title: 'Test Task',
                description: 'Test description',
                dueDate: 'not-a-date',
            };

            const result = CreateTaskDto.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should apply default values for priority and status', () => {
            const dataWithoutDefaults = {
                title: 'Test Task',
                description: 'Test description',
                dueDate: new Date().toISOString(),
            };

            const result = CreateTaskDto.parse(dataWithoutDefaults);
            expect(result.priority).toBe(Priority.MEDIUM);
            expect(result.status).toBe(Status.TODO);
        });
    });
});
