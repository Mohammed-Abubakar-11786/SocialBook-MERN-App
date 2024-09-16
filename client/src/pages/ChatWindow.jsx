import { useRef, useState } from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import abuBakarPhoto from "../assets/abu bakar 50kb photo.jpg";
import { useNavigate, useParams } from "react-router-dom";
import ChattingArea from "../components/ChattingArea";
import Loading from "../components/Loading";
import axios from "axios";
import { flashError } from "../helpers/flashMsgProvider";
import { setUsersData } from "../redux/userSlice";
import { io } from "socket.io-client";

function ChatWindow() {
  const dispatch = useDispatch();
  const socketRef = useRef();

  const [chatContent, setChatContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [triggerMsgSent, setTriggerMsgSent] = useState(false);
  const [triggerMsgRec, setTriggerMsgRec] = useState(false);
  const [lastSeenUpdated, setLastSeenUpdated] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // const [users, setUsers] = useState({});

  const navigate = useNavigate();
  let { userID } = useParams();
  const users = useSelector((state) => state.usersData);

  let currUser = useSelector((state) => state.currUser);

  let [sortedUsers, setSortedUsers] = useState([]);
  // console.log("otherthanCuser = " + otherthanCuser);

  // otherthanCuser.forEach(async(user) => {
  //   let url = `${import.meta.env.VITE_API_BACKEND_URL}getConversation/${
  //     currUser._id
  //   }/${user._id}`;
  //   let res = await axios.get(url, { withCredentials: true });
  //   // console.log(res.data.data.msgs);
  //   if (res.data.success) {
  //     let conv = res.data.data;
  //     conv.updatedAt;
  //     //continue
  //   }
  // });

  let getConversation = async () => {
    let url = `${import.meta.env.VITE_API_BACKEND_URL}getConversation/${
      currUser._id
    }/${userID}`;
    let res = await axios.get(url, { withCredentials: true });
    // console.log("res receieved");
    if (res.data.success) {
      setChatContent({
        currUser: currUser,
        lastSeen: res.data.data.chatUser.lastSeen,
        msgs: res.data.data.msgs,
        chatUser: res.data.data.chatUser,
        conv: res.data.conv,
        // convID: conv.convID,
      });
      setLoading(false);
    } else if (res.data.error) {
      flashError("Internal Server Error");
      console.log(res.data.msg);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currUser) {
      socketRef.current = io(
        `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}chat_namespace`,
        {
          auth: { token: `"${currUser._id}"` },
        }
      );
      socketRef.current.connect();

      socketRef.current.on("connect", () => {
        socketRef.current.emit("userOnline", { user_id: currUser._id });
      });

      socketRef.current.on("setTyping", (data) => {
        sortedUsers.forEach((usr) => {
          if (data.chatUser === currUser._id && data.currUser === usr.user._id)
            document.getElementById(
              `${usr.user._id}-toSetTyping`
            ).innerHTML = `<p class = "text-green-600 font-bold">typing...</p>`;
        });
      });

      socketRef.current.on("setNotTyping", (data) => {
        sortedUsers.forEach((usr) => {
          if (data.chatUser === currUser._id && data.currUser === usr.user._id)
            document.getElementById(`${usr.user._id}-toSetTyping`).innerText =
              usr.conv?.messages[usr.conv?.messages.length - 1].msg !==
              undefined
                ? usr.conv?.messages[usr.conv?.messages.length - 1].msg
                : "";
        });
      });

      const handleDisconnect = () => {
        if (socketRef.current) {
          updateUserLastseen(currUser._id);
          // console.log(currentConvId);
          socketRef.current.emit("userOffline", { user_id: currUser._id });
          socketRef.current.disconnect();
        }
      };

      // const handlevisibilitychange = () => {
      //   if (document.hidden) handleDisconnect();
      // };

      window.addEventListener("beforeunload", handleDisconnect);
      // window.addEventListener("visibilitychange", handlevisibilitychange);
      return () => {
        handleDisconnect();
        window.removeEventListener("beforeunload", handleDisconnect);
        // window.removeEventListener("visibilitychange", handlevisibilitychange);
      };
    }
  }, [currUser, socketRef.current, userID]);

  let updateUserLastseen = async (userID) => {
    let url = `${
      import.meta.env.VITE_API_BACKEND_URL
    }updateUserLastseen/${userID}`;
    let res = await axios.get(url, { withCredentials: true });
    // console.log("res receieved");
    if (res.data.success) {
      setLastSeenUpdated(true);
      // console.log(res);
    } else {
      flashError("Some Error in updating last seen");
    }
  };

  useEffect(() => {
    async function getAndSortOtherUsers() {
      let url = `${import.meta.env.VITE_API_BACKEND_URL}getSortedUsers/${
        currUser._id
      }`;

      let res = await axios.get(url, { withCredentials: true });

      if (res.data.success) setSortedUsers(res.data.sortedUsers);
      else if (res.error) flashError(res.msg);
    }

    getAndSortOtherUsers();
  }, [currUser?._id, triggerMsgSent, users]);

  let update = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
    let res = await axios(url, { withCredentials: true });
    // console.log(res);
    dispatch(setUsersData(res.data));
  };

  useEffect(() => {
    update();
  }, [users]);
  // localStorage.setItem("users", JSON.stringify(Users));

  // useEffect(() => {
  //   let users = JSON.parse(localStorage.getItem("users"));
  //   if (users) {
  //     setUsers(users);
  //   }
  // }, []);

  useEffect(() => {
    if (userID) {
      setLoading(true);
      getConversation();
    }
  }, [userID]);

  useEffect(() => {
    let updateConv = async () => {
      let url = `${import.meta.env.VITE_API_BACKEND_URL}getConversation/${
        currUser._id
      }/${userID}`;
      let res = await axios.get(url, { withCredentials: true });
      // console.log("res receieved");
      if (res.data.success) {
        setChatContent({
          currUser: currUser,
          lastSeen: res.data.data.chatUser.lastSeen,
          msgs: res.data.data.msgs,
          chatUser: res.data.data.chatUser,
          conv: res.data.conv,
          // convID: conv.convID,
        });
      }
    };

    if (userID) updateConv();
  }, [triggerMsgSent, triggerMsgRec, lastSeenUpdated, currUser, userID]);

  function openChat() {
    let right = document.getElementById("rightSection");
    let left = document.getElementById("leftSection");
    if (right && left) {
      right.classList.add("z-10");
      left.classList.add("z-0");
    }
  }

  function closeChat() {
    let right = document.getElementById("rightSection");
    let left = document.getElementById("leftSection");
    if (right && left) {
      right.classList.remove("z-10");
      left.classList.remove("z-0");
    }
  }

  function enlarge(img) {
    let preview = document.getElementById("enlargeImg");
    let previewImg = document.getElementById("EnlargeImg");
    if (preview && previewImg) {
      preview.classList.remove("hidden");
      preview.classList.add("flex");
      previewImg.src = img;
    }
  }

  function removeEnlarge() {
    let preview = document.getElementById("enlargeImg");
    let previewImg = document.getElementById("EnlargeImg");
    if (preview && previewImg) {
      preview.classList.remove("flex");
      preview.classList.add("hidden");
      previewImg.src = "";
    }
  }
  function openChatArea(userID) {
    openChat();

    navigate(`/chatTo/${userID}`);
  }

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

  return (
    <>
      <div
        id="enlargeImg"
        onClick={removeEnlarge}
        className="hidden z-20 bg-slate-400 bg-opacity-50 absolute inset-0 w-screen h-screen  justify-center items-center"
      >
        <div className="relative z-30">
          <img
            id="EnlargeImg"
            src=""
            alt=""
            className="max-w-full max-h-full p-2 shadow-xl relative"
          />
          <button
            onClick={() => removeEnlarge()}
            className="absolute z-50 top-0 right-0 m-4 text-white bg-black bg-opacity-50 rounded-full p-2"
          >
            X
          </button>
        </div>
      </div>

      <div className="flex justify-center items-start bg-blue-100 w-screen h-[90vh] !p-2 sm:!px-4 md:!px-8 lg:!px-16 xl:!px-28 2xl:!px-32 overflow-x-auto">
        <div
          id="leftSection"
          className="scrollbar-hide leftSection overflow-y-auto mt-3 max-md:!mt-2 max-md:absolute max-md:z-10 md:!mt-7 max-md:h-[83%] w-[90%] md:w-1/4 h-[90%] bg-white rounded-xl shadow-xl border mr-1 md:bg-green-800 "
        >
          {" "}
          {/* <button onClick={openChat}>Open Chat</button> */}
          {sortedUsers?.map((user) => {
            const isOnline = user.user.is_online; // Replace this with your logic to determine if the user is online
            return (
              <div
                key={user.user._id}
                className="chat cursor-pointer flex justify-start space-x-2 items-center hover:bg-green-200 rounded-t-xl shadow-xl w-full h-[14%]"
              >
                <div className="relative m-2">
                  <img
                    src={user?.user.image?.url}
                    className="rounded-3xl w-12 shadow-xl cursor-pointer"
                    alt=""
                    onClick={() => enlarge(user.user.image.url)}
                  />
                  {isOnline && (
                    <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div
                  className="userDetails -space-y-1 h-full w-full flex flex-col justify-center items-start"
                  onClick={() => openChatArea(user.user._id)}
                >
                  <p className="text-lg font-semibold">
                    {user.user.username}{" "}
                    {user.user._id === currUser._id ? "(You)" : ""}
                  </p>
                  <div className="flex justify-between pr-4 w-full">
                    <p
                      id={`${user.user._id}-toSetTyping`}
                      className="text-sm text-gray-700 mr-2 w-[70%] md:max-w-24 h-5 overflow-auto scrollbar-hide"
                    >
                      {user.conv?.messages[user.conv?.messages.length - 1].msg}
                    </p>
                    <p className="text-sm text-gray-700">
                      {user.conv?.updatedAt &&
                        formatDateToTime(user.conv?.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          id="rightSection"
          className=" mt-3 max-md:!mt-2 max-md:absolute md:!mt-7 max-md:h-[83%] w-[90%] md:w-3/4 h-[90%] bg-white rounded-xl shadow-xl border"
        >
          {loading ? (
            <>
              <Loading />
            </>
          ) : (
            <ChattingArea
              chatContent={chatContent}
              closeChat={closeChat}
              enlarge={enlarge}
              setTriggerMsgSent={setTriggerMsgSent}
              setTriggerMsgRec={setTriggerMsgRec}
              setLastSeenUpdated={setLastSeenUpdated}
              formatDateToTime={formatDateToTime}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default ChatWindow;
