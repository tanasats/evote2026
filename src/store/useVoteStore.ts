import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // ใช้ Persist แทนการเขียน Cookie แยก
import { deleteCookie, getCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { User, JWTPayload } from '@/types/auth';

interface VoteState {
  organizationId: number | null;
  clubId: number | null;
  councilIds: number[];
  candidatesData: any | null;
  user: User | null;
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

      /*      checkAuth: () => {
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
                      id: decoded.id,
                      name: decoded.name,
                      faculty_code: decoded.faculty_code,
                      faculty_name: decoded.faculty_name,
                      role: decoded.role,
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
      */

      checkAuth: () => {
        const token = getCookie('auth-token');
        if (token) {
          try {
            const decoded = jwtDecode<JWTPayload>(token as string);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
              //get().logout(); // ใช้ action logout ที่มีอยู่ --> มัน Error เลยใช้ข้างล่างแทน
              deleteCookie('auth-token');
              set({ user: null, isLoggedIn: false });
              return;
            }

            // ดึงค่าปัจจุบันที่อยู่ใน Store (ซึ่งอาจจะถูกเปลี่ยนเป็น true ไปแล้ว)
            const currentHasVotedInStore = get().user?.has_voted;
            set({
              user: {
                id: decoded.id,
                name: decoded.name,
                faculty_code: decoded.faculty_code,
                faculty_name: decoded.faculty_name,
                // 💡 หัวใจสำคัญ: ถ้า Store บอกว่าโหวตแล้ว (true) ให้เชื่อ Store
                // ถ้า Store ยังเป็น false หรือ null ให้เชื่อ JWT
                has_voted: currentHasVotedInStore === true ? true : decoded.has_voted,
                role: decoded.role,
                email: decoded.email
              },
              isLoggedIn: true,
            });
          } catch (e) {
            console.error('JWT decode error:', e);
            deleteCookie('auth-token');
            set({ user: null, isLoggedIn: false });
          }
        }
      },


      setHasVoted: (status: boolean) => {
        const currentUser = get().user;
        //console.log("useVoteStore -> setHasVoted() -> currentUser :", currentUser);
        if (currentUser) {
          // Note: ข้อมูลใน Token จะยังเป็น false จนกว่าจะ Login ใหม่ 
          // แต่เราใช้สถานะใน Store (ที่ Persist ไว้) มาแสดงผลที่หน้า Landing Page แทน          
          set({
            user: { ...currentUser, has_voted: status }
          });
          // reset บัตรที่เคยเลือกไว้ก่อน
          set({
            organizationId: null,
            clubId: null,
            councilIds: [],
          })

        }
        //console.log("useVoteStore -> setHasVoted() -> currentUser :", get().user);
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