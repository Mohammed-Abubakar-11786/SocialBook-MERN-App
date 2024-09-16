/* eslint-disable react/prop-types */
import React from "react";

function Story({ index, story }) {
  return (
    <>
      {story && (
        <div
          key={index}
          className="post w-[100px] h-full bg-cover bg-center rounded-lg mr-2 bg-gradient-to-b from-transparent to-black/50"
          style={{
            backgroundImage: `linear-gradient(transparent, rgba(0, 0, 0, 0.5)), url(${story.image.url})`,
          }}
        >
          <img
            className="status-logo w-10 h-auto rounded-full relative left-3 top-2 border-4 border-blue-600 z-10"
            src={story.owner?.image?.url}
            alt=""
          />
          <p className="relative top-16 text-white font-normal text-xs text-center">
            {story.owner?.username}
          </p>
        </div>
      )}
    </>
  );
}

export default Story;
