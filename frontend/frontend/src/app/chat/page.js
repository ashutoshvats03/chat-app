"use client"
import ChatHeader from '@/components/ChatHeader';
import ChatMessages from '@/components/ChatMessages';
import ChatSideBar from '@/components/ChatSideBar';
import Loading from '@/components/Loading';
import MessagInput from '@/components/MessagInput';
import { chat_service, useAppData } from '@/context/AppContext'
import { SocketData } from '@/context/SocketContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

function page() {
  const {
    isAuth,
    loading: userLoading,
    logoutUser,
    user: loggedInUser,
    chats,
    users,
    fetchChats,
    setChats,
  } = useAppData();

  const { onlineUsers, socket } = SocketData();

  const [selectedUser, setSelectedUser] = useState(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [sideBarOpen, setSideBarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showAllUser, setShowAllUser] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)


  const router = useRouter()
  useEffect(() => {
    if (!isAuth && !userLoading) {
      router.push("/login")
    }
  }, [isAuth, userLoading, router])

  const handleLogout = () => {
    logoutUser()
    router.push("/login")
  }

  async function fetchChat() {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get(`${chat_service}/message/${selectedUser}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(data.messages);
      setUser(data.user);
      await fetchChats();
    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  }

  const moveChatToTop = (chatId, newMessage, updatedUnseenCount) => {
    try {
      setChats((prev) => {
        if (!prev) return null;
        const updatedChats = [...prev];
        const chatIndex = updatedChats.findIndex((chat) => {
          return chat.chat._id === chatId
        })
        if (chatIndex !== -1) {
          const [moveChat] = updatedChats.splice(chatIndex, 1)
          const updatedChat = {
            ...moveChat,
            chat: {
              ...moveChat.chat,
              latestMessage: {
                text: newMessage.text,
                sender: newMessage.sender,
              },
              updatedAt: new Date().toString(),
              unseenCount: updatedUnseenCount && newMessage.sender !== loggedInUser._id ? (moveChat.chat.unseenCount || 0) + 1 : moveChat.chat.unseenCount || 0,
            },
          }
          updatedChats.unshift(updatedChat)
        }
        return updatedChats
      })
    } catch (error) {
      console.log(error)
    }
  }

  const resetUnseenCount = (chatId) => {
    setChats((prev) => {
      if (!prev) return null;

      return prev.map((chat) => {
        if (chat.chat._id === chatId) {
          return {
            ...chat,
            chat: {
              ...chat.chat,
              unseenCount: 0
            }
          }
        }
        return chat
      })
    })
  }

  async function createChat(u) {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(`${chat_service}/chat/new`, {
        userId: loggedInUser._id,
        userId2: u._id
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSelectedUser(data.chatId);
      setShowAllUser(false);
      await fetchChats();
    } catch (error) {
      console.log("failed to start chat", error)
    }
  }

  const handleMessageSend = async (e, imageFile) => {
    e.preventDefault();
    if (!message.trim() && !imageFile && !selectedUser) return

    if (typingTimeout) {
      clearTimeout(typingTimeout)
      setTypingTimeout(null)
    }
    socket?.emit("stopTyping", {
      chatId: selectedUser,
      userId: loggedInUser?._id
    })


    const token = Cookies.get("token")
    try {
      const formData = new FormData();
      formData.append("chatId", selectedUser);
      if (message.trim()) {
        formData.append("text", message);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }
      const { data } = await axios.post(`${chat_service}/message`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      setMessages((prev) => {
        const currentMessages = prev || []
        const messageExists = currentMessages.some(
          (msg) => msg._id === data.message._id
        );
        if (!messageExists) {
          return [currentMessages, data.message]
        }
        return currentMessages
      })
      setMessage("")
      const displayText = imageFile ? "📷 image" : message

      moveChatToTop(
        selectedUser,
        {
          text: displayText,
          sender: data.sender
        },
        false,
      )
      toast.success(displayText)
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || "Something went wrong")
    }
  }

  const handleTyping = (value) => {
    setMessage(value);
    if (!selectedUser || !socket) return;
    // socket setup
    if (value.trim()) {
      socket?.emit("typing", {
        chatId: selectedUser,
        userId: loggedInUser?._id
      })
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    const timeout = setTimeout(() => {
      socket?.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id
      })
    }, 1000);
    setTypingTimeout(timeout)
  }

  useEffect(() => {
    try {
      socket?.on("newMessage", (msg) => {
        console.log(`received new message`, msg)
        if (selectedUser === msg.chatId) {
          setMessages((prev) => {
            const currentMessages = prev || []
            const messageExists = currentMessages.some(
              (m) => m._id === msg._id
            );
            if (!messageExists) {
              return [...currentMessages, msg]
            }
            return currentMessages
          })
          moveChatToTop(msg.chatId, msg, false);
          // console.log(`received new chat `,chats)
          // console.log(`received all message `,messages)
        } else {
          moveChatToTop(msg.chatId, msg, true);
        }
      })
    } catch (error) {
      console.log("useeffct", error)
    }

    socket?.on("messageSeen", (data) => {
      console.log(`received message seen ${data}`)

      if (selectedUser === data.chatId) {
        setMessages((prev) => {
          if (!prev) return null;
          return prev.map((msg) => {
            if (msg.sender === loggedInUser?._id && data.messageIds && data.messageIds.includes(msg._id)) {
              return {
                ...msg,
                seen: true,
                seenAt: new Date().toString()
              }
            } else if (msg.sender === loggedInUser?._id && !data.messageIds) {
              return {
                ...msg,
                seen: true,
                seenAt: new Date().toString()
              }
            }
            return msg
          })
        })
      }
    })


    socket?.on("userTyping", (data) => {
      console.log(`received user typing ${data}`)
      if (data.chatId === selectedUser && data.userId !== loggedInUser._id) {
        setIsTyping(true)
      }
    })
    socket?.on("userStoppedTyping", (data) => {
      console.log(`received user stopped typing ${data}`)
      if (data.chatId === selectedUser && data.userId !== loggedInUser._id) {
        setIsTyping(false)
      }
    })

    return () => {
      socket?.off("newMessage")
      socket?.off("messageSeen")
      socket?.off("userTyping")
      socket?.off("userStoppedTyping")
    }
  }, [socket, selectedUser, setChats,messages, chats, loggedInUser?._id])

  useEffect(() => {
    if (selectedUser) {
      fetchChat();
      setIsTyping(false)
      resetUnseenCount(selectedUser)
      socket?.emit("joinChat", selectedUser)
    }

    return () => {
      socket?.emit("leaveChat", selectedUser)
      setMessages(null)
    }
  }, [selectedUser, socket])

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [typingTimeout])

  if (userLoading) return <Loading />
  return (
    <div className='min-h-screen flex bg-gray-900 text-white relative overflow-hidden'>
      <ChatSideBar
        sideBarOPen={sideBarOpen}
        setSideBarOpen={setSideBarOpen}
        showAllUser={showAllUser}
        setShowAllUser={setShowAllUser}
        users={users}
        loggedInUser={loggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
        createChat={createChat}
        onlineUsers={onlineUsers}
      />
      <div className="flex-1 flex flex-col justify-between backdrop-blur-xl bg-white/5 border-1 border-white/10 p-4 ">
        <ChatHeader
          user={user}
          sideBarOPen={sideBarOpen}
          setSideBarOpen={setSideBarOpen}
          isTyping={isTyping}
          onlineUsers={onlineUsers}
        >
        </ChatHeader>
        <ChatMessages
          selectedUser={selectedUser}
          messages={messages}
          loggedInUser={loggedInUser}
        />
        <MessagInput
          selectedUser={selectedUser}
          message={message}
          handleMessageSend={handleMessageSend}
          handleTyping={handleTyping}
          setMessage={setMessage}
        />
      </div>
    </div >
  )
}

export default page
