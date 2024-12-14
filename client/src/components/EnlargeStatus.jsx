/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import EnlargedStory from "./story Components/EnlargedStory";

function EnlargeStatus({ story, setShow }) {
  const allStories = useSelector((state) => state.usersData?.allStories);
  const currUser = useSelector((state) => state.currUser);
  const containerRef = useRef();

  useEffect(() => {
    document.getElementById(story._id)?.scrollIntoView({ behavior: "instant" });
  }, [story, currUser]);

  //scroll function
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Scroll to the next status when halfway visible
            entry.target.scrollIntoView({ behavior: "smooth" });
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.4, // Trigger when half of the story is visible
      }
    );

    const stories = containerRef.current?.children;
    if (stories) {
      Array.from(stories).forEach((storyDiv) => observer.observe(storyDiv));
    }

    return () => observer.disconnect(); // Cleanup on unmount
  }, []);

  return (
    <div id="statusViewer" className="w-screen h-screen">
      {/* Overlay to close the viewer */}
      <div
        onClick={() => setShow(false)}
        className="absolute top-0 left-0 flex w-full h-full z-[999] bg-black opacity-45"
      ></div>

      {/* Scrollable stories container */}
      <div
        ref={containerRef}
        className="absolute top-0 left-0 flex flex-col w-full h-full overflow-auto snap-y snap-mandatory"
      >
        {allStories.map((stry) => (
          <EnlargedStory key={stry._id} story={stry} setShow={setShow} />
        ))}
      </div>
    </div>
  );
}

export default EnlargeStatus;
