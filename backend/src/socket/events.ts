export const SocketEvents = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',

    TASK_CREATED: 'task:created',
    TASK_UPDATED: 'task:updated',
    TASK_DELETED: 'task:deleted',
    TASK_ASSIGNED: 'task:assigned',

    NOTIFICATION_NEW: 'notification:new',

    JOIN_ROOM: 'join:room',
    LEAVE_ROOM: 'leave:room',
} as const;
