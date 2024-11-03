/* eslint-disable react/prop-types */
// import React from 'react'

function DefaultChatArea() {
  return (
    <div className="w-full h-full rounded-xl flex flex-col justify-between">
      <div className="top w-full h-[10%]  bg-green-100 rounded-t-xl shadow-xl flex justify-end items-center">
        {/* <div
          onClick={() => closeChatWindow()}
          className="hover:text-red-500 hover:scale-105 font-bold cursor-pointer min-md:hidden flex justify-center w-fit mr-4 items-center "
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/5244/5244832.png"
            alt=""
            className="w-14 "
          />
          <p>Close Chat</p>
        </div> */}
      </div>
      <div className="mx-auto text-2xl font-light">Select a chat</div>
      <div className="bottom w-full h-[10%] bg-green-100 rounded-b-xl shadow-xl"></div>
    </div>
  );
}

export default DefaultChatArea;
