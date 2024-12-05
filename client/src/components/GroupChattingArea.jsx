import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SendMsg from "./Messages/SendMsg";
import RecMsg from "./Messages/RecMsg";
import axios from "axios";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";
import { logoutUser } from "../redux/userSlice";
import Loading from "./Loading";
import { io } from "socket.io-client";
import { getMessaging } from "firebase/messaging";

/* eslint-disable react/prop-types */
function GroupChattingArea({
  openChat,
  setGroupChattingContentID,
  groupChattingContentID,
  closeChat,
  enlarge,
  closeChatWindow,
  setShowGrpInfo,
  setIsGrpChatContntAvl,
  setGroupEdit,
  setNewGroupDetails,
}) {
  const [isGrpOptionsOpen, setIsGrpOptionsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgToSend, setMsgToSend] = useState("");
  const [msgBeingSent, setMsgBeingSent] = useState(false);
  const lastMessageRef = useRef();
  const [groupChattingContent, setGroupChattingContent] = useState(null);
  const [grpChattingMsgs, setGroupChattingMsgs] = useState();
  const socketRef = useRef();
  const [sentMsgsShown, setSentMsgsShown] = useState(false);
  const [recMsgsShown, setRecMsgsShown] = useState(false);

  const dispatch = useDispatch();
  let currUser = useSelector((state) => state.currUser);

  useEffect(() => {
    if (groupChattingContent) {
      socketRef.current = io(
        `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}grpChatNameSpace`,
        {
          auth: { token: currUser._id },
        }
      );
      socketRef.current.connect();

      socketRef.current.emit("grpUserOnline", {
        currUser,
        toGroup: groupChattingContent._id,
      });

      socketRef.current.on("setGrpUserOnline", (data) => {
        if (data.toGroup === groupChattingContent._id)
          flashSuccess(data.currUser.username + " is Online");
      });

      socketRef.current.on("setGrpUserOffline", (data) => {
        if (data.toGroup === groupChattingContent._id) {
          // flashSuccess(data.currUser.username + " went Offline");
          // if u wish u can show offline msg also
        }
      });

      socketRef.current.on("receiveMsg", (data) => {
        if (data.toGroup === groupChattingContent._id) {
          setGroupChattingMsgs((p) => [...p, data.msg]);
        }
      });

      socketRef.current.on("setTyping", (data) => {
        if (
          data.toGroup === groupChattingContent._id &&
          data.currUser._id != currUser._id
        ) {
          let typing = document.getElementById("grpTypingIndicater");
          let grpUserNames = document.getElementById("grpUserNames");
          if (typing && grpUserNames) {
            typing.classList.remove("hidden");
            grpUserNames.classList.add("hidden");
            typing.innerText = data.currUser.username + " is typing...";
          }
          setTimeout(() => {
            typing.classList.add("hidden");
            grpUserNames.classList.remove("hidden");
            typing.innerText = "";
          }, [1500]);
        }
      });

      // socketRef.current.on("setTyping", (data) => {
      //   if (
      //     data.chatUser === chatContent?.currUser._id &&
      //     data.currUser === chatContent?.chatUser._id
      //   )
      //     setIsTyping(true);
      // });

      // socketRef.current.on("setNotTyping", (data) => {
      //   if (
      //     data.chatUser === chatContent?.currUser._id &&
      //     data.currUser === chatContent?.chatUser._id
      //   )
      //     setIsTyping(false);
      // });

      // socketRef.current.on("setUserOnline", (data) => {
      //   if (data.user_id === chatContent?.chatUser._id)
      //     setCurrentevent("Online");
      // });

      // socketRef.current.on("setUserOfline", (data) => {
      //   if (data.user_id === chatContent?.chatUser._id) {
      //     setLastSeenUpdated((p) => !p);
      //     setCurrentevent("Offline");
      //   }
      // });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [groupChattingContent]);

  useEffect(() => {
    // setMsgToSend("");
    const fetchData = async () => {
      let url = `${
        import.meta.env.VITE_API_BACKEND_URL
      }getGroupContent/${groupChattingContentID}`;
      setLoading(true);
      let res = await axios.get(url, {
        withCredentials: true,
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setLoading(false);

      if (res.data.success) {
        setGroupChattingContent(res.data.chatContent);
        setGroupChattingMsgs(res.data.chatContent.messages);
      } else if (res.data.notLogin) {
        flashError("Login First to Create a Group");
        dispatch(logoutUser);
      } else if (res.data.error) {
        flashError("Error " + res.data.msg);
      }
    };

    fetchData();
  }, [groupChattingContentID]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [grpChattingMsgs]);

  const closeOptions = () => {
    // if (!loading) {
    document.getElementById("grpOptions").classList.add("hidden");
    setIsGrpOptionsOpen(false);
    // }
  };

  function formatDateToTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const timeDifference = now - date;

    const twelveHoursInMilliseconds = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

    if (timeDifference < twelveHoursInMilliseconds) {
      const options = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
    } else {
      const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
    }
  }

  const sendMsg = async () => {
    if (msgToSend) {
      const formData = new FormData();
      formData.append("newMsg", msgToSend);
      formData.append("userName", currUser.username);

      setMsgBeingSent(true);
      let url = `${import.meta.env.VITE_API_BACKEND_URL}saveGroupMsg/${
        currUser._id
      }/${groupChattingContent._id}`;
      // setLoading(true);
      let res = await axios.post(url, formData, {
        withCredentials: true,
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setMsgToSend("");
      setMsgBeingSent(false);

      if (res.data.success) {
        setGroupChattingMsgs((prevMsgs) => [...prevMsgs, res.data.msg]);
        //for sending the notification to grp users even if ther browser is off
        let userIds = [];
        let registrationTokens = [];
        groupChattingContent.grpUsers.map((usr) => {
          if (usr._id != currUser._id) userIds.push(usr._id);
        });

        let formData = new FormData();
        formData.append("userIds", userIds);
        let url = `${import.meta.env.VITE_API_BACKEND_URL}giveLatestTokens`;
        let res1 = await axios.post(url, formData, {
          withCredentials: true,
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        // console.log(tokens);
        if (res1.data.success) {
          registrationTokens = res1.data.tokens;
        } else flashError("some error accoured while sending notifications");
        // This registration token comes from the client FCM SDKs.

        let data = {
          toGroup: groupChattingContent._id,
          msg: res.data.msg,
          sender: currUser?.username,
          senderImg: currUser?.image.url,
          groupName: groupChattingContent.grpName,
          groupImg: groupChattingContent.image.url,
          registrationTokens,
        };
        socketRef.current?.emit("sendMsg", data);
      } else if (res.data.notLogin) {
        flashError("Login First to Create a Group");
        dispatch(logoutUser);
      } else if (res.data.error) {
        flashError("Error " + res.data.msg);
      }
    } else {
      flashError("Enter a Message");
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
    setSentMsgsShown(false);
    setRecMsgsShown(true);
    let recMsgs = Array.from(document.getElementsByClassName("recMsg"));
    recMsgs.forEach((recMsg) => {
      recMsg.classList.remove("hidden");
    });

    closeOptions();
  };

  const showAll = () => {
    let sentMsgs = Array.from(document.getElementsByClassName("sendMsg"));
    sentMsgs.forEach((sentMsg) => {
      sentMsg.classList.remove("hidden");
    });

    let recMsgs = Array.from(document.getElementsByClassName("recMsg"));
    recMsgs.forEach((recMsg) => {
      recMsg.classList.remove("hidden");
    });
    setSentMsgsShown(false);
    setRecMsgsShown(false);
    closeOptions();
  };

  if (loading) return <Loading />;
  return (
    <>
      {groupChattingContent && isGrpOptionsOpen ? (
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
        {/* chat top */}
        <div className="top w-full h-[13%] max-md:h-[11%] bg-green-100 rounded-t-xl shadow-xl flex justify-between items-center p-2">
          <div className="leftHeader flex items-center space-x-2">
            <i
              onClick={() => closeChat()}
              className=" fa-solid fa-arrow-left hidden max-[1026px]:block max-md:text-xl text-3xl cursor-pointer"
            ></i>
            {/* grpImg */}
            <div className="relative">
              <img
                src={groupChattingContent?.image.url}
                className="rounded-3xl w-12 max-md:w-10 m-2 shadow-xl cursor-pointer"
                alt=""
                onClick={() => enlarge(groupChattingContent?.image.url)}
              />{" "}
            </div>
            {/* grpName */}
            <div
              onClick={() => {
                setNewGroupDetails(groupChattingContent);
                setIsGrpChatContntAvl(false);
                setGroupEdit(false);
                setShowGrpInfo(true);
              }}
              className="cursor-pointer flex flex-col justify-center -space-y-1 h-10"
            >
              <p className="font-bold text-[17px]">
                {groupChattingContent.grpName}
              </p>

              {/* <p className="text-blue-700 font-bold" id="online">
                      {isTyping ? "typing..." : "Online"}
                    </p> */}

              <p
                id="grpTypingIndicater"
                className="font-bold text-green-600 hidden text-sm "
              ></p>
              <span id="grpUserNames">
                <p className="hidden min-[600px]:block">
                  {groupChattingContent?.grpUsers.map((usr, index) => {
                    if (index >= 4) return;
                    return <span key={index}> {usr?.username},</span>;
                  })}
                  <span></span>{" "}
                  {groupChattingContent?.grpUsers.length > 4 ? (
                    <span>
                      {" "}
                      ... +{groupChattingContent?.grpUsers.length - 4} users
                    </span>
                  ) : null}
                </p>

                <p className="max-[394px]:hidden min-[600px]:hidden">
                  {groupChattingContent?.grpUsers.map((usr, index) => {
                    if (index >= 2) return;
                    return <span key={index}> {usr?.username},</span>;
                  })}
                  <span></span>{" "}
                  {groupChattingContent?.grpUsers.length > 2 ? (
                    <span>
                      {" "}
                      ... +{groupChattingContent?.grpUsers.length - 2} users
                    </span>
                  ) : null}
                </p>

                <p className=" min-[394px]:hidden">
                  {groupChattingContent?.grpUsers.length} users
                </p>
              </span>
            </div>
          </div>

          {/* three dots icon for option */}
          <div
            className="w-6 flex justify-center cursor-pointer"
            onClick={() => {
              setIsGrpOptionsOpen(true);
              document.getElementById("grpOptions").classList.toggle("hidden");
            }}
          >
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </div>
          {/* options div */}
          <div
            id="grpOptions"
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
              onClick={() => {
                setNewGroupDetails(groupChattingContent);
                setIsGrpChatContntAvl(false);
                setGroupEdit(false);
                setShowGrpInfo(true);
              }}
            >
              Group Info
            </p>
            <p
              className="cursor-pointer hover:text-blue-600 font-semibold mb-1"
              onClick={() => {
                setNewGroupDetails(groupChattingContent);
                setIsGrpChatContntAvl(false);
                setGroupEdit(true);
              }}
            >
              Group Edit
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
        {/* msg area */}
        <div
          id="msgArea"
          className="msgsArea scrollbar-hide w-full h-full overflow-auto pb-5 bg-gray-100 "
        >
          {grpChattingMsgs?.map((msg, index) => {
            const isLastMsg =
              index === groupChattingContent.messages.length - 1;
            return msg.sentByUserId?._id === currUser._id ? (
              <SendMsg
                isGroup={true}
                key={msg._id}
                msg={msg}
                formatDateToTime={formatDateToTime}
                ref={isLastMsg ? lastMessageRef : null}
              />
            ) : (
              <RecMsg
                isGroup={true}
                key={msg._id}
                msg={msg}
                formatDateToTime={formatDateToTime}
                ref={isLastMsg ? lastMessageRef : null}
              />
            );
          })}
        </div>
        {/* bottom */}
        <div className="bottom flex w-full h-[8%] rounded-b-xl shadow-xl bg-gray-100">
          <input
            type="text"
            disabled={msgBeingSent}
            value={msgToSend}
            onKeyDown={() => {
              socketRef.current.emit("typing", {
                currUser,
                toGroup: groupChattingContent._id,
              });
            }}
            onChange={(e) => setMsgToSend(e.target.value)}
            onKeyUp={(e) => {
              if (e.key == "Enter") {
                if (!msgBeingSent) sendMsg();
                // socketRef.current.emit("notTyping", {
                //   user_id: chatUser?._id,
                // });
              } else {
                // if (currUser._id !== chatUser._id)
                //   setTimeout(() => {
                //     socketRef.current.emit("notTyping", {
                //       chatUser: chatUser?._id,
                //       currUser: currUser._id,
                //     });
                //   }, 1500);
              }
            }}
            name=""
            id=""
            placeholder="Enter a message"
            className="p-2 rounded-md rounded-r-none border-r-0 focus:outline-0 w-[80%] 
            sm:w-[82%] min-[425px]:!w-[88%] md:!w-[92%]  h-full"
          />
          {/* <button className="border-[1.6px] border-blue-600  h-full rounded-xl">send</button> */}
          <div
            onClick={() => (!msgBeingSent ? sendMsg() : null)}
            className={`flex-grow border-l border-slate-400 rounded-r-md rounded-l-none ${
              loading
                ? `hover:shadow-none`
                : ` hover:shadow-xl hover:text-blue-500`
            } bg-white flex justify-center items-center rounded-xl cursor-pointer `}
          >
            <i className="fa-regular fa-paper-plane text-2xl mx-auto"></i>
          </div>
        </div>
      </div>
    </>
  );
}

export default GroupChattingArea;
