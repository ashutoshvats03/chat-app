"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { io, Socket } from "socket.io-client"
import { socket_service, useAppData } from "./AppContext"

const SocketContext = createContext({
    socket: null,
    onlineUsers: [],
});
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])


    const { user } = useAppData();

    useEffect(() => {
        if (!user?._id) return;
        const newSocket = io(socket_service, {
            query:{
                userId:user._id
            }
        })
        setSocket(newSocket)
        
        newSocket.on("getOnlineUsers", (users) => {
            setOnlineUsers(users)
        })
        return () => {
            newSocket.disconnect()
        }
    }, [user?._id]);


    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
}

export const SocketData = () => {
    return useContext(SocketContext)
}
