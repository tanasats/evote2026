'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVoteStore } from '@/store/useVoteStore';
import { voteService } from '@/services/voteService';
import CandidateCard from '@/components/voting/CandidateCard';
import { Send, AlertCircle, Check, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SinglePageVoting() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const {user} = useVoteStore();


  // Zustand State
  const {
    //organizationId, clubId, councilIds,
    candidatesData, setCandidatesData
    //, setVote
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
        toast.error("ไม่สามารถดึงข้อมูลได้");
        //alert("ไม่สามารถดึงข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  //}, [candidatesData, setCandidatesData]);
 }, []);



  if (loading) return <div className="flex justify-center items-center min-h-screen">กำลังเตรียมคูหา...</div>;

  return (
    <>
    
    <main className="min-h-screen bg-slate-100 pb-8">
        
      <div className="max-w-5xl mx-auto p-4 space-y-12">

      <header className="my-10">
        <h1 className="text-3xl font-black text-slate-900">รายชื่อผู้สมัคร</h1>
        <p className="text-xl text-slate-800">ข้อมูลเฉพาะสำหรับนิสิต <span className='text-blue-700'>{user?.faculty_name}</span></p>
      </header>

        {/* --- Section 1: องค์การนิสิต (Yellow) --- */}
        <section className="bg-ballot-yellow rounded-3xl  shadow-sm border-ball-yellow border border-ballot-yellow">
         <div className='py-4 px-6 md:px-10'>
            <BallotHeader title="องค์การนิสิต" color="text-slate-800" desc="มีสิทธิ์เลือกได้ 1 หมายเลข" />
          </div>
          <div className='bg-white p-6 md:p-10 rounded-b-3xl border border-ballot-yellow'>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {candidatesData && candidatesData?.organization.map((can: any) => (
                <CandidateCard
                  key={can.id} candidate={can}
                  isSelected={false}
                  onSelect={(id) =>null}
                  ballotColorClass="ballot-yellow"
                />
              ))}
            </div>
          </div>
        </section>

        {/* --- Section 2: สโมสรนิสิต (Pink) --- */}
        <section className=" bg-ballot-pink rounded-3xl shadow-sm border-ball-pink border border-ballot-pink">
         <div className='py-4 px-6 md:px-10'>
            <BallotHeader title="สโมสรนิสิต" color="text-slate-800" desc="มีสิทธิ์เลือกได้ 1 หมายเลข" />
          </div>
          <div className='bg-white p-6 md:p-10 rounded-b-3xl border border-ballot-pink'>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {candidatesData?.club.map((can: any) => (
                <CandidateCard
                  key={can.id} candidate={can}
                  isSelected={false}
                  onSelect={(id) =>null}
                  ballotColorClass="ballot-pink"
                />
              ))}
            </div>
          </div>
        </section>

        {/* --- Section 3: สภานิสิต (Blue) --- */}
        <section className="bg-ballot-blue rounded-3xl shadow-sm border-ball-blue border border-ballot-blue">
          <div className='py-4 px-6 md:px-10'>
            <BallotHeader title="สภานิสิต" color="text-slate-800" desc="มีสิทธิ์เลือกได้สูงสุด 2 หมายเลข" />
          </div>
          <div className='bg-white p-6 md:p-10 rounded-b-3xl border border-ballot-blue'>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {candidatesData?.council.map((can: any) => (
                <CandidateCard
                  key={can.id} candidate={can}
                  isSelected={false}
                  onSelect={(id) =>null}
                  ballotColorClass="ballot-blue"
                />
              ))}
            </div>
          </div>
        </section>



      </div>
    </main>


    </>
  );
}

// Sub-components 
function BallotHeader({ title, color, desc }: any) {
  return (
    <div className="">
      <h2 className={`text-2xl md:text-3xl font-black ${color} mb-1`}>{title}</h2>
      <p className="text-slate-900 flex items-center gap-2">
        <CheckCircle size={16} /> {desc}
      </p>
    </div>
  );
}

