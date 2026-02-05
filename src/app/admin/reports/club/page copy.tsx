'use client'
import { useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronUp, FileSpreadsheet, Users } from 'lucide-react';
import { reportService } from '@/services/reportService';

export default function ClubReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      //const response = await fetch('http://localhost:3001/api/v1/admin/reports/organization');
      const data = await reportService.getReportClub();

      //if (!response.ok) {
      //  throw new Error('ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้');
      //}
      //const result = await response.json();
      setData(data);
      console.log(data);

    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchReportData()
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">รายงานผลการเลือกตั้ง: สโมสรนิสิต</h1>
        <p className="text-slate-500">แยกตามคณะและรายชื่อพรรคที่สมัคร</p>
      </div>

      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.faculty_code} className="bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-sm">
            {/* หัวข้อคณะ (Summary Bar) */}
            <div
              onClick={() => setExpandedFaculty(expandedFaculty === item.faculty_code ? null : item.faculty_code)}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                  {item.faculty_code}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.faculty}</h3>
                  <p className="text-xs text-slate-400">ใช้สิทธิ์แล้ว {item.voted} จาก {item.total_eligible} คน ({((item.voted / item.total_eligible) * 100).toFixed(1)}%)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">สถานะพรรค</span>
                  <p className="text-sm font-bold text-slate-700">
                    {item.candidates ? `${item.candidates.length} พรรค` : 'ไม่มีผู้สมัคร'}
                  </p>
                </div>
                {expandedFaculty === item.faculty_code ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* รายละเอียดคะแนน (Expanded Area) */}
            {expandedFaculty === item.faculty_code && (
              <div className="p-5 bg-slate-50/50 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                {item.candidates ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {item.candidates.map((can: any) => (
                      <div key={can.candidate_id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                        <div>
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">เบอร์ {can.candidate_number}</span>
                          <h4 className="font-bold text-slate-800 mt-1">{can.candidate_name}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-slate-900">{can.score.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-slate-400 italic">คะแนน</p>
                        </div>
                      </div>
                    ))}
                    {/* คะแนนไม่ประสงค์ลงคะแนน */}
                    <div className="bg-slate-100/50 p-4 rounded-xl border border-dashed border-slate-200 flex justify-between items-center">
                      <h4 className="font-bold text-slate-500">ไม่ประสงค์ลงคะแนน</h4>
                      <p className="text-xl font-black text-slate-500">{item.no_vote.toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400 text-sm font-medium italic">
                    -- คณะนี้ไม่มีพรรคพรรคที่สมัครรับการเลือกตั้ง --
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}