import axiosInstance from './axiosInstance';

// กำหนด Interface สำหรับข้อมูลคณะ
export interface Faculty {
  faculty_code: string;
  faculty_name: string;
}

const adminService = {
  // --- ส่วนรายงาน (ที่ทำไว้ก่อนหน้า) ---
  getOrganizationReport: async () => {
    const response = await axiosInstance.get('admin/reports/organization');
    return response.data;
  },

  getClubReport: async () => {
    const response = await axiosInstance.get('admin/reports/club');
    return response.data;
  },

  getCouncilReport: async () => {
    const response = await axiosInstance.get('admin/reports/council');
    return response.data;
  },

  // --- ส่วนจัดการข้อมูลพื้นฐาน (เพิ่มฟังก์ชันที่ต้องการ) ---
  
  /**
   * ดึงรายชื่อคณะทั้งหมดจากระบบ
   * สำหรับนำไปแสดงใน Dropdown หรือการคัดกรองข้อมูล
   */
  getFaculties: async (): Promise<Faculty[]> => {
    try {
      const response = await axiosInstance.get('admin/faculties');
      return response.data;
    } catch (error) {
      console.error('Error fetching faculties:', error);
      throw error;
    }
  },

  /**
   * (เพิ่มเติม) จัดการสถานะการเปิด-ปิดระบบเลือกตั้ง
   */
  updateElectionStatus: async (status: 'OPEN' | 'CLOSED') => {
    const response = await axiosInstance.post('/settings/election-status', { status });
    return response.data;
  }
};

export default adminService;