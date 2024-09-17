import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { flashError } from "../helpers/flashMsgProvider";
import { useDispatch } from "react-redux";
import { setUsersData } from "../redux/userSlice";
import { io } from "socket.io-client";

const NewStoryForm = () => {
  const [file, setFile] = useState(null);
  const [valid, setValid] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const socket = io(
    `${import.meta.env.VITE_API_SOCKET_BACKEND_URL}user_namespace`
  );
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setValid(true);
    } else {
      setValid(false);
    }
  };

  const validateFormAndSubmit = async (e) => {
    e.preventDefault();
    if (!file || !file.type.startsWith("image/")) {
      setValid(false);
    } else {
      let url = `${import.meta.env.VITE_API_BACKEND_URL}newStory`;
      let formData = new FormData();
      formData.append("storyImage", file);
      setLoading(true);
      let res = await axios.post(url, formData, { withCredentials: true });

      setLoading(false);
      if (res.data.notLogin) flashError("Login First");
      else if (res.data.success) {
        socket.emit("newStory", res.data.data);

        navigate("/", {
          state: {
            printSuccess: true,
            msg: "Story Created Successfully",
            data: res.data.data,
          },
        });
      } else if (res.data.error)
        flashError(`Internal Server error : ${res.data.msg}`);
    }
  };

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
          <h3 className="text-3xl font-semibold mb-3">Upload Story Image</h3>
          <p className="text-lg mb-3">Image should be in portrait mode</p>
          <form
            onSubmit={validateFormAndSubmit}
            encType="multipart/form-data"
            className="space-y-5"
          >
            <div className="mb-3">
              <label
                htmlFor="storyImage"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Story Image
              </label>
              <input
                type="file"
                name="storyImage"
                accept="image/*"
                className={`block form-control mt-2 w-full text-sm text-gray-900 border ${
                  valid ? "border-gray-300" : "border-red-500"
                } rounded-lg cursor-pointer bg-gray-50 focus:outline-none`}
                onChange={handleFileChange}
              />
              <div
                className={`mt-2 ${
                  valid !== null &&
                  (valid === true ? "text-green-800" : "text-red-500")
                }`}
              >
                {valid !== null &&
                  (valid === true
                    ? "Looks good!"
                    : "Please select a valid image file!")}
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
