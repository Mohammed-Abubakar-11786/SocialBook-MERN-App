import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { flashError } from "../helpers/flashMsgProvider";
import { logoutUser } from "../redux/userSlice";

/* eslint-disable react/prop-types */
function GroupInfo({
  closeChat,
  newGroupDetails,
  enlarge,
  setGroupEdit,
  setShowGrpInfo,
  setIsGrpChatContntAvl,
  setNewGroupDetails,
}) {
  let currUser = useSelector((state) => state.currUser);

  return (
    <>
      {/* <div>GroupInfo of {newGroupDetails.grpName}</div>
      <div> no. of users {newGroupDetails.grpUsers.length}</div>

      <button
        onClick={() => {
          setShowGrpInfo(false);
          setGroupChattingContentID(newGroupDetails._id);
          setIsGrpChatContntAvl(true);
          //   closeChat();
        }}
      >
        closeChat
      </button> */}

      <i
        onClick={() => {
          setGroupEdit(false);
          setShowGrpInfo(false);
          setIsGrpChatContntAvl(true);
        }}
        className="fixed ml-3 mt-2 fa-solid fa-arrow-left block w-fit  max-md:text-xl text-[1.5rem] cursor-pointer"
      ></i>
      <button
        className="fixed right-7 min-[464px]:right-12 min-[595px]:right-16 top-20 min-[1026px]:top-24 min-[1026px]:right-20 min-[1268px]:right-36"
        onClick={() => {
          // setNewGroupDetails(newGroupDetails);
          setIsGrpChatContntAvl(false);
          setShowGrpInfo(false);
          setGroupEdit(true);
        }}
      >
        <lord-icon
          style={{ width: "45px", height: "45px" }}
          src="https://cdn.lordicon.com/zfzufhzk.json"
          trigger="hover"
        ></lord-icon>
      </button>
      <div className="flex flex-col w-full h-full p-2 pt-3">
        {/* top */}
        <div className="w-full flex flex-col max-h-[50%] min-[600px]:max-h-[35%] items-center min-[600px]:flex-row min-[600px]:px-3 min-[600px]:space-x-[20px]">
          <img
            className="rounded-full w-[100px] min-[600px]:w-[20%] md:w-[17%]"
            src={newGroupDetails.image.url}
            alt=""
          />
          <div className="flex-col w-full">
            <p className="font-bold text-xl mt-2 w-fit min-[600px]:mt-0">
              {newGroupDetails.grpName}
            </p>
            <p className="w-fit text-sm font-bold">Group Description</p>
            <p className="text-sm mt-1 min-[600px]:mt-0 !w-[90%] min-[600px]:w-[80%] max-h-[100px] overflow-auto scrollbar-hide">
              {newGroupDetails.grpDescription}
            </p>
          </div>
        </div>

        {/* selected allUsers */}
        {/* bottom */}
        <div className="flex flex-col w-full mb-2 mt-3  min-h-[45%] min-[600px]:min-h-[65%]">
          <h1 className="font-semibold form-label">Group Members</h1>

          <div className="flex flex-col h-[90%] scrollbar-hide overflow-auto scroll-p-2">
            {newGroupDetails.grpUsers.map((user, index) => {
              return (
                <div
                  key={index}
                  // onClick={() => {
                  //   if (checkboxRef.current && user._id !== currUser?._id) {
                  //     checkboxRef.current.checked =
                  //       !checkboxRef.current.checked;
                  //     if (!checkboxRef.current.checked) {
                  //       toggleUser(user);
                  //     }
                  //   } else {
                  //     flashError("Group cannot be made without you.");
                  //   }
                  // }}
                  className="chat cursor-pointer flex justify-start space-x-2 items-center hover:bg-green-200 rounded-t-xl w-full h-[4rem]"
                >
                  <div className="relative m-2">
                    <img
                      src={user?.image?.url}
                      className="rounded-3xl w-12 shadow-xl cursor-pointer"
                      alt=""
                      onClick={() => enlarge(user.image.url)}
                    />
                  </div>
                  <div className="userDetails -space-y-1 h-full w-full flex flex-col justify-center items-start">
                    <p className="text-lg font-semibold">
                      {user.username}{" "}
                      {user._id === currUser?._id ? "(You)" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* </div> */}
      </div>
    </>
  );
}

export default GroupInfo;
