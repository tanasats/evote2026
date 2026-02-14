'use client'

import { ReactNode } from 'react';
import { useVoteStore } from '@/store/useVoteStore';
import { hasPermission } from '@/utils/rbac';
import { Role } from '@/types/auth';

interface RoleGuardProps {
    children: ReactNode;
    requiredRole: Role | string;
    fallback?: ReactNode;
}

/**
 * RoleGuard Component
 * Conditionally renders children based on user's role
 * Uses role hierarchy - higher roles can access lower role content
 */
export default function RoleGuard({
    children,
    requiredRole,
    fallback = null
}: RoleGuardProps) {
    const { user } = useVoteStore();

    // Check if user has required permission
    if (!hasPermission(user?.role, requiredRole)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
