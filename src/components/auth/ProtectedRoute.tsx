'use client'

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useVoteStore } from '@/store/useVoteStore';
import { canAccessRoute } from '@/utils/rbac';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredAuth?: boolean;
}

/**
 * ProtectedRoute Component
 * Client-side route protection (additional layer to middleware)
 * Shows loading state while checking authentication
 */
export default function ProtectedRoute({
    children,
    requiredAuth = true
}: ProtectedRouteProps) {
    const { user, isLoggedIn, checkAuth } = useVoteStore();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        checkAuth();

        const timer = setTimeout(() => {
            const currentPath = window.location.pathname;

            // Check if route requires authentication
            if (requiredAuth && !isLoggedIn) {
                router.replace('/login');
                return;
            }

            // Check if user can access current route
            if (!canAccessRoute(user?.role, currentPath)) {
                router.replace('/');
                return;
            }

            setIsAuthorized(true);
            setIsChecking(false);
        }, 100);

        return () => clearTimeout(timer);
    }, [isLoggedIn, user?.role, router, checkAuth, requiredAuth]);

    // Show loading state
    if (isChecking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 font-bold">กำลังตรวจสอบสิทธิ์...</p>
            </div>
        );
    }

    // Show nothing if not authorized (will redirect)
    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
