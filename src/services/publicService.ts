// src/services/publicService.ts
import axios from 'axios';

// สร้าง instance แยกต่างหากที่ไม่ต้องใส่ Auth Header (เพื่อความรวดเร็วและลด Error)
const publicAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

const publicService = {
    /**
     * ดึงรายการ Banner ประชาสัมพันธ์ที่สถานะเป็น Active
     */
    getActiveBanners: async () => {
        try {
            const response = await publicAxios.get('/public/banners');
            return response.data;
        } catch (error) {
            console.error('Error fetching banners:', error);
            return []; // คืนค่าเป็น Array ว่างหากเกิดข้อผิดพลาด
        }
    },

    /**
     * ดึงวัน-เวลาเปิดปิดระบบ (สำหรับหน้า Landing Page นับถอยหลัง)
     */
    getElectionSettings: async () => {
        try {
            const response = await publicAxios.get('/public/election-settings');
            return response.data;
        } catch (error) {
            console.error('Error fetching election settings:', error);
            throw error;
        }
    },


    getVotingPeriod: async () => {
        // API นี้จะไป Query จาก systemsettings
        const res = await publicAxios.get('/public/voting-period');
        return {
            start: new Date(res.data.start_time),
            end: new Date(res.data.end_time),
            serverTime: new Date(res.data.server_time) // ส่งเวลา Server กลับมาเพื่อป้องกันนิสิตแก้เวลาเครื่องตัวเอง
        };
    },



};

export default publicService;