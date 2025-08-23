"use client"
import Loading from '@/components/Loading';
import { useAppData, user_service } from '@/context/AppContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ArrowLeft, Save, User, UserCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

function page() {
    const {
        user,
        isAuth,
        loading,
        setUser,
    } = useAppData();
    const [isEdit, setIsEdit] = useState(false)
    const [name, setName] = useState("")

    const router = useRouter();

    const editHandler = () => {
        setIsEdit(!isEdit)
        setName(user?.name);
    }
    const submitHandler = async () => {
        const token = Cookies.get("token")
        try {
            const { data } = await axios.post(`${user_service}/update/user`, { name }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            Cookies.set("token", data.token, {
                expires: 15,
                secure: false,
                path: "/"
            })
            setUser(data.user)
            toast.success(data.message)
            setIsEdit(false)
        } catch (error) {
            localStorage.setItem("error", error)
            toast.error(error.response?.data?.message || "Something went wrong")
        }
    }
    useEffect(() => {
        if (!isAuth && !loading) {
            router.push("/login")
        }
    }, [isAuth, router, loading])

    if (loading) return <Loading />
    return (
        <div className='min-h-screen  bg-gray-900 p-4'>
            <div className="max-w-2xl mx-auto pt-8">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push("/chat")}
                        className='p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors'
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Profile setting
                        </h1>
                        <p className='text-gray-400 mt-1'>
                            Manage your account information
                        </p>
                    </div>
                </div>
                <div className="bg-gray-800 rounded-lg border border-gray-700  shadow-lg">
                    <div className="bg-gray-700 p-8 border-b border-gray-600">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
                                    <UserCircle className="w-12 h-12 text-gray-300" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800"></div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-white">
                                    {user?.name || "User Name"}
                                </h2>
                                <p className="text-gray-400 mt-1">
                                    {user?.email || "User Email"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="space-y-6">
                            <div>
                                <label className='block text-sm font-semibold text-gray-300 mb-3'>
                                    Display Name
                                </label>
                                {
                                    isEdit ? (
                                        <form
                                            onSubmit={submitHandler}
                                            className='space-y-4'
                                        >
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className='w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white'
                                                />
                                                <User className="w-5 h-5 text-gray-300 absolute top-1/2 transform -translate-y-1/2 right-3" />
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type='submit'
                                                    className='flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-semibold'
                                                >
                                                    <Save className="w-5 h-5" />
                                                    Save
                                                </button>
                                                <button
                                                    tyep="button"
                                                    onClick={editHandler}
                                                    className='flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white font-semibold'
                                                >
                                                    <X className="w-5 h-5" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className='flex items-center p-4 justify-between bg-gray-700 rounded-lg border border-gray-600'>
                                            <span className='text-white font-semibold text-lg'>
                                                {user?.name || "User Name"}
                                            </span>
                                            <button
                                                onClick={editHandler}
                                                className='flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-white font-semibold'
                                            >
                                                                                                Edit
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page
