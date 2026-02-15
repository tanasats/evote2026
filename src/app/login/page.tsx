'use client'
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';
import { useVoteStore } from '@/store/useVoteStore';
import { voteService } from '@/services/voteService';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { Vote } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useVoteStore(); // ดึง Action จาก Store

  const handleSuccess = async (response: any) => {
    try {
      // 1. ยืนยันตัวตนผ่าน API Service
      const data = await voteService.loginWithGoogle(response.credential);
      console.log("data : ", data);

      // 2. เก็บ Token ลงใน Cookie สำหรับ Middleware
      setCookie('auth-token', data.token, {
        maxAge: 60 * 60 * 8,      // 8 ชั่วโมง (เพิ่มจาก 1 ชั่วโมง)
        httpOnly: false,           // ⚠️ ตั้งเป็น false ชั่วคราวเพราะ client ต้องอ่าน token
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',        // ป้องกัน CSRF
        path: '/'
      });
      //setCookie('current_user_has_voted',data.user.has_voted, { maxAge: 60 * 60 }); // 1 ชั่วโมงตาม JWT

      // 3. อัปเดต Store ทันที (Navbar จะเปลี่ยนสถานะตรงนี้)
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        faculty_code: data.user.faculty_code,
        faculty_name: data.user.faculty_name,
        has_voted: data.user.has_voted
      });

      // // 3. อัปเดต Store ทันที โดยการ Decode ข้อมูลจาก Token มาเก็บใน Zustand (Navbar จะเปลี่ยนสถานะตรงนี้)
      // const decoded: any = jwtDecode(data.token);
      // setUser({
      //   name: decoded.name,
      //   student_id: decoded.student_id,
      //   faculty_code: decoded.faculty_code,
      //   faculty_name: decoded.faculty_name,
      //   has_voted: decoded.has_voted
      // });

      // 4. วาร์ปไปหน้าเลือกตั้ง
      //router.push('/voting');

      // ถ้านิสิตโหวตแล้ว ให้ส่งไปหน้า Success หรือแจ้งเตือน
      //if (decoded.has_voted) {
      if (data.user.has_voted) {
        //alert("ท่านได้ใช้สิทธิ์ลงคะแนนเรียบร้อยแล้ว");
        //toast.success("ท่านได้ใช้สิทธิ์ลงคะแนนเรียบร้อยแล้ว");
        router.push('/');
      } else {

        if (data.user.role == 'MEMBER')
          router.push('/');
        else if (data.user.role == 'ADMIN' || data.user.role == 'SUPER_ADMIN')
          router.push('/admin/dashboard');
      }



    } catch (err) {
      toast.error('เข้าสู่ระบบไม่สำเร็จ: โปรดตรวจสอบสิทธิ์การเข้าใช้งาน');
      // alert('เข้าสู่ระบบไม่สำเร็จ: โปรดตรวจสอบสิทธิ์การเข้าใช้งาน');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center  bg-slate-50 py-20 px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
        <div className="flex items-center justify-center text-blue-700"><Vote size={80} /></div>
        <h1 className="text-4xl font-black text-slate-800 mb-2">ELECTION <span className='text-blue-600'>2026</span></h1>
        <p className="text-slate-500 mb-8 font-medium">ระบบลงคะแนนเลือกตั้งออนไลน์</p>

        <div className="bg-blue-50 p100/50 p-6 rounded-2xl mb-8">
          <p className="text text-slate-800 leading-relaxed">
            กรุณาเข้าสู่ระบบด้วย <br />**Google Account (@msu.ac.th)**<br />
          </p>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => alert('Google Login Failed')}
            useOneTap
          />
        </div>

        <p className="mt-10 text-[14px] text-slate-400">
          &copy; 2026 สำนักคอมพิวเตอร์ มหาวิทยาลัยมหาสารคาม <br /> Computer Center Mahasarakham University
        </p>
      </div>
    </main>
  );
}