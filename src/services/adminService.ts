import axiosInstance from './axiosInstance';

// กำหนด Interface สำหรับข้อมูลคณะ
export interface Faculty {
  faculty_code: string;
  faculty_name: string;
}

// เพิ่ม Interface สำหรับรองรับข้อมูลเวลา
export interface ElectionSettings {
  start_time: string;
  end_time: string;
}

// กำหนดโครงสร้างข้อมูลสถิติ
export interface DashboardStats {
  summary: {
    total_students: number;
    total_voted: number;
    total_unvoted: number;
    turnout_percent: number;
  };
  faculty_stats: {
    name: string;
    total: number;
    voted: number;
    percent: number;
  }[];
  hourly_stats: {
    time: string;
    count: number;
  }[];
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
    const response = await axiosInstance.post('admin/settings/election-status', { status });
    return response.data;
  },
  /**
     * ดึงค่าการตั้งค่าวัน-เวลาเลือกตั้งปัจจุบัน
     */
  getSystemSettings: async (): Promise<ElectionSettings> => {
    try {
      const response = await axiosInstance.get('admin/settings/election-time');
      return response.data;
    } catch (error) {
      console.error('Error fetching election settings:', error);
      throw error;
    }
  },

  /**
   * อัปเดตวัน-เวลาเลือกตั้งใหม่
   * @param data วัตถุที่ประกอบด้วย startTime และ endTime (ISO String)
   */
  updateElectionTime: async (data: { startTime: string; endTime: string }) => {
    try {
      // ส่งข้อมูลไปยัง Backend โดยใช้ Key ที่ตรงกับ Controller
      const response = await axiosInstance.post('admin/settings/election-time', {
        start_time: data.startTime,
        end_time: data.endTime
      });
      return response.data;
    } catch (error) {
      console.error('Error updating election settings:', error);
      throw error;
    }
  },




  /**
   * จัดการข้อมูลคณะ
   */
  addFaculty: async (data: any) => {
    const response = await axiosInstance.post('/admin/faculties', data);
    return response.data;
  },
  editFaculty: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/admin/faculties/${id}`, data);
    return response.data;
  },
  removeFaculty: async (id: number) => {
    const response = await axiosInstance.delete(`/admin/faculties/${id}`);
    return response.data;
  },

  /**
     * ดึงข้อมูลสถิติภาพรวมสำหรับ Dashboard
     */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await axiosInstance.get('/admin/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
     * นำเข้าข้อมูลนิสิตผ่านไฟล์ Excel/CSV
     * @param file ไฟล์ที่ต้องการอัปโหลด
     */
  importStudents: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/admin/students/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing students:', error);
      throw error;
    }
  },



};

export default adminService;