import React, { useEffect, useState } from "react";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { all } from "axios";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { logoutUser, setUsersData } from "../redux/userSlice";

const NewPostForm = () => {
  const socket = io(
    `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}user_namespace`
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("Select Image Or Video");
  const [file, setFile] = useState(null);
  const [postDescription, setPostDescription] = useState("");
  const [fileError, setFileError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [loading, setLoading] = useState(false);

  let usersData = useSelector((state) => state.usersData);

  let allUsers = useSelector((state) => state.usersData.allUsers);
  let currUser = useSelector((state) => state.currUser);

  const [allowedUsers, setAllowedUsers] = useState([currUser._id]);

  // useEffect(() => {
  //   if (currUser) {
  //     // Remove existing listeners before adding new ones
  //     socket.off("addNewPost");

  //     socket.on("addNewPost", (data) => {
  //       console.log(data);
  //     });

  //     return () => {
  //       // Clean up the event listeners on unmount
  //       socket.off("addNewPost");
  //     };
  //   }
  // }, [currUser, socket]);

  const handleAllowedUsers = (userID) => {
    setAllowedUsers((p) => {
      let toSend = Array.isArray(p) ? p : [p];
      let isDubli = false;
      toSend.forEach((usr) => {
        if (usr === userID) isDubli = true;
      });

      if (isDubli) return [...toSend];
      else return [...toSend, userID];
    });
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    setFile(null);
    setFileError("");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileError("");
  };

  const handleDescriptionChange = (e) => {
    setPostDescription(e.target.value);
    setDescriptionError("");
  };

  const validateFile = () => {
    if (
      selectedOption === "image" &&
      (!file || !file.type.startsWith("image/"))
    ) {
      setFileError("Please select an image file.");
      return false;
    } else if (selectedOption === "video") {
      if (!file || !file.type.startsWith("video/")) {
        setFileError("Please select a video file.");
        return false;
      } else if (file.size > 10485760) {
        setFileError("File size too large. Maximum allowed size is 10 MB.");
        return false;
      }
    } else if (selectedOption === "Select Image Or Video") {
      flashError("Please select Image or Video.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currUser.isPublic && allowedUsers.length < 2) {
      flashError("Select Users else Switch to Account type Public");
      return;
    }
    if (!postDescription) {
      setDescriptionError("Post Description required");
      return;
    }
    if (validateFile()) {
      // Handle form submission logic here
      const formData = new FormData();
      formData.append("post_description", postDescription);
      formData.append("allowed_users", allowedUsers);
      formData.append("NoOfAllowedUsers", allowedUsers.length);

      if (selectedOption === "image") {
        formData.append("post_image", file);
      } else if (selectedOption === "video") {
        formData.append("post_video", file);
      }
      setLoading(true);
      // Assuming the form submission logic is an axios POST request
      const url = `${import.meta.env.VITE_API_BACKEND_URL}newPostAllDetails`;

      let res = await axios.post(url, formData, {
        withCredentials: true,
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        socket.emit("sendPost", res.data.data);
        // let allPosts = [...usersData.allPosts, res.data.data];

        // usersData = {
        //   ...usersData,
        //   allPosts: allPosts,
        // };
        // dispatch(updateUsersDataAllPosts());
        const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
        let res1 = await axios(url);
        // console.log(res);
        dispatch(setUsersData(res1.data));
        setLoading(false);
        navigate("/", {
          state: { msg: "Post Created Successfully 😀", printSuccess: true },
        });
      } else if (res.data.notLogin) {
        setLoading(false);
        dispatch(logoutUser());
        flashError("Login first");
        navigate("/login");
      } else if (res.data.error) {
        setLoading(false);
        flashError(res.data.e || "Internal Server error");
      }
    }
  };

  let location = useLocation();

  useEffect(() => {
    setPostDescription(location.state?.msg);
  }, [location.state]);

  return (
    <>
      {loading && (
        <div className="absolute top-0 flex justify-center items-center left-0 w-[100%] h-[100vh] bg-black opacity-40">
          <p className="text-white font-bold text-2xl text-center inset-0">
            Please Wait...
          </p>
        </div>
      )}
      <div className="row mt-3">
        <div className="col-10 col-lg-6 col-md-6 offset-lg-2 offset-1">
          <h3 className="text-xl font-semibold">
            Enter Here Some Extra Details to Create New Post
          </h3>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="needs-validation"
            encType="multipart/form-data"
          >
            <select
              id="imgOrVideoSelect"
              className="form-select mb-3 mt-3"
              aria-label="Default select example"
              value={selectedOption}
              onChange={handleOptionChange}
            >
              <option>Select Image Or Video</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>

            {selectedOption === "image" && (
              <div className="mb-3" id="imageSelected">
                <label htmlFor="image" className="form-label">
                  Upload Post Image
                </label>
                <input
                  type="file"
                  className="form-control"
                  name="post_image"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {fileError && (
                  <div className="invalid-feedback">{fileError}</div>
                )}
              </div>
            )}
            {selectedOption === "video" && (
              <div className="mb-3" id="videoSelected">
                <label htmlFor="video" className="form-label">
                  Upload Post Video
                </label>
                <input
                  type="file"
                  className="form-control"
                  name="post_video"
                  accept="video/*"
                  onChange={handleFileChange}
                />
                {fileError && (
                  <div className="invalid-feedback">{fileError}</div>
                )}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="postDescription" className="form-label">
                Post Description
              </label>
              <textarea
                type="text"
                className="form-control"
                name="post_description"
                placeholder="Add Post Description here"
                value={postDescription}
                onChange={handleDescriptionChange}
                required
              ></textarea>
              {descriptionError && (
                <div className="invalid-feedback">{descriptionError}</div>
              )}
            </div>

            {/* share section */}
            {!currUser.isPublic && (
              <>
                <label htmlFor="" className="form-label mb-1">
                  Select the Users{" "}
                </label>{" "}
                {allUsers.length <= 1 ? (
                  <p className="text-sm mt-0 text-red-500 font-semibold">
                    *No Users Available
                  </p>
                ) : (
                  <p className="text-sm mt-0 text-red-500 font-semibold">
                    *Only to these users Your Post will be shown
                  </p>
                )}
                {allUsers.length > 1 && (
                  <div className="mt-1 scrollbar-hide shareSection h-[200px] overflow-auto rounded-lg p-2">
                    {allUsers?.map(
                      (user) =>
                        user._id !== currUser._id && (
                          <label
                            htmlFor={`${user._id}-allowedUsersSelect`}
                            key={user._id}
                            className="flex w-full"
                            onClick={() => handleAllowedUsers(user._id)}
                          >
                            {" "}
                            <div
                              className={`shareUserInfo mb-1 w-full  shadow-sm hover:bg-blue-200 rounded-full p-1 cursor-pointer`}
                            >
                              <div className="info  flex items-center ml-1 space-x-3">
                                <input
                                  id={`${user._id}-allowedUsersSelect`}
                                  type="checkbox"
                                  name={`allowed_users`}
                                  value={user._id}
                                />
                                <img
                                  className="w-[40px] h-[40px] rounded-full"
                                  src={user?.image?.url}
                                  alt=""
                                />
                                <p>{user?.username}</p>
                              </div>
                            </div>{" "}
                          </label>
                        )
                    )}
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn btn-success add-btn mt-3">
              Create Post
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewPostForm;
