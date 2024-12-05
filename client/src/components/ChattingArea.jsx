/* eslint-disable react/prop-types */
// import React from 'react'
import { useEffect, useRef, useState } from "react";

import DefaultChatArea from "./DefaultChatArea";
import axios from "axios";
import SendMsg from "./Messages/SendMsg";
import RecMsg from "./Messages/RecMsg";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";
import { io } from "socket.io-client";
import { logoutUser } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
function ChattingArea({
  chatContent,
  closeChat,
  enlarge,
  setTriggerMsgSent,
  setTriggerMsgRec,
  setLastSeenUpdated,
  formatDateToTime,
  closeChatWindow,
}) {
  const socketRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const chatContainerRef = useRef();
  const lastMessageRef = useRef();

  let [loading, setLoading] = useState(false);
  let [allmsgs, setAllmsgs] = useState();
  let [currentEvent, setCurrentevent] = useState(
    chatContent?.chatUser.is_online ? "Online" : "Offline"
  );
  let [lastSeen, setlastSeen] = useState(chatContent?.lastSeen);

  const [msgToSend, setMsgToSend] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [imgToSend, setImgToSend] = useState("");
  const [vidToSend, setVidTosend] = useState("");

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [wait, setWait] = useState(false);
  const [sentMsgsShown, setSentMsgsShown] = useState(false);
  const [recMsgsShown, setRecMsgsShown] = useState(false);

  function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  //socket connections
  useEffect(() => {
    if (chatContent?.currUser && !socketRef.current) {
      socketRef.current = io(
        `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}chat_namespace`,
        {
          auth: { token: chatContent.currUser._id },
        }
      );
      socketRef.current.connect();

      socketRef.current.on("receiveMsg", (data) => {
        if (data.toUser === chatContent?.currUser._id) {
          setAllmsgs((p) => [...p, data.msg]);
          setTriggerMsgRec(true);
          setIsTyping(false);
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
        if (data.user?._id === chatContent?.chatUser._id) {
          setLastSeenUpdated((p) => !p);
          setlastSeen(Date.now());
          setCurrentevent("Offline");
        }
      });

      // socketRef.current.on("disconnect", () => {
      //   socketRef.current.emit("userOffline", { user_id: currUser._id });
      // });

      return () => {
        socketRef.current.disconnect();
        socketRef.current = null;
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

  let { currUser, chatUser } = chatContent;

  async function sendMsg() {
    if (msgToSend) {
      let url = `${import.meta.env.VITE_API_BACKEND_URL}sendMsg/${
        currUser._id
      }/${chatUser._id}`;

      let dataToSend = new FormData();
      dataToSend.append("msgToSend", msgToSend);
      // dataToSend.append("convID", convID);

      setLoading(true);

      let res = await axios.post(url, dataToSend, {
        withCredentials: true,
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      setLoading(false);
      if (res.data.success) {
        setTriggerMsgSent((p) => !p);
        setAllmsgs([...allmsgs, res.data.msg]);

        let formData = new FormData();
        let chatUser_id = [];
        let registrationToken = [];
        chatUser_id.push(chatUser._id);
        formData.append("userIds", chatUser_id);
        let url = `${import.meta.env.VITE_API_BACKEND_URL}giveLatestTokens`;
        let res1 = await axios.post(url, formData, {
          withCredentials: true,
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        // console.log(tokens);
        if (res1.data.success) {
          registrationToken = res1.data.tokens;
        } else flashError("some error accoured while sending notifications");
        // This registration token comes from the client FCM SDKs.

        socketRef.current.emit("sendMsg", {
          msg: res.data.msg,
          sender: currUser?.username,
          senderImg: currUser.image.url,
          toUser: chatUser._id,
          registrationToken,
        });
      } else if (res.data.error) {
        flashError("Internal Server Error ☹️");
      } else if (res.data.notLogin) {
        dispatch(logoutUser());
        navigate("/login", {
          state: {
            forceLogin: true,
            msg: "Login First to Send a Message",
          },
        });
      }
      setMsgToSend("");
    } else {
      flashError("Enter a message ");
    }
  }

  const closeOptions = () => {
    if (!wait) {
      document.getElementById("options").classList.add("hidden");
      setIsOptionsOpen(false);
    }
  };

  const showOnlySentMsgs = () => {
    // Convert HTMLCollection to an array
    let recMsgs = Array.from(document.getElementsByClassName("recMsg"));
    recMsgs.forEach((recMsg) => {
      recMsg.classList.add("hidden");
    });
    setSentMsgsShown(true);
    setRecMsgsShown(false);
    let sentMsgs = Array.from(document.getElementsByClassName("sendMsg"));
    sentMsgs.forEach((sentMsg) => {
      sentMsg.classList.remove("hidden");
    });

    closeOptions();
  };

  const showOnlyRecMsgs = () => {
    // Convert HTMLCollection to an array
    let sentMsgs = Array.from(document.getElementsByClassName("sendMsg"));
    sentMsgs.forEach((sentMsg) => {
      sentMsg.classList.add("hidden");
    });
    setRecMsgsShown(true);
    setSentMsgsShown(false);
    let recMsgs = Array.from(document.getElementsByClassName("recMsg"));
    recMsgs.forEach((recMsg) => {
      recMsg.classList.remove("hidden");
    });

    closeOptions();
  };

  const clearChat = async () => {
    let msgArea = document.getElementById("msgArea");
    let url = `${import.meta.env.VITE_API_BACKEND_URL}clearChats/${
      currUser._id
    }/${chatUser._id}`;

    setWait(true);

    let res = await axios.get(url, {
      withCredentials: true,
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    if (res.data.success) {
      flashSuccess("Cleared Chats");
      msgArea.innerHTML = ``;
    } else flashError("Some thing went wrong...");

    setWait(false);

    closeOptions();
  };

  const showAll = () => {
    setSentMsgsShown(false);
    setRecMsgsShown(false);

    let sentMsgs = Array.from(document.getElementsByClassName("sendMsg"));
    sentMsgs.forEach((sentMsg) => {
      sentMsg.classList.remove("hidden");
    });

    let recMsgs = Array.from(document.getElementsByClassName("recMsg"));
    recMsgs.forEach((recMsg) => {
      recMsg.classList.remove("hidden");
    });

    closeOptions();
  };

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
        <>
          {chatContent && isOptionsOpen ? (
            <>
              <div
                onClick={closeOptions}
                className="overlay absolute z-40 top-0 w-screen h-screen left-0 bg-black opacity-0"
              ></div>
            </>
          ) : (
            <></>
          )}
          <div className="w-full h-full rounded-xl flex flex-col justify-between">
            {/* chat user name sec */}
            <div className="top w-full h-[13%] max-md:h-[11%] bg-green-100 rounded-t-xl shadow-xl flex justify-between items-center p-2">
              <div className="leftHeader flex items-center space-x-2">
                <i
                  onClick={() => closeChat()}
                  className=" fa-solid fa-arrow-left hidden max-[1026px]:block max-md:text-xl text-3xl cursor-pointer"
                ></i>
                <div className="relative">
                  <img
                    src={chatUser.image.url}
                    className="rounded-3xl w-12 max-md:w-10 m-2 shadow-xl cursor-pointer"
                    alt=""
                    onClick={() => enlarge(chatUser.image.url)}
                  />{" "}
                  <div
                    className={`absolute top-3 left-1.5 w-3 h-3 ${
                      currentEvent !== "Offline"
                        ? "bg-green-500"
                        : "bg-slate-400"
                    }  border-2 border-white rounded-full`}
                  ></div>
                </div>

                <div className="cursor-pointer flex flex-col justify-center -space-y-1 h-10">
                  <p className="font-bold text-[17px]">{chatUser.username}</p>

                  {currentEvent === "Offline" ? (
                    <>
                      <p className="text-sm">
                        Offline - {formatDateToTime(lastSeen)}
                        {/* {chatContent?.conv &&
                      formatDateToTime(chatContent?.conv.updatedAt)} */}
                      </p>
                    </>
                  ) : (
                    <p className="text-blue-700 font-bold" id="online">
                      {isTyping ? "typing..." : "Online"}
                    </p>
                  )}
                </div>
              </div>

              {/* three dots icon for option */}
              <div
                className="w-6 flex justify-center cursor-pointer"
                onClick={() => {
                  setIsOptionsOpen(true);
                  document.getElementById("options").classList.toggle("hidden");
                }}
              >
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </div>
              {/* options div */}
              <div
                id="options"
                className="hidden absolute top-12 right-3 md:top-[9rem] md:right-[2rem] lg:right-[5rem] xl:right-[9rem] p-2 z-50 bg-white border-black rounded-md border-[1px] shadow-md"
              >
                <p
                  className="cursor-pointer hover:text-blue-600 font-semibold mb-1"
                  onClick={() => closeChatWindow()}
                >
                  close Chat Window
                </p>

                <p
                  className="cursor-pointer hover:text-blue-600 font-semibold mb-1"
                  onClick={clearChat}
                >
                  Clear Chats
                </p>

                {sentMsgsShown ? (
                  <p
                    className="cursor-pointer hover:text-blue-600 font-semibold mb-1"
                    onClick={showAll}
                  >
                    Show All
                  </p>
                ) : (
                  <p
                    className="cursor-pointer hover:text-blue-600 font-semibold mb-1"
                    onClick={showOnlySentMsgs}
                  >
                    Show Only Sent Msgs
                  </p>
                )}

                {recMsgsShown ? (
                  <p
                    className="cursor-pointer hover:text-blue-600 font-semibold"
                    onClick={showAll}
                  >
                    Show All
                  </p>
                ) : (
                  <p
                    className="cursor-pointer hover:text-blue-600 font-semibold"
                    onClick={showOnlyRecMsgs}
                  >
                    Show Only Receive Msgs
                  </p>
                )}
              </div>
            </div>
            <div
              id="msgArea"
              className="msgsArea scrollbar-hide w-full h-full overflow-auto pb-5 bg-gray-100 "
            >
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
            <div className="bottom flex w-full h-[8%] rounded-b-xl shadow-xl bg-gray-100">
              <input
                type="text"
                disabled={loading}
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
                placeholder="Enter a message"
                className="p-2 rounded-md rounded-r-none border-r-0 focus:outline-none w-[80%] 
            sm:w-[82%] min-[425px]:!w-[88%] md:!w-[92%]  h-full"
              />
              {/* <button className="border-[1.6px] border-blue-600  h-full rounded-xl">send</button> */}
              <div
                onClick={() => (!loading ? sendMsg() : null)}
                className={`flex-grow border-2 rounded-r-md rounded-l-none ${
                  loading ? `bg-blue-500` : `bg-white`
                } bg-white flex justify-center items-center rounded-xl cursor-pointer `}
              >
                <i className="fa-regular fa-paper-plane text-2xl mx-auto"></i>
              </div>
            </div>
          </div>{" "}
        </>
      ) : (
        <>
          <DefaultChatArea />
        </>
      )}
    </>
  );
}

export default ChattingArea;
