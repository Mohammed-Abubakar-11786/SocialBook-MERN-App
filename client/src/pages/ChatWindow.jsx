import { useRef, useState } from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import abuBakarPhoto from "../assets/abu bakar 50kb photo.jpg";
import { useNavigate, useParams } from "react-router-dom";
import ChattingArea from "../components/ChattingArea";
import Loading from "../components/Loading";
import axios from "axios";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";
import { logoutUser, setUsersData } from "../redux/userSlice";
import { io } from "socket.io-client";
import GroupDetails from "../components/GroupDetails";
import GroupChattingArea from "../components/GroupChattingArea";
import GroupInfo from "../components/GroupInfo";
// import { messaging } from "../firebase";
import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

function ChatWindow() {
  onMessage(messaging, (payload) => {
    // console.log("Message received in foreground: ", payload);

    // Optionally display a custom notification
    new Notification("🌐 SocialBook", {
      body: `New message from ${payload.data.sender}: ${payload.data.msg}`,
      icon: payload.data.groupImg,
    });
  });
  const dispatch = useDispatch();
  const socketRef = useRef();

  const [chatContent, setChatContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [triggerMsgSent, setTriggerMsgSent] = useState(false);
  const [triggerMsgRec, setTriggerMsgRec] = useState(false);
  const [lastSeenUpdated, setLastSeenUpdated] = useState(false);

  const [openUserSelect, setOpenUserSelect] = useState(false);
  const [allowGroupEdit, setGroupEdit] = useState(false);
  const [showGrpInfo, setShowGrpInfo] = useState(false);
  let [newGroupDetails, setNewGroupDetails] = useState(null);
  const [isGrpChatContntAvl, setIsGrpChatContntAvl] = useState(false);
  const [groupChattingContentID, setGroupChattingContentID] = useState({});

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
    let res = await axios.get(url, {
      withCredentials: true,
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    // console.log("res receieved");
    setLoading(false);
    if (res.data.success) {
      setChatContent({
        currUser: currUser,
        lastSeen: res.data.data.chatUser.lastSeen,
        msgs: res.data.data.msgs,
        chatUser: res.data.data.chatUser,
        conv: res.data.conv,
        // convID: conv.convID,
      });
    } else if (res.data.notLogin) {
      dispatch(logoutUser());
      navigate("/login", {
        state: { forceLogin: true, msg: "Login First" },
      });
    } else if (res.data.error) {
      flashError("Internal Server Error ☹️");
    }
  };

  useEffect(() => {
    if (currUser && !socketRef.current) {
      socketRef.current = io(
        `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}chat_namespace`,
        {
          auth: { token: `${currUser._id}` },
        }
      );
      socketRef.current.connect();

      socketRef.current.on("connect", () => {
        socketRef.current.emit("userOnline", {
          user_id: currUser._id,
          currUser,
        });
      });

      socketRef.current.on("setUserOnline", (data) => {
        let chatUser = document.getElementById(`forOnline-${data.user_id}`);
        chatUser?.classList.remove("bg-slate-400");
        chatUser?.classList.add("bg-green-500");
      });

      socketRef.current.on("setUserOfline", (data) => {
        let chatUser = document.getElementById(`forOnline-${data.user?._id}`);
        chatUser?.classList.add("bg-slate-400");
        chatUser?.classList.remove("bg-green-500");
      });

      socketRef.current.on("setTyping", (data) => {
        sortedUsers.forEach((usr) => {
          if (
            usr.user &&
            data.chatUser === currUser._id &&
            data.currUser === usr.user._id
          )
            document.getElementById(
              `${usr.user._id}-toSetTyping`
            ).innerHTML = `<p class = "text-green-600 font-bold">typing...</p>`;
        });
      });

      socketRef.current.on("setNotTyping", (data) => {
        sortedUsers.forEach((usr) => {
          if (
            usr.user &&
            data.chatUser === currUser._id &&
            data.currUser === usr.user._id
          )
            document.getElementById(`${usr.user._id}-toSetTyping`).innerText =
              usr.conv?.messages[usr.conv?.messages.length - 1].msg !==
              undefined
                ? usr.conv?.messages[usr.conv?.messages.length - 1].msg
                : "";
        });
      });

      // socketRef.current.on("disconnect", () => {
      //   socketRef.current.emit("userOffline", { user_id: currUser._id });
      // });

      return () => {
        // if (socketRef.current && socketRef.current.connected) {
        // Trigger disconnect if the socket is connected
        socketRef.current.disconnect();
        socketRef.current = null; // Reset socketRef to avoid duplicate connections
        // }
      };
    }
  }, [currUser]);

  // not req becs udating lastseen at the time user disconnect at backend , when socket connection breaks
  // let updateUserLastseen = async (userID) => {
  //   let url = `${
  //     import.meta.env.VITE_API_BACKEND_URL
  //   }updateUserLastseen/${userID}`;

  //   let res = await axios.get(url, {
  //     withCredentials: true,
  //     headers: {
  //       Authorization: localStorage.getItem("token"),
  //     },
  //   });

  //   // console.log("res receieved");
  //   if (res.data.success) {
  //     setLastSeenUpdated(true);
  //     // console.log(res);
  //   } else if (res.data.notLogin) {
  //     dispatch(logoutUser());
  //     navigate("/login", {
  //       state: { forceLogin: true, msg: "Login First" },
  //     });
  //   } else if (res.data.error) {
  //     flashError("Some Error in updating last seen");
  //   }
  // };

  useEffect(() => {
    async function getAndSortOtherUsers() {
      let url = `${import.meta.env.VITE_API_BACKEND_URL}getSortedUsers/${
        currUser?._id
      }`;
      let res = await axios.get(url, {
        withCredentials: true,
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      // console.log(res);
      setUserLoading(false);
      if (res.data.success) setSortedUsers(res.data.sortedUsers);
      else if (res.data.notLogin) {
        dispatch(logoutUser());
        navigate("/login", {
          state: { forceLogin: true, msg: "Login First" },
        });
      } else if (res.data.error) {
        flashError("Internal Server Error ☹️");
        navigate("/");
      } //res.msg
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

  //to update conv page
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

    setIsGrpChatContntAvl(false);
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

  function closeChatWindow() {
    socketRef.current.emit("userOffline", { user_id: currUser._id });
    navigate("/");
  }

  let toggleSelectGroupUsers = () => {
    setOpenUserSelect((p) => !p);
    // console.log(openUserSelect); //here the statment writen above to change, and in this line we are trying to use value which is same as previosly before changing

    if (!openUserSelect) {
      let allUsers = document.getElementsByClassName("newGrpUser");
      Array.from(allUsers).forEach((user) => {
        user.checked = false;
      });
      flashSuccess("Select the users to add in group");
    }
  };

  let createGroup = async () => {
    let allUsers = document.getElementsByClassName("newGrpUser");
    let selectedUsers = [];
    Array.from(allUsers).forEach((user) => {
      if (user.checked) {
        selectedUsers.push(user.id.split("-")[1]);
      }
    });
    let url = `${import.meta.env.VITE_API_BACKEND_URL}saveNewGroupUsers/${
      currUser._id
    }`;

    setLoading(true);
    let res = await axios.post(
      url,
      { selectedUsers },
      {
        withCredentials: true,
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );

    setLoading(false);
    if (res.data.success) {
      flashSuccess("Group created successfully.");
      toggleSelectGroupUsers();
      setNewGroupDetails(res.data.NewGrp);
      setIsGrpChatContntAvl(false);
      setShowGrpInfo(false);
      setGroupEdit(true);
      openChat(); // on mobiles to view right area
    } else if (res.data.notLogin) {
      flashError("Login First to Create a Group");
      dispatch(logoutUser);
    } else if (res.data.error) {
      flashError("Error" + res.data.msg);
      toggleSelectGroupUsers();
    }
  };

  let allUsers = [];
  sortedUsers.map((user) => {
    if (!user.conv?.isGroup) {
      allUsers.push(user.user);
    }
  });
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
        {/* left section */}
        <div
          id="leftSection"
          className="scrollbar-hide leftSection overflow-y-auto mt-3 max-[1026px]:!mt-2 max-[1026px]:absolute max-[1026px]:z-10 min-[1026px]:!mt-7 max-[1026px]:h-[83%] w-[90%] min-[1026px]:w-1/4 h-[90%] bg-white rounded-xl shadow-xl border mr-1 md:bg-green-800 "
        >
          {" "}
          {userLoading ? (
            <>
              <Loading />
            </>
          ) : (
            //show all users
            <>
              {sortedUsers?.map((user) => {
                if (user.conv?.isGroup) {
                  return (
                    <div
                      onClick={() => {}}
                      key={user.conv._id}
                      className="chat cursor-pointer flex justify-start space-x-2 items-center hover:bg-green-200 rounded-t-xl shadow-xl w-full h-[14%]"
                    >
                      {user.conv?.grpCreationPending ? (
                        <>
                          {/* group pending  */}
                          <div className="relative m-2">
                            <img
                              src={user.conv.image.url}
                              className="rounded-3xl w-12 shadow-xl cursor-pointer"
                              alt="ImgAbu"
                            />
                          </div>
                          <div
                            className="userDetails -space-y-1 h-full w-full flex flex-col justify-center items-start"
                            onClick={() => {
                              if (!openUserSelect && !allowGroupEdit) {
                                setIsGrpChatContntAvl(false);
                                setGroupEdit(true);
                                setNewGroupDetails(user.conv);
                                openChat(); // on mobiles to view right area
                              } else if (allowGroupEdit)
                                flashError(
                                  "Complete group creation Process first"
                                );
                            }}
                          >
                            <p className="text-lg font-semibold">New Group</p>
                            <div className="flex justify-between pr-4 w-full">
                              <p
                                // id={`${user.user._id}-toSetTyping`}
                                className="text-sm text-gray-700 mr-2 w-[70%] md:max-w-24 h-5 overflow-auto scrollbar-hide"
                              >
                                {`${user.conv?.grpUsers.length} users`}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="relative m-2">
                            <img
                              src={user.conv?.image.url}
                              className="rounded-3xl w-12 shadow-xl cursor-pointer"
                              alt="Img"
                              onClick={() => enlarge(user.conv?.image.url)}
                            />
                          </div>
                          {/* grpName and lastmsg */}
                          <div
                            className="userDetails -space-y-1 h-full w-full flex flex-col justify-center items-start"
                            onClick={() => {
                              if (!openUserSelect && !allowGroupEdit) {
                                openChat();
                                setGroupChattingContentID(user.conv._id);
                                setIsGrpChatContntAvl(true);
                              } else if (allowGroupEdit)
                                flashError(
                                  "Complete group updation Process first"
                                );
                            }}
                          >
                            <p className="text-lg font-semibold">
                              {user.conv?.grpName}{" "}
                            </p>
                            <div className="flex justify-between pr-4 w-full">
                              <p
                                // id={`${user.user._id}-toSetTyping`}
                                className="text-sm text-gray-700 mr-2 w-[70%] md:max-w-24 h-5 overflow-auto scrollbar-hide"
                              >
                                {
                                  user.conv?.messages[
                                    user.conv?.messages.length - 1
                                  ]?.msg
                                }
                              </p>
                              <p className="text-xs text-gray-700">
                                {user.conv?.updatedAt &&
                                  formatDateToTime(user.conv?.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                } else {
                  const isOnline = user.user.is_online; // Replace this with your logic to determine if the user is online
                  return (
                    <div
                      onClick={() => {
                        if (openUserSelect)
                          document
                            .getElementById(`newGrpUser-${user.user._id}`)
                            ?.click();
                      }}
                      key={user.user._id}
                      className="chat cursor-pointer flex justify-start space-x-2 items-center hover:bg-green-200 rounded-t-xl shadow-xl w-full h-[14%]"
                    >
                      {currUser && user.user._id === currUser._id ? (
                        <>
                          <input
                            readOnly={true}
                            className={`${
                              openUserSelect ? " " : "hidden"
                            } ml-3 newGrpUser`}
                            type="checkbox"
                            checked={true} // Only evaluates if currUser exists
                            name={`newGrpUser-${user.user._id}`}
                            id={`newGrpUser-${user.user._id}`}
                            onClick={(e) => {
                              if (user.user._id === currUser?._id) {
                                e.preventDefault(); // Prevent toggling the checkbox
                                flashError("Group cannot be made without you.");
                              }
                            }}
                          />
                        </>
                      ) : (
                        <>
                          {" "}
                          <input
                            className={`${
                              openUserSelect ? " " : "hidden"
                            } ml-3 newGrpUser`}
                            type="checkbox"
                            name={`newGrpUser-${user.user._id}`}
                            id={`newGrpUser-${user.user._id}`}
                          />
                        </>
                      )}

                      <div className="relative m-2">
                        <img
                          src={user?.user.image?.url}
                          className="rounded-3xl w-12 shadow-xl cursor-pointer"
                          alt=""
                          onClick={() => enlarge(user.user.image.url)}
                        />
                        <div
                          id={`forOnline-${user.user._id}`}
                          className={`absolute top-0 left-0 w-3 h-3 ${
                            isOnline ? "bg-green-500" : "bg-slate-400"
                          } bg-green-500 border-2 border-white rounded-full`}
                        ></div>
                      </div>
                      <div
                        className="userDetails -space-y-1 h-full w-full flex flex-col justify-center items-start"
                        onClick={() => {
                          if (!openUserSelect && !allowGroupEdit) {
                            setIsGrpChatContntAvl(false);
                            setGroupEdit(false);
                            setShowGrpInfo(false);
                            openChatArea(user.user._id);
                          } else if (allowGroupEdit)
                            flashError("Complete group updation process first");
                        }}
                      >
                        <p className="text-lg font-semibold">
                          {user.user.username}{" "}
                          {user.user._id === currUser?._id ? "(You)" : ""}
                        </p>
                        <div className="flex justify-between pr-4 w-full">
                          <p
                            id={`${user.user._id}-toSetTyping`}
                            className="text-sm text-gray-700 mr-2 max-[444px]:w-20 w-44 lg:w-20 h-5 overflow-auto scrollbar-hide"
                          >
                            {
                              user.conv?.messages[
                                user.conv?.messages.length - 1
                              ]?.msg
                            }
                          </p>
                          {user.user._id !== currUser?._id ? (
                            <p className="text-xs text-gray-700">
                              {user.conv?.updatedAt &&
                                formatDateToTime(user.conv?.updatedAt)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {user.user._id === currUser?._id ? (
                        <div
                          onClick={() => closeChatWindow()}
                          className="hover:text-red-500 mr-3 hover:scale-105 font-bold cursor-pointer  flex justify-center w-fit items-center "
                        >
                          <img
                            src="https://png.pngtree.com/png-clipart/20230804/original/pngtree-red-cross-icon-close-button-x-vector-picture-image_9578889.png"
                            alt=""
                            className="w-[95px]"
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                }
              })}
            </>
          )}
          <div className="sticky cursor-pointer border-black rounded-xl flex justify-center items-center !w-[60px] h-[60px] bottom-16 left-[15rem] max-[1200px]:left-[12rem] max-[1066px]:left-[11rem] max-[1026px]:left-[85%]">
            {userLoading ? (
              <></>
            ) : (
              <>
                {openUserSelect ? (
                  <>
                    {" "}
                    <div>
                      <div className="flex flex-col p-2 py-1 mr-5 rounded-full bg-black hover:!bg-blue-500 mb-1">
                        <p
                          onClick={createGroup}
                          className="font-bold text-white"
                        >
                          Create
                        </p>
                      </div>

                      <div className="flex flex-col p-2 py-1 mr-5 rounded-full bg-red-500 hover:!bg-blue-500">
                        <p
                          onClick={toggleSelectGroupUsers}
                          className="font-bold text-white "
                        >
                          Cancel
                        </p>
                      </div>
                    </div>
                  </>
                ) : allowGroupEdit ? (
                  <></>
                ) : (
                  <>
                    {" "}
                    <>
                      <lord-icon
                        onClick={toggleSelectGroupUsers}
                        style={{ width: "55px", height: "70px" }}
                        src="https://cdn.lordicon.com/fbmgfhau.json"
                        trigger="hover"
                      ></lord-icon>
                    </>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {/* right section */}
        <div
          id="rightSection"
          className=" mt-3 max-[1026px]:!mt-2 max-[1026px]:absolute min-[1026px]:!mt-7 max-[1026px]:h-[83%] w-[90%] min-[1026px]:w-3/4 h-[90%] bg-white rounded-xl shadow-xl border"
        >
          {loading ? (
            <>
              <Loading />
            </>
          ) : isGrpChatContntAvl ? (
            <>
              <GroupChattingArea
                openChat={openChat}
                setGroupChattingContentID={setGroupChattingContentID}
                groupChattingContentID={groupChattingContentID}
                closeChat={closeChat}
                enlarge={enlarge}
                closeChatWindow={closeChatWindow}
                setIsGrpChatContntAvl={setIsGrpChatContntAvl}
                setShowGrpInfo={setShowGrpInfo}
                setGroupEdit={setGroupEdit}
                setNewGroupDetails={setNewGroupDetails}
              />
            </>
          ) : allowGroupEdit ? (
            <>
              <GroupDetails
                newGroupDetails={newGroupDetails}
                setGroupEdit={setGroupEdit}
                setNewGroupDetails={setNewGroupDetails}
                closeChat={closeChat}
                enlarge={enlarge}
                allUsers={allUsers}
                setLoading={setLoading}
                setIsGrpChatContntAvl={setIsGrpChatContntAvl}
                setGroupChattingContentID={setGroupChattingContentID}
                setShowGrpInfo={setShowGrpInfo}
              />
            </>
          ) : showGrpInfo ? (
            <>
              <GroupInfo
                newGroupDetails={newGroupDetails}
                setNewGroupDetails={setNewGroupDetails}
                closeChat={closeChat}
                setShowGrpInfo={setShowGrpInfo}
                enlarge={enlarge}
                setLoading={setLoading}
                setIsGrpChatContntAvl={setIsGrpChatContntAvl}
                setGroupEdit={setGroupEdit}
              />
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
              closeChatWindow={closeChatWindow}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default ChatWindow;
