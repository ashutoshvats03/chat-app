"use client"
{/* if we would have done that in verify page directly then it would give error in builidng eror  */ }
{/* because we have using params to get email , so we should use that in suspense page */ }




import { ArrowRight, ChevronLeft, Loader2, Lock } from 'lucide-react'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import React, { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { AppProvider, useAppData, user_service } from '@/context/AppContext'
import Loading from './Loading'
import toast from 'react-hot-toast'
// import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

function verifyOtp() {
  const {isAuth, setIsAuth, setUser,loading:userLoading,fetchChats,fetchUsers } = useAppData()
  const [loading, setloading] = useState(false)
  const [OTP, setOTP] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const InputRefs = useRef([]);
  const router = useRouter();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer])

  const handleInputChange = (index, value) => {
    if (value.length > 1) {
      return
    }
    const newOTP = [...OTP];
    newOTP[index] = value;
    setOTP(newOTP);
    setError("");

    if (value && index < 5) {
      InputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !OTP[index] && index > 0) {
      InputRefs.current[index - 1].focus();
    }
  }
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      const newOTP = digits.split("");
      setOTP(newOTP);
      InputRefs.current[0].focus();
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = OTP.join("");
    setloading(true);
    if (otp.length !== 6) {
      setError("Please enter a valid otp")
      return
    }
    setError("")
    try {
      const { data } = await axios.post(
        `${user_service}/verify`,
        { email, otp }
      );
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      setOTP(["", "", "", "", "", ""])
      InputRefs.current[0]?.focus();
      setUser(data);
      setIsAuth(true);
      fetchChats();
      fetchUsers();
      // router.push("/");
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setloading(false);
    }
  }

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        `${user_service}/login`,
        { email }
      );
      toast.success(data.message);
      setTimer(60);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setResendLoading(false);
    }
  }


  const email = useSearchParams().get('email') || "";
  if(userLoading) return <Loading />
  if (isAuth) redirect('/chat')
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8 relative">
            <button
              suppressHydrationWarning
              className='absolute top-0 left-0 p-2   hover:text-white text-gray-400'
            >
              <ChevronLeft className='w-6 h-6' onClick={() => router.back()} />
            </button>
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Lock size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Verify your email..
            </h1>
            <div className="text-gray-400 text-lg">
              We have sent a 6 digit code to your
              <p className='text-blue-600 font-medium'>`{email}`</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-gray-300 mb-4 text-center"
                >
                  Enter your 6 digit otp here
                </label>
                <div className='flex justify-center in-checked: space-x-3'>
                  {
                    OTP.map((digit, index) => {
                      return <input
                        key={index}
                        ref={(el) => (InputRefs.current[index] = el)}
                        type="text"
                        suppressHydrationWarning
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-12 bg-gray-700 text-center text-white text-xl font-bold border border-gray-600 rounded-lg  focus:ring focus:ring-blue-600"
                      />
                    })
                  }
                </div>
              </div>
              {
                error && <div className='bg-red-900 border border-red-700 rounded-lg p-3 text-center'>
                  <p className='text-red-400 text-sm text-center'>
                    {error}
                  </p>
                </div>
              }
              <button
                type="submit"
                suppressHydrationWarning
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {
                  loading ? <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </div> : <div className="flex items-center justify-center gap-2">
                    <span>
                      Verify
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                }

              </button>
            </form>
            <div className="mt-6 text-center">
              <p className='text-gray-400 text-sm mb-2'>
                Didn't receive the code?{" "}
              </p>
              {
                timer > 0 ? <p
                  className='text-gray-400 text-sm'>
                  Resend code in {timer} seconds
                </p> : <button
                  className='text-blue-400 hover:text-blue-300 disabled:opacity-50 text-sm font-medium'
                  disabled={resendLoading}
                  onClick={handleResend}
                >
                  {resendLoading ? "Resending..." : "Resend code"}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default verifyOtp
