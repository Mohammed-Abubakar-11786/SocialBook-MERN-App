/* eslint-disable react/prop-types */
import React from "react";
import { DateTime } from "luxon";

const Post = ({
  post,
  postComments,
  handleCmtInpChange,
  sendComment,
  allUsers,
  sendPost,
  incLike,
  openComment,
  openShare,
  delPost,
  reduceSize = false,
}) =>
  post &&
  postComments && (
    <div
      id={post._id}
      className={`view bg-white rounded-xl p-2 mb-2 ${
        reduceSize ? "w-1/4 h-1/2" : "h-3/4"
      }`}
    >
      <div className="userInfo flex justify-start mt-2">
        <img
          src={post.owner?.image.url}
          className="w-[50px] h-[65px] rounded-full mr-2 relative bottom-[0.2rem] hover:cursor-pointer"
          alt=""
        />
        <div className="info flex flex-col justify-start">
          <h6 className="font-semibold text-lg">{post.owner?.username}</h6>
          <p className="text-sm">
            {DateTime.fromISO(post?.createdAt, {
              zone: "Asia/Kolkata",
            }).toFormat("EEE, MMM d, yyyy, hh:mm:ss a")}
          </p>
        </div>
        <div className="postDelBtn" onClick={delPost}>
          {/* <i className="fa-solid fa-ellipsis-vertical"></i> */}
        </div>
      </div>
      <div className="postDesc p-2">
        <p>{post.description}</p>
      </div>
      <div className={`postImg`}>
        {post.isVedio ? (
          <video controls className={`postVideo rounded-xl`} muted>
            <source src={post.vedio.url} type={post.vedio.fileType} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={post?.image.url} className={`rounded-xl `} alt="" />
        )}
      </div>
      <div className="icons flex justify-start items-center p-[3px] mt-2">
        <div
          className="container cursor-pointer w-fit m-0"
          onClick={() => incLike(post._id)}
        >
          <i
            id={`${post._id}-likeBtn`}
            className="fa-solid fa-thumbs-up like-icon text-[21px] text-gray-600 mr-2"
          ></i>
          <span id={`${post._id}-likeCount`} className="text-lg">
            {post.like}
          </span>
        </div>
        <div
          className="container cursor-pointer w-fit m-0"
          onClick={() => openComment(post._id)}
        >
          <i className="fa-solid fa-comments text-[20px] text-gray-600 mr-2"></i>
          <span id={`${post._id}-commentCount`} className="text-lg">
            {post.comments.length}
          </span>
        </div>
        <div
          className="container cursor-pointer w-fit m-0"
          onClick={() => openShare(post._id)}
        >
          <i className="fa-solid fa-share text-gray-600 mr-2 text-[20px]"></i>
          <span id={`${post._id}-shareCount`} className="text-lg">
            {post.shares.length}
          </span>
        </div>
        <div
          className="container hidden cursor-pointer hover:scale-110 w-fit sendBtn ml-auto mr-0 space-x-2 items-center"
          id={`${post._id}-sendbtn`}
          onClick={() => sendPost(post._id)}
        >
          <i className="fa-regular fa-paper-plane text-xl"></i>
          <span className="font-semibold">Send</span>
        </div>
      </div>

      {/* comment section */}
      <div
        className="commentSection bg-blue-100 rounded-xl p-2 h-[230px] mt-2"
        style={{ display: "none" }}
        id={`${post._id}-commentSection`}
      >
        <div
          className="scrollbar-hide  commentWindow h-[78%] overflow-y-auto"
          id={`${post._id}-commentWindow`}
        >
          {post.comments.map((cmt) => (
            <div
              key={cmt._id}
              className="comment bg-white rounded-xl p-2 flex space-x-2"
              style={{ marginBottom: "0.5rem" }}
            >
              <img
                src={cmt.userImg}
                alt=""
                className="w-[55px] h-[55px] rounded-full"
              />
              <div className="inner-comment flex flex-col justify-center space-y-1">
                <h6 className="mb-0 text-[14px] font-bold">{cmt.username}</h6>
                <p className="text-sm">{cmt.comment}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="commentInput  w-full  flex space-x-1 p-2">
          <input
            type="text"
            placeholder="Type here..."
            id={`${post._id}-cmtInput`}
            className="w-[90%] rounded-l-xl pl-2 focus:outline bg-white"
            value={postComments[post._id]}
            onChange={(e) => handleCmtInpChange(post._id, e.target.value)}
          />
          <button
            className="bg-green-400 hover:bg-green-500 p-1 rounded-r-xl px-2"
            onClick={() => sendComment(post._id)}
          >
            Send
          </button>
        </div>
      </div>

      {/* share section */}
      <div
        className="mt-1 scrollbar-hide shareSection h-[200px] overflow-auto bg-blue-100 rounded-lg p-2"
        style={{ display: "none" }}
        id={`${post._id}-shareSection`}
      >
        <form id={`postSendForm-${post._id}`}>
          {allUsers?.map((user) => (
            <label
              htmlFor={`${user._id}-${post._id}-shareUserSelect`}
              key={user._id}
              className="flex w-full"
            >
              <div
                className={`shareUserInfo mb-1 w-full bg-white hover:bg-blue-200 rounded-full p-1 cursor-pointer`}
              >
                <div className="info flex items-center ml-1 space-x-3">
                  <input
                    id={`${user._id}-${post._id}-shareUserSelect`}
                    type="checkbox"
                    name={`shared_users-${post._id}`}
                    value={user._id}
                    className={`check-${post._id}`}
                  />
                  <img
                    className="w-[50px] h-[50px] rounded-full"
                    src={user?.image?.url}
                    alt=""
                  />
                  <p>{user?.username}</p>
                </div>
              </div>
            </label>
          ))}
        </form>
      </div>
    </div>
  );

export default Post;
