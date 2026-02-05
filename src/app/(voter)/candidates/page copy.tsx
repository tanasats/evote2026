// src/app/(voter)/candidates/page.tsx
'use client'
import { User, ShieldCheck, Landmark } from 'lucide-react';

export default function CandidatesList() {
  // สมมติว่านี่คือข้อมูลที่ดึงมาจาก API โดยกรองตามคณะของผู้ใช้ (เช่น คณะวิศวกรรมศาสตร์)
  const candidateSections = [
    {
      title: "ผู้สมัครองค์การนิสิต",
      description: "ผู้สมัครระดับส่วนกลาง (เห็นเหมือนกันทั้งมหาวิทยาลัย)",
      icon: <ShieldCheck className="text-blue-600" />,
      candidates: [
        { id: 1, no: "1", name: "ทีมเพื่อนิสิต", image: "/path/to/img1.jpg", policy: "เพิ่มสวัสดิการรถรับส่ง..." },
        { id: 2, no: "2", name: "ทีมก้าวใหม่", image: "/path/to/img2.jpg", policy: "ปรับปรุงห้องสมุด 24 ชม..." },
      ]
    },
    {
      title: "ผู้สมัครสภานิสิต (เขตวิศวกรรมศาสตร์)",
      description: "ตัวแทนคณะเพื่อตรวจสอบการทำงานของส่วนกลาง",
      icon: <Landmark className="text-purple-600" />,
      candidates: [
        { id: 10, no: "1", name: "นายขยัน เรียนดี", image: "/path/to/img3.jpg", policy: "เป็นกระบอกเสียงให้ชาววิศวะ..." },
      ]
    },
    {
      title: "ผู้สมัครสโมสรนิสิตวิศวกรรมศาสตร์",
      description: "ผู้บริหารกิจกรรมภายในคณะของคุณ",
      icon: <User className="text-emerald-600" />,
      candidates: [
        { id: 20, no: "1", name: "กลุ่ม Gear Progress", image: "/path/to/img4.jpg", policy: "จัดค่ายติวและกีฬาคณะ..." },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">รายชื่อผู้สมัคร</h1>
        <p className="text-slate-500 font-bold">ข้อมูลเฉพาะสำหรับนิสิตคณะวิศวกรรมศาสตร์</p>
      </header>

      {candidateSections.map((section, idx) => (
        <section key={idx} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
              {section.icon}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 leading-none">{section.title}</h2>
              <p className="text-sm text-slate-400 font-medium mt-1">{section.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.candidates.map((can) => (
              <div key={can.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="flex p-6 gap-5">
                  {/* รูปภาพผู้สมัคร */}
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border-2 border-slate-50">
                    <img src={can.image} alt={can.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* ข้อมูลเบื้องต้น */}
                  <div className="flex-1">
                    <div className="text-xs font-black text-blue-600 mb-1">หมายเลข</div>
                    <div className="text-4xl font-black text-slate-900 mb-2 leading-none">{can.no}</div>
                    <div className="font-bold text-slate-800 line-clamp-1">{can.name}</div>
                  </div>
                </div>
                
                {/* นโยบายย่อๆ */}
                <div className="px-6 pb-6 mt-auto">
                  <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed">
                    <span className="font-black text-slate-900 block mb-1">นโยบายหลัก:</span>
                    {can.policy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      
      {/* ปุ่มกลับหน้าหลัก */}
      <footer className="text-center mt-10">
        <button onClick={() => window.history.back()} className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
          ← ย้อนกลับหน้าหลัก
        </button>
      </footer>
    </div>
  );
}