/* eslint-disable react/prop-types */
import React from "react";

function LikeBtn({ animationRef }) {
  return (
    <div className={`absolute  h-full w-full`}>
      <dotlottie-player
        // ref={animationRef}
        src="https://lottie.host/189cc05e-e007-4d05-b089-ef5397d2256d/pXnwH8sLHb.lottie"
        background="transparent"
        speed="1"
        style={{ width: "100%", height: "100%" }}
        loop={false} // Play only once
        autoplay
      ></dotlottie-player>
    </div>
  );
}

export default LikeBtn;
