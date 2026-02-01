import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // ใช้ Persist แทนการเขียน Cookie แยก
import { deleteCookie, getCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';

interface VoteState {
  organizationId: number | null;
  clubId: number | null;
  councilIds: number[];
  candidatesData: any | null;
  user: any | null;
  isLoggedIn: boolean;

  setVote: (type: 'organizationId' | 'clubId' | 'councilIds', value: any) => void;
  setCandidatesData: (data: any) => void;
  resetVotes: () => void;
  setUser: (userData: any) => void;
  checkAuth: () => void;
  setHasVoted: (status: boolean) => void;
  logout: (router: any) => void;
}

export const useVoteStore = create<VoteState>()(
  persist(
    (set, get) => ({
      organizationId: null,
      clubId: null,
      councilIds: [],
      candidatesData: null,
      user: null,
      isLoggedIn: false,

      setVote: (type, value) => set((state) => ({ ...state, [type]: value })),
      setCandidatesData: (data) => set({ candidatesData: data }),
      
      resetVotes: () => set({
        organizationId: null,
        clubId: null,
        councilIds: [],
      }),

      setUser: (userData) => set({ user: userData, isLoggedIn: !!userData }),

      checkAuth: () => {
        const token = getCookie('auth-token');
        if (token) {
          try {
            const decoded: any = jwtDecode(token as string);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
              deleteCookie('auth-token');
              set({ user: null, isLoggedIn: false });
              return;
            }

            // ดึงค่า has_voted จาก JWT โดยตรง ไม่ต้องพึ่ง Cookie ตัวอื่น
            set({
              user: {
                student_id: decoded.student_id,
                name: decoded.name,
                faculty_id: decoded.faculty_id,
                faculty_name: decoded.faculty_name,
                has_voted: decoded.has_voted // ค่าจาก JWT เป็นหลัก
              },
              isLoggedIn: true,
            });
          } catch (e) {
            deleteCookie('auth-token');
            set({ user: null, isLoggedIn: false });
          }
        }
      },

      setHasVoted: (status: boolean) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, has_voted: status }
          });
          // Note: ข้อมูลใน Token จะยังเป็น false จนกว่าจะ Login ใหม่ 
          // แต่เราใช้สถานะใน Store (ที่ Persist ไว้) มาแสดงผลที่หน้า Landing Page แทน
        }
      },

      logout: (router: any) => {
        deleteCookie('auth-token');
        set({ 
          user: null, 
          isLoggedIn: false, 
          organizationId: null, 
          clubId: null, 
          councilIds: [],
          candidatesData: null 
        });
        // ล้าง storage ของ zustand ออกด้วย
        localStorage.removeItem('vote-storage');
        router.push('/');
      },
    }),
    {
      name: 'vote-storage', // ชื่อใน LocalStorage
      storage: createJSONStorage(() => localStorage),
      // เลือกเฉพาะบางค่าที่จะเก็บ (เช่น ข้อมูล user) เพื่อป้องกันข้อมูลโหวตค้าง
      partialize: (state) => ({ 
        user: state.user, 
        isLoggedIn: state.isLoggedIn,
        candidatesData: state.candidatesData
      }),
    }
  )
);