import axios from "axios";
import { useState } from "react";
import Loading from "../components/Loading";
import { flashError, flashSuccess } from "../helpers/flashMsgProvider";
import { useNavigate } from "react-router-dom";

function ForgetPassPage() {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpMatched, setOtpMatched] = useState(false);

  const [actualOtp, setActualOtp] = useState("");
  const [password, setPassword] = useState("");
  const [cnfPassword, setCnfPassword] = useState("");
  const [cnfUnMatched, setCnfUnMatched] = useState(false);
  const [passMatched, setPassMatched] = useState(false);

  let navigate = useNavigate();

  const reqOtp = async () => {
    if (!username || !email) {
      flashError("Enter the details");
      return;
    }
    setOtp("");
    let url = `${
      import.meta.env.VITE_API_BACKEND_URL
    }genrateOtp/${username}/${email}`;

    setLoading(true);
    let res = await axios.get(url, {
      withCredentials: true,
    });

    setLoading(false);
    if (res.data.success && res.data.isOTPsent) {
      flashSuccess("Otp Sent to your email");

      setActualOtp(res.data.otp);

      setOtpSent(true);
    } else if (res.data.userNotExist) {
      flashError("Given details are incorrect");
    } else if (res.data.error) {
      flashError("Error" + res.data.msg);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      flashError("Enter the otp");
      return;
    }

    if (otp == actualOtp) {
      flashSuccess("Otp verified 😀");
      setOtpMatched(true);
      setOtpSent(false);
    } else {
      flashError("Otp Not Matched");
    }
  };

  const handelPassChange = (e) => {
    let { name, value } = e.target;
    if (name == "password") {
      setPassword(value);
    } else if (name == "cnfPassword") setCnfPassword(value);
  };

  const updatePassword = async () => {
    if (passMatched) {
      let url = `${import.meta.env.VITE_API_BACKEND_URL}updatePassWord`;

      let formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);

      setLoading(true);
      let res = await axios.post(url, formData, {
        withCredentials: true,
      });

      setLoading(false);
      if (res.data.success) {
        flashSuccess("password updated");
        navigate("/login", {
          state: { printSuccess: true, msg: "password updated login now" },
        });
      } else if (res.data.userNotExist) {
        flashError("Given details are incorrect");
      } else if (res.data.error) {
        flashError("Internal server error");
        // flashError("Error" + res.data.msg);
      }
    }
  };
  return (
    <>
      {loading ? (
        <>
          <div className="absolute z-40 top-0 left-0 w-screen h-screen bg-black opacity-30"></div>
          <div className="absolute z-50 top-0 left-0 w-screen h-screen flex justify-center items-center">
            <p className="text-3xl font-bold text-white">Please Wait...</p>
          </div>
        </>
      ) : null}
      <div className="flex flex-col mx-auto my-auto w-[99%] sm:w-[80%] md:w-[60%] lg:w-[50%] xl:w-[40%] shadow-md p-3 pb-2  mt-3 rounded-md">
        <h1 className="text-[1.2rem] md:text-2xl font-bold">
          🌐 Reset your password here !{" "}
        </h1>
        {/* username */}
        <div className="flex flex-col mt-3">
          <label htmlFor="username" className="form-label font-semibold">
            Username
          </label>
          <input
            placeholder="username"
            disabled={otpSent || otpMatched}
            type="text"
            name="username"
            id="username"
            value={username}
            className="form-control"
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        {/* email */}
        <div className="flex flex-col mt-3">
          <label htmlFor="email" className="form-label font-semibold">
            Email
          </label>
          <input
            placeholder="email"
            type="email"
            name="email"
            id="username"
            disabled={otpSent || otpMatched}
            value={email}
            className="form-control"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {!otpMatched ? (
          <button
            onClick={reqOtp}
            disabled={otpSent}
            className="p-2 bg-green-500 hover:bg-blue-600 text-white font-bold w-fit mb-2 rounded-md mt-3"
          >
            Next
          </button>
        ) : null}

        {otpSent ? (
          <>
            {/* otp */}
            <div className="flex flex-col mt-1">
              <label htmlFor="otp" className="form-label font-semibold">
                Enter Otp
              </label>
              <input
                type="text"
                name="otp"
                id="otp"
                placeholder="otp"
                value={otp}
                className="form-control"
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={verifyOtp}
                className="p-2 bg-green-500 hover:bg-blue-600 text-white font-bold w-fit rounded-md mt-3"
              >
                Verify
              </button>
              <button
                onClick={reqOtp}
                className="p-2 bg-orange-500 hover:bg-blue-600 text-white font-bold w-fit rounded-md mt-3"
              >
                Resend
              </button>
              <button
                onClick={() => {
                  setOtpSent(false);
                }}
                className="p-2 bg-orange-500 hover:bg-blue-600 text-white font-bold w-fit rounded-md mt-3"
              >
                Edit details
              </button>
            </div>
          </>
        ) : null}

        {otpMatched ? (
          <>
            {/* password */}
            <div className="flex flex-col mt-3">
              <label htmlFor="password" className="form-label font-semibold">
                Password
              </label>
              <input
                placeholder="password"
                type="text"
                name="password"
                id="password"
                value={password}
                className="form-control"
                onChange={handelPassChange}
                onKeyUp={() => {
                  if (password == "" || cnfPassword == "") {
                    setCnfUnMatched(false);
                    setPassMatched(false);
                  } else if (cnfPassword != password) {
                    setCnfUnMatched(true);
                    setPassMatched(false);
                  } else if (cnfPassword === password) {
                    setCnfUnMatched(false);
                    setPassMatched(true);
                  }
                }}
              />
            </div>{" "}
            {/* cnfPassword */}
            <div className="flex flex-col mt-3">
              <label htmlFor="cnfPassword" className="form-label font-semibold">
                Confirm Password
              </label>
              <input
                placeholder="confirm password"
                type="password"
                name="cnfPassword"
                id="cnfPassword"
                value={cnfPassword}
                className="form-control"
                onChange={handelPassChange}
                onKeyUp={() => {
                  if (password == "" || cnfPassword == "") {
                    setCnfUnMatched(false);
                    setPassMatched(false);
                  } else if (cnfPassword != password) {
                    setCnfUnMatched(true);
                    setPassMatched(false);
                  } else if (cnfPassword === password) {
                    setCnfUnMatched(false);
                    setPassMatched(true);
                  }
                }}
              />
              {cnfUnMatched ? (
                <div className="text-red-500 font-bold text-sm mt-2">
                  Confirm password not matched
                </div>
              ) : passMatched ? (
                <div className="text-green-600 font-bold text-sm mt-2">
                  Confirm password matched
                </div>
              ) : null}
            </div>
            <button
              onClick={updatePassword}
              className="p-2 bg-green-500 hover:bg-blue-600 text-white font-bold w-fit mb-2 rounded-md mt-3"
            >
              Update
            </button>
          </>
        ) : null}
      </div>
    </>
  );
}

export default ForgetPassPage;
