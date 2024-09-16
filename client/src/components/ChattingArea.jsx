/* eslint-disable react/prop-types */
// import React from 'react'
import { useEffect, useRef, useState } from "react";
import abuBakarPhoto from "../assets/abu bakar 50kb photo.jpg";

import DefaultChatArea from "./DefaultChatArea";
import axios from "axios";
import SendMsg from "./Messages/SendMsg";
import RecMsg from "./Messages/RecMsg";
import { flashError } from "../helpers/flashMsgProvider";
import { io } from "socket.io-client";
function ChattingArea({
  chatContent,
  closeChat,
  enlarge,
  setTriggerMsgSent,
  setTriggerMsgRec,
  setLastSeenUpdated,
  formatDateToTime,
}) {
  const socketRef = useRef();
  // const chatContainerRef = useRef();
  const lastMessageRef = useRef();

  let [allmsgs, setAllmsgs] = useState();
  let [currentEvent, setCurrentevent] = useState(
    chatContent?.chatUser.is_online ? "Online" : "Offline"
  );
  const [msgToSend, setMsgToSend] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [imgToSend, setImgToSend] = useState("");
  const [vidToSend, setVidTosend] = useState("");

  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  useEffect(() => {
    if (chatContent?.currUser) {
      socketRef.current = io(
        `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}/chat_namespace`,
        {
          auth: { token: chatContent.currUser._id },
        }
      );
      socketRef.current.connect();

      socketRef.current.on("receiveMsg", (data) => {
        if (data.toUser === chatContent?.currUser._id) {
          setAllmsgs((p) => [...p, data.msg]);
          setTriggerMsgRec(true);
        }
      });

      socketRef.current.on("setTyping", (data) => {
        if (
          data.chatUser === chatContent?.currUser._id &&
          data.currUser === chatContent?.chatUser._id
        )
          setIsTyping(true);
      });

      socketRef.current.on("setNotTyping", (data) => {
        if (
          data.chatUser === chatContent?.currUser._id &&
          data.currUser === chatContent?.chatUser._id
        )
          setIsTyping(false);
      });

      socketRef.current.on("setUserOnline", (data) => {
        if (data.user_id === chatContent?.chatUser._id)
          setCurrentevent("Online");
      });

      socketRef.current.on("setUserOfline", (data) => {
        if (data.user_id === chatContent?.chatUser._id) {
          setLastSeenUpdated((p) => !p);
          setCurrentevent("Offline");
        }
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (chatContent && !isEmptyObject(chatContent)) {
      setAllmsgs(chatContent.msgs);
      // console.log(allmsgs);
    }
  }, [chatContent]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allmsgs]);

  if (!chatContent) {
    return <DefaultChatArea />;
  }

  if (isEmptyObject(chatContent)) {
    return <div>Loading...</div>;
  }

  let { currUser, lastSeen, chatUser } = chatContent;

  async function sendMsg() {
    if (msgToSend) {
      let url = `${import.meta.env.VITE_API_BACKEND_URL}sendMsg/${
        currUser._id
      }/${chatUser._id}`;

      let dataToSend = new FormData();
      dataToSend.append("msgToSend", msgToSend);
      // dataToSend.append("convID", convID);
      let res = await axios.post(url, dataToSend, { withCredentials: true });
      if (res.data.success) {
        setTriggerMsgSent((p) => !p);
        socketRef.current.emit("sendMsg", {
          msg: res.data.msg,
          toUser: chatUser._id,
        });
        setAllmsgs([...allmsgs, res.data.msg]);
      } else if (res.data.error) {
        flashError("Internal Server Error");
      }

      setMsgToSend("");
    } else {
      flashError("Enter a message ");
    }
  }

  return (
    <>
      {/* <div>
        <button onClick={()=> closeChat()}>close</button>
      <p>Username : {userName}</p>
      <p>Lastseen : {lastSeen}</p>
      <p>userID : {userID}</p>
      {msgs?.length > 0 ? (
        <p>msgs</p>
      ) :(
        <p>No msgs</p>
      ) }
    </div> */}

      {chatUser ? (
        <div className="w-full h-full rounded-xl flex flex-col justify-between">
          <div className="top w-full h-[13%] max-md:h-[11%] bg-green-100 rounded-t-xl shadow-xl flex justify-between items-center p-2">
            <div className="leftHeader flex items-center space-x-2">
              <i
                onClick={() => closeChat()}
                className=" fa-solid fa-arrow-left hidden max-md:block max-md:text-xl text-3xl cursor-pointer"
              ></i>
              <div className="relative">
                <img
                  src={chatUser.image.url}
                  className="rounded-3xl w-12 max-md:w-10 m-2 shadow-xl cursor-pointer"
                  alt=""
                  onClick={() => enlarge(chatUser.image.url)}
                />{" "}
                {chatUser.is_online && (
                  <div className="absolute top-3 left-1.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="cursor-pointer flex flex-col justify-center -space-y-1">
                <p className="font-bold text-lg">{chatUser.username}</p>

                {currentEvent === "Offline" ? (
                  <p>
                    Offline - last seen {formatDateToTime(lastSeen)}
                    {/* {chatContent?.conv &&
                      formatDateToTime(chatContent?.conv.updatedAt)} */}
                  </p>
                ) : (
                  <p className="text-blue-700 font-bold" id="online">
                    {isTyping ? "typing..." : "Online"}
                  </p>
                )}

                <p className=""></p>
              </div>
            </div>
          </div>
          <div className="msgsArea scrollbar-hide w-full h-full overflow-auto pb-5 bg-gray-100 ">
            {/* {console.log(allmsgs)} */}
            {allmsgs?.map((msg, index) => {
              const isLastMsg = index === allmsgs.length - 1;
              return msg.sentByUserId === currUser._id ? (
                <SendMsg
                  key={msg._id}
                  msg={msg}
                  formatDateToTime={formatDateToTime}
                  ref={isLastMsg ? lastMessageRef : null}
                />
              ) : (
                <RecMsg
                  key={msg._id}
                  msg={msg}
                  formatDateToTime={formatDateToTime}
                  ref={isLastMsg ? lastMessageRef : null}
                />
              );
            })}
          </div>
          <div className="bottom flex w-full h-[8%] space-x-1 rounded-b-xl shadow-xl bg-gray-100">
            <input
              type="text"
              value={msgToSend}
              onKeyDown={() => {
                if (currUser._id !== chatUser._id)
                  socketRef.current.emit("typing", {
                    chatUser: chatUser?._id,
                    currUser: currUser._id,
                  });
              }}
              onChange={(e) => setMsgToSend(e.target.value)}
              onKeyUp={(e) => {
                if (e.key == "Enter") {
                  sendMsg();
                  socketRef.current.emit("notTyping", {
                    user_id: chatUser?._id,
                  });
                } else {
                  if (currUser._id !== chatUser._id)
                    setTimeout(() => {
                      socketRef.current.emit("notTyping", {
                        chatUser: chatUser?._id,
                        currUser: currUser._id,
                      });
                    }, 1500);
                }
              }}
              name=""
              id=""
              placeholder="Enter a message >>>"
              className="p-2 rounded-xl border-[1.6px] focus:outline-blue-600 focus:outline-1 w-[80%] 
            sm:w-[82%] min-[425px]:!w-[88%] md:!w-[92%]  h-full"
            />
            {/* <button className="border-[1.6px] border-blue-600  h-full rounded-xl">send</button> */}
            <div
              onClick={() => sendMsg()}
              className="flex-grow border-2 bg-white border-blue-600 flex justify-center items-center rounded-xl hover:!bg-blue-600 hover:border-white hover:shadow-xl hover:text-white cursor-pointer "
            >
              <i className="fa-regular fa-paper-plane text-2xl mx-auto"></i>
            </div>
          </div>
        </div>
      ) : (
        <>
          <DefaultChatArea />
        </>
      )}
    </>
  );
}

export default ChattingArea;
