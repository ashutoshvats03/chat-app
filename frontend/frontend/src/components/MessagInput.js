import { Loader2, Paperclip, Send, X } from 'lucide-react';
import React, { useState } from 'react'

function MessagInput({
    selectedUser,
    message,
    handleMessageSend,
    handleTyping,
    setMessage
}) {
    const [imageFile, setImageFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() && !imageFile && !selectedUser) return
        setIsUploading(true)
        await handleMessageSend(e, imageFile)
        setIsUploading(false)
        setImageFile(null)
    }
    if (!selectedUser) return null;
    return (
        <form
            className='border border-gray-700 flex flex-col gap-2 pt-2'
            onSubmit={handleSubmit}
        >
            {
                imageFile && (
                    <div className='relative w-fit'>
                        <img
                            src={URL.createObjectURL(imageFile)}
                            alt="image"
                            className='w-24 h-24 object-cover border border-gray-600 rounded-lg'
                        />
                        <button
                            type='button'
                            onClick={() => setImageFile(null)}
                            className='absolute -top-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center'
                        >
                            <X className='w-4 h-4 text-white' />
                        </button>
                    </div>
                )
            }
            <div className="flex item-center gap-2">
                <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 p-2 rounded-lg px-3 py-2 transition-colors">
                    <Paperclip size={16} className="w-5 h-5 text-gray-300" />
                    <input type="file" accept='image/*' className='hidden'
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.type.startsWith('image/')) {
                                setImageFile(file);
                            }
                        }}
                    />
                </label>
                <input type="text" className='flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none' 
                placeholder={imageFile ? 'Caption...' : 'Type a message...'}
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value),
                    handleTyping(e.target.value)
                }}
                />
                <button type='submit' disabled={(!imageFile && !message || isUploading)} 
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed'>
                    
                    {isUploading ? (
                        <Loader2 className='w-4 h-4 text-white animate-spin' />
                    ):(
                        <Send className='w-4 h-4 text-white' />
                    )}
                </button>
            </div>
        </form>
    )
}

export default MessagInput
