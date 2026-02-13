'use client'
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVoteStore } from '@/store/useVoteStore'; // เพิ่มการดึง Store เข้ามา
import {
  Settings, Users, UserCog, School, Users2,
  Calendar, BarChart3, ChevronRight, Menu, X,
  Activity, Vote
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useVoteStore(); // ดึงข้อมูล user เพื่อเช็ค role
  const [isOpen, setIsOpen] = useState(false);

  const menuGroups = [
    {
      title: "รายงานและตรวจสอบ",
      roleRequired: 'ADMIN', // ADMIN และ SUPER_ADMIN จะเห็นกลุ่มนี้
      items: [
        { name: "ผลคะแนน Real-time", href: "/admin/dashboard", icon: Activity },
        { name: "รายงานองค์การนิสิต", href: "/admin/reports/organization", icon: BarChart3 },
        { name: "รายงานสโมสรนิสิต", href: "/admin/reports/club", icon: BarChart3 },
        { name: "รายงานสภานิสิต", href: "/admin/reports/council", icon: BarChart3 },
      ]
    },
    {
      title: "จัดการข้อมูล",
      roleRequired: 'ADMIN', // ADMIN และ SUPER_ADMIN จะเห็นกลุ่มนี้
      items: [
        { name: "จัดการคณะ", href: "/admin/faculties", icon: School },
        { name: "จัดการผู้สมัคร", href: "/admin/candidates", icon: Users },
      ]
    },
    {
      title: "การตั้งค่าระบบ",
      roleRequired: 'SUPER_ADMIN', // เฉพาะ SUPER_ADMIN เท่านั้น
      items: [
        // { name: "สถานะการเลือกตั้ง", href: "/admin/settings", icon: Settings },
        { name: "วันและเวลาเปิด-ปิด", href: "/admin/settings/election", icon: Calendar },
      ]
    },
    {
      title: "จัดการผู้ใช้งาน",
      roleRequired: 'SUPER_ADMIN',
      items: [
        { name: "ข้อมูลนิสิต", href: "/admin/users/students", icon: Users2 },
        { name: "ข้อมูลเจ้าหน้าที่", href: "/admin/users/staffs", icon: UserCog },
      ]
    },
  ];

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* --- Mobile Header --- */}
      <div className="lg:hidden flex bg-slate-900 text-white sticky top-0 z-[60]">
        {/* <div className="font-black tracking-tighter text-lg">ADMIN <span className="text-blue-500">MSU</span></div> */}
        <div onClick={() => setIsOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer">
          <Menu size={24} />
        </div>
      </div>

      {/* --- Overlay Backdrop --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden animate-in fade-in duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* --- Sidebar Container --- */}
      <aside className={`scrollbar-thin
        fixed inset-y-0 left-0 z-[80] w-72 bg-slate-900 text-slate-300 px-6 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block shrink-0
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Header ใน Sidebar */}
        <div className="flex items-center justify-between py-3">
          <div className="lg:hidden flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Vote size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              E-VOTE <span className="text-blue-600">MSU</span>
            </span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-sidebar-scroll pr-2">
          {menuGroups.map((group, idx) => {
            // --- Logic การเช็คสิทธิ์ (RBAC) ---
            // 1. ถ้ากลุ่มต้องการ SUPER_ADMIN แต่ user เป็น ADMIN ให้ซ่อน
            if (group.roleRequired === 'SUPER_ADMIN' && user?.role !== 'SUPER_ADMIN') {
              return null;
            }

            return (
              <div key={idx} className="animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">
                  {group.title}
                </h3>
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSidebar}
                        className={`
                          group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200
                          ${isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'hover:bg-slate-800/50 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`} />
                          <span className="text-sm font-bold">{item.name}</span>
                        </div>
                        {isActive && <ChevronRight size={16} className="animate-in slide-in-from-left-2" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-slate-800">
          <p className="text-[10px] text-slate-600 font-medium text-center italic">
            Logged in as: <span className="text-slate-400">{user?.role}</span>
          </p>
          <p className="text-[10px] text-slate-600 font-medium text-center italic mt-1">© 2026 E-VOTE System v1.0</p>
        </div>
      </aside>
    </>
  );
}