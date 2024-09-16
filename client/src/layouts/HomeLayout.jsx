/* eslint-disable react/prop-types */
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Login from "../components/Login";
import FlashMessage from "../components/FlashMessage";
function HomeLayout({ children }) {
  return (
    <div className="fixed w-full h-full">
      <div
        id="otherThenSettings"
        className="w-full h-[100vh] absolute left-0  top-0 hidden"
      ></div>
      <Navbar />
      <FlashMessage />
      {children}
      <Footer />
    </div>
  );
}

export default HomeLayout;
