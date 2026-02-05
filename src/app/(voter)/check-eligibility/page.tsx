// src/app/(voter)/check-eligibility/page.tsx
'use client'
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export default function CheckEligibility() {
  const user = { name: "สมชาย รักเรียน", id: "65010912345", faculty: "คณะวิศวกรรมศาสตร์", status: "ELIGIBLE" };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-black">ยืนยันสิทธิ์เลือกตั้ง</h1>
          <p className="text-blue-100 opacity-80">ปีการศึกษา 2568</p>
        </div>

        <div className="p-8 space-y-6">
          {/* ข้อมูลผู้มีสิทธิ์ */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">ชื่อ-นามสกุล</p>
                <p className="font-bold text-slate-900">{user.name}</p>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">คณะที่สังกัด</p>
                <p className="font-bold text-slate-900">{user.faculty}</p>
             </div>
          </div>

          {/* สิทธิการลงคะแนน */}
          <div>
            <h3 className="font-black text-slate-900 mb-4 px-2">สิทธิการลงคะแนนของคุณ</h3>
            <div className="space-y-3">
              <BallotCard title="เลือกตั้งองค์การนิสิต" type="ส่วนกลาง" />
              <BallotCard title="เลือกตั้งสภานิสิต" type="เขตคณะวิศวกรรมศาสตร์" />
              <BallotCard title="เลือกตั้งสโมสรนิสิต" type="สังกัดคณะวิศวกรรมศาสตร์" />
            </div>
          </div>

          <div className="pt-4">
             <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                ดูรายชื่อผู้สมัครในเขตของคุณ <ExternalLink size={18} />
             </button>
          </div>

          <p className="text-center text-xs text-slate-400 font-medium">
            หากข้อมูลไม่ถูกต้อง กรุณาติดต่อกองกิจการนิสิต ภายในวันที่ 10 ก.พ. นี้
          </p>
        </div>
      </div>
    </div>
  );
}

function BallotCard({ title, type }: { title: string, type: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
      <div>
        <p className="font-bold text-slate-800">{title}</p>
        <p className="text-[10px] font-bold text-blue-500 uppercase">{type}</p>
      </div>
      <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
        Ready
      </div>
    </div>
  );
} 