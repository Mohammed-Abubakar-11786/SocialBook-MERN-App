import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { flashError, flashSuccess } from "../../helpers/flashMsgProvider";
import { setUsersData } from "../../redux/userSlice";

function AllUsers() {
  let usersData = useSelector((state) => state.usersData);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const delUser = async (userID) => {
    let url = `${import.meta.env.VITE_API_BACKEND_URL}delUser/${userID}`;
    console.log(url);
    let res = await axios(url, { withCredentials: true });
    console.log(res);
    if (res.data.success) {
      flashSuccess("user Deleted Successfully");
      updateUsersData();
    } else if (res.data.error) flashError(res.data.msg);
  };

  let updateUsersData = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
    let res = await axios({ url });
    // console.log(res);
    dispatch(setUsersData(res.data));
  };

  useEffect(() => {
    updateUsersData();
  }, [usersData]);

  return (
    <>
      {loading && (
        <div className="absolute top-0 flex justify-center items-center left-0 w-[100%] h-[100vh] bg-black opacity-40">
          <p className="text-white font-bold text-2xl text-center inset-0">
            Please Wait...
          </p>
        </div>
      )}
      <div>
        {usersData?.allUsers?.map((user) => {
          return (
            <div
              key={user._id}
              className="chat cursor-pointer flex justify-start space-x-2 items-center hover:bg-green-200 rounded-t-xl shadow-xl w-full h-[14%]"
            >
              <img
                src={user?.image?.url}
                className="rounded-3xl w-12 m-2 shadow-xl cursor-pointer"
                alt=""
                onClick={() => enlarge(user.image.url)}
              />
              <div
                className="userDetails -space-y-1 h-full w-full flex flex-col justify-center items-start"
                onClick={() => openChatArea(user._id)}
              >
                <p className="text-lg font-semibold">{user.username}</p>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 mr-7">Assalamu Alikum</p>
                  <p className="text-sm text-gray-700">8:29 pm</p>
                </div>
              </div>
              <button
                className="bg-red-800 p-4 text-white z-[99]"
                onClick={() => delUser(user._id)}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default AllUsers;
