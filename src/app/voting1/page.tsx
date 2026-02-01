'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVoteStore } from '@/store/useVoteStore';
import { voteService } from '@/services/voteService';
import CandidateCard from '@/components/voting/CandidateCard';
import { Send, AlertCircle, XCircle } from 'lucide-react';

export default function SinglePageVoting() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Zustand State
  const { 
    organizationId, clubId, councilIds, 
    candidatesData, setVote, setCandidatesData 
  } = useVoteStore();

  useEffect(() => {
    const fetchData = async () => {
      if (candidatesData) {
        setLoading(false);
        return;
      }
      try {
        const data = await voteService.getCandidates();
        setCandidatesData(data);
      } catch (err) {
        alert("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [candidatesData, setCandidatesData]);

  // Logic สำหรับจัดการการเลือก (Single & Multiple Select)
  const handleToggle = (type: 'organizationId' | 'clubId' | 'councilIds', id: number) => {
    if (type === 'councilIds') {
      const current = councilIds.filter(i => i !== 0); // เอา "ไม่ประสงค์" ออกก่อน
      if (id === 0) {
        setVote('councilIds', [0]); // ถ้าเลือกไม่ประสงค์ ให้ล้างคนอื่น
      } else {
        const nextIds = current.includes(id) 
          ? current.filter(i => i !== id) 
          : (current.length < 2 ? [...current, id] : current);
        setVote('councilIds', nextIds.length === 0 ? [] : nextIds);
      }
    } else {
      setVote(type, id);
    }
  };

  const handleGoToSummary = () => {
    if (organizationId === null || clubId === null || councilIds.length === 0) {
      alert("กรุณาเลือกให้ครบทั้ง 3 บัตร (หรือเลือกไม่ประสงค์ลงคะแนน)");
      return;
    }
    router.push('/summary');
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">กำลังเตรียมคูหา...</div>;

  return (
    <main className="min-h-screen bg-slate-100 pb-20">
      <div className="max-w-5xl mx-auto p-4 space-y-12">
        
        <header className="py-10 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-2">คูหาเลือกตั้งออนไลน์</h1>
          <p className="text-slate-500">โปรดเลือกลงคะแนนให้ครบทั้ง 3 ประเภทด้านล่างนี้</p>
        </header>

        {/* --- Section 1: องค์การนิสิต (Yellow) --- */}
        <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border-t-8 border-ball-yellow">
          <BallotHeader title="บัตรเลือกตั้งองค์การนิสิต" color="text-yellow-600" desc="เลือกได้ 1 หมายเลข" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {candidatesData?.organization.map((can: any) => (
              <CandidateCard 
                key={can.id} candidate={can} 
                isSelected={organizationId === can.id}
                onSelect={(id) => handleToggle('organizationId', id)}
                ballotColorClass="ballot-yellow"
              />
            ))}
          </div>
          <NoVoteButton isSelected={organizationId === 0} onClick={() => handleToggle('organizationId', 0)} />
        </section>

        {/* --- Section 2: สโมสรนิสิต (Pink) --- */}
        <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border-t-8 border-ball-pink">
          <BallotHeader title="บัตรเลือกตั้งสโมสรนิสิต" color="text-pink-600" desc="เลือกได้ 1 หมายเลข" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {candidatesData?.club.map((can: any) => (
              <CandidateCard 
                key={can.id} candidate={can} 
                isSelected={clubId === can.id}
                onSelect={(id) => handleToggle('clubId', id)}
                ballotColorClass="ballot-pink"
              />
            ))}
          </div>
          <NoVoteButton isSelected={clubId === 0} onClick={() => handleToggle('clubId', 0)} />
        </section>

        {/* --- Section 3: สภานิสิต (Blue) --- */}
        <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border-t-8 border-ball-blue">
          <BallotHeader title="บัตรเลือกตั้งสภานิสิต" color="text-blue-600" desc="เลือกได้สูงสุด 2 หมายเลข" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {candidatesData?.council.map((can: any) => (
              <CandidateCard 
                key={can.id} candidate={can} 
                isSelected={councilIds.includes(can.id)}
                onSelect={(id) => handleToggle('councilIds', id)}
                ballotColorClass="ballot-blue"
              />
            ))}
          </div>
          <NoVoteButton isSelected={councilIds.includes(0)} onClick={() => handleToggle('councilIds', 0)} />
        </section>

        {/* --- Footer: Submit Area --- */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white text-center shadow-2xl">
          <h3 className="text-2xl font-bold mb-4">ตรวจสอบความเรียบร้อย</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            เมื่อท่านเลือกครบทั้ง 3 ใบแล้ว โปรดกดปุ่มด้านล่างเพื่อตรวจสอบสรุปผลและยืนยันการลงคะแนน
          </p>
          <button 
            onClick={handleGoToSummary}
            className="group flex items-center justify-center gap-3 mx-auto px-12 py-5 bg-green-500 hover:bg-green-400 text-slate-900 rounded-2xl font-black text-xl transition-all active:scale-95"
          >
            ไปที่หน้าสรุปและยืนยัน
            <Send className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </main>
  );
}

// Sub-components เพื่อความสะอาดของโค้ด
function BallotHeader({ title, color, desc }: any) {
  return (
    <div className="mb-8">
      <h2 className={`text-2xl md:text-3xl font-black ${color} mb-1`}>{title}</h2>
      <p className="text-slate-400 font-bold flex items-center gap-2">
        <AlertCircle size={16} /> {desc}
      </p>
    </div>
  );
}

function NoVoteButton({ isSelected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full max-w-sm mx-auto flex items-center justify-center gap-3 p-4 rounded-2xl border-4 transition-all font-bold
        ${isSelected ? 'bg-slate-800 border-slate-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
    >
      <XCircle size={20} /> ไม่ประสงค์ลงคะแนน
    </button>
  );
}