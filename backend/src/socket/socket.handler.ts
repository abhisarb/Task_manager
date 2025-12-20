import { Server, Socket } from 'socket.io';
import { SocketEvents } from './events';
import authService from '../services/auth.service';

/**
 * Socket.io handler for real-time communication
 */
export class SocketHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        this.setupMiddleware();
        this.setupHandlers();
    }

    /**
     * Setup authentication middleware for socket connections
     */
    private setupMiddleware() {
        this.io.use(async (socket: Socket, next) => {
            try {
                const token = socket.handshake.auth.token;

                if (!token) {
                    return next(new Error('Authentication error'));
                }

                const payload = authService.verifyToken(token);
                (socket as any).userId = payload.userId;
                next();
            } catch (error) {
                next(new Error('Authentication error'));
            }
        });
    }

    /**
     * Setup socket event handlers
     */
    private setupHandlers() {
        this.io.on(SocketEvents.CONNECTION, (socket: Socket) => {
            const userId = (socket as any).userId;
            console.log(`User connected: ${userId}`);

            socket.join(`user:${userId}`);

            socket.on(SocketEvents.DISCONNECT, () => {
                console.log(`User disconnected: ${userId}`);
            });
        });
    }

    /**
     * Broadcast task creation to all connected clients
     */
    broadcastTaskCreated(task: any) {
        this.io.emit(SocketEvents.TASK_CREATED, task);
    }

    /**
     * Broadcast task update to all connected clients
     */
    broadcastTaskUpdated(task: any) {
        this.io.emit(SocketEvents.TASK_UPDATED, task);
    }

    /**
     * Broadcast task deletion to all connected clients
     */
    broadcastTaskDeleted(taskId: string) {
        this.io.emit(SocketEvents.TASK_DELETED, { taskId });
    }

    /**
     * Send task assignment notification to specific user
     */
    notifyTaskAssigned(userId: string, task: any) {
        this.io.to(`user:${userId}`).emit(SocketEvents.TASK_ASSIGNED, {
            message: `You have been assigned to task: ${task.title}`,
            task,
        });
    }

    /**
     * Send notification to specific user
     */
    sendNotification(userId: string, notification: any) {
        this.io.to(`user:${userId}`).emit(SocketEvents.NOTIFICATION_NEW, notification);
    }

    /**
     * Get Socket.io server instance
     */
    getIO(): Server {
        return this.io;
    }
}

let socketHandler: SocketHandler;

export const initializeSocket = (io: Server): SocketHandler => {
    socketHandler = new SocketHandler(io);
    return socketHandler;
};

export const getSocketHandler = (): SocketHandler => {
    if (!socketHandler) {
        throw new Error('Socket handler not initialized');
    }
    return socketHandler;
};
