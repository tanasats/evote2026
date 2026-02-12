'use client'
import { useState, useEffect } from 'react';
import { 
  Clock, Calendar, Save, Power, 
  AlertTriangle, CheckCircle2, Timer 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminService from '@/services/adminService';

export default function ElectionSettings() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  // ดึงค่าการตั้งค่าปัจจุบัน
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await adminService.getSystemSettings();
      setStartTime(settings.start_time);
      setEndTime(settings.end_time);
      checkStatus(settings.start_time, settings.end_time);
    } catch (err) {
      toast.error('ไม่สามารถโหลดการตั้งค่าได้');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = (start: string, end: string) => {
    const now = new Date();
    setIsLive(now >= new Date(start) && now <= new Date(end));
  };

  const handleSave = async () => {
    if (new Date(startTime) >= new Date(endTime)) {
      return toast.error('เวลาปิดต้องอยู่หลังเวลาเปิดเสมอ');
    }

    if (!confirm('ยืนยันการเปลี่ยนแปลงเวลาเลือกตั้ง? การเปลี่ยนแปลงนี้จะมีผลต่อนิสิตทุกคนทันที')) return;

    try {
      await adminService.updateElectionTime({ startTime, endTime });
      toast.success('บันทึกการตั้งค่าเวลาเรียบร้อย');
      loadSettings();
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">ตั้งค่าระบบเลือกตั้ง</h1>
        <p className="text-slate-500 font-medium">กำหนดวันและเวลาสำหรับการเปิดให้ลงคะแนนล่วงหน้า</p>
      </div>

      {/* --- Live Status Card --- */}
      <div className={`p-8 rounded-[3rem] border-2 transition-all ${isLive ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg ${isLive ? 'bg-emerald-500 text-white shadow-emerald-200 animate-pulse' : 'bg-white text-slate-300'}`}>
              <Power size={32} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
              <h2 className={`text-3xl font-black ${isLive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isLive ? 'ระบบกำลังเปิดรับโหวต' : 'ระบบปิดการลงคะแนน'}
              </h2>
            </div>
          </div>
          <div className="text-center md:text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Server Time</p>
             <p className="text-xl font-mono font-bold text-slate-700">{new Date().toLocaleString('th-TH')}</p>
          </div>
        </div>
      </div>

      {/* --- Config Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Time */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
             <Calendar size={20} />
             <span className="font-black uppercase tracking-widest text-xs">วันเวลาเริ่มต้น</span>
          </div>
          <input 
            type="datetime-local" 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <p className="text-xs text-slate-400 font-medium px-2 italic">* นิสิตจะเริ่มเข้าสู่หน้าโหวตได้ตั้งแต่เวลานี้</p>
        </div>

        {/* End Time */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-red-500 mb-2">
             <Clock size={20} />
             <span className="font-black uppercase tracking-widest text-xs">วันเวลาสิ้นสุด</span>
          </div>
          <input 
            type="datetime-local" 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <p className="text-xs text-slate-400 font-medium px-2 italic">* เมื่อถึงเวลานี้ ระบบจะตัดสิทธิ์การส่งคะแนนทันที</p>
        </div>
      </div>

      {/* --- Warning & Action --- */}
      <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 flex items-start gap-4">
        <AlertTriangle className="text-amber-500 shrink-0" size={24} />
        <p className="text-sm text-amber-800 font-medium">
          <span className="font-black">ข้อควรระวัง:</span> การแก้ไขเวลาขณะที่ระบบกำลังรันอยู่อาจส่งผลกระทบต่อจำนวนผู้มาใช้สิทธิ์ กรุณาตรวจสอบเวลาที่ถูกต้องจากกองกิจการนิสิตก่อนบันทึก
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95"
        >
          <Save size={20} /> บันทึกและปรับปรุงระบบ
        </button>
      </div>
    </div>
  );
}