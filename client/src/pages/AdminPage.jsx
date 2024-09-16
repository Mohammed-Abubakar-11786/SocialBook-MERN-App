/* eslint-disable react/prop-types */
import axios from "axios";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";
import { setUsersData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";

function AdminPage({ children }) {
  // const navigate = useNavigate();

  // let usersData = useSelector((state) => state.usersData);
  const [allowed, setAllowed] = useState(false);
  const [formData, setFormdata] = useState({
    name: "",
    pass: "",
  });

  const dispatch = useDispatch();

  const handleChange = (e) => {
    let { name, value } = e.target;
    setFormdata((p) => ({
      ...p,
      [name]: value,
    }));
  };

  const check = () => {
    if (
      formData.name.length > 0 &&
      formData.pass.length > 0 &&
      formData.name == import.meta.env.VITE_API_ADMIN_NAME &&
      formData.pass == import.meta.env.VITE_API_ADMIN_PASS
    ) {
      setAllowed(true);
    } else flashError("Invalid Credentials");
  };

  const delUser = async (userID) => {
    let url = `${import.meta.env.VITE_API_BACKEND_URL}delUser/${userID}`;
    let res = await axios.get(url, { withCredentials: true });
    if (res.data.success) {
      flashSuccess("user Deleted Successfully");
      updateUsersData();
    } else if (res.data.error) flashError(res.data.msg);
  };

  let updateUsersData = async () => {
    const url = `${import.meta.env.VITE_API_BACKEND_URL}`;
    let res = await axios({ url });
    // console.log(res);
    dispatch(setUsersData(res.data));
  };

  // const openUsers = () => {
  //   navigate("/admin/allUsers");
  // };

  // const openPosts = () => {
  //   navigate("/admin/allPosts");
  // };

  // const openStories = () => {
  //   navigate("/admin/allStories");
  // };
  return (
    <>
      <div className="w-full flex space-x-5 bg-blue-400 p-1 top-14 sticky z-50">
        <NavLink to={"/admin/allUsers"}>
          <button className="p-1 rounded-xl bg-white">Allusers</button>
        </NavLink>
        <NavLink to={"/admin/allPosts"}>
          <button className="p-1 rounded-xl bg-white">AllPosts</button>
        </NavLink>
        <Link to={"/admin/allStories"}>
          <button className="p-1 rounded-xl bg-white">AllStories</button>
        </Link>
      </div>
      {!allowed ? (
        <div className="absolute flex flex-col  left-0 top-0 z-[999] w-full h-full  justify-center items-center bg-black opacity-70 ">
          <input
            type="text"
            name="name"
            id=""
            value={formData.name}
            onChange={handleChange}
            className="p-1 mb-2 rounded"
            placeholder="Name"
          />
          <input
            type="password"
            name="pass"
            value={formData.pass}
            onChange={handleChange}
            className="p-1 rounded"
            placeholder="Pass"
          />
          <button className="bg-white p-2 mt-2 rounded" onClick={check}>
            Submit
          </button>
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
}

export default AdminPage;
