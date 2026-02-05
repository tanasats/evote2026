import axiosInstance from './axiosInstance';

export const reportService = {
  // 
  getReportOrganization: async () => {
    const response = await axiosInstance.get('/admin/reports/organization');
    return response.data;
  },

  getReportClub: async () => {
    const response = await axiosInstance.get('/admin/reports/club');
    return response.data;
  },

  getReportCouncil: async () => {
    const response = await axiosInstance.get('/admin/reports/council');
    return response.data;
  }

};