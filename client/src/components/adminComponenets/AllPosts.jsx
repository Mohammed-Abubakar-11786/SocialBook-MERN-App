import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Post from "../Post";
import axios from "axios";
import { flashError, flashSuccess } from "../../helpers/flashMsgProvider";
import { setUsersData, updateUsersData } from "../../redux/userSlice";

function AllPosts() {
  let usersData = useSelector((state) => state.usersData);
  const [posts, setPosts] = useState(usersData.allPosts || []);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  let [postComments, setPostComment] = useState(
    posts.reduce((acc, post) => {
      acc[post._id] = "";
      return acc;
    }, {})
  );

  let delPost = async (postID) => {
    let url = `${import.meta.env.VITE_API_BACKEND_URL}delPost/${postID}`;
    setLoading(true);
    let res = await axios(url, { withCredentials: true });
    setLoading(false);
    if (res.data.success) {
      flashSuccess("Post Deleted Successfully");
      update();
    } else if (res.data.error) flashError(res.data.msg);
  };

  let update = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
    let res = await axios(url, { withCredentials: true });
    // console.log(res);
    setPosts(res.data.allPosts);
    dispatch(updateUsersData(res.data));
  };

  useEffect(() => {
    setPosts(usersData.allPosts);
    update();
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
        {" "}
        {posts?.map((post) => (
          <div key={post._id} className="flex items-center space-x-10">
            <Post
              key={post._id}
              post={post}
              postComments={postComments}
              reduceSize={true}
              // handleCmtInpChange={handleCmtInpChange}
              // sendComment={sendComment}
              // allUsers={allUsers}
              // sendPost={sendPost}
              // incLike={incLike}
              // openComment={openComment}
              // openShare={openShare}
            />
            <button
              className="bg-red-800 text-white p-2 h-[10%]"
              onClick={() => delPost(post._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default AllPosts;
