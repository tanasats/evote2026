'use client'
import Link from 'next/link';
import { useVoteStore } from '@/store/useVoteStore';
import {
  ArrowRight, Newspaper, Calendar, ShieldCheck,
  Heart, CheckCircle, LayoutGrid, GraduationCap,
  Clock, UserCheck, Loader2,
  Instagram,
  Facebook,
  Mail,

} from 'lucide-react';
import { useEffect, useState } from 'react';
import adminService from '@/services/adminService';
import publicService from '@/services/publicService';

export default function LandingPage() {
  const { isLoggedIn, user, checkAuth } = useVoteStore();

  // --- States สำหรับเวลา ---
  const [electionTime, setElectionTime] = useState<{ start: Date, end: Date } | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const [systemStatus, setSystemStatus] = useState<'UPCOMING' | 'LIVE' | 'CLOSED'>('UPCOMING');
  const [loading, setLoading] = useState(true);
  // เพิ่มใน LandingPage Component
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    fetchSystemSettings();
  }, [checkAuth]);

  useEffect(() => {
    const loadBanners = async () => {
      const data = await publicService.getActiveBanners();
      setBanners(data);
    };
    loadBanners();
  }, []);


  // ดึงเวลาเปิด-ปิดจาก Database
  const fetchSystemSettings = async () => {
    try {
      const settings = await adminService.getSystemSettings();
      if (settings.start_time && settings.end_time) {
        setElectionTime({
          start: new Date(settings.start_time),
          end: new Date(settings.end_time)
        });
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  // Logic การนับถอยหลังและเช็คสถานะ
  useEffect(() => {
    if (!electionTime) return;

    const timer = setInterval(() => {
      const now = new Date();

      if (now < electionTime.start) {
        setSystemStatus('UPCOMING');
        const diff = electionTime.start.getTime() - now.getTime();
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      } else if (now >= electionTime.start && now <= electionTime.end) {
        setSystemStatus('LIVE');
        setTimeLeft(null);
      } else {
        setSystemStatus('CLOSED');
        setTimeLeft(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [electionTime]);

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
    <main className="bg-white">
      <div className="min-h-screen bg-slate-50">


        {/* ส่วน Banner ประชาสัมพันธ์ */}
        {banners.length > 0 && (
          <section className="w-full mx-auto">
            <div className="relative overflow-hidden shadow-2xl shadow-blue-100 bg-slate-100">
              {/* ในกรณีที่มีหลายรูป สามารถทำ Loop หรือใช้ Swiper ได้ */}
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGES_URL}${banners[0].image_url}`}
                className="w-full h-full object-cover transition-opacity duration-500"
                alt={banners[0].title}
              />
            </div>
          </section>
        )}


        <section className="relative pt-10 pb-16 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-block px-4 py-1.5 mb-6 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest animate-bounce">
              Election 2026 is here
            </div>



            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-3 tracking-tighter">
              กำหนดอนาคต <span className="text-blue-600">มหาวิทยาลัย</span>
            </h1>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">
              เริ่มที่เสียงของคุณ
            </h1>

            {/* --- ส่วนแสดงผล Countdown และปุ่ม Action --- */}
            <div className="mt-10 flex flex-col items-center">
              {loading ? (
                <Loader2 className="animate-spin text-slate-300" size={32} />
              ) : (
                <>
                  {/* แสดง Countdown หากยังไม่ถึงเวลา */}
                  {systemStatus === 'UPCOMING' && timeLeft && (
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">ระบบโหวตจะเปิดให้ใช้งานในอีก</p>
                      <div className="flex gap-2 justify-center items-center">
                        <CountdownBlock value={timeLeft.days} label="Days" />
                        <span className="text-2xl font-black text-slate-300">:</span>
                        <CountdownBlock value={timeLeft.hours} label="Hours" />
                        <span className="text-2xl font-black text-slate-300">:</span>
                        <CountdownBlock value={timeLeft.minutes} label="Mins" />
                        <span className="text-2xl font-black text-slate-300">:</span>
                        <CountdownBlock value={timeLeft.seconds} label="Secs" />
                      </div>
                    </div>
                  )}

                  {/* เงื่อนไขการแสดงปุ่มตามสถานะระบบและ User */}
                  <div className="flex flex-col items-center gap-6">
                    {isLoggedIn && user?.has_voted ? (
                      /* กรณีที่ลงคะแนนแล้ว */
                      <div className="animate-in fade-in zoom-in duration-500">
                        <div className="inline-flex flex-col items-center p-8 bg-green-50 rounded-[2.5rem] border border-green-100 shadow-sm">
                          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-100">
                            <CheckCircle size={32} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-800 mb-2">ท่านได้ใช้สิทธิ์เรียบร้อยแล้ว</h3>
                          <p className="text-slate-500 mb-4 max-w-sm text-sm">
                            คะแนนของท่านถูกบันทึกเข้าสู่ระบบอย่างปลอดภัย <br />ขอบคุณที่ร่วมสร้างสรรค์มหาวิทยาลัยของเรา
                          </p>
                          <div className="flex items-center gap-2 text-green-600 font-black">
                            <Heart size={18} fill="currentColor" />
                            <span>ขอบคุณสำหรับพลังเสียง</span>
                          </div>
                        </div>
                      </div>
                    ) : systemStatus === 'LIVE' ? (
                      /* กรณีที่อยู่ในช่วงเวลาเลือกตั้ง */
                      <Link href={isLoggedIn ? "/voting" : "/login"}>
                        <button className="group flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-green-200 active:scale-95 animate-pulse">
                          เข้าสู่คูหาเลือกตั้ง
                          <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </button>
                      </Link>
                    ) : systemStatus === 'UPCOMING' ? (
                      /* กรณีที่ยังไม่ถึงเวลาเปิดหีบ - แสดงปุ่มตรวจสอบรายชื่อ */
                      <Link href={isLoggedIn ? "/profile" : "/login"}>
                        <button className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-blue-100 active:scale-95">
                          <UserCheck size={24} />
                          ตรวจสอบรายชื่อผู้มีสิทธิ์
                          <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </button>
                      </Link>
                    ) : (
                      /* กรณีที่ปิดการเลือกตั้งแล้ว */
                      <div className="bg-slate-200 text-slate-500 px-10 py-5 rounded-3xl font-black text-xl">
                        ปิดหีบเลือกตั้งเรียบร้อยแล้ว
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="py-6 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex justify-center text-slate-600">
            <div>
              <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">คณะกรรมการการเลือกตั้ง</h3>
              <p className="pl-6">
                นายวีรภัทร บุญรัตน์ (ประธานกกต)  0994690837 <br />
                นางสาวกัลย์สุดา อำไพ (ผู้ช่วยเลขา) 0985126134 <br />
                <span className="flex items-center gap-2"><Facebook /> Facebook: <a href='https://www.facebook.com/profile.php?id=100064335000698' className="text-blue-600">เลือกตั้งองค์กรนิสิต มมส. MSU Election</a></span>
                <span className="flex items-center gap-2"><Instagram /> Instagram : <a href='https://www.instagram.com/msu_election/' className="text-blue-600">MSU_ELECTION 2026</a></span>
                <span className="flex items-center gap-2"><Mail /> Email: msusc@msu.ac.th</span>
              </p>
            </div>
          </div>
        </section>

        {/* --- Knowledge Section --- */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-800 mb-4">ทำความรู้จักตำแหน่งที่เปิดรับเลือกตั้ง</h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                ศึกษาบทบาทหน้าที่ของตัวแทนแต่ละองค์กร เพื่อประกอบการตัดสินใจ <br className="hidden md:block" />
                ก่อนเข้าสู่คูหาเลือกตั้งครั้งสำคัญในรั้วเหลืองเทา
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {roles.map((item, idx) => (
                <div
                  key={idx}
                  className={`group bg-white rounded-[3rem] p-10 border ${item.borderColor} shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500`}
                >
                  <div className={`${item.lightColor} ${item.textColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-500`}>
                    {item.icon}
                  </div>
                  <div className="mb-6">
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${item.lightColor} ${item.textColor}`}>
                      {item.role}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-4">{item.title}</h3>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{item.englishTitle}</p>
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
      </div >
    </main >
  );
}

// --- คอมโพเนนต์ย่อยสำหรับ Countdown ---
function CountdownBlock({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-2">
        <span className="text-3xl md:text-5xl font-black text-blue-600">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}