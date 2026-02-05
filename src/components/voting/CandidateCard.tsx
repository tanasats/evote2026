// src/components/voting/CandidateCard.tsx
import Image from 'next/image';

interface Candidate {
  id: number;
  candidate_number: number;
  name: string;
  image_url: string;
}

interface CardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: number) => void;
  ballotColorClass: string; // 'ballot-yellow', 'ballot-pink', or 'ballot-blue'
}

export default function CandidateCard({ candidate, isSelected, onSelect, ballotColorClass }: CardProps) {
  return (
    <div
      onClick={() => onSelect(candidate.id)}
      className={`relative group cursor-pointer transition-all duration-300 active:scale-95 ${isSelected
        ? 'scale-[1.02] z-10'
        : 'hover:translate-y-[-4px]'
        }`}
    >
      <div className={`
        bg-white rounded-3xl overflow-hidden shadow-sm border-4 transition-all duration-300
        ${isSelected ? `border-green-500 shadow-2xl shadow-green-200` : 'border-transparent shadow-slate-200'}
      `}>
        {/* Number Badge */}
        <div className={`
          absolute top-3 left-3 w-12 h-12 rounded-2xl flex items-center justify-center 
          text-2xl font-black shadow-lg z-20 transition-colors
          ${isSelected ? 'bg-green-500 text-white' : `bg-${ballotColorClass} text-slate-800`}
        `}>
          {candidate.candidate_number}
        </div>

        {/* Candidate Image */}
        <div className="aspect-3/4 relative bg-slate-100">
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGES_URL}${candidate.image_url}`}
            alt={candidate.name}
            className="object-cover w-full h-full" 
          />

          {/* Selected Overlay */}
          {isSelected && (
            <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
              <div className="bg-white rounded-full p-2 shadow-lg animate-selection">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="p-4 text-center bg-white">
          <p className="text-blue-800 font-black text-lg truncate leading-tight">
            {candidate.name}
          </p>
          <p className="text-blue-600 mt-1 font-medium">
            หมายเลข <span className="font-black text-2xl">{candidate.candidate_number}</span>
          </p>
        </div>
      </div>
    </div>
  );
}