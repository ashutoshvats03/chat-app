"use client";
import Loading from "@/components/Loading";
import { useAppData, user_service } from "@/context/AppContext";
import axios from "axios";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

function Page() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const {isAuth,loading:userLoading} = useAppData()
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(
                `${user_service}/login`,
                { email }
            );
            toast.success(data.message);
            router.push(`/verify?email=${email}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wron2g");
        } finally {
            setLoading(false);
        }
    };
    if(userLoading) return <Loading />
    if(isAuth )  redirect("/chat")
    
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                            <Mail size={40} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3">
                            Welcome to chat-app
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Enter your mail to continue your journey
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    suppressHydrationWarning
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full px-4 py-4 placeholder-gray-400"
                                    placeholder="Enter your email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                suppressHydrationWarning
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {
                                    loading ? <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending OTP to your mail..
                                    </div> : <div className="flex items-center justify-center gap-2">
                                        <span>
                                            {loading ? "Sending..." : "Send Verification Code"}
                                        </span>
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                }

                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
