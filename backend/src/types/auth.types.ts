export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
    };
    token: string;
}

export interface JwtPayload {
    userId: string;
    email: string;
}

export interface AuthRequest extends Request {
    userId?: string;
}
