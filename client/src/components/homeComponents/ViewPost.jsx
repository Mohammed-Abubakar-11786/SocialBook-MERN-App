/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
// import { DateTime } from "luxon";
import { useSelector, useDispatch } from "react-redux";
import { flashError, flashSuccess } from "../../helpers/flashMsgProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Post from "../Post";
import { logoutUser, setUsersData } from "../../redux/userSlice";

const ViewPost = () => {
  const dispatch = useDispatch();
  const socket = io(
    `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}user_namespace`
  );
  let usersData = useSelector((state) => state.usersData);

  let allPosts = usersData?.allPosts;
  let currUser = useSelector((state) => state.currUser);
  let allUsers = usersData?.allUsers;

  const [posts, setPosts] = useState(allPosts);
  let [postComments, setPostComment] = useState();

  useEffect(() => {
    setPosts(allPosts);
    setPostComment(
      allPosts?.reduce((acc, post) => {
        acc[post._id] = "";
        return acc;
      }, {})
    );
  }, [allPosts]);

  const addPost = async (newPost) => {
    setPosts([newPost, ...posts]);

    const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
    let res1 = await axios({ url });
    // console.log(res);
    dispatch(setUsersData(res1.data));
  };

  const handleCmtInpChange = (postId, value) => {
    setPostComment({ ...postComments, [postId]: value });
  };

  let navigate = useNavigate();

  useEffect(() => {
    if (currUser) {
      // Remove existing listeners before adding new ones
      socket.off("incLikeCount");
      socket.off("appendCmt");
      socket.off("increseShareCount");
      socket.off("addNewPost");

      socket.on("incLikeCount", (data) => {
        document.getElementById(`${data.post_Id}-likeCount`).innerText =
          data.count;
      });

      socket.on("addNewPost", (post) => {
        if (!post.isPrivate || post.allowedUsers.includes(currUser._id)) {
          addPost(post);
        }

        // document.getElementById("postContainer").appendChild(div);
      });

      socket.on("appendCmt", (data) => {
        // console.log(data);
        // Create the comment div
        const commentDiv = document.createElement("div");
        commentDiv.classList.add(
          "comment",
          "bg-white",
          "rounded-xl",
          "p-2",
          "flex",
          "space-x-2",
          "mb-[0.5rem]"
        );

        // Create the image element
        const img = document.createElement("img");
        img.src = data.usrImg;
        img.alt = "";
        img.classList.add("w-[8%]", "h-[45px]", "rounded-full");

        // Create the inner comment div
        const innerCommentDiv = document.createElement("div");
        innerCommentDiv.classList.add(
          "inner-comment",
          "flex",
          "flex-col",
          "justify-center",
          "space-y-1"
        );

        // Create the username heading
        const usernameHeading = document.createElement("h6");
        usernameHeading.classList.add("mb-0", "text-[14px]", "font-bold");
        usernameHeading.textContent = data.usrName;

        // Create the comment paragraph
        const commentParagraph = document.createElement("p");
        commentParagraph.classList.add("text-sm");
        commentParagraph.textContent = data.usrCmt;

        // Append the username and comment to the inner comment div
        innerCommentDiv.appendChild(usernameHeading);
        innerCommentDiv.appendChild(commentParagraph);

        // Append the image and inner comment div to the main comment div
        commentDiv.appendChild(img);
        commentDiv.appendChild(innerCommentDiv);

        // Append the main comment div to the comment window
        document
          .getElementById(`${data.post_Id}-commentWindow`)
          .appendChild(commentDiv);

        // Update the comment count
        document.getElementById(`${data.post_Id}-commentCount`).innerText =
          data.cmtCount;

        scrollUp(`${data.post_Id}-commentWindow`);
      });

      socket.on("increseShareCount", (data) => {
        document.getElementById(`${data.post_Id}-shareCount`).innerText =
          data.count;
      });

      const videos = document.querySelectorAll(".postVideo");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
              if (video.paused) {
                video.play().catch((error) => {
                  console.error("Failed to play video:", error);
                });
              }
            } else {
              if (!video.paused) {
                setTimeout(() => {
                  video.pause();
                }, 100); // Delay to prevent rapid toggle
              }
            }
          });
        },
        { threshold: 0.5 }
      );

      videos.forEach((video) => {
        observer.observe(video);
      });

      return () => {
        // Clean up the event listeners on unmount
        socket.off("incLikeCount");
        socket.off("appendCmt");
        socket.off("increseShareCount");
        socket.off("addNewPost");
      };
    }
  }, [currUser, socket]);

  const incLike = async (post_Id) => {
    try {
      if (currUser) {
        const url = `${
          import.meta.env.VITE_API_BACKEND_URL
        }incLike/${post_Id}/${currUser._id}`;
        let res = await axios(url, { withCredentials: true });
        if (res.data.success) {
          let count = res.data.count;
          document.getElementById(`${post_Id}-likeBtn`).style.color =
            res.data.color;
          document.getElementById(`${post_Id}-likeCount`).innerText =
            res.data.count;
          socket.emit("likeBtnClicked", { post_Id, count });
        } else if (res.data.error) {
          // flashError(res.data.message);
          flashError("Internal server error");
        }
      } else {
        flashError("Login First");
        navigate("/login");
      }
    } catch (e) {
      flashError("Some error accored");
    }
  };

  const openComment = (post_Id) => {
    const commentSection = document.getElementById(`${post_Id}-commentSection`);
    const shareSection = document.getElementById(`${post_Id}-shareSection`);
    if (commentSection.style.display === "none") {
      commentSection.style.display = "block";
      scrollUp(`${post_Id}-commentWindow`);
    } else {
      commentSection.style.display = "none";
    }
    shareSection.style.display = "none";
  };

  const sendComment = async (post_Id) => {
    const commentInput = document.getElementById(`${post_Id}-cmtInput`);
    const cmt = commentInput.value;
    if (currUser) {
      try {
        if (cmt) {
          const url = `${
            import.meta.env.VITE_API_BACKEND_URL
          }saveCmt/${post_Id}/${currUser._id}`;
          let res = await axios.post(
            url,
            { cmt },
            {
              withCredentials: true,
              headers: {
                Authorization: localStorage.getItem("token"),
              },
            }
          );

          if (res.data.success) {
            let usrImg = res.data.obj.userImg;
            let usrName = res.data.obj.username;
            let usrCmt = res.data.obj.comment;
            let cmtCount = res.data.count;

            commentInput.value = "";

            // Create the comment div
            const commentDiv = document.createElement("div");
            commentDiv.classList.add(
              "comment",
              "bg-white",
              "rounded-xl",
              "p-2",
              "flex",
              "space-x-2",
              "mb-[0.5rem]"
            );

            // Create the image element
            const img = document.createElement("img");
            img.src = usrImg;
            img.alt = "";
            img.classList.add("w-[8%]", "h-[45px]", "rounded-full");

            // Create the inner comment div
            const innerCommentDiv = document.createElement("div");
            innerCommentDiv.classList.add(
              "inner-comment",
              "flex",
              "flex-col",
              "justify-center",
              "space-y-1"
            );

            // Create the username heading
            const usernameHeading = document.createElement("h6");
            usernameHeading.classList.add("mb-0", "text-[14px]", "font-bold");
            usernameHeading.textContent = usrName;

            // Create the comment paragraph
            const commentParagraph = document.createElement("p");
            commentParagraph.classList.add("text-sm");
            commentParagraph.textContent = usrCmt;

            // Append the username and comment to the inner comment div
            innerCommentDiv.appendChild(usernameHeading);
            innerCommentDiv.appendChild(commentParagraph);

            // Append the image and inner comment div to the main comment div
            commentDiv.appendChild(img);
            commentDiv.appendChild(innerCommentDiv);

            // Append the main comment div to the comment window
            document
              .getElementById(`${post_Id}-commentWindow`)
              .appendChild(commentDiv);

            // Update the comment count
            document.getElementById(`${post_Id}-commentCount`).innerText =
              res.data.count;

            // Scroll up the comment window
            postComments[post_Id] = "";
            setPostComment({ ...postComments, [post_Id]: "" });
            scrollUp(`${post_Id}-commentWindow`);

            let data1 = {
              post_Id,
              usrImg,
              usrName,
              usrCmt,
              cmtCount,
            };
            socket.emit("cmtAdded", data1);
          } else if (res.data.notLogin) {
            flashError("Login First To Comment");
            navigate("/login");
          } else if (res.data.error) {
            flashError("Internal Server Error");
          } else if (!res.data.success) {
            flashError(res.data.message);
          }
        } else {
          flashError("Enter a comment to send");
        }
      } catch (e) {
        flashError("Internal Server Error");
      }
    } else {
      flashError("Login First To Comment");
      navigate("/login");
    }
  };

  const openShare = (post_Id) => {
    const commentSection = document.getElementById(`${post_Id}-commentSection`);
    const shareSection = document.getElementById(`${post_Id}-shareSection`);
    const sendBtn = document.getElementById(`${post_Id}-sendbtn`);
    commentSection.style.display = "none";
    if (shareSection.style.display === "none") {
      shareSection.style.display = "block";
      sendBtn.style.display = "block";
    } else {
      shareSection.style.display = "none";
      sendBtn.style.display = "none";
    }
  };

  const sendPost = async (post_Id) => {
    if (currUser) {
      const postForm = document.getElementById(`postSendForm-${post_Id}`);
      const formData = new FormData(postForm);

      const url = `${import.meta.env.VITE_API_BACKEND_URL}sendPost/${post_Id}`;
      let res = await axios.post(url, formData, {
        withCredentials: true,
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.noSendUsers) {
        flashError("Select a User");
      } else if (res.data.success) {
        if (res.data.isVideo) {
          flashError("You cannot send videos as of now");
          document.getElementById(`${post_Id}-shareSection`).style.display =
            "none";
          document.getElementById(`${post_Id}-sendbtn`).style.display = "none";
          const checkBoxes = document.getElementsByClassName(
            `check-${post_Id}`
          );
          for (let c of checkBoxes) {
            c.checked = false;
          }
        } else {
          flashSuccess("Post Successfully Sent 😀");
          document.getElementById(`${post_Id}-shareCount`).innerText =
            res.data.shareCount;
          document.getElementById(`${post_Id}-shareSection`).style.display =
            "none";
          document.getElementById(`${post_Id}-sendbtn`).style.display = "none";
          const checkBoxes = document.getElementsByClassName(
            `check-${post_Id}`
          );
          for (let c of checkBoxes) {
            c.checked = false;
          }

          socket.emit("incShareCount", {
            post_Id,
            count: res.data.shareCount,
          });
        }
      } else if (res.data.error) {
        flashError("Internal Server Error");
      } else if (res.data.notLogin) {
        flashError("login First to Share a Post");
        navigate("/login");
        dispatch(logoutUser());
      }
    } else {
      flashError("login First to Share a Post");
      navigate("/login");
    }
  };

  const scrollUp = (id) => {
    $(`#${id}`).animate(
      {
        scrollTop: $(`#${id}`).offset().top + $(`#${id}`)[0].scrollHeight,
      },
      0
    );
  };

  return (
    <div className="flex flex-col mt-1" id="postContainer">
      {/* {console.log(postComments)} */}
      {posts?.map(
        (post) =>
          (!post.isPrivate || post.allowedUsers.includes(currUser?._id)) && (
            <Post
              key={post._id}
              post={post}
              postComments={postComments}
              handleCmtInpChange={handleCmtInpChange}
              sendComment={sendComment}
              allUsers={allUsers}
              sendPost={sendPost}
              incLike={incLike}
              openComment={openComment}
              openShare={openShare}
            />
          )
      )}
    </div>
  );
};
export default ViewPost;
