import axiosInstance from './axiosInstance';

export const voteService = {
  // ดึงรายชื่อผู้สมัคร
  getCandidates: async () => {
    const response = await axiosInstance.get('/candidates/getballots');
    return response.data;
  },

  // ส่งผลการเลือกตั้ง
  submitVote: async (voteData: {
    organizationId: number | null;
    clubId: number | null;
    councilIds: number[];
  }) => {
    const response = await axiosInstance.post('/vote/submit', voteData);
    return response.data;
  },

  // ตรวจสอบสถานะการ Login (Google Auth)
  loginWithGoogle: async (idToken: string) => {
    const response = await axiosInstance.post('/auth/google-login', { id_token: idToken });
    return response.data;
  }
};