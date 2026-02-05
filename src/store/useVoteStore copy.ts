import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand'

// เพิ่ม role ใน Interface ของ User ใน useVoteStore.ts
interface User {
  id: string;
  name: string;
  email: string; // เพิ่ม email
  role: 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'; // เพิ่ม role
  faculty_code: string;
  faculty_name: string;
  has_voted: boolean;
}

interface VoteState {
  // ข้อมูลการเลือก
  organizationId: number | null;
  clubId: number | null;
  councilIds: number[];
  candidatesData: any | null;
  // ข้อมูล User
  user: any | null;
  isLoggedIn: boolean;

  // Actions
  setVote: (type: 'organizationId' | 'clubId' | 'councilIds', value: any) => void;
  setCandidatesData: (data: any) => void;
  resetVotes: () => void;
  setUser: (userData: any) => void;
  checkAuth: () => void;
  setHasVoted: (status: boolean) => void;
  logout: (router: any) => void;
}

export const useVoteStore = create<VoteState>((set, get) => ({
  organizationId: null,
  clubId: null,
  councilIds: [],
  candidatesData: null, // เริ่มต้นเป็น null
  user: null,
  isLoggedIn: false,

  setVote: (type, value) => set((state) => ({ ...state, [type]: value })),
  setCandidatesData: (data) => set({ candidatesData: data }),
  resetVotes: () => set({
    organizationId: null,
    clubId: null,
    councilIds: [],
    // เราไม่ reset candidatesData เพื่อให้ใช้ข้ามหน้าได้จนกว่าจะ Logout
  }),
  setUser: (userData) => set({ user: userData, isLoggedIn: !!userData }),


  checkAuth: () => {
    console.log("useVoteStore -> checkAuth()");
    const token = getCookie('auth-token');
    console.log("useVoteStore -> checkAuth() -> token", token) ;

    if (token) {
      try {
        const decoded: any = jwtDecode(token as string);
        // ตรวจสอบว่า Token หมดอายุหรือยัง (Optional)
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.log("useVoteStore -> checkAuth() -> Token หมดอายุ");
          deleteCookie('auth-token');
          set({ user: null, isLoggedIn: false });
          return;
        }
        console.log("useVoteStore -> checkAuth() -> decoded", decoded);
        const current_user_has_voted = getCookie('current_user_has_voted');
      
        //set({ user: decoded, isLoggedIn: true });
        // set({
        //   user: {
        //     student_id: decoded.student_id,
        //     name: decoded.name,
        //     faculty_code: decoded.faculty_code,
        //     faculty_name: decoded.faculty_name,
        //     has_voted: decoded.has_voted
        //   },
        //   isLoggedIn: true,
        // });

        const currentUser = {
          id:decoded.id,
          name:decoded.name,
          faculty_code:decoded.faculty_code,
          faculty_name:decoded.faculty_name,
          has_voted:current_user_has_voted};
           
        console.log("useVoteStore -> checkAuth() -> currentUser", currentUser);
        if (currentUser) {
          set({
            user: { ...currentUser,has_voted: current_user_has_voted}, isLoggedIn:true});
        }
      } catch (e) {
        deleteCookie('auth-token');
        //set({ user: null, isLoggedIn: false });
      }
    } else {
      //set({ user: null, isLoggedIn: false });
    }

  },

  /**
     * อัปเดตสถานะการลงคะแนนเฉพาะจุด 
     * (เรียกใช้หลังจากส่งฟอร์มเลือกตั้งสำเร็จเพื่อให้หน้าแรกเปลี่ยนสถานะทันที)
     */
  setHasVoted: (status: boolean) => {
    setCookie('current_user_has_voted', status.toString());
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, has_voted: status }
      });
    }
  },
  logout: (router: any) => {
    deleteCookie('auth-token');
    set({ user: null, isLoggedIn: false, organizationId: null, clubId: null, councilIds: [] });
    router.push('/');
  },




}))


// import { create } from 'zustand'

// interface VoteState {
//   organizationId: number | null;
//   clubId: number | null;
//   councilIds: number[];
//   setVote: (type: 'organizationId' | 'clubId' | 'councilIds', value: any) => void;
//   resetVotes: () => void;
// }

// export const useVoteStore = create<VoteState>((set) => ({
//   organizationId: null,
//   clubId: null,
//   councilIds: [],
//   setVote: (type, value) => set((state) => ({ ...state, [type]: value })),
//   resetVotes: () => set({ organizationId: null, clubId: null, councilIds: [] }),
// }))