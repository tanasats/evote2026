'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVoteStore } from '@/store/useVoteStore';
import { voteService } from '@/services/voteService';
import { CheckCircle2, ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

export default function SummaryPage() {
  const router = useRouter();
  const { organizationId, clubId, councilIds, candidatesData, resetVotes, setHasVoted } = useVoteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ฟังก์ชันช่วยดึงข้อมูลผู้สมัครจาก Cache ใน Zustand
  const getCandidateInfo = (type: 'organization' | 'club' | 'council', id: number | null) => {
    if (id === 0) return { name: "ไม่ประสงค์ลงคะแนน", number: "" };
    if (id === null || !candidatesData) return { name: "ไม่ได้เลือก", number: "" };

    const found = candidatesData[type]?.find((c: any) => c.id === id);
    return found
      ? { name: found.name, number: `หมายเลข ${found.candidate_number}` }
      : { name: "ไม่พบข้อมูล", number: "" };
  };

  const handleFinalSubmit = async () => {
    //const confirmVote = confirm("ยืนยันหย่อนบัตร? เมื่อยืนยันแล้วจะไม่สามารถแก้ไขได้");
    //if (!confirmVote) return;
    setIsModalOpen(false); // ปิด Modal ก่อนเริ่มบันทึก
    setIsSubmitting(true);

    try {
      const response = await voteService.submitVote({
        organizationId,
        clubId,
        councilIds
      });
      setHasVoted(true);
      resetVotes();
      router.push(`/success?ref=${response.ref_code}`);
    } catch (error: any) {
      //alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกคะแนน");
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกคะแนน"
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 pb-32">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="text-green-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800">ตรวจสอบข้อมูลการลงคะแนน</h1>
          <p className="text-slate-500 mt-2">โปรดอ่านทบทวนรายชื่อและหมายเลขที่ท่านเลือกอีกครั้ง</p>
        </header>

        <div className="space-y-6">
          {/* 1. องค์การนิสิต */}
          <SummaryItem
            title="บัตรเลือกตั้งองค์การนิสิต"
            info={getCandidateInfo('organization', organizationId)}
            colorClass="bg-ballot-yellow"
          />

          {/* 2. สโมสรนิสิต */}
          <SummaryItem
            title="บัตรเลือกตั้งสโมสรนิสิต"
            info={getCandidateInfo('club', clubId)}
            colorClass="bg-ballot-pink"
          />

          {/* 3. สภานิสิต (กรณีเลือกได้หลายคน) */}
          <div className="p-1 rounded-[2rem] bg-ballot-blue shadow-sm">
            <div className="bg-white p-6 rounded-[1.8rem]">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">บัตรเลือกตั้งสภานิสิต</h3>
              {councilIds.includes(0) ? (
                <p className="text-xl font-black text-slate-800">ไม่ประสงค์ลงคะแนน</p>
              ) : (
                <div className="space-y-3">
                  {councilIds.map(id => {
                    const info = getCandidateInfo('council', id);
                    return (
                      <div key={id} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
                        <span className="text-lg font-black text-slate-800">{info.name}</span>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{info.number}</span>
                      </div>
                    );
                  })}
                  <p className="text-xl font-black text-slate-800 leading-tight">
                    {councilIds.length === 0 ? "ไม่ได้เลือก" : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* คำเตือน */}
        <div className="mt-10 p-5 bg-red-50 border border-red-100 rounded-3xl flex gap-4 items-start">
          <AlertTriangle className="text-red-500 shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-red-800 text-sm">การดำเนินการนี้ไม่สามารถยกเลิกได้</h4>
            <p className="text-red-700 text-xs mt-1 leading-relaxed">
              เมื่อกด "ยืนยันหย่อนบัตร" ระบบจะทำการบันทึกคะแนนและยืนยันการใช้สิทธิ์ของท่านทันที ท่านจะไม่สามารถกลับมาแก้ไขได้อีก
            </p>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <footer className="fixed bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ย้อนกลับไปแก้ไข
          </button>
          <button
            //onClick={handleFinalSubmit}
            onClick={() => setIsModalOpen(true)}
            disabled={isSubmitting}
            className={`flex-[2] py-4 rounded-2xl font-black text-xl text-white shadow-xl transition-all active:scale-95
              ${isSubmitting ? 'bg-slate-400' : 'bg-slate-900 hover:bg-black shadow-slate-200'}`}
          >
            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันหย่อนบัตร'}
          </button>


        </div>
      </footer>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFinalSubmit}
        title="ยืนยันการหย่อนบัตร?"
        description="เมื่อยืนยันแล้ว คะแนนจะถูกบันทึกทันทีและไม่สามารถแก้ไขได้อีก โปรดตรวจสอบความถูกต้อง"
        confirmText="ยืนยันหย่อนบัตร"
        type="success"
      />

    </main>
  );
}

// Sub-component สำหรับความสะอาดของโค้ด
function SummaryItem({ title, info, colorClass }: any) {
  return (
    <div className={`p-1 rounded-[2rem] ${colorClass} shadow-sm`}>
      <div className="bg-white p-6 rounded-[1.8rem] flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
          <p className="text-xl font-black text-slate-800 leading-tight">{info.name}</p>
        </div>
        {info.number && (
          <div className="bg-slate-50 px-4 py-2 rounded-2xl">
            <span className="text-sm font-bold text-slate-600">{info.number}</span>
          </div>
        )}
      </div>
    </div>
  );
}