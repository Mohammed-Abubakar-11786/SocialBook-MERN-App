/* eslint-disable react/prop-types */
import FlashMessage from "../components/FlashMessage";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
function ChatLayout({ children }) {
  return (
    <div className="fixed w-full">
      <div
        id="otherThenSettings"
        className="w-full h-full absolute left-0  top-0 hidden"
      ></div>
      <FlashMessage />

      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

export default ChatLayout;
