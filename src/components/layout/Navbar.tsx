'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useVoteStore } from '@/store/useVoteStore';
import { Vote, LogIn, User, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '../ui/ConfirmModal';


export default function Navbar() {
  const { isLoggedIn, user, logout, checkAuth } = useVoteStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();

   useEffect(() => {
     checkAuth();
   }, [checkAuth]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsLogoutModalOpen(false);
    logout(router);
  };

  // const handleLogout = () => {
  //   if (confirm("ยืนยันการออกจากระบบ?")) {
  //     logout(router); // เรียกใช้ logout และส่ง router เข้าไป
  //   }
  // };

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white backdrop-blur-md border-b border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* ซ้าย: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Vote className="text-white" size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">E-VOTE</span>
        </Link>

        {/* ขวา: Menu */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <Link href="/login">
              <button className="flex items-center gap-2 bg-white text-slate-700 px-5 py-2 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer">
                <LogIn size={16} /> เข้าสู่ระบบ
              </button>
            </Link>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-3 bg-slate-50 rounded-full border border-slate-200 hover:bg-slate-100 transition-all"
              >
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                  <User size={18} />
                </div>
                <span className="text-sm font-bold text-slate-700 hidden sm:block">{user?.name}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[110]">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1 text-blue-800">
                    <p>{user?.student_id}</p>
                    <p>{user?.name}</p>
                  </div>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                    <User size={16} /> โปรไฟล์
                  </Link>
                  <button 
                    onClick={()=> setIsLogoutModalOpen(true)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors mt-1 border-t border-slate-50"
                  >
                    <LogOut size={16} /> ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {JSON.stringify(user)}

      <ConfirmModal 
      isOpen={isLogoutModalOpen}
      onClose={() => setIsLogoutModalOpen(false)}
      onConfirm={() =>  handleLogout()}
      title="ออกจากระบบ?"
      description="คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบในขณะนี้?"
      confirmText="ออกจากระบบ"
      type="danger"
    />
    </nav>
  );
}