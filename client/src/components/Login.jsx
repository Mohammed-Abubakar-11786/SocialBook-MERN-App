import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import { setCurrUser, setOnlineUsers } from "../redux/userSlice";
import { flashSuccess, flashError } from "../helpers/flashMsgProvider";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import FlashMessage from "./FlashMessage";

const Login = () => {
  let navigate = useNavigate();
  let location = useLocation();

  // useEffect(() => {
  //   if (location.state?.forceLogin) {
  //     flashError("Login First to Perform the Operation");
  //   }
  // }, [location.state]);

  useEffect(() => {
    if (location.state?.forceLogin) {
      flashError(location.state?.msg || "Login First to Perform the Operation");
    }
    if (location.state?.printSuccess) {
      flashSuccess(location.state.msg);
      // Clear the state after using it
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

  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const currUser = useSelector((state) => state.currUser);

  const dispatch = useDispatch();

  const [errorMsg, setErrorMsg] = useState("");
  const [succMsg, setSuccMsg] = useState("");

  const openLoginForm = () => {
    if (!currUser) {
      setSuccMsg("");
      setErrorMsg("");
      setIsOpen(true);
    }
    return;
  };

  const closeLoginForm = () => {
    setIsOpen(false);
    navigate("/");
    setSuccMsg("");
    setErrorMsg("");
  };

  let handleOnChange = (e) => {
    setSuccMsg("");
    setErrorMsg("");
    let { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  let onSubmit = async (e) => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 200);
    e.preventDefault();
    e.stopPropagation();

    const FormDataToSend = new FormData();
    FormDataToSend.append("username", formData.username);
    FormDataToSend.append("password", formData.password);
    const url = `${import.meta.env.VITE_API_BACKEND_URL}login`;
    try {
      setIsLoading(true);
      let res = await axios.post(
        url,
        FormDataToSend,
        { withCredentials: true },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIsLoading(false);
      if (res.data.success) {
        setFormData({
          username: "",
          password: "",
        });

        localStorage.setItem("token", res.data.token);
        setErrorMsg("");
        setSuccMsg(res.data.message + " 🎉🎉🎉");
        flashSuccess(res.data.message + " 🎉🎉🎉");
        dispatch(setOnlineUsers(res.data.data));
        dispatch(setCurrUser(res.data.data));
        closeLoginForm();
      } else if (res.data.error) {
        setFormData({
          username: "",
          password: "",
        });
        setSuccMsg("");
        setErrorMsg(res.data.data.message + " ☹️");
      }
    } catch (e) {
      setFormData({
        username: "",
        password: "",
      });
      setErrorMsg("");
      setSuccMsg("");
      // setErrorMsg(e.message || "Something Went Wrong. Try Again Later");
      setErrorMsg("Something Went Wrong. Try Again Later");
      setIsLoading(false);
    }
  };

  const changeBtnColr = () => {
    if (formData.username && formData.password) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
      }, 200);
    }
  };

  return (
    <>
      <FlashMessage />
      <button
        onClick={openLoginForm}
        id="openLogin"
        className="btn btn-primary hidden"
      >
        Open Login Form
      </button>
      {isOpen && (
        <div className="fixed inset-0 p-2 flex justify-center items-center bg-black bg-opacity-50 z-50 ">
          <div
            onClick={closeLoginForm}
            className="w-full h-full absolute z-0 "
          ></div>
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <h2 className="text-2xl mb-3">LogIn</h2>
            <p className="mb-2 text-center text-red-500 text-lg font-bold">
              {errorMsg}
            </p>
            <p className="mb-2 text-center text-green-500 text-lg font-bold">
              {succMsg}
            </p>
            <form method="post" onSubmit={onSubmit}>
              <label htmlFor="username" className="block mb-2">
                Username:
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Username"
                required
                value={formData.username}
                onChange={handleOnChange}
                className="w-full p-2 mb-4 rounded-lg border border-gray-300"
              />

              <label htmlFor="password" className="block mb-2">
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleOnChange}
                className="w-full p-2 mb-4 rounded-lg border border-gray-300"
              />

              <button
                id="loginBtn"
                type="submit"
                onClick={changeBtnColr}
                disabled={isLoading}
                className={`w-full py-2 text-white rounded-lg transition duration-200 ${
                  submitted ? "bg-orange-600" : "bg-blue-500 hover:bg-blue-600"
                } font-bold`}
              >
                {isLoading ? (
                  <lord-icon
                    src="https://cdn.lordicon.com/jpgpblwn.json"
                    trigger="loop"
                    state="loop-expand"
                    colors="primary:#ffffff"
                    className="w-[100px] h-[100px]"
                  ></lord-icon>
                ) : (
                  <p> Log In</p>
                )}
              </button>
            </form>
            <button
              onClick={closeLoginForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-200"
            >
              &times;
            </button>

            <p className="mt-4">
              Don't have an account?{" "}
              <Link
                to="/signup"
                onClick={closeLoginForm}
                className="text-blue-500 hover:underline"
              >
                Sign Up
              </Link>
            </p>

            <p className="mt-2">
              <Link to="/forgetPass" className="text-blue-500 hover:underline">
                Forget Password?
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
