/* eslint-disable react/prop-types */
import axios from "axios";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logoutUser, setCurrUserAccType } from "../redux/userSlice";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import Switch from "@mui/material/Switch";

const label = { inputProps: { "aria-label": "Switch demo" } };

const Navbar = () => {
  let navigate = useNavigate();
  let currUser = useSelector((state) => state.currUser);

  const dispatch = useDispatch();

  const [isPublic, setIsPublic] = useState(currUser?.isPublic);

  const handleSwitch = async (event) => {
    let newIsPublic = event.target.checked;
    setIsPublic(newIsPublic);
    let url = `${import.meta.env.VITE_API_BACKEND_URL}toggleAccType/${
      currUser._id
    }`;
    let res = await axios(url, { withCredentials: true });

    if (res.data.success) {
      let curr = { ...currUser, isPublic: newIsPublic };
      dispatch(setCurrUserAccType(curr));
      flashSuccess("Account type updated successfully!");
    } else if (res.data.error) flashError("Failed to update account type.");
  };

  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  // const [logoutMessage, setLogoutMessage] = useState(null);

  const openLoginForm = () => {
    navigate("/login");
  };

  if (settingsMenuOpen) {
    document.getElementById("otherThenSettings").style.display = "block";
    document
      .getElementById("otherThenSettings")
      ?.addEventListener("click", () => {
        closeSettingsMenu();
      });
  }

  const toggleSettingsMenu = () => {
    setSettingsMenuOpen(!settingsMenuOpen);
  };

  const closeSettingsMenu = () => {
    setSettingsMenuOpen(false);
    document.getElementById("otherThenSettings").style.display = "none";
  };

  const logOut = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}logout`;
    const res = await axios(url, { withCredentials: true });
    if (res.data.success) {
      let logedOutUser = currUser.username;
      dispatch(logoutUser());
      closeSettingsMenu();
      flashSuccess(`You Logged Out!! Bye 👋👋 ${logedOutUser} 😊 See You Soon`);
      navigate("/");
    } else if (res.data.error) {
      closeSettingsMenu();
      flashError("Logout Failed ☹️");
    }
  };

  // useEffect(() => {
  //   if (logoutMessage) {
  //     flashSuccess(logoutMessage);
  //     setLogoutMessage(null); // Reset the logout message state after showing the flash message
  //   }
  // }, [logoutMessage]);

  return (
    <nav className="sticky z-50 top-0 bg-blue-500 h-14 flex items-center justify-between !px-2 sm:!px-5 md:!px-10 lg:!px-16 xl:!px-28 2xl:!px-40 ">
      <div className="nav-left flex items-center space-x-4 md:space-x-6 lg:space-x-8">
        <Link to="/" className="text-white text-lg flex items-center">
          <i className="fa-solid fa-globe mr-2"></i> SocialBook
        </Link>
        <i className="fa-solid fa-bell text-white text-lg hidden md:inline"></i>
        <i className="fa-solid fa-envelope text-white text-lg hidden md:inline"></i>
        <i className="fa-solid fa-video text-white text-lg hidden md:inline"></i>
      </div>

      <div className="nav-right flex items-center">
        <div className="input-container relative mr-4 hidden md:block">
          <i className="fa-solid fa-magnifying-glass absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 opacity-60"></i>
          <input
            type="text"
            className="searchBar focus:outline-blue-600 rounded-2xl text-lg py-1 px-8 w-60 h-9 border border-black"
            placeholder="Search"
          />
        </div>

        {currUser ? (
          <div className="relative">
            <div
              className="profile-logo cursor-pointer"
              onClick={toggleSettingsMenu}
            >
              <img
                src={currUser.image?.url}
                alt="Profile"
                className="w-10 h-12 rounded-full ml-4"
              />
            </div>
          </div>
        ) : (
          <button
            className="btn btn-success signup ml-0 lg:ml-4 bg-white   hover:text-blue-500 text-blue-500 border border-blue-500 rounded-full py-1 px-4 shadow-lg"
            onClick={openLoginForm}
          >
            LogIn/SignUp
          </button>
        )}

        {settingsMenuOpen && currUser && (
          <div
            id="settingsMenu"
            className="absolute z-[60] top-12 right-5 max-w-[100%] bg-white rounded-lg shadow-lg"
          >
            <div className="innerSettings p-4">
              <div className="settingUserInfo flex items-center mb-4">
                <img
                  src={currUser.image.url}
                  alt="Profile"
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div className="info ">
                  <h6 className="text-lg font-medium">{currUser.username}</h6>
                  <a href="#" className="text-blue-500">
                    See Your Profile
                  </a>
                </div>
                <div className="ml-auto flex flex-col justify-center items-center text-sm -space-y-2">
                  <p
                    className={
                      isPublic || currUser.isPublic
                        ? "font-bold text-green-600"
                        : "font-semibold text-gray-500 opacity-60"
                    }
                  >
                    Public
                  </p>
                  <Switch
                    checked={isPublic || currUser.isPublic}
                    // checked={isPublic}
                    onChange={handleSwitch}
                    {...label}
                  />
                  <p
                    className={
                      !(isPublic || currUser.isPublic)
                        ? "font-bold text-green-600"
                        : "font-semibold text-gray-500 opacity-60"
                    }
                  >
                    Private
                  </p>
                </div>
                <i
                  className="fa-solid fa-xmark text-xl ml-auto cursor-pointer"
                  onClick={closeSettingsMenu}
                ></i>
              </div>
              <hr className="my-2" />
              <div className="settingUserInfo mt-3 flex items-center mb-4 cursor-pointer">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4658/4658943.png"
                  alt="Feedback"
                  className="w-8 h-8 mr-3"
                />
                <div className="info">
                  <h6 className="text-lg font-medium">Give Feedback</h6>
                  <a href="#" className="text-blue-500">
                    Help us to improve the new design
                  </a>
                </div>
              </div>
              <hr className="my-2" />
              <div className="settingUserInfo mt-3 flex items-center mb-4 cursor-pointer">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Settings_%28iOS%29.png/800px-Settings_%28iOS%29.png"
                  alt="Settings"
                  className="w-8 h-8 mr-3"
                />
                <div className="info  flex space-x-5">
                  <h6 className="text-lg font-medium">Settings & Privacy</h6>
                  <i className="fa-solid fa-angle-right text-lg ml-auto"></i>
                </div>
              </div>
              <div className="settingUserInfo flex items-center mb-4 cursor-pointer">
                <img
                  src="https://previews.123rf.com/images/sarahdesign/sarahdesign1410/sarahdesign141000993/32210603-help-icon.jpg"
                  alt="Help"
                  className="w-8 h-8 mr-3"
                />
                <div className="info flex space-x-5">
                  <h6 className="text-lg font-medium">Help & Support</h6>
                  <i className="fa-solid fa-angle-right text-lg ml-auto"></i>
                </div>
              </div>
              <div className="settingUserInfo flex items-center mb-4 cursor-pointer">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4854/4854302.png"
                  alt="Display"
                  className="w-8 h-8 mr-3"
                />
                <div className="info flex space-x-5">
                  <h6 className="text-lg font-medium">
                    Display & Accessibility
                  </h6>
                  <i className="fa-solid fa-angle-right text-lg ml-auto"></i>
                </div>
              </div>

              <div
                onClick={logOut}
                className="settingUserInfo flex items-center mb-2 cursor-pointer"
              >
                <img
                  src="https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-11/512/logout-icon.png"
                  alt="Logout"
                  className="w-8 h-8 mr-3"
                />
                <div className="info flex space-x-5">
                  <h6 className="text-lg font-medium">Logout</h6>
                  <i className="fa-solid fa-angle-right text-lg ml-auto"></i>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
