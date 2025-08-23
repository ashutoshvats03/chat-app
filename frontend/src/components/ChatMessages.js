import { Check, CheckCheck, CheckIcon, UserCircle } from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react'

function ChatMessages({
    selectedUser,
    messages,
    loggedInUser
}) {
    
    const uniqueMessage = useMemo(() => {
        if (!messages) return []
        const seen = new Set();
        return messages.filter((message) => {
            if (seen.has(message._id)) return false;
            seen.add(message._id);
            return true
        })
    }, [messages])
    const bottomRef = useRef();
    // console.log("uniqueMessage",uniqueMessage)
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedUser, uniqueMessage])
    return (
        <div className='flex-1 overflow-hidden'>
            <div className="h-full max-h-[calc(100vh-6rem)] overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {!selectedUser ? (
                    <p className="text-center text-gray-400 mt-20">
                        Select a user to start chatting
                    </p>
                ) : (
                    <>
                        {
                            uniqueMessage?.length === 0 ? (
                                <p className="text-center text-gray-400 mt-20">
                                    No messages yet
                                </p>
                            ) : (
                                uniqueMessage?.map((e, i) => {
                                    const isSentByMe = e.sender === loggedInUser._id;
                                    const uniqueKey = `${e._id}-${i}`

                                    return (
                                        <div key={uniqueKey} className={`flex   flex-col gap-1 m-4
                                        ${isSentByMe ? "items-end" : "items-start"
                                            }`}>

                                            <div className={`rounded-lg p-3 max-w-sm
                                                    ${isSentByMe ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
                                                }`}>
                                                {e.messageType === "image" && e.image && (
                                                    <div className="relative group">
                                                        <img
                                                            src={e.image.url}
                                                            width={150}
                                                            height={150}
                                                            alt="image"
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />

                                                    </div>
                                                )}
                                                {e.text && (
                                                    <p className='mt-1'>{e.text}</p>
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-1 text-xs text-gray-400
                                                ${isSentByMe ? "pr-2 flex-row-reverse" : "pl-2 flex-row"}
                                                `}>
                                                <span>
                                                    {moment(e.createdAt).format("hh:mm A . MMM D")}
                                                </span>
                                                {
                                                    isSentByMe && (
                                                        <div className="flex items center ml-1">
                                                            {
                                                                e.seen ? (
                                                                    <div className="flex items-center gap-1 text-blue-400">
                                                                        <CheckCheck className="w-4 h-4" />
                                                                        {
                                                                            e.seenAt && (
                                                                                <span>
                                                                                    {
                                                                                        moment(e.seenAt).format("hh:mm A")
                                                                                    }
                                                                                </span>
                                                                            )
                                                                        }
                                                                    </div>
                                                                ) : (
                                                                    <Check className='w-4 h-4 text-gray-500' />
                                                                )
                                                            }
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            )
                        }
                        <div ref={bottomRef}></div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ChatMessages
