import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Post from "../Post";
import axios from "axios";
import { flashError, flashSuccess } from "../../helpers/flashMsgProvider";
import { setUsersData } from "../../redux/userSlice";
import Story from "../Story";

function AllStories() {
  const [loading, setLoading] = useState(false);

  let usersData = useSelector((state) => state.usersData);
  const dispatch = useDispatch();

  useEffect(() => {
    updateUsersData();
  }, [usersData]);

  let delStory = async (storyID) => {
    let url = `${import.meta.env.VITE_API_BACKEND_URL}delStory/${storyID}`;
    setLoading(true);
    let res = await axios(url, { withCredentials: true });
    setLoading(false);
    if (res.data.success) {
      flashSuccess("Story Deleted Successfully");
      updateUsersData();
    } else if (res.data.error) flashError(res.data.msg);
  };

  let updateUsersData = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
    let res = await axios(url, { withCredentials: true });
    // console.log(res);
    dispatch(setUsersData(res.data));
  };
  return (
    <>
      {loading && (
        <div className="absolute top-0 flex justify-center items-center left-0 w-[100%] h-[100vh] bg-black opacity-40">
          <p className="text-white font-bold text-2xl text-center inset-0">
            Please Wait...
          </p>
        </div>
      )}

      <div className=" h-full w-full overflow-auto">
        {" "}
        {usersData.allStories?.map((story, index) => (
          <div
            key={story._id}
            className="h-[150px] flex items-center space-x-10 mb-2"
          >
            <Story key={index} index={index} story={story} />

            <button
              className="bg-red-800 text-white p-2 "
              onClick={() => delStory(story._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default AllStories;
