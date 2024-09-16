/* eslint-disable react/prop-types */

import { forwardRef } from "react";

let SendMsg = forwardRef(({ msg, formatDateToTime }, ref) => {
  return (
    <>
      <div
        ref={ref}
        className="sendMsg w-fit max-w-[85%]  max-h-[50%] min-h-[5%] overflow-auto rounder-xl
           bg-orange-200 mt-2 rounded-l-xl ml-auto shadow-xl p-2 pb-1 "
      >
        {" "}
        <p>{msg.msg}</p>{" "}
        <p className="w-fit ml-auto text-xs">
          {msg.createdAt && formatDateToTime(msg.createdAt)}
        </p>{" "}
      </div>
    </>
  );
});

SendMsg.displayName = "SendMsg";
export default SendMsg;
