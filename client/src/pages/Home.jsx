/* eslint-disable react/prop-types */
// import React, { useEffect } from "react";
import axios from "axios";
import LeftSectionTop from "../components/homeComponents/LeftSectionTop";
import LeftSectionBottom from "../components/homeComponents/LeftSectionBottom";
import StorySection from "../components/homeComponents/StorySection";
import NewPost from "../components/homeComponents/NewPost";
import ViewPost from "../components/homeComponents/ViewPost";
import RightSectionTop from "../components/homeComponents/RightSectionTop";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, setCurrUser, setUsersData } from "../redux/userSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";

function Home() {
  let location = useLocation();
  let navigate = useNavigate();

  useEffect(() => {
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

  const dispatch = useDispatch();
  function showAndHide(element) {
    if (element) {
      element.style.opacity = "1"; // Ensure initial opacity is set
      element.style.display = "block";

      setTimeout(function () {
        element.style.opacity = "0";
        setTimeout(function () {
          element.style.display = "none";
        }, 1000);
      }, 3000);
    }
  }

  let getHomeDetails = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
    let res = await axios({ url });
    // console.log(res);
    dispatch(setUsersData(res.data));
  };

  let getCurrUser = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}currUser`;
    let res = await axios(url, { withCredentials: true });
    console.log(res);

    if (res.data.success) {
      dispatch(setCurrUser(res.data.data));
    } else {
      dispatch(logoutUser());
    }
  };

  useEffect(() => {
    getHomeDetails();
    getCurrUser(); //get the curr logedin user
  }, []);
  // let successMessage, errorMessage, SuccMsg, errMsg;

  // useEffect(() => {

  // }, []);

  // successMessage = document.getElementById("manualflashSuccess");
  // errorMessage = document.getElementById("manualflashSuccess");

  // SuccMsg = document.getElementById("SuccMsg");
  // errMsg = document.getElementById("errMsg");

  // function flashSuccess(msg) {
  //   if (SuccMsg) {
  //     SuccMsg.innerText = msg;
  //     showAndHide(successMessage);
  //   }
  // }

  // function flashError(msg) {
  //   if (errMsg) {
  //     errMsg.innerText = msg;
  //     showAndHide(errorMessage);
  //   }
  // }
  return (
    <div className="bg-gray-300 w-full">
      <div className="flex justify-center items-center p-2 !pt-[5px] w-full">
        <div className="flex-col h-[90.3vh] w-1/4 bg-white rounded-xl mx-1  hidden min-[865px]:block">
          <div className="h-[40%]">
            <LeftSectionTop />
          </div>
          <center>
            <hr className="w-4/5 my-0" />
          </center>
          <div className="h-[60%]">
            <LeftSectionBottom />
          </div>
        </div>
        <div className="scrollbar-hide flex-col rounded-xl w-full min-[865px]:w-[48.8%] h-[90.3vh] overflow-y-auto border-b-0 ">
          <div className="h-[28%] xl:h-[25%] w-full">
            <StorySection />
          </div>
          <div className="h-auto mt-2">
            <NewPost />
          </div>
          <div className="h-auto mt-2 mb-3">
            <ViewPost />
          </div>

          <div className=" min-[865px]:hidden absolute bottom-8 right-0 flex flex-col items-end mr-1">
            <Link
              id="chatBtn"
              className="no-underline text-black"
              to="/chatWindow"
            >
              <div className="chatBtn">
                <button className="btn btn-primary mt-1">
                  Go to Chat window
                </button>
              </div>
            </Link>
            <Link
              id="chatBtn"
              className="no-underline text-black"
              to="/groupChat"
            >
              <div className="chatBtn">
                <button className="btn btn-primary mt-1">
                  Open Group Chat
                </button>
              </div>
            </Link>
          </div>
        </div>
        <div className=" h-[90.3vh] w-1/4 bg-white rounded-xl mx-1 hidden min-[865px]:block">
          <RightSectionTop />
        </div>
      </div>
    </div>
  );
}

export default Home;
