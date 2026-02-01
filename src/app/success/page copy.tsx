'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, Download, LogOut } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refCode = searchParams.get('ref') || 'N/A';
  const today = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        
        {/* Card ใบเสร็จดิจิทัล */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          
          {/* Header ส่วนสีเขียว */}
          <div className="bg-green-600 p-8 text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <CheckCircle size={48} className="text-white" />
            </div>
            <h1 className="text-2xl font-black mb-1">ลงคะแนนเลือกตั้งสำเร็จ</h1>
            <p className="text-green-100 text-sm">ขอบคุณที่ใช้สิทธิ์เลือกตั้งเพื่ออนาคตที่ดีขึ้น</p>
          </div>

          {/* ข้อมูลการอ้างอิง */}
          <div className="p-8">
            <div className="space-y-6 text-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">รหัสอ้างอิงการลงคะแนน (Ref Code)</p>
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-4 px-6 inline-block">
                  <span className="text-2xl font-black text-slate-800 tracking-wider">{refCode}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6 text-left">
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

            <div className="mt-10 space-y-3">
              <button 
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-700 text-white rounded-2xl font-black hover:bg-blue-800 transition-all active:scale-95"
              >
                <Download size={18} /> บันทึกใบยืนยัน
              </button>
              <button 
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center gap-2 py-4 text-white font-bold bg-red-500 hover:bg-red-600 rounded-2xl transition-colors"
              >
                <LogOut size={18} /> ออกจากระบบทันที
              </button>              
              <button 
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center gap-2 py-4 text-slate-500 font-bold bg-slate-100 hover:bg-slate-300 rounded-2xl transition-colors"
              >
                <Home size={18} /> กลับหน้าหลัก
              </button>



            </div>
          </div>

          {/* Footer ตกแต่งรูปฟันปลา (Ticket Style) */}
          <div className="h-4 bg-slate-100 flex gap-2 justify-center items-center overflow-hidden">
             {[...Array(10)].map((_, i) => (
               <div key={i} className="w-6 h-6 bg-white rounded-full -mt-6" />
             ))}
          </div>
        </div>
        
        <p className="text-center text-slate-400 text-xs mt-8 px-6">
          โปรดเก็บบันทึกภาพหน้าจอนี้ไว้เพื่อเป็นหลักฐานในกรณีที่มีการตรวจสอบข้อมูลการลงคะแนน
        </p>
      </div>
    </main>
  );
}

// แนะนำให้ใช้ Suspense เนื่องจากมีการใช้ useSearchParams
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>}>
      <SuccessContent />
    </Suspense>
  );
}