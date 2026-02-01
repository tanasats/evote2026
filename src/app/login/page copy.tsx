'use client'
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { voteService } from '@/services/voteService';

export default function xLoginPage() {
  const router = useRouter();

  const handleSuccess = async (response: any) => {




    try {
      // ส่ง id_token ไปให้ Backend Node.js
      //const res = await axios.post('http://localhost:3000/api/v1/auth/google-login', {
      //  id_token: response.credential
      // });

      // ใช้ Service แทนการเรียก axios ตรงๆ
      const data = await voteService.loginWithGoogle(response.credential);
      
      // เก็บ JWT ลง Cookie
      setCookie('auth-token', data.token);
      
      // วาร์ปไปหน้าเลือกตั้ง
      router.push('/voting');
    } catch (err) {
        console.log(err);
      alert('Login Failed: โปรดใช้อีเมลมหาวิทยาลัยที่ได้รับสิทธิ์');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">ระบบเลือกตั้งออนไลน์</h1>
      <GoogleLogin onSuccess={handleSuccess} />
    </div>
  );
}