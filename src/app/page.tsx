'use client'
import Link from 'next/link';
import { useVoteStore } from '@/store/useVoteStore';
import { ArrowRight, Newspaper, Calendar, ShieldCheck, Heart, CheckCircle, LayoutGrid, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {


  const { isLoggedIn, user, checkAuth } = useVoteStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);



  const roles = [
    {
      title: "องค์การนิสิต",
      englishTitle: "Student Union",
      role: "ฝ่ายบริหารระดับมหาวิทยาลัย",
      description: "ทำหน้าที่คล้าย 'คณะรัฐมนตรี' วางแผนและจัดกิจกรรมส่วนกลางระดับมหาวิทยาลัย บริหารงบประมาณกิจกรรม และเป็นตัวแทนนิสิตประสานงานกับผู้บริหารมหาวิทยาลัย",
      icon: <LayoutGrid size={32} />,
      color: "bg-ballot-yellow",
      lightColor: "bg-ballot-yellow/50",
      textColor: "text-slate-600",
      borderColor: "border-ballot-yellow"
    },
    {
      title: "สโมสรนิสิต",
      englishTitle: "Faculty Student Committee",
      role: "ฝ่ายบริหารระดับคณะ",
      description: "ทำหน้าที่ดูแลกิจกรรมและสวัสดิการนิสิต 'ภายในคณะ' ตนเอง ประสานงานระหว่างนิสิตกับคณะ และเป็นผู้ขับเคลื่อนกิจกรรมสร้างสรรค์ตามอัตลักษณ์ของแต่ละคณะ",
      icon: <GraduationCap size={32} />,
      color: "bg-ballot-blue",
      lightColor: "bg-ballot-blue/50",
      textColor: "text-slate-600",
      borderColor: "border-ballot-blue"
    },
    {
      title: "สภานิสิต",
      englishTitle: "Student Council",
      role: "ฝ่ายนิติบัญญัติ & ตรวจสอบ",
      description: "ทำหน้าที่คล้าย 'สภาผู้แทนราษฎร' เป็นกระบอกเสียงตรวจสอบการทำงานขององค์การนิสิต พิจารณางบประมาณ และดูแลสิทธิสวัสดิภาพของนิสิตทุกคน",
      icon: <ShieldCheck size={32} />,
      color: "bg-ballot-pink",
      lightColor: "bg-ballot-pink/50",
      textColor: "text-slate-600",
      borderColor: "border-ballot-pink"
    }
  ];




  return (
    <main className=" bg-white">

      <div className="min-h-screen bg-slate-50">
        {/* --- Hero Section --- */}
        <section className="relative pt-20 pb-16 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-block px-4 py-1.5 mb-6 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest animate-bounce">
              E-VOTE 2026 is here
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-3 tracking-tighter">
              กำหนดอนาคต <span className="text-blue-600">มหาวิทยาลัย</span>
            </h1>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">
              เริ่มที่เสียงของคุณ
            </h1>

            {/* เงื่อนไขการแสดงปุ่มหรือข้อความขอบคุณ */}
            <div className="mt-10">
              {isLoggedIn && user?.has_voted ? (
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
                  <button className="group flex items-center gap-3 mx-auto bg-green-500 hover:bg-green-600 text-slate0 text-white px-10 py-4 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-slate-200 active:scale-95">
                    {isLoggedIn ? "เข้าสู่คูหาเลือกตั้ง" : "เข้าสู่ระบบเพื่อใช้สิทธิ์"}
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              )}
            </div>
            {/* {!user?.has_voted && (
            <Link href={isLoggedIn ? "/candidates" : "/login"}>
              <button className="group flex items-center gap-3 mx-auto bg-green-500 hover:bg-green-600 text-slate0 text-white px-10 py-4 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-slate-200 active:scale-95">
                {isLoggedIn ? "รายชื่อผู้สมัคร" : "เข้าสู่ระบบเพื่อตรวจสอบสิทธิ์"}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            )} */}
          </div>

        </section>

        {/* --- Knowledge Section --- */}
        <section className="py-14 bg-slate-100 ">
          <p className="text-center mx-auto text-slate-400 font-medium md:text-lg mb-10 leading-relaxed">
            ทำความรู้จักกับ 3 องค์กรหลักที่คุณต้องเลือกเข้าไปทำหน้าที่ <br className="hidden md:block" />
            เพื่อรักษาผลประโยชน์และสร้างสรรค์กิจกรรมในรั้วเหลืองเทา
          </p>
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {roles.map((item, idx) => (
                <div
                  key={idx}
                  className={`group bg-white rounded-[2.5rem] p-8 border ${item.borderColor} shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500`}
                >
                  <div className={`${item.lightColor} ${item.textColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    {item.icon}
                  </div>
                  <div className="mb-4">
                    <span className={`text-[12px] font-black uppercase tracking-[0.2em] ${item.textColor}`}>
                      {item.role}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{item.title}</h3>
                    <p className="text-[12px] font-bold text-slate-400 uppercase">{item.englishTitle}</p>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                    {item.description}
                  </p>
                  <div className={`h-1.5 w-12 ${item.color} rounded-full`} />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-slate-100 py-10 px-4">
        </section>
        {/* --- Simple Footer Info --- */}
        {/* <section className="py-10 px-4">
          <div className="p-10 max-w-4xl mx-auto bg-slate-900 rounded-[3rem] text-center text-white relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-4">สรุปสั้นๆ ให้จำง่าย</h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
                <SummaryBox title="องค์การฯ" desc="บริหารมหาวิทยาลัย" />
                <div className="hidden md:block h-12 w-px bg-white/20" />
                <SummaryBox title="สโมสรฯ" desc="บริหารคณะ" />
                <div className="hidden md:block h-12 w-px bg-white/20" />
                <SummaryBox title="สภานิสิต" desc="ตรวจสอบ" />
              </div>
            </div>
          </div>
        </section> */}

      </div>




















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

function SummaryBox({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="text-center">
      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <p className="text-xl font-black text-white">{desc}</p>
    </div>
  );
}