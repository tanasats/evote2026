'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVoteStore } from '@/store/useVoteStore';
import { voteService } from '@/services/voteService';
import { CheckCircle, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { json } from 'stream/consumers';

export default function SummaryPage() {
  const router = useRouter();
  const { organizationId, clubId, councilIds,candidatesData, resetVotes } = useVoteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ฟังก์ชันสำหรับการส่งคะแนน
  const handleFinalSubmit = async () => {
    // 1. Validation เบื้องต้น
    if (organizationId === null || clubId === null || councilIds.length === 0) {
      alert("ข้อมูลการลงคะแนนไม่ครบถ้วน กรุณากลับไปเลือกใหม่อีกครั้ง");
      return;
    }

    // 2. ยืนยันความตั้งใจของนิสิต
    const confirmVote = confirm("ตรวจสอบข้อมูลการเลือกของท่านอีกครั้ง\nเมื่อยืนยันแล้วจะไม่สามารถแก้ไขคะแนนได้\n\nต้องการยืนยันหย่อนบัตรใช่หรือไม่?");
    if (!confirmVote) return;

    setIsSubmitting(true);
    try {
      // 3. เรียกใช้ API Service ที่ส่งข้อมูลแบบ Transaction
      const response = await voteService.submitVote({
        organizationId,
        clubId,
        councilIds
      });

      // 4. บันทึกสำเร็จ -> ล้าง State -> ไปหน้า Success พร้อมส่ง Ref Code
      resetVotes();
      router.push(`/success?ref=${response.ref_code}`);
    } catch (error: any) {
      console.error("Submission Error:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 pb-32">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-800 mb-2">ตรวจสอบรายการเลือกตั้ง</h1>
          <p className="text-slate-500">โปรดตรวจสอบหมายเลขที่ท่านเลือกก่อนกดยืนยันหย่อนบัตร</p>
        </header>

        <div className="space-y-4">
          {/* สรุปบัตรองค์การ */}
          <SummaryCard 
            label="บัตรสีเหลือง: องค์การนิสิต" 
            value={organizationId === 0 ? "ไม่ประสงค์ลงคะแนน" : `หมายเลข ${organizationId}`} 
            colorClass="bg-ballot-yellow"
          />

          {/* สรุปบัตรสโมสร */}
          <SummaryCard 
            label="บัตรสีชมพู: สโมสรนิสิต" 
            value={clubId === 0 ? "ไม่ประสงค์ลงคะแนน" : `หมายเลข ${clubId}`} 
            colorClass="bg-ballot-pink"
          />

          {/* สรุปบัตรสภา */}
          <SummaryCard 
            label="บัตรสีฟ้า: สภานิสิต" 
            value={councilIds.includes(0) ? "ไม่ประสงค์ลงคะแนน" : `หมายเลข ${councilIds.join(', ')}`} 
            colorClass="bg-ballot-blue"
          />
          {candidatesData?.organization.map((can: any) => {
            console.log(can)
          })}
        </div>

        {/* ส่วนคำแนะนำด้านความปลอดภัย */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <p className="text-sm text-amber-800">
            <strong>คำเตือน:</strong> หลังจากกดปุ่มยืนยันด้านล่าง ระบบจะบันทึกคะแนนเข้าสู่ฐานข้อมูลทันที และสถานะการใช้สิทธิ์ของท่านจะถูกเปลี่ยนเป็น "ใช้สิทธิ์แล้ว" โดยไม่สามารถย้อนกลับได้
          </p>
        </div>
      </div>
      
      {/* Navigation Footer */}
      <footer className="fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-50">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button 
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-4 font-bold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <ArrowLeft size={20} /> แก้ไขคะแนน
          </button>
          
          <button 
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className={`flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95
              ${isSubmitting ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'}`}
          >
            {isSubmitting ? 'กำลังบันทึกคะแนน...' : (
              <>
                <Send size={20} />
                ยืนยันหย่อนบัตร
              </>
            )}
          </button>
        </div>
      </footer>
    </main>
  );
}

// Sub-component สำหรับแต่ละรายการสรุป
function SummaryCard({ label, value, colorClass }: { label: string, value: string, colorClass: string }) {
  return (
    <div className={`p-1 rounded-3xl ${colorClass} shadow-sm`}>
      <div className="bg-white p-5 rounded-[1.4rem] flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
          <span className="text-xl font-black text-slate-800">{value}</span>
        </div>
        <div className="bg-slate-50 p-2 rounded-full">
          <CheckCircle className="text-slate-300" size={24} />
        </div>
      </div>
    </div>
  );
}