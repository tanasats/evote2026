'use client'
import { useVoteStore } from '@/store/useVoteStore';
import { User, Mail, School, Hash, ShieldCheck, ArrowLeft, CheckCircle2 ,MessageCircleQuestionMark} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn } = useVoteStore();

  // ป้องกันการเข้าถึงหากยังไม่ได้ Login
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-bold animate-pulse">กำลังตรวจสอบข้อมูล...</p>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        
        {/* ปุ่มย้อนกลับ */}
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} /> ย้อนกลับ
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          {/* Header ส่วนรูปโปรไฟล์ */}
          <div className="relative h-32 bg-linear-to-r from-slate-800 to-slate-900">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="relative w-28 h-28 rounded-3xl bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-[1.2rem] bg-slate-100 flex items-center justify-center overflow-hidden">
                  {/* รูป Mockup โดยใช้ Initial ของชื่อ */}
                  <span className="text-4xl font-black text-slate-400 uppercase">
                    {user?.name?.charAt(0)}
                  </span>
                  {/* กรณีมีรูปจริงในอนาคต: <Image src={user.image} fill alt="profile" /> */}
                </div>
                {/* สถานะการยืนยันตัวตน */}
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white">
                  <ShieldCheck size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* ข้อมูลผู้ใช้งาน */}
          <div className="pt-16 pb-10 px-8 text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-1">{user?.name}</h1>
            <p className="text-blue-600 mb-8">{user?.faculty_name}</p>

            <div className="space-y-4 text-left">
              <ProfileInfoItem icon={<Hash size={18} />} label="รหัสนิสิต" value={user?.student_id} />
              <ProfileInfoItem icon={<School size={18} />} label="สังกัดคณะ" value={user?.faculty_name} />
              <ProfileInfoItem icon={<Mail size={18} />} label="อีเมลมหาวิทยาลัย" value={`${user?.student_id}@msu.ac.th`} />
            </div>

            {/* ส่วนแสดงสถานะการโหวต */}
            <div className={`mt-10 p-5 rounded-3xl flex items-center justify-between ${user?.has_voted ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
              <div className="text-left">
                <p className="text-[12px] tracking-widest text-slate-400 mb-1">สถานะการใช้สิทธิ์</p>
                <p className={`font-bold ${user?.has_voted ? 'text-green-700' : 'text-amber-700'}`}>
                  {user?.has_voted ? 'ใช้สิทธิ์เรียบร้อยแล้ว' : 'ยังไม่ได้ใช้สิทธิ์'}
                </p>
              </div>
              {user?.has_voted ? (
                <CheckCircle2 className="text-green-500" size={28} />
              ) : (
                // <div className="w-8 h-8 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                <MessageCircleQuestionMark className="text-amber-500" size={28} />
              )}
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm">
          ข้อมูลนี้ถูกดึงมาจากฐานข้อมูลทะเบียนนิสิต <br />หากข้อมูลไม่ถูกต้องโปรดติดต่อผู้พัฒนาระบบ
        </p>
      </div>
    </main>
  );
}

// Sub-component สำหรับแต่ละรายการข้อมูล
function ProfileInfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-[12px]  tracking-widest text-slate-400 uppercase tracking-tight">{label}</p>
        <p className="  text-slate-700">{value || 'ไม่ระบุ'}</p>
      </div>
    </div>
  );
}