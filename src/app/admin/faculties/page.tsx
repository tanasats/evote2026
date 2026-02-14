'use client'
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminService from '@/services/adminService';

export default function FacultyManagement() {
    const [faculties, setFaculties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ code: '', name: '', nameEn: '' });

    useEffect(() => { loadFaculties(); }, []);

    const loadFaculties = async () => {
        setLoading(true);
        try {
            const data = await adminService.getFaculties();
            setFaculties(data);
        } catch (err) { toast.error('โหลดข้อมูลคณะล้มเหลว'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await adminService.editFaculty(editingId, formData);
                toast.success('แก้ไขข้อมูลคณะสำเร็จ');
            } else {
                await adminService.addFaculty(formData);
                toast.success('เพิ่มคณะใหม่สำเร็จ');
            }
            setIsModalOpen(false);
            setFormData({ code: '', name: '', nameEn: '' });
            setEditingId(null);
            loadFaculties();
        } catch (err) { toast.error('เกิดข้อผิดพลาด'); }
    };

    const filteredFaculties = faculties.filter(f =>
        f.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.faculty_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">จัดการข้อมูลคณะ</h1>
                    <p className="text-slate-500 font-medium">เพิ่มหรือแก้ไขรายชื่อคณะสำหรับการจัดกลุ่มผู้สมัครและนิสิต</p>
                </div>
                <button
                    onClick={() => { setEditingId(null); setFormData({ code: '', name: '', nameEn: '' }); setIsModalOpen(true); }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                    <Plus size={20} /> เพิ่มคณะใหม่
                </button>
            </div>

            {/* Filter & Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="ค้นหาด้วยรหัสหรือชื่อคณะ..."
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">รหัสคณะ</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อคณะ (TH/EN)</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredFaculties.map((fac) => (
                                <tr key={fac.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-4">
                                        <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{fac.faculty_code}</span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <p className="font-bold text-slate-900">{fac.faculty_name}</p>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">{fac.faculty_name_en}</p>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingId(fac.id);
                                                    setFormData({ code: fac.faculty_code, name: fac.faculty_name, nameEn: fac.faculty_name_en });
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900">{editingId ? 'แก้ไขคณะ' : 'เพิ่มคณะใหม่'}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">รหัสคณะ (Code)</label>
                                <input required className="w-full mt-1 p-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="เช่น ENG, SCI" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">ชื่อคณะ (ภาษาไทย)</label>
                                <input required className="w-full mt-1 p-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">ชื่อคณะ (English Name)</label>
                                <input required className="w-full mt-1 p-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.nameEn} onChange={e => setFormData({ ...formData, nameEn: e.target.value })} />
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all">
                            {editingId ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่ม'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}