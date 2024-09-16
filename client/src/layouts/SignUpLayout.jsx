/* eslint-disable react/prop-types */
import Navbar from "../components/Navbar";
import Login from "../components/Login";
import FlashMessage from "../components/FlashMessage";
function SignUpLayout({ children }) {
  return (
    <div className="w-full h-[100vh]">
      <div
        id="otherThenSettings"
        className="w-full h-full absolute left-0 top-0 hidden"
      ></div>

      <FlashMessage />
      <Navbar />

      {children}
    </div>
  );
}

export default SignUpLayout;
