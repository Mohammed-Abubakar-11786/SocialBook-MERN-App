/* eslint-disable react/prop-types */
import "../css/flashMsgCss.css";
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios, { all } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";
import { logoutUser } from "../redux/userSlice";
import { Navigate, useNavigate } from "react-router-dom";

const GroupChat = () => {
  const socketRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const allUsers = useSelector((state) => state.usersData.allUsers);
  let currUser = useSelector((state) => state.currUser);

  const [onlineUsers, setOnlineUsers] = useState(
    allUsers?.filter((user) => user?.is_online_in_group)
  );

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [triggerShowUser, setTriggerShowUser] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesLengthRef = useRef(0); // Ref to track messages length

  // useEffect(() => {
  //   let initialize = async () => {
  //     await getGroupChats();
  //   };
  //   initialize();
  // }, []);

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

  const getGroupChats = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}getGroupChats`;
    setMsgsLoading(true);
    let res = await axios(url, {
      withCredentials: true,
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    setMsgsLoading(false);
    if (res.data.notLogin) {
      dispatch(logoutUser());
      flashError("Login first");
      Navigate("/login");
    } else if (res.data.success) {
      setMessages(res.data.data);
    }

    scrollUp();
  };
  // const getOnlineUsers = async () => {
  //   setOnlineUsers(allUsers?.filter((user) => user?.is_online_in_group));
  // };

  const [message, setMessage] = useState("");
  let [beingSent, setBeingSent] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [sentMsgsShown, setSentMsgsShown] = useState(false);
  const [recMsgsShown, setRecMsgsShown] = useState(false);
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);
  const [showDeleteOverlay1, setShowDeleteOverlay1] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState("");

  useEffect(() => {
    let initialize = async () => {
      await getGroupChats();
    };
    initialize();
    if (currUser && !socketRef.current) {
      socketRef.current = io(
        `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}groupChatNameSpace`,
        {
          auth: { token: currUser._id },
        }
      );
      socketRef.current.connect();

      socketRef.current.on("connect", () => {
        socketRef.current.emit("userOnline", { user_id: currUser?._id });
      });

      // socketRef.current.on("setTyping", (data) => {
      //   sortedUsers.forEach((usr) => {
      //     if (data.chatUser === currUser._id && data.currUser === usr.user._id)
      //       document.getElementById(
      //         `${usr.user._id}-toSetTyping`
      //       ).innerHTML = `<p class = "text-green-600 font-bold">typing...</p>`;
      //   });
      // });

      // socketRef.current.on("setNotTyping", (data) => {
      //   sortedUsers.forEach((usr) => {
      //     if (data.chatUser === currUser._id && data.currUser === usr.user._id)
      //       document.getElementById(`${usr.user._id}-toSetTyping`).innerText =
      //         usr.conv?.messages[usr.conv?.messages.length - 1].msg !==
      //         undefined
      //           ? usr.conv?.messages[usr.conv?.messages.length - 1].msg
      //           : "";
      //   });
      // });

      socketRef.current.on("setTyping", (data) => {
        let userTyping = document.getElementById(`${data._id}-setTyping`);
        userTyping.innerText = "typing...";
        let p = document.getElementById(`${data._id}-typer`);
        if (!p) {
          let outerDiv = document.getElementById("typingIndicater");
          let msgOuter = document.createElement("div");
          msgOuter.id = data._id + "-typer";
          msgOuter.className =
            "bg-green-100 shadow-lg p-1 mb-1 rounded-md font-bold";
          let para = document.createElement("p");
          para.innerHTML = `${data.username} is <b class="text-green-600">typing...</b>`;

          let timeBar = document.createElement("div");
          timeBar.className =
            "h-[0.2rem] bg-green-600 animation-dec-width rounded-xl";

          msgOuter.append(para);
          msgOuter.append(timeBar);

          outerDiv.append(msgOuter);

          setTimeout(() => {
            msgOuter.remove();
          }, [1500]);
        }
      });

      socketRef.current.on("setNotTyping", (data) => {
        //without the setNotTyping the functionality has been implemented using setTyping itself
        // let p = document.getElementById(`${data._id}-typer`);
        // if (p) {
        //   p.remove();
        // }

        let userTyping = document.getElementById(`${data._id}-setTyping`);
        userTyping.innerText = "";
      });

      socketRef.current.on("GroupUserOnline", (data) => {
        const LiveUser = data.currUser;
        setOnlineUsers((prevUsers) => {
          prevUsers = prevUsers.filter((usr) => usr?._id !== LiveUser?._id);

          return [...prevUsers, LiveUser];
        });

        let p = document.getElementById(
          LiveUser?._id + "-onlineIndic@" + data.cntTime
        );
        if (!p) {
          let div = document.createElement("div");
          div.id = LiveUser?._id + "-onlineIndic@" + data.cntTime;
          div.className =
            "p-1 my-1 w-[90%] h-[6%] max-sm:!text-xs max-sm:!px-0 px-5 text-sm flex justify-center items-center text-center rounded-2xl border bg-green-300";
          div.innerText = `${
            LiveUser?.username === currUser.username
              ? "(You)"
              : LiveUser?.username
          } Joined the Chat! @ ${formatDateToTime(data.cntTime)}`;

          document.getElementById("innerChatSpace").append(div);
          scrollUp();
        }
      });

      socketRef.current.on("GroupUserOffline", (data) => {
        // getOnlineUsers();
        const LiveUser = data.currUser;
        setOnlineUsers((prevUsers) =>
          prevUsers.filter((user) => user?._id !== LiveUser?._id)
        );

        let p = document.getElementById(
          LiveUser?._id + "-oflineIndic@" + data.disCntTime
        );
        if (!p && LiveUser) {
          let div = document.createElement("div");
          div.id = LiveUser?._id + "-oflineIndic@" + data.disCntTime;
          div.className =
            "p-1 my-1 w-[90%] h-[6%] max-sm:!text-xs max-sm:!px-0 max-sm:px-0 px-5 text-sm flex justify-center items-center text-center rounded-2xl border bg-red-300";
          div.innerText = `${
            LiveUser.username
          } Left the Chat! @ ${formatDateToTime(data.disCntTime)}`;

          document.getElementById("innerChatSpace").append(div);
          scrollUp();
        }
      });

      socketRef.current.on("recGrpMsg", (data) => {
        setMessages((prevMessages) => {
          return Array.isArray(prevMessages) ? [...prevMessages, data] : [data];
        });
      });

      socketRef.current.on("recDeletedMsg", (data) => {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== data.msg_id)
        );
      });

      socketRef.current.on("recAllMsgsDeleted", () => {
        // document.getElementById("innerChatSpace").innerHTML = ``;
        setMessages([]);
        flashSuccess("All Messages Deleted");
      });

      // const handleDisconnect = () => {
      //   if (socketRef.current) {
      //     // updateUserLastseen(currUser._id);
      //     // console.log(currentConvId);
      //     socketRef.current.emit("userOffline", { user_id: currUser._id });
      //     socketRef.current.disconnect();
      //   }
      // };

      // const handlevisibilitychange = () => {
      //   if (document.hidden) handleDisconnect();
      // };

      // window.addEventListener("beforeunload", handleDisconnect);
      // window.addEventListener("visibilitychange", handlevisibilitychange);
      return () => {
        // handleDisconnect();
        socketRef.current.disconnect();
        socketRef.current = null; // Reset socketRef to avoid duplicate connections

        // window.removeEventListener("beforeunload", handleDisconnect);
        // window.removeEventListener("visibilitychange", handlevisibilitychange);
      };
    }
  }, [currUser]);

  const closeOptions = () => {
    document.getElementById("options").classList.add("hidden");
    setIsOptionsOpen(false);
  };

  const showOnlySentMsgs = () => {
    // Convert HTMLCollection to an array
    let recMsgs = Array.from(document.getElementsByClassName("recMsg"));
    recMsgs.forEach((recMsg) => {
      recMsg.classList.add("hidden");
    });
    setSentMsgsShown(true);
    setRecMsgsShown(false);
    let sentMsgs = Array.from(document.getElementsByClassName("sentMsg"));
    sentMsgs.forEach((sentMsg) => {
      sentMsg.classList.remove("hidden");
    });

    closeOptions();
  };

  const showOnlyRecMsgs = () => {
    // Convert HTMLCollection to an array
    let sentMsgs = Array.from(document.getElementsByClassName("sentMsg"));
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

  const showAll = () => {
    setSentMsgsShown(false);
    setRecMsgsShown(false);

    let sentMsgs = Array.from(document.getElementsByClassName("sentMsg"));
    sentMsgs.forEach((sentMsg) => {
      sentMsg.classList.remove("hidden");
    });

    let recMsgs = Array.from(document.getElementsByClassName("recMsg"));
    recMsgs.forEach((recMsg) => {
      recMsg.classList.remove("hidden");
    });

    closeOptions();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message) {
      const url = `${import.meta.env.VITE_API_BACKEND_URL}saveGrpMsg/${
        currUser._id
      }`;

      setBeingSent(true);
      const res = await axios.post(
        url,
        {
          msg: message,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      setBeingSent(false);
      if (res.data.notLogin) {
        dispatch(logoutUser());
        navigate("/login", {
          state: { forceLogin: true, msg: "Login First To Chat" },
        });
      } else if (res.data.success) {
        socketRef.current.emit("grpMsgSent", res.data.grpmsg);

        setMessages((prevMessages) => {
          return Array.isArray(prevMessages)
            ? [...prevMessages, res.data.grpmsg]
            : [res.data.grpmsg];
        });

        setMessage("");
      } else if (res.data.error) {
        flashError(res.data.msg);
      }
    } else {
      flashError("Enter a Message");
    }
  };

  const handleDeleteMessage = async () => {
    // console.log("in del");
    setLoading(true);
    let url = `${
      import.meta.env.VITE_API_BACKEND_URL
    }delGrpMsg/${deleteMessageId}`;
    let res = await axios.get(url, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    if (res.data.success) {
      setLoading(false);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== deleteMessageId)
      );
      socketRef.current.emit("msgDeleted", { msg_id: deleteMessageId });
      flashSuccess("Message Deleted Successfully!");
      setShowDeleteOverlay(false);
      setShowDeleteOverlay1(false);
    } else if (res.data.notLogin) {
      dispatch(logoutUser());
      navigate("/login", {
        state: { forceLogin: true, msg: "Login First To Delete a Message" },
      });
    } else if (res.data.error) {
      flashError("Internal Server Error ☹️");
    }
  };

  const handleDeleteAllMessages = async () => {
    if (currUser._id === "6696b0ce0ff46750a97b2ccd") {
      let url = `${import.meta.env.VITE_API_BACKEND_URL}delAllGrpMsg`;
      let res = await axios.get(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setMessages([]);
        // document.getElementById("innerChatSpace").innerHTML = ``; //this line is creating that error
        socketRef.current.emit("allMsgsDeleted");
        flashSuccess("All Messages Deleted");
      } else if (res.data.notLogin) {
        dispatch(logoutUser());
        navigate("/login", {
          state: {
            forceLogin: true,
            msg: "Login First to Delete the Messages",
          },
        });
      } else if (res.data.error) {
        flashError("Internal Server Error ☹️");
      }
    } else {
      flashError("Only Admins can do clear chat");
    }

    closeOptions();
  };

  const handleMessageLongPress = (msgType, msgId) => {
    setDeleteMessageId(msgId);
    if (msgType === "sendMsg") {
      setShowDeleteOverlay(true);
    } else {
      setShowDeleteOverlay1(true);
    }
  };

  const showUsers = () => {
    let onlineUsers = document.getElementById("onlineUsers");
    onlineUsers.style.display = "block";
    setTriggerShowUser(true);
    onlineUsers.classList.add("absolute");
    onlineUsers.classList.add("left-0");
    onlineUsers.classList.add("top-10");
    onlineUsers.classList.add("w-[250px]");
    onlineUsers.classList.add("z-[999]");
  };

  const hideOnlineUsers = () => {
    let onlineUsers = document.getElementById("onlineUsers");
    onlineUsers.style.display = "none";
    setTriggerShowUser(false);
  };

  useEffect(() => {
    if (messages?.length > messagesLengthRef.current) {
      scrollUp();
    }
    messagesLengthRef.current = messages?.length;
  }, [messages]);

  const scrollUp = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {triggerShowUser && (
        <div
          onClick={() => hideOnlineUsers()}
          className="absolute w-screen h-screen bg-black opacity-50 z-[99]"
        ></div>
      )}
      {loading && (
        <>
          <div className="w-screen flex justify-center items-center h-screen z-[999] bg-slate-300">
            <p className="font-semibold text-xl text-black"> Please wait...</p>
          </div>
        </>
      )}
      {showDeleteOverlay && (
        <>
          <div
            className="overlay fixed top-0 left-0 w-full h-full bg-black opacity-50 z-40"
            id="delCnfOverlay"
            onClick={() => setShowDeleteOverlay(false)}
          ></div>
          <div className="fixed flex left-[35%] right-[35%] top-[40%] bottom-[40%] items-center z-50 justify-center ">
            <div className="del-cnf flex flex-col  px-5 pt-3 pb-2 rounded-lg  bg-white shadow-lg">
              <h2 className="font-semibold text-xl mb-2">
                Delete Confirmation !!!
              </h2>
              <div className="flex w-full justify-center">
                <button
                  onClick={handleDeleteMessage}
                  className="nbtn delBtn bg-red-500 text-white p-2 rounded-lg m-1"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteOverlay(false)}
                  className="windowCloseBtn bg-blue-500 text-white p-2 rounded-lg m-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showDeleteOverlay1 && (
        <>
          <div
            className="overlay absolute flex top-0 w-screen h-screen left-0 bg-black opacity-50 z-40"
            id="delCnfOverlay1"
            onClick={() => setShowDeleteOverlay1(false)}
          ></div>
          <div className="fixed left-[35%] right-[35%] top-[40%] bottom-[40%] flex justify-center items-center z-50">
            <div
              className="del-cnf p-3 flex flex-col items-start rounded-lg z-50 bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-semibold">
                You can only delete your messages!!!
              </h2>
              <button
                onClick={() => setShowDeleteOverlay1(false)}
                className="windowCloseBtn bg-blue-500 text-white p-2 rounded-lg m-2"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {isOptionsOpen ? (
        <div
          onClick={closeOptions}
          className="overlay absolute z-40 flex top-0 w-screen h-screen left-0 bg-black opacity-50"
        ></div>
      ) : (
        <></>
      )}
      <div
        id="typingIndicater"
        className="z-[999] absolute left-5 top-16 "
      ></div>

      <div className="head w-11/12 rounded-2xl border border-black bg-cyan-200 font-bold text-center m-auto mt-4 p-3 shadow">
        <h1 className="text-xl">
          Welcome <span className="text-red-500">{currUser.username}</span> to
          Group Chat
        </h1>
      </div>
      <div className="outerContainer flex justify-center items-center w-11/12 h-[72%] m-auto mt-4">
        {/* All online users */}
        <div
          id="onlineUsers"
          className="onlineUsers hidden md:block w-1/3 h-full overflow-y-auto border border-black rounded-2xl bg-white mr-6 p-3 shadow"
        >
          <div className="UserHead flex justify-between items-center bg-cyan-200 rounded-t-2xl border-b border-black p-3">
            <h3>All Online Users</h3>{" "}
            <button
              className="block md:hidden"
              onClick={() => hideOnlineUsers()}
            >
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
          </div>
          <div className="innerUsers overflow-y-auto">
            {onlineUsers.map((user) => (
              <div
                key={user._id}
                className="userInfo flex items-center p-2 border-b border-black cursor-pointer hover:bg-cyan-100"
              >
                <div className="profile-container relative">
                  <img
                    className="user-profile-image w-12 h-12 rounded-full object-cover border-2 border-white mr-2"
                    src={user.image.url}
                    alt="User Profile"
                  />
                  <div className="online-indicator w-4 h-4 bg-green-500 rounded-full border-2 border-white absolute top-0 left-0"></div>
                </div>
                <div className="info">
                  <h6>
                    {user.username}
                    {currUser && user._id === currUser._id ? " (You)" : ""}{" "}
                    <p
                      id={`${user._id}-setTyping`}
                      className="text-sm font-bold text-green-600"
                    ></p>
                  </h6>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ChatSpace w-full md:w-2/3 h-full border border-black rounded-2xl bg-white p-3 shadow">
          <div className="chattingHead flex justify-between items-center bg-cyan-200 rounded-t-2xl border-b border-black p-3">
            <h3 className="font-semibold text-lg hidden md:block cursor-pointer">
              {" "}
              All Chats
            </h3>
            <h3
              className="font-semibold text-lg block md:hidden cursor-pointer"
              onClick={() => showUsers()}
            >
              {" "}
              All Online Users
            </h3>
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
              className="hidden absolute p-2 top-64 min-[389px]:top-[226px] right-14 md:right-[83px]  z-50 bg-white border-black rounded-md border-[1px] shadow-md"
            >
              <p
                className="cursor-pointer hover:text-blue-600 font-semibold mb-1"
                onClick={handleDeleteAllMessages}
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
            id="innerChatSpace"
            className="innerChatSpace flex flex-col items-center overflow-y-auto scrollbar-hide h-[75%] w-full p-1"
          >
            {msgsLoading ? (
              <div className="w-full flex justify-center items-center h-screen z-[999] rounded-sm bg-slate-100">
                <p className="font-semibold text-xl text-black">
                  {" "}
                  Please wait...
                </p>
              </div>
            ) : (
              <>
                {messages?.map((msg, index) => {
                  return (
                    <div
                      key={index}
                      className={`pr-3 p-[3px] pl-1 my-1 w-fit max-w-[60%] text-sm rounded-2xl border ${
                        msg.sendUser._id === currUser._id
                          ? "sentMsg ml-auto bg-orange-100 shadow-xl"
                          : "recMsg  mr-auto bg-white shadow-xl"
                      }`}
                      onMouseDown={() =>
                        handleMessageLongPress(
                          msg.sendUser._id === currUser._id
                            ? "sendMsg"
                            : "recMsg",
                          msg._id
                        )
                      }
                      onDoubleClick={() =>
                        handleMessageLongPress(
                          msg.sendUser._id === currUser._id
                            ? "sendMsg"
                            : "recMsg",
                          msg._id
                        )
                      }
                    >
                      <div className="flex items-center w-full">
                        <div className="sendUserImage w-fit mr-2">
                          <img
                            src={msg.sendUser.image.url}
                            alt="image"
                            className="w-12 h-12 rounded-full"
                          />
                        </div>
                        <div className="w-fit">
                          <p>{msg.msg}</p>
                          <div className="time text-sm text-gray-500 w-fit ml-auto">
                            <p className="text-xs ">
                              {formatDateToTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div ref={messagesEndRef} />
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <div className="outerTypeMsg bg-cyan-100 border border-black rounded-2xl p-2 mt-2">
            <form onSubmit={handleSendMessage} className="typeMsg flex">
              <input
                type="text"
                disabled={beingSent}
                placeholder="Enter Message"
                className="form-control flex-1 mr-2 border rounded-lg p-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={() => {
                  socketRef.current.emit("typing", {
                    _id: currUser._id,
                    username: currUser.username,
                  });
                }}
                onKeyUp={(e) => {
                  if (e.key == "Enter") {
                    handleSendMessage();
                    socketRef.current.emit("notTyping", {
                      _id: currUser._id,
                    });
                  } else {
                    setTimeout(() => {
                      socketRef.current.emit("notTyping", {
                        _id: currUser._id,
                      });
                    }, 1500);
                  }
                }}
              />
              <button
                disabled={beingSent}
                className="btn btn-success bg-green-500 text-white rounded-lg p-2"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupChat;
