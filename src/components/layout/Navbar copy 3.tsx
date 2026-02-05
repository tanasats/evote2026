'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useVoteStore } from '@/store/useVoteStore';
import { 
  User, LogOut, LayoutDashboard, Settings, 
  Vote, Menu, X, ChevronDown, ShieldCheck 
} from 'lucide-react';

export default function Navbar() {
  const { user, isLoggedIn, logout, checkAuth } = useVoteStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  if (!mounted) return <nav className="h-16 bg-white border-b border-slate-100" />;

  const handleLogout = () => {
    logout(router);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Vote size={20} />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">
                E-VOTE <span className="text-blue-600">MSU</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isLoggedIn ? (
              <>
                <NavLinks role={user?.role} currentPath={pathname} />
                <div className="h-6 w-px bg-slate-200 mx-4" />
                <UserMenu user={user} onLogout={handleLogout} />
              </>
            ) : (
              <Link href="/login">
                <button className="bg-slate-100 text-slate-800 px-6 py-2 rounded-xl  hover:bg-slate-200 transition-all active:scale-95">
                  เข้าสู่ระบบ
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-2 animate-in slide-in-from-top-2">
          {isLoggedIn ? (
            <>
              <div className="px-4 py-3 bg-slate-50 rounded-2xl mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logged in as</p>
                <p className="text-sm font-black text-slate-900">{user?.name}</p>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                  {user?.role}
                </span>
              </div>
              <NavLinks role={user?.role} isMobile currentPath={pathname} />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={18} /> ออกจากระบบ
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">เข้าสู่ระบบ</button>
            </Link>
          )}
        </div>
      )}
      {JSON.stringify(user)}
    </nav>
  );
}

// --- Sub-components สำหรับแยก Logic ตาม Role ---

function NavLinks({ role, isMobile, currentPath }: { role: string, isMobile?: boolean, currentPath: string }) {
  const baseClass = isMobile 
    ? "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all "
    : "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ";

  const activeClass = "bg-blue-50 text-blue-600 ";
  const inactiveClass = "text-slate-500 hover:text-slate-900 hover:bg-slate-50 ";

  return (
    <>
      {/* สำหรับนิสิตทั่วไป */}
      {role === 'MEMBER' && (
        <Link href="/voting" className={`${baseClass} ${currentPath === '/voting' ? activeClass : inactiveClass}`}>
          <Vote size={18} /> เข้าสู่คูหาเลือกตั้ง
        </Link>
      )}

      {/* สำหรับเจ้าหน้าที่ */}
      {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        <Link href="/admin/dashboard" className={`${baseClass} ${currentPath.includes('/admin/dashboard') ? activeClass : inactiveClass}`}>
          <LayoutDashboard size={18} /> Dashboard สรุปผล
        </Link>
      )}

      {/* สำหรับผู้พัฒนาระบบ */}
      {role === 'SUPER_ADMIN' && (
        <Link href="/admin/settings" className={`${baseClass} ${currentPath.includes('/admin/settings') ? activeClass : inactiveClass}`}>
          <Settings size={18} /> ตั้งค่าระบบ
        </Link>
      )}

      <Link href="/profile" className={`${baseClass} ${currentPath === '/profile' ? activeClass : inactiveClass}`}>
        <User size={18} /> ข้อมูลส่วนตัว
      </Link>
    </>
  );
}

function UserMenu({ user, onLogout }: { user: any, onLogout: () => void }) {
  return (
    <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
      <div className="text-right hidden lg:block">
        <p className="text font-black text-slate-900 leading-none">{user?.name}</p>
        <span className="text-[12px] text-blue-600 font-bold uppercase tracking-tighter">
          {user?.faculty_name}
        </span>
      </div>
      <button 
        onClick={onLogout}
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        title="ออกจากระบบ"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}