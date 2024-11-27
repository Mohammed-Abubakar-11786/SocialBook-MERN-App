/* eslint-disable react/prop-types */

import { forwardRef } from "react";
import "../../App.css";
let SendMsg = forwardRef(({ msg, formatDateToTime, isGroup }, ref) => {
  return (
    <div className="sendMsg flex justify-end items-center" ref={ref}>
      {isGroup ? (
        <img
          className="w-[30px] mt-2  mr-2 rounded-full "
          src={msg.sentByUserId?.image.url}
          alt=""
        />
      ) : null}
      <div
        className="w-fit max-w-[85%] max-h-[350px] min-h-[5%] overflow-auto scrollbar-hide rounder-xl
           bg-orange-200 mt-2 rounded-l-xl  shadow-xl p-2 py-1"
      >
        {" "}
        {isGroup ? (
          <p className="text-xs">~{msg.sentByUserId.username}</p>
        ) : null}
        <p>{msg.msg}</p>{" "}
        <p className="w-fit ml-auto text-xs">
          {msg.createdAt && formatDateToTime(msg.createdAt)}
        </p>{" "}
      </div>
    </div>
  );
});

SendMsg.displayName = "SendMsg";
export default SendMsg;
