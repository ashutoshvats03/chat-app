"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"

export const user_service = "http://13.62.100.24:5000/api/user"
export const chat_service = "http://13.62.100.24:5002/api/user"
export const socket_service = "http://13.62.100.24:5002"

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    async function fetchUser() {
        try {
            const token = Cookies.get("token");
            const { data } = await axios.get(`${user_service}/myprofile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(data.user);
            setIsAuth(true);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    async function logoutUser() {
        try {
            Cookies.remove("token");
            setUser(null);
            setIsAuth(false);
            toast.success("Logout Successfully");
        } catch (error) {
            console.log(error);
        }
    }

    const [chats, setChats] = useState([]);

    async function fetchChats() {
        try {
            const { data } = await axios.get(`${chat_service}/chat/all`, {
                headers: {
                    Authorization: `Bearer ${Cookies.get("token")}`,
                },
            });
            setChats(data.chats);
        } catch (error) {
            console.log(error);
        }
    }

    const [users, setUsers] = useState([]);

    async function fetchUsers() {
        try {
            const { data } = await axios.get(`${user_service}/user/all`, {
                headers: {
                    Authorization: `Bearer ${Cookies.get("token")}`,
                },
            });
            setUsers(data.users);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        fetchUsers();
        fetchUser();
        fetchChats();
    }, []);
    return (
        <AppContext.Provider value={{ user, setUser, isAuth, setIsAuth, loading, logoutUser, fetchChats, fetchUsers, chats, users, setChats }}>
            {children}
            <Toaster />
        </AppContext.Provider>
    )
}

export const useAppData = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error("useAppData must be used within AppProvider")
    }
    return context
}