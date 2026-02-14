'use client'
import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
// นำเข้า adminService
import adminService from '@/services/adminService';



export default function StudentImport() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('กรุณาเลือกไฟล์ก่อนดำเนินการ');
            return;
        }

        setUploading(true);
        try {
            // 🔥 เรียกใช้ผ่าน Service แทนการยิงตรง
            const res = await adminService.importStudents(file);

            toast.success(res.message || 'นำเข้าข้อมูลนิสิตสำเร็จ');
            setFile(null); // ล้างค่าไฟล์หลังจากสำเร็จ
        } catch (err: any) {
            // ดึง Message จาก Error Response ถ้ามี
            const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล';
            toast.error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">นำเข้ารายชื่อนิสิต</h1>
                <p className="text-slate-500 font-medium">อัปโหลดไฟล์ Excel เพื่อเพิ่มหรืออัปเดตรายชื่อผู้มีสิทธิ์เลือกตั้ง</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* ส่วนคำแนะนำ */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                        <h3 className="font-black text-blue-900 mb-4 flex items-center gap-2">
                            <AlertCircle size={18} /> ข้อกำหนดไฟล์
                        </h3>
                        <ul className="text-xs text-blue-700 space-y-3 font-bold leading-relaxed">
                            <li>• ไฟล์นามสกุล .xlsx หรือ .csv</li>
                            <li>• ต้องมีหัวตาราง: <br /><span className="bg-white px-2 py-1 rounded inline-block mt-1">student_id, email, faculty_code, name</span></li>
                            <li>• faculty_code ต้องตรงกับที่มีในระบบ</li>
                        </ul>
                        <button className="mt-6 w-full py-3 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                            <Download size={14} /> ดาวน์โหลดตัวอย่างไฟล์
                        </button>
                    </div>
                </div>

                {/* ส่วน Upload */}
                <div className="md:col-span-2 space-y-6">
                    <div
                        className={`relative border-4 border-dashed rounded-[3rem] p-12 text-center transition-all ${file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-white hover:border-blue-200'}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                        }}
                    >
                        <input type="file" className="hidden" id="excel-upload" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />

                        {file ? (
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                                    <FileSpreadsheet size={40} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-800">{file.name}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button onClick={() => setFile(null)} className="text-xs font-black text-red-500 uppercase hover:underline">เปลี่ยนไฟล์</button>
                            </div>
                        ) : (
                            <label htmlFor="excel-upload" className="cursor-pointer space-y-4 block">
                                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-[2rem] flex items-center justify-center mx-auto transition-transform">
                                    <Upload size={40} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-800">คลิกเพื่อเลือกไฟล์รายชื่อนิสิต</p>
                                    <p className="text-sm text-slate-400 font-medium">รองรับเฉพาะ .xlsx, .xls และ .csv</p>
                                </div>
                            </label>
                        )}
                    </div>

                    <button
                        disabled={!file || uploading}
                        onClick={handleUpload}
                        className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-slate-200 disabled:opacity-30 disabled:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        {uploading ? (
                            <><Loader2 className="animate-spin" /> กำลังนำเข้าข้อมูล...</>
                        ) : (
                            <><CheckCircle2 /> ยืนยันการนำเข้าข้อมูล</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}