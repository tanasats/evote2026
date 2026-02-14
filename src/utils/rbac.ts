// RBAC (Role-Based Access Control) Utility Functions

import { Role } from '@/types/auth';

// Role hierarchy levels - higher number = more permissions
const roleHierarchy: Record<Role, number> = {
    [Role.SUPER_ADMIN]: 3,
    [Role.ADMIN]: 2,
    [Role.MEMBER]: 1
};

/**
 * Check if user has permission based on role hierarchy
 * @param userRole - Current user's role
 * @param requiredRole - Required role for the action
 * @returns true if user has sufficient permissions
 */
export const hasPermission = (
    userRole: Role | string | undefined,
    requiredRole: Role | string
): boolean => {
    if (!userRole) return false;

    const userLevel = roleHierarchy[userRole as Role];
    const requiredLevel = roleHierarchy[requiredRole as Role];

    if (userLevel === undefined || requiredLevel === undefined) {
        return false;
    }

    return userLevel >= requiredLevel;
};

/**
 * Check if user can access a specific route
 * @param userRole - Current user's role
 * @param pathname - Route pathname
 * @returns true if user can access the route
 */
export const canAccessRoute = (
    userRole: Role | string | undefined,
    pathname: string
): boolean => {
    // Public routes
    if (pathname === '/' || pathname === '/login') {
        return true;
    }

    // Voting routes - require authentication
    if (pathname.startsWith('/voting') ||
        pathname.startsWith('/summary') ||
        pathname.startsWith('/success') ||
        pathname.startsWith('/profile')) {
        return !!userRole;
    }

    // Admin routes - require ADMIN or SUPER_ADMIN
    if (pathname.startsWith('/admin')) {
        // SUPER_ADMIN only routes
        if (pathname.startsWith('/admin/settings') ||
            pathname.startsWith('/admin/users')) {
            return hasPermission(userRole, Role.SUPER_ADMIN);
        }

        // General admin routes
        return hasPermission(userRole, Role.ADMIN);
    }

    return true;
};

/**
 * Get numeric level of a role
 * @param role - Role to get level for
 * @returns Numeric level or 0 if invalid
 */
export const getRoleLevel = (role: Role | string | undefined): number => {
    if (!role) return 0;
    return roleHierarchy[role as Role] || 0;
};

/**
 * Check if a role is valid
 * @param role - Role to validate
 * @returns true if role is valid
 */
export const isValidRole = (role: string | undefined): role is Role => {
    if (!role) return false;
    return Object.values(Role).includes(role as Role);
};

/**
 * Get redirect path based on user role and current path
 * @param userRole - Current user's role
 * @param pathname - Current pathname
 * @returns Redirect path or null if no redirect needed
 */
export const getRedirectPath = (
    userRole: Role | string | undefined,
    pathname: string
): string | null => {
    // Not logged in
    if (!userRole) {
        if (pathname !== '/' && pathname !== '/login') {
            return '/login';
        }
        return null;
    }

    // Already on login page but logged in
    if (pathname === '/login') {
        if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) {
            return '/admin/dashboard';
        }
        return '/voting';
    }

    // Trying to access admin routes without permission
    if (pathname.startsWith('/admin')) {
        if (!hasPermission(userRole, Role.ADMIN)) {
            return '/';
        }

        // ADMIN trying to access SUPER_ADMIN routes
        if ((pathname.startsWith('/admin/settings') || pathname.startsWith('/admin/users')) &&
            !hasPermission(userRole, Role.SUPER_ADMIN)) {
            return '/admin/dashboard';
        }
    }

    return null;
};