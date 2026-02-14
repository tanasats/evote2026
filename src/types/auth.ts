// Authentication and Authorization Types

export enum Role {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface JWTPayload {
    id: string;
    name: string;
    email: string;
    role: Role;
    faculty_code: string;
    faculty_name: string;
    has_voted: boolean;
    iat: number;
    exp: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    faculty_code: string;
    faculty_name: string;
    has_voted: boolean;
}

export interface AuthState {
    user: User | null;
    isLoggedIn: boolean;
}
