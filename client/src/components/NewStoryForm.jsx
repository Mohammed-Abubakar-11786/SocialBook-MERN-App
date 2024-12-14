import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { flashError } from "../helpers/flashMsgProvider";
import { useDispatch } from "react-redux";
import { logoutUser, setUsersData } from "../redux/userSlice";
import { io } from "socket.io-client";

const NewStoryForm = () => {
  const [file, setFile] = useState(null);
  const [valid, setValid] = useState();
  const [validError, setValidError] = useState();
  const [title, setTitle] = useState("");
  const [validTitle, setvalidTitle] = useState();
  const [titleError, setTitleError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const socket = io(
    `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}user_namespace`
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile || !selectedFile.type.startsWith("video/")) {
      setValid(false);
      setValidError("Please select a video file");
    } else if (selectedFile.size > 10485760) {
      setValid(false);
      setValidError("File size too large. Maximum allowed size is 10 MB.");
    } else {
      setValid(true);
      setFile(selectedFile);
    }
  };

  const validateFormAndSubmit = async (e) => {
    e.preventDefault();
    if (valid && file) {
      if (!title) {
        setvalidTitle("false");
        setTitleError("title required");
        return;
      }
      if (validTitle === "false") {
        flashError("only 20 characters are allowed");
        return;
      }
      let url = `${import.meta.env.VITE_API_BACKEND_URL}newStory`;
      let formData = new FormData();
      formData.append("storyVideo", file);
      formData.append("title", title);

      setLoading(true);
      let res = await axios.post(url, formData, {
        withCredentials: true,
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      setLoading(false);
      if (res.data.notLogin) {
        dispatch(logoutUser());
        navigate("/login", {
          state: { forceLogin: true, msg: "Login First" },
        });
      } else if (res.data.success) {
        socket.emit("newStory", res.data.data);

        navigate("/", {
          state: {
            printSuccess: true,
            msg: "Story Created Successfully",
            data: res.data.data,
          },
        });
      } else if (res.data.error) flashError(`Internal Server error ☹️`); //: ${res.data.msg} for err msg
    } else {
      setValid(false);
      setValidError("Select a video first");
    }
  };

  useEffect(() => {
    if (title.length == 0) {
      setvalidTitle(null);
      setTitleError("");
    } else if (title.length <= 20) {
      setvalidTitle("true");
    } else {
      setvalidTitle("false");
      setTitleError("only 20 Characters are allowed");
    }
  }, [title]);

  return (
    <>
      {loading && (
        <div className="absolute left-0 top-0 bg-black opacity-30 w-screen h-screen flex justify-center items-center">
          <p className="text-white font-bold text-3xl text-center inset-0">
            Please Wait...
          </p>{" "}
        </div>
      )}
      <div className="row mt-5">
        <div className="col-10 col-lg-6 col-md-6 offset-lg-2 offset-1">
          <h3 className="text-3xl font-semibold mb-3">Upload Story Video</h3>
          <p className="text-lg mb-3">Video should be in portrait mode</p>
          <form
            onSubmit={validateFormAndSubmit}
            encType="multipart/form-data"
            className="space-y-5"
          >
            <div className="mb-3">
              <label
                htmlFor="storyVideo"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Story Video
              </label>
              <input
                type="file"
                name="storyVideo"
                accept="video/*"
                className={`block form-control mt-2 w-full text-sm text-gray-900 border ${
                  valid ? "border-gray-300" : "border-red-500"
                } rounded-lg cursor-pointer bg-gray-50 focus:outline-none`}
                onChange={handleFileChange}
              />
              <div
                className={`mt-2 ${
                  valid === true ? "text-green-800" : "text-red-500"
                }`}
              >
                {valid === true ? "Looks good!" : validError}
              </div>
            </div>

            <div className="mb-3">
              <label
                htmlFor="storyTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Story Title{" "}
                <span className="text-xm text-red-500">
                  {title.length === 0 ? (
                    <>(only 20 Characters)</>
                  ) : title.length >= 20 ? (
                    title.length === 20 ? (
                      <></>
                    ) : (
                      <>Remove {Math.abs(20 - title.length)} Characters</>
                    )
                  ) : (
                    <>(now {20 - title.length} Characters)</>
                  )}
                </span>
              </label>
              <input
                type="text"
                id="storyTitle"
                value={title}
                className={`block form-control mt-2 w-full text-sm text-gray-900 border ${
                  validTitle && validTitle === "true"
                    ? "border-gray-300"
                    : "border-red-500"
                } rounded-lg cursor-pointer bg-gray-50 focus:outline-none`}
                onChange={(e) => {
                  setTitle(e.target.value);

                  // console.log(title.length);
                }}
              />
              <div
                className={`mt-2 ${
                  validTitle && validTitle === "true"
                    ? "text-green-800"
                    : "text-red-500"
                }`}
              >
                {validTitle && validTitle === "true"
                  ? "Looks good!"
                  : titleError}
              </div>
            </div>
            <button type="submit" className="btn btn-success add-btn mt-3">
              Create Story
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewStoryForm;
