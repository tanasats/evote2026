'use client'
import { Heart, Github, Globe, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-slate-100 pt-12 pb-8">
      {/* <div className="max-w-7xl mx-auto px-4"> */}
      <div className="max-w-full mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-slate-300">

          {/* ส่วนซ้าย: Copyright & Description */}
          <div className="max-w-sm">
            <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tighter">
              ELECTION <span className="text-blue-600">V0.5-Build1</span>
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              ระบบลงคะแนนเลือกตั้งออนไลน์ที่โปร่งใส ตรวจสอบได้ และมั่นคงปลอดภัย
              เพื่อก้าวต่อไปของประชาธิปไตยในสถานศึกษา
            </p>
          </div>

          {/* ส่วนขวา: Developer Info & Links */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Developed by</h3>
              <div className="space-y-2">
                <p className="text-sm text-slate-700">งานพัฒนาระบบสารสนเทศ สำนักคอมพิวเตอร์ </p>
                <div className="flex gap-3">
                  <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
                    <Github size={18} />
                  </Link>
                  <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
                    <Globe size={18} />
                  </Link>
                  <Link href="mailto:dev@university.ac.th" className="text-slate-400 hover:text-slate-900 transition-colors">
                    <Mail size={18} />
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Support</h3>
              <ul className="text-sm font-medium text-slate-600 space-y-2">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">คู่มือการใช้งาน</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">แจ้งปัญหา</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ส่วนล่างสุด: Copyright Line */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium">
            © {currentYear} Computer Center @MSU. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            Program by <Heart size={12} className="text-red-400 fill-current" />
            <span className="text-slate-600">Mr.Tanasat Sudjing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}