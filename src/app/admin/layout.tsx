'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVoteStore } from '@/store/useVoteStore';
import AdminSidebar from '@/app/admin/AdminSidebar';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoggedIn, checkAuth } = useVoteStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. ตรวจสอบสถานะจาก Token/Cookie ใหม่เพื่อความชัวร์
    checkAuth();

    // ให้เวลา Zustand Rehydrate ข้อมูลสักครู่ (ลดเวลาลงเพราะมี middleware ป้องกันแล้ว)
    const timer = setTimeout(() => {
      // 2. เช็คสิทธิ์: ต้อง Login และต้องเป็น ADMIN หรือ SUPER_ADMIN เท่านั้น
      // (เราอนุญาตให้ Admin เข้า Layout นี้ได้ แต่จะไปล็อคเมนูย่อยใน Sidebar แทน)
      if (!isLoggedIn || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
        router.replace('/'); // ดีดกลับหน้าหลักถ้าไม่มีสิทธิ์
      } else {
        setIsAuthorized(true);
      }
      setLoading(false);
    }, 100); // ลดจาก 500ms เป็น 100ms

    return () => clearTimeout(timer);
  }, [isLoggedIn, user?.role, router, checkAuth]);

  // แสดง Loading ระหว่างเช็คสิทธิ์
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-bold">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
      </div>
    );
  }

  // กรณีไม่มีสิทธิ์ (ป้องกันการเห็นเนื้อหาแวบเดียวก่อนโดน Redirect)
  if (!isAuthorized) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar สำหรับ Admin */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header ย่อยในหน้า Admin */}
        {/* <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
              System Control Panel
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
              <p className="text-[10px] text-blue-600 font-bold uppercase">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header> */}

        {/* ส่วนเนื้อหาที่เปลี่ยนไปตาม Route */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto px-8 py-4 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}