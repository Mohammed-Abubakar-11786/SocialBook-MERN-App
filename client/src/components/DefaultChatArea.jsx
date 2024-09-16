/* eslint-disable react/prop-types */
// import React from 'react'

function DefaultChatArea() {
  return (
    <div className="w-full h-full rounded-xl flex flex-col justify-between">
        <div className="top w-full h-[10%] bg-green-100 rounded-t-xl shadow-xl"></div>
        <div className="mx-auto text-2xl font-light">Select a chat</div>
        <div className="bottom w-full h-[10%] bg-green-100 rounded-b-xl shadow-xl"></div>
    
    </div>
  )
}

export default DefaultChatArea
