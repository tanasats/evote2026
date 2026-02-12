'use client'
import { useState, useEffect } from 'react';
import { 
  Clock, Calendar, Save, Power, 
  AlertTriangle, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminService from '@/services/adminService';

export default function ElectionSettings() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันแปลง ISO String เป็นรูปแบบที่ datetime-local รองรับ (YYYY-MM-DDTHH:mm)
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settings = await adminService.getSystemSettings();
      
      // 🔥 หัวใจสำคัญ: แปลงค่าก่อนนำไปใส่ใน State
      const formattedStart = formatDateTime(settings.start_time);
      const formattedEnd = formatDateTime(settings.end_time);
      
      setStartTime(formattedStart);
      setEndTime(formattedEnd);
      
      checkStatus(settings.start_time, settings.end_time);
    } catch (err) {
      toast.error('ไม่สามารถโหลดการตั้งค่าปัจจุบันได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const checkStatus = (start: string, end: string) => {
    if (!start || !end) return;
    const now = new Date();
    setIsLive(now >= new Date(start) && now <= new Date(end));
  };

  const handleSave = async () => {
    if (!startTime || !endTime) {
      return toast.error('กรุณาระบุเวลาให้ครบถ้วน');
    }
    if (new Date(startTime) >= new Date(endTime)) {
      return toast.error('เวลาปิดต้องอยู่หลังเวลาเปิดเสมอ');
    }

    if (!confirm('ยืนยันการเปลี่ยนแปลงเวลาเลือกตั้ง?')) return;

    try {
      await adminService.updateElectionTime({ startTime, endTime });
      toast.success('บันทึกการตั้งค่าเรียบร้อย');
      loadSettings(); // โหลดค่าใหม่เพื่อยืนยัน
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  if (loading) return (
    <div className="flex flex-col h-96 items-center justify-center">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-slate-500 font-bold tracking-tight">กำลังดึงการตั้งค่าจากฐานข้อมูล...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ตั้งค่าระบบเลือกตั้ง</h1>
          <p className="text-slate-500 font-medium">กำหนดช่วงเวลาที่อนุญาตให้นิสิตเข้าถึงระบบลงคะแนน</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
            <span className="text-[10px] font-black text-blue-400 uppercase block">Database Status</span>
            <span className="text-xs font-bold text-blue-600">Sync Completed</span>
        </div>
      </div>

      {/* Live Status Card */}
      <div className={`p-8 rounded-[3rem] border-2 transition-all duration-500 ${isLive ? 'bg-emerald-50 border-emerald-100 shadow-xl shadow-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg transition-colors ${isLive ? 'bg-emerald-500 text-white shadow-emerald-200 animate-pulse' : 'bg-white text-slate-300'}`}>
              <Power size={32} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current System State</p>
              <h2 className={`text-3xl font-black ${isLive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isLive ? 'SYSTEM IS LIVE' : 'SYSTEM CLOSED'}
              </h2>
              <p className="text-sm font-bold text-slate-500 mt-1 italic">
                {isLive ? 'นิสิตสามารถลงคะแนนได้ตามปกติ' : 'หน้าลงคะแนนถูกปิดการเข้าถึง'}
              </p>
            </div>
          </div>
          <div className="text-center md:text-right bg-white/50 p-4 rounded-3xl border border-white/50 shadow-inner">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Server Time</p>
             <p className="text-xl font-mono font-bold text-slate-700">{new Date().toLocaleString('th-TH')}</p>
          </div>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
             <div className="p-2 bg-blue-50 rounded-lg"><Calendar size={18} /></div>
             <span className="font-black uppercase tracking-widest text-xs">เวลาเปิดหีบ (Start)</span>
          </div>
          <input 
            type="datetime-local" 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-xl text-slate-700 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 hover:border-red-200 transition-colors">
          <div className="flex items-center gap-3 text-red-500 mb-2">
             <div className="p-2 bg-red-50 rounded-lg"><Clock size={18} /></div>
             <span className="font-black uppercase tracking-widest text-xs">เวลาปิดหีบ (End)</span>
          </div>
          <input 
            type="datetime-local" 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-xl text-slate-700 focus:ring-4 focus:ring-red-100 focus:bg-white transition-all outline-none"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      {/* Action Area */}
      <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
        <div className="flex-1 bg-amber-50 rounded-[2rem] p-6 border border-amber-100 flex items-start gap-4">
            <AlertTriangle className="text-amber-500 shrink-0" size={24} />
            <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
              <span className="font-black">โปรดตรวจสอบ:</span> หากมีการเปลี่ยนแปลงเวลาขณะที่นิสิตกำลังใช้งาน ระบบจะอัปเดตสถานะทันทีใน Request ถัดไป กรุณามั่นใจในความถูกต้องของเวลาจาก กกต.
            </p>
        </div>
        <button 
          onClick={handleSave}
          className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95 group"
        >
          <Save size={20} className="group-hover:scale-110 transition-transform" /> 
          อัปเดตการตั้งค่า
        </button>
      </div>
    </div>
  );
}