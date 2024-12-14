/* eslint-disable react/prop-types */
import { useState } from "react";
import EnlargeStatus from "./EnlargeStatus";

function Story({ index, story }) {
  const [show, setShow] = useState(false);
  return (
    <>
      {show ? <EnlargeStatus story={story} setShow={setShow} /> : null}

      {story && story.video && (
        <div
          key={index}
          onClick={() => {
            setShow(true);
          }}
          className="post cursor-pointer w-[100px] h-full bg-cover bg-center rounded-lg mr-2 relative overflow-hidden"
        >
          {/* Background video */}
          <video
            autoPlay
            muted
            loop
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src={story.video.url} type={story?.video.fileType} />
            Your browser does not support the video tag.
          </video>

          {/* Overlay gradient */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50"></div>

          {/* Foreground content */}
          <img
            className="status-logo w-10 h-auto rounded-full relative left-3 top-2 border-4 border-blue-600 z-10"
            src={story.owner?.image?.url}
            alt=""
          />

          <p className="relative top-16 text-white font-normal text-xs text-center z-10">
            {story.owner?.username}
          </p>
        </div>
      )}
    </>
  );
}

export default Story;
