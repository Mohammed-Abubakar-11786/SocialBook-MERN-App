/* eslint-disable react/prop-types */
import { memo, useEffect, useRef, useState } from "react";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";
import { useSelector, useDispatch } from "react-redux";
import "../css/customScrolBar.css";
import "../App.css";
import axios from "axios";
import { logoutUser } from "../redux/userSlice";

// eslint-disable-next-line react/prop-types
function GroupDetails({
  newGroupDetails,
  setGroupEdit,
  closeChat,
  enlarge,
  allUsers,
  setLoading,
  setGroupChattingContentID,
  setIsGrpChatContntAvl,
  setNewGroupDetails,
  setShowGrpInfo,
}) {
  const selectedUserEndRef = useRef();
  const otherUserEndRef = useRef();
  const startOfPageRef = useRef();

  // console.log(otherUsers);

  let currUser = useSelector((state) => state.currUser);
  const dispatch = useDispatch();

  const [scrollSelected, setScrollSelected] = useState(false);
  const [scrollUnSelected, setScrollUnSelected] = useState(false);
  let [selectedUsers, setSelectedUsers] = useState(newGroupDetails.grpUsers);
  let [groupInfo, setGrpInfo] = useState({
    grpName: newGroupDetails.grpName ? newGroupDetails.grpName : "",
    grpImg: "",
    grpDescription: newGroupDetails?.grpDescription
      ? newGroupDetails?.grpDescription
      : "",
  });
  let [groupInfoError, setGroupInfoError] = useState({
    grpName: false,
    grpImg: false,
    grpDescription: false,
  });
  const [openDelConfirmation, setOpenDelConfirmation] = useState(false);

  let otherusers = [];
  allUsers.forEach((User) => {
    let found = false;
    newGroupDetails.grpUsers.forEach((user) => {
      if (User._id === user._id) {
        found = true;
      }
    });
    if (!found) otherusers.push(User);
  });

  let [otherUsers, setOtherUsers] = useState(otherusers);

  useEffect(() => {
    if (scrollSelected && selectedUsers.length > 0) {
      selectedUserEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setScrollSelected(false);
    }
  }, [scrollSelected]); // Include hasMounted in the dependency array

  useEffect(() => {
    if (scrollUnSelected && otherUsers.length > 0) {
      otherUserEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setScrollUnSelected(false);
    }
  }, [scrollUnSelected]); // Include hasMounted in the dependency array

  let submitDetails = async () => {
    if (groupInfo.grpName === "") {
      setGroupInfoError((prev) => ({
        ...prev,
        grpName: true,
      }));
      return;
    }

    const formData = new FormData();
    formData.append("groupName", groupInfo.grpName);
    formData.append("groupDescription", groupInfo.grpDescription);
    formData.append("groupImg", groupInfo.grpImg);
    formData.append("grpId", newGroupDetails._id);
    formData.append("selectedUsers", JSON.stringify(selectedUsers));

    let url = `${import.meta.env.VITE_API_BACKEND_URL}saveNewGroupDetails/${
      currUser._id
    }`;

    setLoading(true);
    let res = await axios.post(url, formData, {
      withCredentials: true,
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-Type": "multipart/form-data",
      },
    });

    setLoading(false);
    if (res.data.success) {
      flashSuccess("Group Details Updated");
      setNewGroupDetails(res.data.grp);
      setGroupChattingContentID(res.data.grp._id);
      setGroupEdit(false);
      setShowGrpInfo(true);

      // closeChat();
    } else if (res.data.notLogin) {
      flashError("Login First to Create a Group");
      dispatch(logoutUser);
    } else if (res.data.error) {
      flashError("Error" + res.data.msg);
    }
  };

  let deleteGroup = async () => {
    let url = `${import.meta.env.VITE_API_BACKEND_URL}deleteGroup/${
      newGroupDetails._id
    }`;

    setLoading(true);
    let res = await axios.get(url, {
      withCredentials: true,
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    setLoading(false);

    if (res.data.success) {
      flashSuccess("Group Deleted");
      setGroupEdit(false);
      setShowGrpInfo(false);
      setIsGrpChatContntAvl(false);
      closeChat();
    } else if (res.data.notLogin) {
      flashError("login first to delete the group");
      dispatch(logoutUser);
    } else if (res.data.error) {
      // flashError(res.data.msg);
      flashError("Intenal Server Error");
    }
  };

  let handelChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "grpImg" && files.length > 0) {
      const file = files[0];
      const fileSizeInMb = file.size / (1024 * 1024);
      if (fileSizeInMb > 3) {
        flashError("Image Size Must be less than 3 Mb");
      } else {
        setGrpInfo((p) => ({
          ...p,
          grpImg: file,
        }));
      }
    } else {
      setGrpInfo((p) => ({
        ...p,
        [name]: value,
      }));
    }

    if (name === "grpName") {
      if (value.length > 0) {
        setGroupInfoError((prev) => ({
          ...prev,
          [name]: false,
        }));
      }
    }
  };

  let toggleUser = (User) => {
    let exist = selectedUsers.some((user) => user._id === User._id);
    if (exist) {
      setSelectedUsers((prev) => prev.filter((user) => user._id != User._id));
      setOtherUsers((prev) => [...prev, User]);
      setScrollUnSelected(true);
    } else {
      setOtherUsers((prev) => prev.filter((user) => user._id != User._id));
      setSelectedUsers((prev) => [...prev, User]);
      setScrollSelected(true);
    }
  };

  return (
    <>
      {" "}
      {/* {pleaseWait ? (
        <>
          <Loading />
        </>
      ) : ( */}
      <>
        {openDelConfirmation ? (
          <>
            <div className="w-screen h-screen absolute top-0 left-0 bg-slate-300 opacity-45 flex justify-center items-center z-40"></div>
            <div
              onClick={() => setOpenDelConfirmation(false)}
              className="absolute w-screen h-screen top-0 left-0 bg-transparent z-50 flex justify-center items-center"
            >
              <div
                className=" bg-white p-3 rounded-md shadow-lg w-[350px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* del msg */}
                <div className="font-bold mb-3 text-lg cursor-pointer">
                  {newGroupDetails.grpName ? (
                    <span>
                      Do you really want to delete a group <br />{" "}
                      <span className="text-red-500">
                        {newGroupDetails.grpName}!
                      </span>
                    </span>
                  ) : (
                    <span>Do you really want to delete a group</span>
                  )}
                </div>
                {/* btns */}
                <div className="flex justify-around mx-auto">
                  <button
                    className="bg-green-500 hover:bg-blue-500 font-bold p-1 rounded-md text-white"
                    onClick={() => setOpenDelConfirmation(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-red-500 hover:bg-blue-500 font-bold p-1 rounded-md text-white"
                    onClick={() => {
                      deleteGroup();
                      setOpenDelConfirmation(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
        <div className="flex-col h-full">
          <div
            ref={startOfPageRef}
            className="h-[10%] flex justify-center items-center"
          >
            <h1 className="font-bold text-center text-[1.2rem] md:text-lg ">
              Complete Your Group Creation
            </h1>
          </div>
          {/* chat fetching details */}
          <div className="h-[80%] flex-col items-center">
            <div className="p-3 pt-1 pb-0 rounded-md mx-auto w-full h-[95%] md:w-[85%] custom-scrollbar-css overflow-auto">
              {/* grpName and grp img */}
              <div className="flex max-md:flex-col md:flex md:justify-around">
                {/* grpName */}
                <div className="flex flex-col w-fit mb-2">
                  <label htmlFor="grpName" className="font-semibold form-label">
                    Enter Your Group Name{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="grpName"
                    type="text"
                    name="grpName"
                    value={groupInfo.grpName}
                    onChange={(e) => handelChange(e)}
                    className=" form-control w-full"
                  />
                  <div
                    className={`${
                      groupInfoError.grpName ? "block" : "hidden"
                    } text-xs text-red-400 font-bold`}
                  >
                    Group Name Required
                  </div>
                </div>
                {/* grpImg */}
                <div className="flex flex-col w-fit mb-2">
                  <label htmlFor="grpImg" className="font-semibold form-label">
                    Select Your Group Image
                  </label>
                  <input
                    id="grpImg"
                    type="file"
                    name="grpImg"
                    accept="image/*"
                    onChange={(e) => handelChange(e)}
                    className="form-control w-full"
                  />
                </div>
              </div>
              {/* grpDescription */}
              <div className="flex flex-col w-full mb-2 mt-3">
                <label
                  htmlFor="grpDescription"
                  className="font-semibold form-label"
                >
                  Enter Your Group Description
                </label>
                <textarea
                  id="grpDescription"
                  name="grpDescription"
                  value={groupInfo.grpDescription}
                  onChange={(e) => handelChange(e)}
                  className=" form-control w-full"
                />
              </div>

              <div className="flex max-md:flex-col justify-around">
                {/* selected allUsers */}
                <div className="flex flex-col w-full mb-2 mt-3">
                  <h1 className="font-semibold form-label">
                    Your Group Members
                  </h1>
                  <div className="flex flex-col h-[11rem] scrollbar-hide overflow-auto scroll-p-2">
                    {selectedUsers.map((user, index) => {
                      // console.log(user._id);
                      const isLastUser = index === selectedUsers.length - 1;
                      const checkboxRef = useRef();
                      return (
                        <div
                          ref={isLastUser ? selectedUserEndRef : null}
                          key={user._id}
                          onClick={() => {
                            if (
                              checkboxRef.current &&
                              user._id !== currUser?._id
                            ) {
                              checkboxRef.current.checked =
                                !checkboxRef.current.checked;
                              if (!checkboxRef.current.checked) {
                                toggleUser(user);
                              }
                            } else {
                              flashError("Group cannot be made without you.");
                            }
                          }}
                          className="chat cursor-pointer flex justify-start space-x-2 items-center hover:bg-green-200 rounded-t-xl w-full h-[4rem]"
                        >
                          {currUser && user._id === currUser._id ? (
                            <>
                              <input
                                ref={checkboxRef}
                                readOnly={true}
                                className={` ml-3 newGrpUser`}
                                type="checkbox"
                                checked={true} // Only evaluates if currUser exists
                                name={`newGrpUser-${user._id}`}
                                id={`newGrpUser-${user._id}`}
                                onClick={(e) => {
                                  if (user._id === currUser?._id) {
                                    e.preventDefault(); // Prevent toggling the checkbox
                                    flashError(
                                      "Group cannot be made without you."
                                    );
                                  }
                                }}
                              />
                            </>
                          ) : (
                            <>
                              {" "}
                              <input
                                ref={checkboxRef}
                                className={`ml-3 newGrpUser`}
                                type="checkbox"
                                defaultChecked={true}
                                name={`newGrpUser-${user._id}`}
                                id={`newGrpUser-${user._id}`}
                                onClick={() => {
                                  checkboxRef.current.checked =
                                    !checkboxRef.current.checked;
                                }}
                              />
                            </>
                          )}

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
                {/* other then selected users */}
                <div className="flex flex-col w-full mb-2 mt-3">
                  <h1 className="font-semibold form-label">Other Users</h1>
                  <div className="flex flex-col h-[11rem] scrollbar-hide overflow-auto scroll-p-2">
                    {otherUsers.map((user, index) => {
                      const isLastUser = index === otherUsers.length - 1;

                      const checkboxRef = useRef();
                      return (
                        <div
                          ref={isLastUser ? otherUserEndRef : null}
                          key={user._id}
                          onClick={() => {
                            if (checkboxRef.current) {
                              checkboxRef.current.checked =
                                !checkboxRef.current.checked;

                              if (checkboxRef.current.checked) {
                                toggleUser(user);
                              }
                            }
                          }}
                          className="chat cursor-pointer flex justify-start space-x-2 items-center hover:bg-green-200 rounded-t-xl w-full h-[4rem]"
                        >
                          <input
                            ref={checkboxRef}
                            className={`ml-3 newGrpUser`}
                            type="checkbox"
                            defaultChecked={false}
                            name={`newGrpUser-${user._id}`}
                            id={`newGrpUser-${user._id}`}
                            onClick={() => {
                              checkboxRef.current.checked =
                                !checkboxRef.current.checked;
                            }}
                          />

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
              </div>
            </div>
          </div>
          {/* below save, discard and delete grp btn */}
          <div className="w-full flex justify-evenly items-center h-[10%] top-0 shadow-lg rounded-b-md">
            <div
              onClick={submitDetails}
              className="hover:bg-blue-500 cursor-pointer p-2 py-1 rounded-md bg-green-500 font-bold text-white"
            >
              Save
            </div>
            <div
              onClick={() => {
                if (!newGroupDetails.grpCreationPending) {
                  setGroupEdit(false);
                  setGroupChattingContentID(newGroupDetails._id);
                  setIsGrpChatContntAvl(true);
                } else {
                  setGroupEdit(false);
                  closeChat();
                }
                // closeChat();
              }}
              className="hover:bg-blue-500 hover:text-white cursor-pointer p-2 py-1 rounded-md bg- border-1 border-black font-bold text-red-500"
            >
              Discard
            </div>

            <div
              onClick={() => setOpenDelConfirmation(true)}
              className="hover:bg-blue-500 cursor-pointer p-2 py-1 rounded-md bg-red-500 font-bold text-white"
            >
              Delete Group
            </div>
          </div>
        </div>
      </>
      {/* )} */}
    </>
  );
}

export default memo(GroupDetails);
