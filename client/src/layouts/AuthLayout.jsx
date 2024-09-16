/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { flashError } from "../helpers/flashMsgProvider";
import FlashMessage from "../components/FlashMessage";
import Loading from "../components/Loading";

function AuthLayout({ children }) {
  let currUser = useSelector((state) => state.currUser);
  let navigate = useNavigate();
  let [loader, setLoader] = useState(true);
  let getCurrUser = async () => {
    try {
      //   const url = `${import.meta.env.VITE_API_BACKEND_URL}currUser`;
      //   let res = await axios(url, { withCredentials: true });
      //   if (!res.data.success) {
      //     navigate("/login");
      //   }

      if (!currUser) {
        // flashError("Login First to Perform the Operation");
        navigate("/login", { state: { forceLogin: true } });
      }
      setTimeout(() => {
        setLoader(false);
      }, [1000]);
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    getCurrUser();
  }, [currUser]);

  return loader ? (
    <>
      <div className="h-screen">
        <Loading />
      </div>
    </>
  ) : (
    <>{children}</>
  );
}

export default AuthLayout;
