'use client'
import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, X, Eye, EyeOff, Save, Loader2, Image as ImageIcon, MoveVertical } from 'lucide-react';
import adminService from '@/services/adminService';
import { toast } from 'react-hot-toast';

export default function BannerManagement() {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ title: '', link_url: '', display_order: 0 });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadBanners(); }, []);

    const loadBanners = async () => {
        try {
            const data = await adminService.getBanners();
            setBanners(data);
        } catch (err) { toast.error('ไม่สามารถโหลดข้อมูลได้'); }
        finally { setLoading(false); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // สร้าง Preview ทันที
        }
    };
    // เพิ่มฟังก์ชันเหล่านี้เข้าไปใน BannerManagement Component
    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await adminService.toggleBannerStatus(id, !currentStatus);
            toast.success('อัปเดตสถานะสำเร็จ');
            loadBanners(); // รีโหลดข้อมูลใหม่
        } catch (err) {
            toast.error('ไม่สามารถเปลี่ยนสถานะได้');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ Banner นี้?')) return;

        try {
            await adminService.deleteBanner(id);
            toast.success('ลบ Banner เรียบร้อยแล้ว');
            loadBanners(); // รีโหลดข้อมูลใหม่
        } catch (err) {
            toast.error('ไม่สามารถลบได้');
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('link_url', formData.link_url);
        data.append('display_order', formData.display_order.toString());
        if (selectedFile) data.append('image', selectedFile);

        setIsSubmitting(true);
        try {
            await adminService.saveBanner(data, editingId || undefined);
            toast.success(editingId ? 'แก้ไข Banner สำเร็จ' : 'เพิ่ม Banner สำเร็จ');
            setIsModalOpen(false);
            resetForm();
            loadBanners();
        } catch (err) { toast.error('เกิดข้อผิดพลาดในการบันทึก'); }
        finally { setIsSubmitting(false); }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ title: '', link_url: '', display_order: 0 });
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Banner ประชาสัมพันธ์</h1>
                    <p className="text-slate-500 font-medium italic">จัดการรูปภาพสไลด์หน้าแรก (แนะนำขนาด 21:9)</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black flex items-center gap-2 shadow-2xl shadow-slate-200 transition-all hover:bg-slate-800"
                >
                    <Plus size={20} /> เพิ่ม Banner ใหม่
                </button>
            </div>

            {/* Banner List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {banners.map((banner) => (
                    <div key={banner.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-500">
                        <div className="aspect-[21/9] bg-slate-100 relative overflow-hidden">
                            <img src={`${process.env.NEXT_PUBLIC_IMAGES_URL}${banner.image_url}`} className="w-full h-full object-cover" alt="" />
                            <div className="absolute top-4 right-4 flex gap-2">
                                {/* // ปุ่มสลับสถานะ */}
                                <button
                                    onClick={() => handleToggleStatus(banner.id, banner.is_active)}
                                    className={`p-3 rounded-2xl shadow-sm transition-all ${banner.is_active ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}
                                >
                                    {banner.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                {/* // ปุ่มลบ */}
                                <button
                                    onClick={() => handleDelete(banner.id)}
                                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-black text-slate-800">{banner.title || 'ไม่มีหัวข้อ'}</h3>
                                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">Order: {banner.display_order}</span>
                            </div>
                            <p className="text-sm text-slate-400 font-bold truncate mb-6">{banner.link_url || 'ไม่ได้เชื่อมโยงลิงก์'}</p>
                            <button
                                onClick={() => { setEditingId(banner.id); setFormData({ ...banner }); setPreviewUrl(`${process.env.NEXT_PUBLIC_IMAGES_URL}${banner.image_url}`); setIsModalOpen(true); }}
                                className="w-full py-4 bg-slate-50 rounded-2xl font-black text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                แก้ไขรายละเอียด
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Modal Form --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)} />
                    <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-black text-slate-900">{editingId ? 'แก้ไข Banner' : 'เพิ่ม Banner ใหม่'}</h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-slate-900"><X size={24} /></button>
                            </div>

                            <div className="space-y-6">
                                {/* Image Upload & Preview Section */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`group relative aspect-[21/9] rounded-xl border-4 border-dashed transition-all flex items-center justify-center overflow-hidden cursor-pointer ${previewUrl ? 'border-emerald-100' : 'border-slate-100 hover:border-blue-200 bg-slate-50'}`}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black">
                                                <Upload className="mr-2" /> เปลี่ยนรูปภาพ
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:text-blue-500 transition-colors">
                                                <ImageIcon size={32} />
                                            </div>
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">คลิกเพื่ออัปโหลดรูปภาพ (21:9)</p>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">หัวข้อ (Title)</label>
                                        <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="เช่น ประชาสัมพันธ์การเลือกตั้ง" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">ลำดับการแสดง (Order)</label>
                                        <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">ลิงก์ที่เกี่ยวข้อง (Optional URL)</label>
                                    <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.link_url} onChange={e => setFormData({ ...formData, link_url: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>

                            <div className="mt-12 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600">ยกเลิก</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || (!previewUrl && !editingId)}
                                    className="flex-[2] bg-slate-900 text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึก Banner</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}