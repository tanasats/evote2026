'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, Download, LogOut, Heart } from 'lucide-react';
import { useVoteStore } from '@/store/useVoteStore'; // Import Store เข้ามา
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout } = useVoteStore(); // ดึงฟังก์ชัน logout มาใช้

  const refCode = searchParams.get('ref') || 'N/A';
  const today = new Date().toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // ฟังก์ชันสำหรับการ Logout ทันที (ไม่ถาม Confirm)
  const handleInstantLogout = () => {
    logout(router); // ฟังก์ชันนี้จะลบ Cookie, ล้าง Store และส่งไปหน้า / อัตโนมัติ
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          {/* Header ส่วนสีเขียว (เหมือนเดิม) */}
          <div className="bg-green-600 p-8 text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <CheckCircle size={48} />
            </div>
            <h1 className="text-2xl font-black mb-1">บันทึกคะแนนสำเร็จ</h1>
            <p className="text-green-100 text-sm">ขอบคุณที่ร่วมเป็นส่วนหนึ่งของการเลือกตั้ง</p>
          </div>

          <div className="p-8">
            {/* ข้อมูลการอ้างอิง (เหมือนเดิม) */}
            <div className="space-y-6 text-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">รหัสอ้างอิงการลงคะแนน</p>
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-4 px-6 inline-block">
                  <div className="w-64 wrap-break-word text-3xl font-black text-slate-800">
                    {refCode}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-4 text-left">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">วันที่ลงคะแนน</p>
                  <p className="text-sm font-bold text-slate-700">{today}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">สถานะ</p>
                  <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} /> บันทึกสำเร็จ
                  </p>
                </div>
              </div>
            </div>

            {/* --- กลุ่มปุ่มกด 3 ปุ่ม --- */}
            <div className="mt-8 space-y-3">
              {/* 1. ปุ่มบันทึกใบยืนยัน */}
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                <Download size={18} /> บันทึกใบยืนยัน
              </button>

              <div className="grid grid-cols-2 gap-3">
                {/* 2. ปุ่มกลับหน้าหลัก (ไม่ Logout) */}
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                >
                  <Home size={18} /> กลับหน้าหลัก
                </button>

                {/* 3. ปุ่มออกจากระบบทันที (Logout) */}
                <button
                  onClick={handleInstantLogout}
                  className="flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all active:scale-95"
                >
                  <LogOut size={18} /> ออกจากระบบ
                </button>
              </div>
            </div>
          </div>

          <div className="h-4 bg-slate-100 flex gap-2 justify-center items-center overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-white rounded-full -mt-6" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>}>
      <SuccessContent />
    </Suspense>
  );
}