'use client'
import { useState, useEffect } from 'react';
import {
    Plus, Pencil, Trash2, Upload, UserPlus,
    X, ImageIcon, Loader2, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import candidateService, { CandidateFormData } from '@/services/candidateService';
// สมมติว่ามี adminService สำหรับดึงรายชื่อคณะ
import adminService from '@/services/adminService';

export default function CandidateManagement() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<CandidateFormData>({
        name: '',
        namegroup: '',
        candidate_number: '',
        type: 'ORGANIZATION',
        faculty_code: '',
    });
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // ดึงข้อมูลผู้สมัครและรายชื่อคณะพร้อมกัน
            const [canData, facData] = await Promise.all([
                candidateService.getAll(),
                adminService.getFaculties() // เพิ่มฟังก์ชันนี้ใน adminService เพื่อดึงคณะมาเลือก
            ]);
            setCandidates(canData);
            setFaculties(facData);
        } catch (err) {
            toast.error('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            setFormData({ ...formData, image: selectedFile });
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await candidateService.update(editingId, formData);
                toast.success('อัปเดตข้อมูลเรียบร้อย');
            } else {
                await candidateService.create(formData);
                toast.success('เพิ่มผู้สมัครสำเร็จ');
            }
            setIsModalOpen(false);
            resetForm();
            loadInitialData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('ยืนยันการลบผู้สมัครรายนี้?')) return;
        try {
            await candidateService.delete(id);
            toast.success('ลบข้อมูลเรียบร้อย');
            loadInitialData();
        } catch (err) {
            toast.error('ไม่สามารถลบข้อมูลได้');
        }
    };

    const handleEdit = (can: any) => {
        setEditingId(can.id);
        setFormData({
            name: can.name,
            namegroup: can.namegroup,
            candidate_number: can.candidate_number,
            type: can.type,
            faculty_code: can.faculty_code || '',
        });
        setPreview(can.image_url ? `${process.env.NEXT_PUBLIC_IMAGES_URL}${can.image_url}` : null);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', namegroup: '', candidate_number: '', type: 'ORGANIZATION', faculty_code: '', image: null });
        setPreview(null);
        setEditingId(null);
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">รายชื่อผู้สมัคร</h1>
                    <p className="text-slate-500 font-medium">จัดการข้อมูลและรูปภาพผู้สมัครรับเลือกตั้ง</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> เพิ่มผู้สมัคร
                </button>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {candidates.map((can) => (
                    <div key={can.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-300">
                        <div className="aspect-3/4 bg-slate-100 relative overflow-hidden">
                            {can.image_url ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_IMAGES_URL}${can.image_url}`}
                                    alt={can.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48} /></div>
                            )}
                            <div className="absolute top-4 left-4 bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg">
                                เบอร์ {can.candidate_number}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{can.type}</span>
                                <h3 className="text-lg font-black text-slate-900 mt-1 line-clamp-1">{can.name}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{can.faculty_name || 'ส่วนกลาง'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(can)}
                                    className="flex-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Pencil size={16} /> แก้ไข
                                </button>
                                <button
                                    onClick={() => handleDelete(can.id)}
                                    className="p-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-slate-900">{editingId ? 'แก้ไขข้อมูล' : 'เพิ่มผู้สมัครใหม่'}</h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
                            </div>

                            <div className="space-y-5">
                                {/* Image Upload Preview */}
                                <div className="flex justify-center mb-4">
                                    <div className="relative group cursor-pointer w-32 h-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden"
                                        onClick={() => document.getElementById('file-input')?.click()}>
                                        {preview ? (
                                            <img src={preview} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="mx-auto text-slate-300 mb-1" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Upload Photo</span>
                                            </div>
                                        )}
                                        <input id="file-input" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">หมายเลข</label>
                                        <input required type="number" className="w-full mt-1 p-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.candidate_number} onChange={(e) => setFormData({ ...formData, candidate_number: e.target.value })} />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ชื่อผู้สมัคร / ชื่อพรรค</label>
                                        <input required className="w-full mt-1 p-3 bg-slate-50 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ประเภท</label>
                                        <select className="w-full mt-1 p-3 bg-slate-50 rounded-xl font-bold outline-none"
                                            value={formData.type} onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="ORGANIZATION">องค์การนิสิต</option>
                                            <option value="COUNCIL">สภานิสิต</option>
                                            <option value="CLUB">สโมสรนิสิต</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">สังกัดคณะ</label>
                                        <select className="w-full mt-1 p-3 bg-slate-50 rounded-xl font-bold outline-none"
                                            value={formData.faculty_code} onChange={(e) => setFormData({ ...formData, faculty_code: e.target.value })}>
                                            <option value="">-- ส่วนกลาง --</option>
                                            {faculties.map(f => <option key={f.faculty_code} value={f.faculty_code}>{f.faculty_name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600">ยกเลิก</button>
                                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 disabled:opacity-50 flex justify-center items-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'บันทึกข้อมูล'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}