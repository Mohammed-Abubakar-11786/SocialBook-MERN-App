/* eslint-disable react/prop-types */
// import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import Story from "../Story";
import { useEffect, useState } from "react";
import axios from "axios";
import { setUsersData } from "../../redux/userSlice";
import { io } from "socket.io-client";
import { flashError, flashSuccess } from "../../helpers/flashMsgProvider";

const StorySection = () => {
  let location = useLocation();
  let navigate = useNavigate();

  useEffect(() => {
    if (location.state?.printSuccess) {
      flashSuccess(location.state.msg);
      // Clear the state after using it
      if (location.state.data) {
        setAllStories([location.state.data, ...allStories]);
        update();
      }
      navigate(location.pathname, {
        replace: true,
        state: {
          ...location.state,
          printSuccess: false,
          msg: "",
        },
      });
    }
  }, [location, navigate]);

  const dispatch = useDispatch();
  const currUser = useSelector((state) => state.currUser);
  const [allStories, setAllStories] = useState(
    useSelector((state) => state.usersData?.allStories)
  );

  // let allStories = useSelector((state) => state.usersData.allStories);
  let socket = io(
    `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}user_namespace`
  );

  useEffect(() => {
    // Remove existing listeners before adding new ones
    socket.off("addNewStory");

    socket.on("addNewStory", async (data) => {
      setAllStories([data, ...allStories]);

      const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
      let res1 = await axios({ url });
      // console.log(res);
      dispatch(setUsersData(res1.data));
    });

    return () => {
      // Clean up the event listeners on unmount
      socket.off("addNewStory");
    };
  }, [socket, allStories, dispatch]);

  useEffect(() => {
    update();
  }, []);

  let update = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
    let res = await axios(url, { withCredentials: true });
    // console.log(res);
    setAllStories(res.data.allStories);
    dispatch(setUsersData(res.data));
  };
  return (
    <div className="scrollbar-hide w-full flex justify-start items-center h-full bg-white rounded-lg p-2 pl-3 overflow-x-auto">
      <Link
        // onClick={(e) => {
        //   e.preventDefault();
        //   flashError("This feature is temporarily not available");
        // }}
        to="newStory/"
        className="h-full"
      >
        <div
          className="CreatePost flex flex-col items-center justify-center min-w-[100px] h-full bg-cover bg-center rounded-lg mr-2 bg-gradient-to-b from-transparent to-black/50 "
          style={{
            backgroundImage: `linear-gradient(transparent, rgb(0, 0, 0, 0.5)), url('https://image.winudf.com/v2/image/Y29tLmRlaGF0aW11c2ljMS5BQUFfc2NyZWVuXzBfMTUzOTg3NzgxMV8wMDA/screen-0.webp?fakeurl=1&type=.webp')`,
          }}
        >
          <i className="fa-solid fa-circle-plus text-white text-4xl hover:scale-110 transition-transform duration-300"></i>

          <p className="text-white font-semibold text-xs mt-2 cursor-pointer">
            Post Story
          </p>
        </div>
      </Link>
      <div className="flex h-full">
        {allStories?.map((story, index) => (
          <Story key={index} index={index} story={story} />
        ))}
      </div>
    </div>
  );
};

export default StorySection;
