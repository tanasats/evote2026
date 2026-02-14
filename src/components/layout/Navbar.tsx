'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useVoteStore } from '@/store/useVoteStore';
import {
  User, LogOut, LayoutDashboard, Settings,
  Vote, Menu, X, ChevronDown, ShieldCheck
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';



export default function Navbar() {
  const { user, isLoggedIn, candidatesData, logout, checkAuth } = useVoteStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  if (!mounted) return <nav className="h-16 bg-white border-b border-slate-100" />;

  const handleLogout = () => {
    setIsOpen(false);
    setIsLogoutModalOpen(false);
    logout(router);
  };
  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between h-16 items-center">

          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Vote size={20} />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">
                Election <span className="text-blue-600">MSU</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isLoggedIn ? (
              <>
                <NavLinks has_voted={user?.has_voted} role={user?.role} currentPath={pathname} />
                {/* <div className="h-6 w-px bg-slate-200 mx-4" /> */}
                <UserMenu user={user} onLogoutClick={openLogoutModal} />
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
              {/* <div className="px-4 py-3 bg-slate-50 rounded-2xl mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logged in as</p>
                <p className="text-sm font-black text-slate-900">{user?.name}</p>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                  {user?.role}
                </span>
              </div> */}



              <div className="flex items-center gap-4 pb-4">
                <div className="text-left">
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Logged in as</p>
                  <p className="text-2xl font-black text-slate-900 leading-none">{user?.name}</p>
                  <p className="text-[14px] text-blue-600 font-bold uppercase">{user?.faculty_name}</p>
                </div>
                {/* <div className="w-12 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.name?.charAt(0)}
            </div> */}
              </div>



              <NavLinks has_voted={user?.has_voted} role={user?.role} isMobile currentPath={pathname} />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={18} /> ออกจากระบบ
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <button className="w-full bg-slate-100 text-slate-800 py-3 rounded-xl">เข้าสู่ระบบ</button>
            </Link>
          )}
        </div>
      )}
      {/* {JSON.stringify(user)} */}
      {/* {JSON.stringify(candidatesData)} */}

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => handleLogout()}
        title="ออกจากระบบ?"
        description="คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบในขณะนี้?"
        confirmText="ออกจากระบบ"
        type="danger"
      />

    </nav>
  );
}

// --- Sub-components สำหรับแยก Logic ตาม Role ---

function NavLinks({ has_voted, role, isMobile, currentPath }: { has_voted: boolean | undefined, role: string | undefined, isMobile?: boolean, currentPath: string }) {
  const baseClass = isMobile
    ? "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all "
    : "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ";

  const activeClass = "bg-blue-50 text-blue-600 ";
  const inactiveClass = "text-slate-500 hover:text-slate-900 hover:bg-slate-50 ";

  return (
    <>
      {/* สำหรับนิสิตทั่วไป */}
      {(role === 'MEMBER' && !has_voted) && (
        <Link href="/candidates" className={`${baseClass} ${currentPath === '/candidates' ? activeClass : inactiveClass}`}>
          <Vote size={18} /> รายชื่อผู้สมัคร
        </Link>
      )}

      {/* สำหรับเจ้าหน้าที่ */}
      {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        <Link href="/admin/dashboard" className={`${baseClass} ${currentPath.includes('/admin/dashboard') ? activeClass : inactiveClass}`}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
      )}

      {/* สำหรับผู้พัฒนาระบบ */}
      {/* {role === 'SUPER_ADMIN' && (
        <Link href="/admin/settings" className={`${baseClass} ${currentPath.includes('/admin/settings') ? activeClass : inactiveClass}`}>
          <Settings size={18} /> ตั้งค่าระบบ
        </Link>
      )} */}

      <Link href="/profile" className={`${baseClass} ${currentPath === '/profile' ? activeClass : inactiveClass}`}>
        <User size={18} /> ข้อมูลส่วนตัว
      </Link>
    </>
  );
}



function UserMenu({ user, onLogoutClick }: { user: any, onLogoutClick: () => void }) {
  return (
    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
      {/* <div className="text-right hidden lg:block">
        <p className="text font-black text-slate-900 leading-none">{user?.name}</p>
        <span className="text-[12px] text-blue-600 font-bold uppercase tracking-tighter">
          {user?.faculty_name}
        </span>
      </div> */}

      <div className="flex items-center gap-4">
        <div className="text-right pl-3">
          <p className="text font-black text-slate-900 leading-none">{user?.name}</p>
          <p className="text-[12px] text-blue-600 font-bold uppercase">{user?.faculty_name}</p>
        </div>
        <div className="text-2xl w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          {user?.name?.charAt(0)}
        </div>
      </div>

      <button
        onClick={onLogoutClick}
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        title="ออกจากระบบ"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}