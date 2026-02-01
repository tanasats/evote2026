// src/components/BallotCard.tsx
'use client'
import Image from 'next/image';

interface Candidate {
  id: number;
  candidate_number: number;
  name: string;
  image_url: string;
}

interface BallotCardProps {
  type: 'ORGANIZATION' | 'CLUB' | 'COUNCIL';
  candidates: Candidate[];
  selectedIds: number[]; // รองรับทั้งเลือก 1 และเลือก 2
  onSelect: (id: number) => void;
}

export default function BallotCard({ type, candidates, selectedIds, onSelect }: BallotCardProps) {
  // กำหนดสีตามประเภทบัตรด้วย Tailwind v4 variable classes
  const bgColor = {
    ORGANIZATION: 'bg-ballot-yellow',
    CLUB: 'bg-ballot-pink',
    COUNCIL: 'bg-ballot-blue',
  }[type];

  return (
    <div className={`p-4 rounded-2xl shadow-lg ${bgColor} transition-all duration-300`}>
      <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
        บัตรเลือกตั้ง{type === 'ORGANIZATION' ? 'องค์การนิสิต' : type === 'CLUB' ? 'สโมสรนิสิต' : 'สภานิสิต'}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id}
            onClick={() => onSelect(candidate.id)}
            className={`relative p-2 rounded-xl bg-white cursor-pointer border-4 transition-all
              ${selectedIds.includes(candidate.id) ? 'border-green-500 scale-105 shadow-xl' : 'border-transparent'}`}
          >
            <div className="aspect-square relative overflow-hidden rounded-lg mb-2">
              <Image 
                src={candidate.image_url || '/placeholder.png'} 
                alt={candidate.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-gray-700">หมายเลข {candidate.candidate_number}</span>
              <p className="text-sm font-medium text-gray-600 truncate">{candidate.name}</p>
            </div>
          </div>
        ))}

        {/* ปุ่มไม่ประสงค์ลงคะแนน */}
        <div 
          onClick={() => onSelect(0)} // ใช้ ID 0 แทน No Vote
          className={`flex items-center justify-center p-4 rounded-xl bg-gray-200 cursor-pointer border-4
            ${selectedIds.includes(0) ? 'border-red-500 bg-red-50' : 'border-transparent'}`}
        >
          <span className="font-bold text-gray-700">ไม่ประสงค์ลงคะแนน</span>
        </div>
      </div>
    </div>
  );
}