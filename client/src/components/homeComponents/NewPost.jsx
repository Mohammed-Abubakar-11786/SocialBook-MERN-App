/* eslint-disable react/prop-types */
// import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { flashError } from "../../helpers/flashMsgProvider";

const NewPost = () => {
  const navigate = useNavigate();
  let currUser = useSelector((state) => state.currUser);

  const [postDesc, setPostDesc] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (currUser) {
      navigate("/newPostForm", { state: { msg: postDesc } });
    } else {
      flashError("Login First");
      navigate("/login");
    }
  };

  return (
    <div className="new-post bg-white rounded-lg p-2">
      {currUser ? (
        <div>
          <div className="newUserInfo flex items-center  text-sm p-2">
            <img
              src={currUser.image.url}
              alt=""
              className="w-[50px] h-full rounded-full mr-2 relative bottom-[0.2rem] hover:cursor-pointer"
            />
            <div className="newInfo -space-y-1">
              <h6 className="mb-1 hover:cursor-pointer font-semibold">
                {currUser.username}
              </h6>
              <p className="opacity-70">
                {currUser.isPublic ? "Public" : "Private"}
              </p>
            </div>
            <i className="fa-solid fa-ellipsis-vertical text-md ml-auto relative"></i>
          </div>
          <center>
            <div className="postDetails">
              <form onSubmit={handleFormSubmit}>
                <textarea
                  name="description"
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  placeholder={`What's On Your Mind, ${currUser.username}?`}
                  className="mt-2 ml-4 h-16 w-[90%] border-none resize-none outline-none scrollbar-hide "
                ></textarea>
                <hr className="newPostHr my-0 mx-auto w-[80%]" />
                <div className="newPostIcons flex items-center mt-2 ml-3 md:ml-8 mb-1">
                  <div className="live newPostIcon mr-6 hover:cursor-pointer justify-center items-center max-[415px]:hidden sm:flex sm:flex-col">
                    <i className="fa-solid fa-video text-red-600 mr-2"></i>
                    <p className="inline">Live Video</p>
                  </div>
                  <div className="camera newPostIcon mr-6 hover:cursor-pointer">
                    <button
                      type="submit"
                      className="text-black border-none bg-white flex flex-col justify-center items-center sm:block"
                    >
                      <i className="fa-solid fa-camera text-green-600 mr-2"></i>
                      <p className="inline">Photo/Video</p>
                    </button>
                  </div>
                  <div className="activity newPostIcon mr-6 hover:cursor-pointer max-[332px]:hidden">
                    <i className="fa-regular fa-face-smile text-yellow-600 mr-2"></i>
                    <p className="inline">Feeling/Activity</p>
                  </div>
                  <div className="postSendBtn newPostIcon ml-auto mr-4 hover:scale-110 transition-transform">
                    <button
                      type="submit"
                      className="text-black border-none bg-white"
                    >
                      <i className="fa-solid fa-paper-plane mr-2"></i>
                      <p>Send</p>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </center>
        </div>
      ) : (
        <div>
          <div className="newUserInfo flex items-center text-sm p-2">
            <img
              src="https://img.freepik.com/premium-vector/man-face-design-logo-premium_96853-366.jpg"
              alt=""
              className="w-[7.5%] min-w-[50px] h-full rounded-full mr-2 relative bottom-[0.2rem] hover:cursor-pointer"
            />
            <div className="newInfo ">
              <h6 className="mb-1 hover:cursor-pointer">UserName</h6>
              <p className="opacity-70">Public / Private</p>
            </div>
          </div>
          <center>
            <div className="postDetails">
              <form onSubmit={handleFormSubmit}>
                <textarea
                  name="description"
                  placeholder="What's On Your Mind, UserName?"
                  className="mt-2 ml-4 h-16 w-[90%] border-none resize-none outline-none"
                ></textarea>
                <hr className="newPostHr my-0 mx-auto w-[80%]" />
                <div className="newPostIcons flex items-center mt-2 ml-3 md:ml-8 mb-1">
                  <div className="live newPostIcon mr-6 hover:cursor-pointer flex flex-col justify-center items-center sm:block">
                    <i className="fa-solid fa-video text-red-600 mr-2"></i>
                    <p className="inline">Live Video</p>
                  </div>
                  <div className="camera newPostIcon mr-6 hover:cursor-pointer">
                    <button
                      type="submit"
                      className="text-black border-none bg-white flex flex-col justify-center items-center sm:block"
                    >
                      <i className="fa-solid fa-camera text-green-600 mr-2"></i>
                      <p className="inline">Photo/Video</p>
                    </button>
                  </div>
                  <div className="activity newPostIcon mr-6 hover:cursor-pointer hidden min-[768px]:block">
                    <i className="fa-regular fa-face-smile text-yellow-600 mr-2"></i>
                    <p className="inline">Feeling/Activity</p>
                  </div>
                  <div className="postSendBtn  mr-4 newPostIcon ml-auto hover:scale-110 transition-transform">
                    <button
                      type="submit"
                      className="text-black border-none bg-white"
                    >
                      <i className="fa-solid fa-paper-plane mr-2"></i>
                      <p>Send</p>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </center>
        </div>
      )}
    </div>
  );
};

export default NewPost;
