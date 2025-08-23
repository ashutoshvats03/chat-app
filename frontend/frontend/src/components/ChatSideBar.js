import { CornerDownRight, CornerUpLeft, LogOut, MessageCircle, Plus, Search, UserCircle, X } from 'lucide-react'
import Link from 'next/link';
import React, { useState } from 'react'

function ChatSideBar({
    sideBarOPen,
    setSideBarOpen,
    showAllUser,
    setShowAllUser,
    users,
    loggedInUser,
    chats,
    selectedUser,
    setSelectedUser,
    handleLogout,
    createChat,
    onlineUsers,
}) {
    const [searchQUery, setSearchQuery] = useState('')
    // console.log(users)
    // console.log(users?.length)
    // console.log("------------------")
    // console.log(loggedInUser?._id)
    return (
        <aside className={`fixed flex flex-col justify-between z-20 sm:static  top-0 left-0  h-screen w-80 bg-gray-900 border-r border-gray-700 sm:translate-x-0  transform transition-transform duration-300 ease-in-out ${sideBarOPen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 borber-b border-gray-700">
                <div className='sm:hidden flex justify-end mb-0'>
                    <button
                        onClick={() => setSideBarOpen(false)}
                        className="p-2 bg-red-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-300" />
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start gap-3">
                        <div className="p-2 bg-blue-600 flex justify-between">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {
                                showAllUser ? "All Users" : "Messages"
                            }
                        </h2>
                    </div>
                    <button className={`p-2.5 rounded-lg transition-colors 
                        ${!showAllUser ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-gray-700 text-white"}`
                    }
                        onClick={() => setShowAllUser((prev) => !prev)}
                    >
                        {
                            showAllUser ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />
                        }
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden px-4 py-2  ">
                {
                    showAllUser ? <div className='space-y-4 h-full'>
                        <div className='relative'>
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder='Search user...'
                                className='w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white plcahholder:text-gray-400 rounded-lg focus:outline-none focus:border-blue-500'
                                value={searchQUery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* user lists */}
                        <div className="space-y-2 overflow-y-auto h-full pb-4 ">
                            {
                                users?.filter(u => u._id !== loggedInUser?._id && u.name.toLowerCase().includes(searchQUery.toLocaleLowerCase())).map((u) => (

                                    <button
                                        key={u._id}
                                        className='w-full text-left p-4  rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-colors '
                                        onClick={() => createChat(u)}
                                    >

                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <UserCircle className="w-8 h-8 text-gray-300" />
                                                {/* online symbol dikahna hai */}
                                                {
                                                    Object.values(onlineUsers).includes(u._id) && (
                                                        <span className=" absolute top-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900" />
                                                    )
                                                }
                                            </div>

                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium text-white">{u.name}</span>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {/* to show online offlin text */}
                                                {
                                                    Object.values(onlineUsers).includes(u._id) ? "Online" : "Offline"
                                                }
                                            </div>
                                        </div>

                                    </button>
                                ))}
                        </div>

                    </div> : (
                        chats && chats.length > 0 ? (
                            <div className='space-y-2 overflow-y-auto h-full pb-4'>
                                {
                                    chats.map((c) => {
                                        const latestMessage = c.chat.latestMessage;
                                        const isSelected = selectedUser === c.chat._id
                                        const isSendByMe = latestMessage.sender === loggedInUser?._id
                                        const unseenCount = c.chat.unseenCount || 0;

                                        return (
                                            <button
                                                key={c.chat._id}
                                                onClick={() => {
                                                    setSelectedUser(c.chat._id)
                                                    setSideBarOpen(false)
                                                }}
                                                className={`w-full text-left p-4 rounded-lg transition-colors 
                                                    ${isSelected
                                                        ? "bg-blue-600 border border-blue-500"
                                                        : "border border-gray-700 hover:border-gray-6000"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="relative w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                                            <UserCircle className="w-8 h-8 text-gray-300" />
                                                            {/* online user work */}
                                                            {
                                                                Object.values(onlineUsers).includes(c.user?.user?._id) && (
                                                                    <span className=" absolute top-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900" />
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0 ">
                                                        <div className="flex items-center justify-start mb-1">
                                                            <span className={`font-semibold truncate ${isSelected ? "text-white" : "text-gray-200"}`}>
                                                                {c.user?.user?.name ? c.user.user.name : "Unknown User"}
                                                            </span>
                                                            {
                                                                unseenCount > 0 &&
                                                                <span className=" bg-red-600 text-xs text-white font-bold rounded-full min-w-[22px] h-5.5 flex items-center justify-center px-2 ">
                                                                    {unseenCount > 99 ? "99+" : unseenCount}
                                                                </span>
                                                            }
                                                        </div>
                                                        {
                                                            latestMessage && (
                                                                <div className="flex items-center gap-2">
                                                                    {isSendByMe ? (
                                                                        <CornerUpLeft
                                                                            size={14}
                                                                            className='text-blue-400 text-shrink-0' />
                                                                    ) : (
                                                                        <CornerDownRight
                                                                            size={14}
                                                                            className='text-green-400 text-shrink-0' />
                                                                    )}
                                                                    <span className='text-sm text-gray-400 truncate flex-1'>
                                                                        {latestMessage.text}
                                                                    </span>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center h-full text-center'>
                                <div className="p-4 bg-gray-800 rounded-full mb-4">
                                    <MessageCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className='text-gray-400 font-medium'>
                                    No Chats Found
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Start a new chat to begin messaging
                                </p>
                            </div>
                        ))}
            </div>
            {/* footer */}
            <div className='p-4 border border-t border-gray-700 space-y-2'>
                <Link href={"/profile"} className='flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors'>
                    <div className="p-1.5 bg-gray-700 rounded-3xl">
                        <UserCircle className="w-6 h-6 text-gray-300" />
                    </div>
                    <span className="font-medium text-gray-300">
                        Profile
                    </span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-white w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors">
                    <div className="p-1.5 bg-gray-700 rounded-3xl">
                        <LogOut className="w-6 h-6 text-red-600" />
                    </div>
                    <span className='font-medium'>Logout</span>
                </button>
            </div>
        </aside>
    )
}

export default ChatSideBar
