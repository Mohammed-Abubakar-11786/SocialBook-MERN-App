import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Switch from "@mui/material/Switch";
import axios from "axios";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";
import { useNavigate } from "react-router-dom";
import { setUsersData, updateUsersData } from "../redux/userSlice";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    userImage: null,
  });

  let dispatch = useDispatch();

  const navigate = useNavigate();

  const label = { inputProps: { "aria-label": "Switch demo" } };

  const [usernameError, setUserNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [noImageError, setNoImgError] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [loading, setLoading] = useState(false);

  const [passwordMatch, setPasswordMatch] = useState(null);
  const [imageValid, setImageValid] = useState(true);

  const handleSwitch = (e) => {
    setIsPublic(e.target.checked);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "userImage") {
      setFormData((prev) => ({
        ...prev,
        userImage: files[0],
      }));
      setImageValid(files[0]?.type.startsWith("image/") || false);
      if (imageValid) setNoImgError(false);
      else setNoImgError(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (name === "username") setUserNameError(false);
      else if (name === "email") setEmailError(false);
      else if (name === "password") setPasswordError(false);
      if (name === "confirmPassword") {
        setPasswordMatch(formData.password === value);
      }
      if (name === "password") {
        setPasswordMatch(formData.confirmPassword === value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username) {
      setUserNameError(true);
      return;
    } else if (!formData.userImage) {
      setNoImgError(true);
      return;
    }
    if (!noImageError) {
      if (!formData.email) {
        setEmailError(true);
        return;
      } else if (!formData.password) {
        setPasswordError(true);
        return;
      }
    }
    if (passwordMatch && imageValid) {
      // Proceed with form submission
      let url = `${import.meta.env.VITE_API_BACKEND_URL}addUser`;
      const FormDataToSend = new FormData();

      FormDataToSend.append("username", formData.username);
      FormDataToSend.append("email", formData.email);
      FormDataToSend.append("password", formData.password);
      FormDataToSend.append("userImage", formData.userImage);
      FormDataToSend.append("isPublic", isPublic);

      setLoading(true);

      let res = await axios.post(url, FormDataToSend, {
        withCredentials: true,
      });

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        userImage: null,
        isPublic: true,
      });

      document.getElementById("imageInp").value = "";

      setLoading(false);

      if (res.data.success) {
        update();
        navigate("/login", {
          state: {
            printSuccess: true,
            msg: "Account Created Successfully, Login Now",
          },
        });
        // flashSuccess("Account Created Successfully. Login Now");
        // navigate("/login");
      } else if (res.data.error) {
        console.log(res.data.data);
        flashError(res.data.data.message);
      }
    }
  };

  let update = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
    let res = await axios(url, { withCredentials: true });
    dispatch(updateUsersData(res.data));
  };

  return (
    <>
      {loading && (
        <div className="w-full h-full absolute left-0 top-0 flex justify-center items-center z-[999] bg-black opacity-50">
          <p className="font-bold text-white text-3xl">Please wait...</p>
        </div>
      )}
      <div className="flex justify-center  p-4 pt-4  w-full h-[90%]">
        <div className=" p-4 pb-2 bg-white rounded-lg shadow-lg  h-fit sm:w-full ">
          <h3 className="mb-3 text-xl font-semibold">
            Welcome User SignUp on 🌐SocialBook Here
          </h3>
          <form
            id="signUPForm"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
            className="needs-validation "
          >
            <div className="flex sm:flex-row sm:items-center sm:!space-x-10 w-full flex-col items-start ">
              <div className="mb-3 w-full sm:w-1/2">
                <label htmlFor="username" className="form-label">
                  UserName
                </label>
                <input
                  type="text"
                  className="form-control w-full p-2 border border-gray-300 rounded-md"
                  name="username"
                  placeholder="Enter Your Username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
                {usernameError && (
                  <div className="invalid-feedback">UserName required</div>
                )}
              </div>

              <div className="flex items-center space-x-3 mb-3 !ml-0 sm:flex-col ">
                <label htmlFor="accType" className="form-label">
                  Account Type
                </label>
                <div className="w-fit  flex flex-col justify-center items-center text-sm -space-y-2">
                  <p
                    className={
                      isPublic
                        ? "font-bold text-green-600"
                        : "font-semibold text-gray-500 opacity-60"
                    }
                  >
                    Public
                  </p>
                  <Switch
                    id="accType"
                    name="isPublic"
                    checked={isPublic}
                    onChange={handleSwitch}
                    {...label}
                  />
                  <p
                    className={
                      !isPublic
                        ? "font-bold text-green-600"
                        : "font-semibold text-gray-500 opacity-60"
                    }
                  >
                    Private
                  </p>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-row sm:items-center sm:!space-x-10 w-full flex-col items-start ">
              <div className="mb-3 sm:w-1/2">
                <label htmlFor="userImage" className="form-label">
                  Upload Your Image
                </label>
                <input
                  type="file"
                  className="form-control w-full p-2 border border-gray-300 rounded-md"
                  name="userImage"
                  accept="image/*"
                  id="imageInp"
                  required
                  onChange={handleChange}
                />

                {!imageValid && (
                  <>
                    <div className={`invalid-feedback`} id="imageNot">
                      Please Select Image File!
                    </div>
                  </>
                )}

                {noImageError && (
                  <div className="invalid-feedback">Profile Photo required</div>
                )}
              </div>

              <div className="mb-3 sm:w-1/2">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control w-full p-2 border border-gray-300 rounded-md"
                  name="email"
                  placeholder="Enter Your Email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />

                {emailError && (
                  <div className="invalid-feedback">Email required</div>
                )}
              </div>
            </div>

            <div className="flex sm:flex-row sm:items-center sm:!space-x-10 w-full flex-col items-start ">
              <div className="mb-3 sm:w-1/2">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="origPass"
                  type="password"
                  className="form-control w-full p-2 border border-gray-300 rounded-md"
                  name="password"
                  placeholder="Enter Your Password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                {passwordError && (
                  <div className="invalid-feedback">Password is required</div>
                )}
              </div>

              <div className="mb-3 sm:w-1/2">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="cnfPass"
                  type="password"
                  className="form-control w-full p-2 border border-gray-300 rounded-md"
                  name="confirmPassword"
                  placeholder="Enter Your Password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {formData.password.length > 0 &&
                  formData.confirmPassword.length > 0 &&
                  (passwordMatch ? (
                    <div className={`valid-feedback`} id="passCheckPass">
                      Your Confirm Password Has Matched 😀
                    </div>
                  ) : (
                    <div className={`invalid-feedback`} id="passCheck">
                      Your Confirm Password Hasn't Matched 🙁
                    </div>
                  ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success mb-3 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              SignUp
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
