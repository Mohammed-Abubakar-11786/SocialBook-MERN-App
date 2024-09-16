// import React from "react";

function LeftSectionTop() {
  return (
    <div className="ml-12 mt-3 text-lg">
      <div className="mb-6 flex items-center">
        <i className="fa-solid fa-newspaper text-blue-500 mr-2"></i>
        <p className="opacity-80 text-base hover:cursor-pointer">Latest News</p>
      </div>

      <div className="mb-6 flex items-center">
        <i className="fa-solid fa-user-group text-blue-500 mr-2"></i>
        <p className="opacity-80 text-base hover:cursor-pointer">Friends</p>
      </div>

      <div className="mb-6 flex items-center">
        <i className="fa-solid fa-people-group text-blue-500 mr-2"></i>
        <p className="opacity-80 text-base hover:cursor-pointer">Group</p>
      </div>

      <div className="mb-6 flex items-center">
        <i className="fa-solid fa-cart-shopping text-blue-500 mr-2"></i>
        <p className="opacity-80 text-base hover:cursor-pointer">
          Market Place
        </p>
      </div>

      <div className="mb-3 flex items-center">
        <i className="fa-solid fa-tv text-blue-500 mr-2"></i>
        <p className="opacity-80 text-base hover:cursor-pointer">Watch</p>
      </div>

      <div className="mb-6">
        <a href="#" className="opacity-80 text-base hover:cursor-pointer">
          See More
        </a>
      </div>
    </div>
  );
}

export default LeftSectionTop;
