// src/services/candidateService.ts
import axiosInstance from './axiosInstance';

export interface CandidateFormData {
  name: string;
  candidate_number: number | string;
  type: 'ORGANIZATION' | 'COUNCIL' | 'CLUB';
  faculty_code?: string;
  image?: File | null;
}

const candidateService = {
  // ดึงข้อมูลผู้สมัครทั้งหมด
  getAll: async () => {
    const response = await axiosInstance.get('/candidates');
    return response.data;
  },

  // เพิ่มผู้สมัครใหม่ (ต้องใช้ FormData)
  create: async (data: CandidateFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('candidate_number', data.candidate_number.toString());
    formData.append('type', data.type);
    if (data.faculty_code) formData.append('faculty_code', data.faculty_code);
    if (data.image) formData.append('image', data.image);

    const response = await axiosInstance.post('/candidates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // อัปเดตข้อมูลผู้สมัคร
  update: async (id: number, data: CandidateFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('candidate_number', data.candidate_number.toString());
    formData.append('type', data.type);
    if (data.faculty_code) formData.append('faculty_code', data.faculty_code);
    if (data.image) formData.append('image', data.image);

    const response = await axiosInstance.put(`/candidates/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // ลบผู้สมัคร
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/candidates/${id}`);
    return response.data;
  }
};

export default candidateService;