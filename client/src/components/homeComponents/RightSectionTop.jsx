// import React from 'react';

import { Link } from "react-router-dom";
// import { useDispatch } from "react-redux";

const RightSectionTop = () => {
  return (
    <>
      <div className="events">
        <div className="flex justify-between items-baseline opacity-80 px-8 mt-4">
          <h5>Events</h5>
          <a href="#" className="text-blue-500">
            See All
          </a>
        </div>
        <div className="flex ml-3 items-center mt-1 scale-90">
          <img
            src="https://researchmaniacs.com/Calendar-Dates/Images/March-18.png"
            alt="Event"
            className="w-1/4 h-full mr-2"
          />
          <div className="eventInfo">
            <h6 className="m-0 opacity-80">Social Media</h6>
            <i className="fa-solid fa-location-dot mr-1"></i>
            <p className="inline m-0 opacity-80">Willson Teck Park</p>
            <br />
            <a href="#" className="text-sm text-blue-500">
              More Info
            </a>
          </div>
        </div>

        <div className="flex ml-3 items-center mt-1 scale-90">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfaAr6XPMSSpO705ZIp5uB2mbPhflJ1dbMKZdW3K67M0SfYB5nsgzvaY4YTIwJvV6A3gQ&usqp=CAU"
            alt="Event"
            className="w-1/4 h-full mr-2"
          />
          <div className="eventInfo">
            <h6 className="m-0 opacity-80">Mobile Marketing</h6>
            <i className="fa-solid fa-location-dot mr-1"></i>
            <p className="inline m-0 opacity-80">Willson Teck Park</p>
            <br />
            <a href="#" className="text-sm text-blue-500">
              More Info
            </a>
          </div>
        </div>
      </div>

      <div className="add">
        <div className="flex justify-between items-baseline opacity-80 px-8 mt-3">
          <h5>Advertisement</h5>
          <a href="#" className="text-blue-500">
            Close
          </a>
        </div>
        <img
          src="https://blog.ipleaders.in/wp-content/uploads/2021/10/Advertisement-Media.jpg"
          alt="Advertisement"
          className="w-10/12 mt-1 mx-auto rounded-lg"
        />
      </div>

      <div className="conv">
        <div className="flex justify-between items-baseline opacity-80 px-8 mt-7">
          <h5>Conversations</h5>
          <a href="#" className="text-blue-500 hidden lg:block">
            Hide Users
          </a>
        </div>
        <Link id="chatBtn" className="no-underline text-black" to="/chatWindow">
          <div className="chatBtn">
            <button className="btn btn-primary ml-8 mt-4">
              Go to Chat window
            </button>
          </div>
        </Link>
        <Link id="chatBtn" className="no-underline text-black" to="/groupChat">
          <div className="chatBtn">
            <button className="btn btn-primary ml-8 mt-2">
              Open Group Chat
            </button>
          </div>
        </Link>
      </div>
    </>
  );
};

export default RightSectionTop;
