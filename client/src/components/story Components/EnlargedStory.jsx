/* eslint-disable react/prop-types */
import "../story Components/storycss.css";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LikeBtn from "./LikeBtn";
import axios from "axios";
import { logoutUser } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { flashError } from "../../helpers/flashMsgProvider";
import { io } from "socket.io-client";

function EnlargedStory({ story, setShow }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currUser = useSelector((state) => state.currUser);

  const [likes, setLikes] = useState(story.likes.length);
  const [disLikes, setDisLikes] = useState(story.disLikes.length);
  const [isLiked, setIsLiked] = useState();
  const [isDisLiked, setIsDisLiked] = useState();
  const [shouldPlay, setShouldPlay] = useState(false);

  const socketRef = useRef();

  //socket connections
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(
        `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}user_namespace`
      );
      socketRef.current.connect();

      socketRef.current.on("setStoryLiked", (data) => {
        if (data.storyID === story._id) {
          setLikes(data.likes);
          setDisLikes(data.disLikes);
        }
      });

      socketRef.current.on("setStorydisLiked", (data) => {
        if (data.storyID === story._id) {
          setLikes(data.likes);
          setDisLikes(data.disLikes);
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
    if (story.likes.some((stry) => stry === currUser?._id)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }

    if (story.disLikes.some((stry) => stry === currUser?._id)) {
      setIsDisLiked(true);
    } else {
      setIsDisLiked(false);
    }
  }, [story, currUser]);

  const handelLikeBtn = async () => {
    setShouldPlay(true);

    if (isDisLiked) {
      setDisLikes((p) => p - 1);
      setIsDisLiked(false);

      setLikes((p) => p + 1);
      setIsLiked(true);

      if (!currUser) flashError("login first to like");
      else {
        let url = `${import.meta.env.VITE_API_BACKEND_URL}updateLike`;
        let formData = new FormData();
        formData.append("userID", currUser._id);
        formData.append("storyID", story._id);
        formData.append("like", "true");

        let res = await axios.post(url, formData, {
          withCredentials: true,
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        if (res.data.notLogin) {
          dispatch(logoutUser());
          navigate("/login", {
            state: { forceLogin: true, msg: "Login First" },
          });
        } else if (res.data.success) {
          socketRef.current.emit("storyLiked", {
            storyID: story._id,
            likes: likes + 1,
            disLikes: disLikes - 1,
          });

          console.log("success : liked");
        } else if (res.data.error) flashError(`Internal Server error ☹️`); //: ${res.data.msg} for err msg
      }
    } else if (isLiked) {
      setLikes((p) => p - 1);
      setIsLiked(false);

      if (!currUser) flashError("login first to unlike");
      else {
        let url = `${import.meta.env.VITE_API_BACKEND_URL}updateLike`;
        let formData = new FormData();
        formData.append("userID", currUser._id);
        formData.append("storyID", story._id);
        formData.append("like", "false");

        let res = await axios.post(url, formData, {
          withCredentials: true,
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        if (res.data.notLogin) {
          dispatch(logoutUser());
          navigate("/login", {
            state: { forceLogin: true, msg: "Login First" },
          });
        } else if (res.data.success) {
          socketRef.current.emit("storydisLiked", {
            storyID: story._id,
            likes: likes - 1,
            disLikes: disLikes,
          });

          // console.log("success : unliked");
        } else if (res.data.error) flashError(`Internal Server error ☹️`); //: ${res.data.msg} for err msg
      }
    } else {
      setLikes((p) => p + 1);
      setIsLiked(true);
      if (!currUser) flashError("login first to like");
      else {
        let url = `${import.meta.env.VITE_API_BACKEND_URL}updateLike`;
        let formData = new FormData();
        formData.append("userID", currUser._id);
        formData.append("storyID", story._id);
        formData.append("like", "true");

        let res = await axios.post(url, formData, {
          withCredentials: true,
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        if (res.data.notLogin) {
          dispatch(logoutUser());
          navigate("/login", {
            state: { forceLogin: true, msg: "Login First" },
          });
        } else if (res.data.success) {
          socketRef.current.emit("storyLiked", {
            storyID: story._id,
            likes: likes + 1,
            disLikes: disLikes,
          });

          console.log("success : liked");
        } else if (res.data.error) flashError(`Internal Server error ☹️`); //: ${res.data.msg} for err msg
      }
    }

    setTimeout(() => setShouldPlay(false), 3000);
  };

  const handelDisLikeBtn = async () => {
    // if(isLiked){
    //   setLikes(p => p- 1);
    //   setIsLiked(false);
    // }
    if (isDisLiked) {
      setDisLikes((p) => p - 1);
      setIsDisLiked(false);
      if (!currUser) flashError("login first to like");
      else {
        let url = `${import.meta.env.VITE_API_BACKEND_URL}updateLike`;
        let formData = new FormData();
        formData.append("userID", currUser._id);
        formData.append("storyID", story._id);
        formData.append("like", "disLike");

        let res = await axios.post(url, formData, {
          withCredentials: true,
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        if (res.data.notLogin) {
          dispatch(logoutUser());
          navigate("/login", {
            state: { forceLogin: true, msg: "Login First" },
          });
        } else if (res.data.success) {
          socketRef.current.emit("storydisLiked", {
            storyID: story._id,
            likes: likes,
            disLikes: disLikes - 1,
          });

          console.log("success : liked");
        } else if (res.data.error) flashError(`Internal Server error ☹️`); //: ${res.data.msg} for err msg
      }
    } else if (isLiked) {
      setLikes((p) => p - 1);
      setDisLikes((p) => p + 1);
      setIsLiked(false);
      setIsDisLiked(true);

      if (!currUser) flashError("login first to unlike");
      else {
        let url = `${import.meta.env.VITE_API_BACKEND_URL}updateLike`;
        let formData = new FormData();
        formData.append("userID", currUser._id);
        formData.append("storyID", story._id);
        formData.append("like", "disLike");

        let res = await axios.post(url, formData, {
          withCredentials: true,
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        if (res.data.notLogin) {
          dispatch(logoutUser());
          navigate("/login", {
            state: { forceLogin: true, msg: "Login First" },
          });
        } else if (res.data.success) {
          socketRef.current.emit("storydisLiked", {
            storyID: story._id,
            likes: likes - 1,
            disLikes: disLikes + 1,
          });

          // console.log("success : unliked");
        } else if (res.data.error) flashError(`Internal Server error ☹️`); //: ${res.data.msg} for err msg
      }
    }
    //now increase dislike
    else {
      setDisLikes((p) => p + 1);
      setIsDisLiked(true);
      if (!currUser) flashError("login first to like");
      else {
        let url = `${import.meta.env.VITE_API_BACKEND_URL}updateLike`;
        let formData = new FormData();
        formData.append("userID", currUser._id);
        formData.append("storyID", story._id);
        formData.append("like", "disLike");

        let res = await axios.post(url, formData, {
          withCredentials: true,
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        if (res.data.notLogin) {
          dispatch(logoutUser());
          navigate("/login", {
            state: { forceLogin: true, msg: "Login First" },
          });
        } else if (res.data.success) {
          socketRef.current.emit("storydisLiked", {
            storyID: story._id,
            likes: likes,
            disLikes: disLikes + 1,
          });

          console.log("success : liked");
        } else if (res.data.error) flashError(`Internal Server error ☹️`); //: ${res.data.msg} for err msg
      }
    }
  };

  return (
    <div
      onDoubleClick={handelLikeBtn}
      id={story._id}
      key={story._id}
      onClick={(e) => e.stopPropagation()}
      className="w-full h-full bg-white flex-shrink-0 flex flex-col snap-start relative z-[9999] min-[443px]:w-[65%] md:w-[45%] lg:w-[35%] mx-auto"
    >
      {shouldPlay ? (
        <>
          <LikeBtn />
        </>
      ) : (
        <></>
      )}

      <i
        onClick={() => setShow(false)}
        className="fa-solid fa-arrow-left hidden absolute z-[99999] text-white shadow-xl top-2 left-2 max-[443px]:block max-md:text-xl text-3xl cursor-pointer"
      ></i>
      <video autoPlay muted loop className="w-full h-full object-cover">
        <source src={story?.video.url} type={story?.video.fileType} />
        Your browser does not support the video tag.
      </video>
      {/* like button */}
      <div
        onClick={handelLikeBtn}
        className="absolute cursor-pointer right-3 bottom-[30%] flex flex-col items-center text-white"
      >
        {isLiked ? (
          <>
            <i className="fa-solid fa-thumbs-up like-icon text-4xl !text-blue-500 mr-1"></i>
            {/* <lord-icon3
              style={{ width: "50px", height: "50px" }}
              src="https://cdn.lordicon.com/ohfmmfhn.json"
              trigger="hover"
              colors="primary: #0095FF" // Change color to blue on like
            /> */}
          </>
        ) : (
          <>
            <i className="fa-solid fa-thumbs-up like-icon text-4xl !text-gray-600 mr-1"></i>
            {/* <lord-icon
              style={{ width: "50px", height: "50px" }}
              src="https://cdn.lordicon.com/ohfmmfhn.json"
              trigger="hover"
              colors="primary: #36454F" // Default color
            /> */}
          </>
        )}
        <div className="font-bold text-sm">{likes}</div>
      </div>
      {/* unlike Btn */}
      <div
        onClick={handelDisLikeBtn}
        className="absolute cursor-pointer right-3 bottom-[20%] flex flex-col items-center text-white"
      >
        {isDisLiked ? (
          <>
            <i className="fa-solid fa-thumbs-down text-4xl text-blue-600 mr-1"></i>
            {/* <lord-icon3
              style={{ width: "50px", height: "50px" }}
              src="https://cdn.lordicon.com/ohfmmfhn.json"
              trigger="hover"
              colors="primary: #0095FF" // Change color to blue on like
            /> */}
          </>
        ) : (
          <>
            <i className="fa-solid fa-thumbs-down text-4xl text-gray-600 mr-1"></i>

            {/* <lord-icon
              style={{ width: "50px", height: "50px" }}
              src="https://cdn.lordicon.com/ohfmmfhn.json"
              trigger="hover"
              colors="primary: #36454F" // Default color
            /> */}
          </>
        )}
        <div className="font-bold text-sm">{disLikes}</div>
      </div>

      <div className="w-full flex items-center space-x-3 !bg-transparent justify-between p-1 px-2 h-[8%]">
        <div className="flex flex-col items-start">
          <p className="">{story?.title}</p>
          <p className="font-bold ">{story.owner.username}</p>
        </div>
        <img
          src={story.owner.image.url}
          alt=""
          className="w-[45px] h-[50px] rounded-full "
        />
      </div>
    </div>
  );
}

export default EnlargedStory;
