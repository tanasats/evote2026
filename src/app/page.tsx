'use client'
import Link from 'next/link';
import { useVoteStore } from '@/store/useVoteStore';
import { ArrowRight, Newspaper, Calendar, ShieldCheck, Heart, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {


  const { isLoggedIn, user, checkAuth} = useVoteStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  return (
    <main className=" bg-white">
      {/* Hero Section */}
<section className="py-20 px-4 text-center bg-slate-100 from-slate-50 to-white">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <ShieldCheck size={14} /> ระบบเลือกตั้งโปร่งใส ตรวจสอบได้
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
            กำหนดอนาคตนิสิต <br /><span className="text-blue-600">ด้วยปลายนิ้วคุณ</span>
          </h1>
          {/* เงื่อนไขการแสดงปุ่มหรือข้อความขอบคุณ */}
          <div className="mt-10">
            {isLoggedIn && user?.has_voted=="true" ?(
              /* กรณีที่ 1: Login แล้ว และลงคะแนนแล้ว */
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="inline-flex flex-col items-center p-8 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-100">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">ท่านได้ใช้สิทธิ์ลงคะแนนเรียบร้อยแล้ว</h3>
                  <p className="text-slate-500 mb-6 max-w-sm">
                    ขอขอบคุณที่ร่วมเป็นส่วนหนึ่งในการขับเคลื่อนมหาวิทยาลัย <br />คะแนนของท่านถูกบันทึกเข้าสู่ระบบอย่างปลอดภัยแล้ว
                  </p>
                  <div className="flex items-center gap-2 text-red-600 font-bold">
                    <Heart size={18} fill="currentColor" />
                    <span className='text-green-600'>ขอบคุณสำหรับพลังเสียงของท่าน</span>
                  </div>
                </div>
              </div>
            ) : (
              /* กรณีที่ 2: ยังไม่ Login หรือยังไม่ได้ลงคะแนน */
              <Link href={isLoggedIn ? "/voting" : "/login"}>
                <button className="group flex items-center gap-3 mx-auto bg-green-500 hover:bg-green-600 text-slate0 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95">
                  {isLoggedIn ? "เข้าสู่คูหาเลือกตั้ง" : "เข้าสู่ระบบเพื่อใช้สิทธิ์"}
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            )}
          </div>
        </div>
        {/* {JSON.stringify(user)} */}
      </section>

      {/* ประกาศข่าวสาร */}
      {/* <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900">ประกาศและข่าวสาร</h2>
            <p className="text-slate-500">ข้อมูลสำคัญสำหรับการเลือกตั้งปีนี้</p>
          </div>
          <button className="text-blue-600 font-bold text-sm hover:underline">ดูทั้งหมด</button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <NewsCard 
            title="ประกาศรายชื่อผู้สมัครรับเลือกตั้งอย่างเป็นทางการ" 
            date="15 Jan 2026"
            category="ประกาศ"
          />
          <NewsCard 
            title="คู่มือการลงคะแนนออนไลน์ผ่านระบบ E-VOTE" 
            date="12 Jan 2026"
            category="คู่มือ"
          />
          <NewsCard 
            title="ข้อควรปฏิบัติและกฎระเบียบในการหาเสียง" 
            date="10 Jan 2026"
            category="กฎระเบียบ"
          />
        </div>
      </section> */}
      
    </main>
  );
}

function NewsCard({ title, date, category }: any) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-video bg-slate-100 rounded-3xl mb-4 overflow-hidden relative">
        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">
          {category}
        </div>
        <div className="w-full h-full flex items-center justify-center text-slate-300">
          <Newspaper size={48} />
        </div>
      </div>
      <p className="text-slate-400 text-xs font-bold mb-2 flex items-center gap-2">
        <Calendar size={12} /> {date}
      </p>
      <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
        {title}
      </h3>
    </div>
  );
}