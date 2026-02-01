'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressStepper from '@/components/voting/ProgressStepper';
import CandidateCard from '@/components/voting/CandidateCard';
import { useVoteStore } from '@/store/useVoteStore';
import { voteService } from '@/services/voteService'; // เรียกใช้ Service ที่เราทำไว้
import { XCircle, ChevronRight, ChevronLeft,Check } from 'lucide-react';

export default function VotingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any>(null);
  
  // ดึง State และ Function จาก Zustand Store
  const { organizationId, clubId, councilIds,setCandidatesData, setVote } = useVoteStore();

  // 1. ดึงข้อมูลผู้สมัครจาก API เมื่อโหลดหน้าจอ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await voteService.getCandidates();
        setCandidates(data);
        setCandidatesData(data);
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        alert("ไม่สามารถดึงข้อมูลผู้สมัครได้ กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Logic การจัดการ "ไม่ประสงค์ลงคะแนน" (ID = 0)
  const handleSelectNoVote = (type: 'organizationId' | 'clubId' | 'councilIds') => {
    if (type === 'councilIds') {
      // สำหรับบัตรสภา ถ้าเลือกไม่ประสงค์ลงคะแนน ให้ล้างค่า Array เป็น [0]
      setVote('councilIds', [0]);
    } else {
      setVote(type, 0);
    }
  };

  // 3. Logic การเลือกผู้สมัครปกติ
  const handleSelectCandidate = (type: 'organizationId' | 'clubId' | 'councilIds', id: number) => {
    if (type === 'councilIds') {
      // กรองเอาเลข 0 ออกถ้ามี และจัดการการเลือกไม่เกิน 2 คน
      const currentIds = councilIds.filter(i => i !== 0);
      if (currentIds.includes(id)) {
        setVote('councilIds', currentIds.filter(i => i !== id));
      } else if (currentIds.length < 2) {
        setVote('councilIds', [...currentIds, id]);
      } else {
        alert("เลือกได้สูงสุด 2 หมายเลข");
      }
    } else {
      setVote(type, id);
    }
  };

  // 4. Logic การเปลี่ยนหน้า
  const handleNext = () => {
    if (step === 1 && organizationId === null) return alert('กรุณาเลือกหมายเลข หรือไม่ประสงค์ลงคะแนน');
    if (step === 2 && clubId === null) return alert('กรุณาเลือกหมายเลข หรือไม่ประสงค์ลงคะแนน');
    if (step === 3 && councilIds.length === 0) return alert('กรุณาเลือกหมายเลข หรือไม่ประสงค์ลงคะแนน');

    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/summary');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">กำลังโหลดคูหาเลือกตั้ง...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      {/* 1. ส่วนหัวบอกลำดับขั้นตอน */}
      <ProgressStepper currentStep={step} />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* 2. หัวข้อประจำบัตร */}
        <div className={`mb-8 text-center rounded-2xl py-3 ${step === 1 ? 'bg-ballot-yellow' : step === 2 ? 'bg-ballot-pink' : 'bg-ballot-blue' }`}>
          <h2 className="text-3xl font-black text-slate-800 mb-2">
            {step === 1 ? 'บัตรเลือกตั้งองค์การนิสิต' : step === 2 ? 'บัตรเลือกตั้งสโมสรนิสิต' : 'บัตรเลือกตั้งสภานิสิต'}
          </h2>
          <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold border-2 ${
            step === 1 ? 'border-ballot-yellow text-yellow-700 bg-yellow-50' : 
            step === 2 ? 'border-ballot-pink text-pink-700 bg-pink-50' : 
            'border-ballot-blue text-blue-700 bg-blue-50'
          }`}>
            {step === 3 ? 'เลือกได้สูงสุด 2 หมายเลข' : 'เลือกได้เพียง 1 หมายเลขเท่านั้น'}
          </div>
        </div>

        {/* 3. รายการผู้สมัคร */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
          {(step === 1 ? candidates?.organization : step === 2 ? candidates?.club : candidates?.council)?.map((can: any) => (
            <CandidateCard 
              key={can.id} 
              candidate={can} 
              isSelected={step === 3 ? councilIds.includes(can.id) : (step === 1 ? organizationId : clubId) === can.id}
              onSelect={(id) => handleSelectCandidate(step === 1 ? 'organizationId' : step === 2 ? 'clubId' : 'councilIds', id)}
              ballotColorClass={step === 1 ? 'ballot-yellow' : step === 2 ? 'ballot-pink' : 'ballot-blue'}
            />
          ))}
        </div>

        {/* 4. ปุ่มไม่ประสงค์ลงคะแนน (แยกส่วนชัดเจน) */}
        <div className="max-w-md mx-auto">
          <button
            onClick={() => handleSelectNoVote(step === 1 ? 'organizationId' : step === 2 ? 'clubId' : 'councilIds')}
            className={`w-full p-5 rounded-3xl border-4 transition-all flex items-center justify-center gap-3 font-black text-xl shadow-sm
              ${(step === 3 ? councilIds.includes(0) : (step === 1 ? organizationId : clubId) === 0) 
                ? 'bg-white border-green-500 text-slate-500 scale-[1.02] shadow-xl border-green' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
          >
            <Check size={28} />
            ไม่ประสงค์ลงคะแนน
          </button>
        </div>
      </div>

      {/* 5. Navigation Bar (Sticky Footer) */}
      <footer className="fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className={`flex items-center gap-1 px-6 py-3 font-bold text-slate-400 hover:text-slate-800 transition-colors ${step === 1 ? 'opacity-0' : 'opacity-100'}`}
          >
            <ChevronLeft size={20} /> ย้อนกลับ
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black active:scale-95 transition-all"
          >
            {step === 3 ? 'ตรวจสอบผลสรุป' : 'ถัดไป'}
            <ChevronRight size={20} />
          </button>
        </div>
      </footer>
    </main>
  );
}