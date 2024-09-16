/* eslint-disable react/prop-types */
import { forwardRef } from "react";

let RecMsg = forwardRef(({ msg, formatDateToTime }, ref) => {
  return (
    <>
      <div
        ref={ref}
        className="recMsg w-fit max-w-[85%]  max-h-[50%] min-h-[5%] overflow-auto rounder-xl
           bg-white mt-2 rounded-r-xl mr-auto shadow-xl p-2 pb-1 "
      >
        <p>{msg.msg}</p>{" "}
        <p className="w-fit ml-auto text-xs">
          {" "}
          {msg.createdAt && formatDateToTime(msg.createdAt)}
        </p>
      </div>
    </>
  );
});

RecMsg.displayName = "RecMsg";
export default RecMsg;
