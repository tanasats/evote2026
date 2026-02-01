'use client'
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'; // เพิ่มการ Import นี้
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  type?: 'danger' | 'success' | 'warning';
}

export default function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, description, 
  confirmText = "ยืนยัน", type = 'warning' 
}: ConfirmModalProps) {
  
  const [mounted, setMounted] = useState(false);

  // ตรวจสอบว่า Component ถูก mount หรือยัง (ป้องกัน Error ใน Next.js SSR)
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // ล็อคการเลื่อนหน้าจอ
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const colors = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-100",
    success: "bg-green-600 hover:bg-green-700 shadow-green-100",
    warning: "bg-slate-900 hover:bg-black shadow-slate-100"
  };

  const icons = {
    danger: <AlertTriangle className="text-red-600" size={32} />,
    success: <CheckCircle2 className="text-green-600" size={32} />,
    warning: <AlertTriangle className="text-amber-500" size={32} />
  };

  // ใช้ createPortal เพื่อส่ง Modal ไปที่ document.body
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div className="relative bg-white w-full max-w-[400px] rounded-[2.5rem] p-8 md:p-10 shadow-2xl z-[10000] animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 p-5 bg-slate-50 rounded-full">{icons[type]}</div>
          <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">{description}</p>

          <div className="flex flex-col w-full gap-3">
            <button onClick={onConfirm} className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-lg active:scale-95 transition-all ${colors[type]}`}>
              {confirmText}
            </button>
            <button onClick={onClose} className="w-full py-4 rounded-2xl text-slate-400 font-bold hover:text-slate-700 hover:bg-slate-50 transition-all">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body // ปลายทางของ Portal
  );
}