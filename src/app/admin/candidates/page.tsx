'use client'
import { useState, useEffect, useMemo } from 'react';
import {
    Plus, Pencil, Trash2, Upload, UserPlus,
    X, ImageIcon, Loader2, Search, Filter,
    LayoutGrid, List, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import candidateService, { CandidateFormData } from '@/services/candidateService';
import adminService from '@/services/adminService';

export default function CandidateManagement() {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Filter & View States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterFaculty, setFilterFaculty] = useState('ALL');
    const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

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
            const [canData, facData] = await Promise.all([
                candidateService.getAll(),
                adminService.getFaculties()
            ]);
            setCandidates(canData);
            setFaculties(facData);
        } catch (err) {
            toast.error('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    // --- Logic การกรองข้อมูล ---
    const filteredCandidates = useMemo(() => {
        return candidates.filter(can => {
            const matchSearch = can.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                can.candidate_number.toString() === searchTerm;
            const matchType = filterType === 'ALL' || can.type === filterType;
            const matchFaculty = filterFaculty === 'ALL' || can.faculty_code === filterFaculty;
            return matchSearch && matchType && matchFaculty;
        });
    }, [candidates, searchTerm, filterType, filterFaculty]);

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

    if (loading) return (
        <div className="flex flex-col h-96 items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-slate-400 font-bold animate-pulse">กำลังเตรียมข้อมูลผู้สมัคร...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">จัดการผู้สมัคร</h1>
                    <p className="text-slate-500 font-medium italic">Dashboard สำหรับ Admin จัดการข้อมูลการเลือกตั้ง</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} /> เพิ่มผู้สมัคร
                </button>
            </div>

            {/* --- Filter Bar --- */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อผู้สมัคร หรือหมายเลข..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap md:flex-nowrap gap-2">
                    <select
                        className="flex-1 md:w-48 bg-slate-100 px-4 py-3 rounded-2xl border-none font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        value={filterType}
                        onChange={(e) => {
                            setFilterType(e.target.value);
                            if (e.target.value === 'ORGANIZATION') setFilterFaculty('ALL');
                        }}
                    >
                        <option value="ALL text-slate-400">ทุกประเภทองค์กร</option>
                        <option value="ORGANIZATION">องค์การนิสิต</option>
                        <option value="COUNCIL">สภานิสิต</option>
                        <option value="CLUB">สโมสรนิสิต</option>
                    </select>

                    {filterType !== 'ORGANIZATION' && (
                        <select
                            className="flex-1 md:w-60 bg-slate-100 px-4 py-3 rounded-2xl border-none font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                            value={filterFaculty}
                            onChange={(e) => setFilterFaculty(e.target.value)}
                        >
                            <option value="ALL">ทุกคณะ / ทุกสังกัด</option>
                            {faculties.map(f => (
                                <option key={f.faculty_code} value={f.faculty_code}>{f.faculty_name}</option>
                            ))}
                        </select>
                    )}

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('GRID')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('TABLE')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'TABLE' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Content Area --- */}
            {filteredCandidates.length > 0 ? (
                viewMode === 'GRID' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCandidates.map((can) => (
                            <div key={can.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm group hover:shadow-2xl hover:border-blue-100 transition-all duration-500">
                                <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                                    {can.image_url ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_IMAGES_URL}${can.image_url}`}
                                            alt={can.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48} /></div>
                                    )}
                                    <div className="absolute top-5 left-5 bg-slate-900/90 backdrop-blur text-white px-4 py-1.5 rounded-2xl text-xs font-black shadow-lg">
                                        หมายเลข {can.candidate_number}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{can.type}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 line-clamp-1">{can.name}</h3>
                                        <h4 className="text-xl text-slate-900 line-clamp-1">{can.namegroup}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{can.faculty_name || 'ส่วนกลาง'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(can)}
                                            className="flex-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Pencil size={16} /> แก้ไข
                                        </button>
                                        <button
                                            onClick={() => handleDelete(can.id)}
                                            className="p-3.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* --- Table View --- */
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-indigo-100/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[14px] text-slate-600 uppercase tracking-widest">เบอร์</th>
                                        <th className="px-4 py-5 text-[14px] text-slate-600 uppercase tracking-widest">ผู้สมัคร</th>
                                        <th className="px-4 py-5 text-[14px] text-slate-600 uppercase tracking-widest">ประเภท</th>
                                        <th className="px-4 py-5 text-[14px] text-slate-600 uppercase tracking-widest">คณะ/สังกัด</th>
                                        <th className="px-8 py-5 text-[14px] text-slate-600 uppercase tracking-widest text-right">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {filteredCandidates.map((can) => (
                                        <tr key={can.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                                                    {can.candidate_number}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                                                        {can.image_url ? (
                                                            <img src={`${process.env.NEXT_PUBLIC_IMAGES_URL}${can.image_url}`} className="w-full h-full object-cover" />
                                                        ) : <ImageIcon className="w-full h-full p-2 text-slate-300" />}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{can.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[14px] text-blue-660 bg-blue-50 px-2.5 py-1 rounded-lg uppercase">{can.type}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-slate-500">{can.faculty_name || 'ส่วนกลาง'}</span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEdit(can)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Pencil size={18} /></button>
                                                    <button onClick={() => handleDelete(can.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                /* --- Empty State --- */
                <div className="py-32 text-center bg-indigo-100 rounded-[3rem] border border-dashed border-slate-200">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Filter className="text-slate-200" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">ไม่พบข้อมูลผู้สมัคร</h3>
                    <p className="text-slate-400 font-medium">ลองเปลี่ยนคำค้นหา หรือปรับตัวกรองประเภทและคณะใหม่</p>
                    <button onClick={() => { setSearchTerm(''); setFilterType('ALL'); setFilterFaculty('ALL'); }} className="mt-4 text-blue-600 font-bold hover:underline">ล้างตัวกรองทั้งหมด</button>
                </div>
            )}

            {/* --- Modal Form --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900">{editingId ? 'แก้ไขข้อมูล' : 'เพิ่มผู้สมัครใหม่'}</h2>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Candidate Profile</p>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-indigo-100 p-2 rounded-full text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
                            </div>

                            <div className="space-y-6">
                                {/* Image Upload */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative group cursor-pointer w-40 h-52 bg-indigo-100 rounded-[2rem] border-4 border-dashed border-slate-100 flex items-center justify-center overflow-hidden transition-all hover:border-blue-200"
                                        onClick={() => document.getElementById('file-input')?.click()}>
                                        {preview ? (
                                            <img src={preview} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="mx-auto text-slate-200 mb-2" size={32} />
                                                <span className="text-[14px] text-slate-600 uppercase tracking-widest">3:4 Portrait</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="text-blue-600" />
                                        </div>
                                        <input id="file-input" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-1">
                                        <label className="text-[14px] text-slate-600 uppercase tracking-[0.2em] ml-2 block mb-2">เบอร์</label>
                                        <input required type="number" className="w-full p-4 bg-indigo-100 rounded-2xl font-black text-center text-xl text-blue-600 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none shadow-inner"
                                            value={formData.candidate_number} onChange={(e) => setFormData({ ...formData, candidate_number: e.target.value })} />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="text-[14px] text-slate-600 uppercase tracking-[0.2em] ml-2 block mb-2">ชื่อผู้สมัคร/ชื่อพรรค</label>
                                        <input required className="w-full p-4 bg-indigo-100 rounded-2xl font-bold text-blue-600 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none"
                                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="กรอกชื่อที่ต้องการแสดง..." />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="text-[14px] text-slate-600 uppercase tracking-[0.2em] ml-2 block mb-2">ชื่อกลุ่ม</label>
                                        <input className="w-full p-4 bg-indigo-100 rounded-2xl font-bold text-blue-600 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none"
                                            value={formData.namegroup} onChange={(e) => setFormData({ ...formData, namegroup: e.target.value })} placeholder="กรอกชื่อที่ต้องการแสดง..." />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[14px] text-slate-600 uppercase tracking-[0.2em] ml-2 block mb-2">ประเภทองค์กร</label>
                                        <select className="w-full p-4 bg-indigo-100 rounded-2xl font-bold text-blue-600 outline-none border-2 border-transparent focus:border-blue-500 appearance-none cursor-pointer"
                                            value={formData.type} onChange={(e: any) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, type: val, faculty_code: val === 'ORGANIZATION' ? '' : formData.faculty_code });
                                            }}>
                                            <option value="ORGANIZATION">องค์การนิสิต (ส่วนกลาง)</option>
                                            <option value="COUNCIL">สภานิสิต (คณะ)</option>
                                            <option value="CLUB">สโมสรนิสิต (คณะ)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[14px] text-slate-600 uppercase tracking-[0.2em] ml-2 block mb-2">สังกัดคณะ</label>
                                        <select
                                            disabled={formData.type === 'ORGANIZATION'}
                                            className="w-full p-4 bg-indigo-100 rounded-2xl font-bold text-blue-600 outline-none border-2 border-transparent focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                            value={formData.faculty_code} onChange={(e) => setFormData({ ...formData, faculty_code: e.target.value })}>
                                            <option value="">-- ไม่ระบุคณะ --</option>
                                            {faculties.map(f => <option key={f.faculty_code} value={f.faculty_code}>{f.faculty_name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col sm:flex-row gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors">ยกเลิก</button>
                                <button type="submit" disabled={isSubmitting} className="order-1 sm:order-2 flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black shadow-2xl shadow-slate-200 disabled:opacity-50 flex justify-center items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : editingId ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}