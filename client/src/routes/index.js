// import App from "./App.jsx";
// import { createBrowserRouter } from "react-router-dom";
// import ChatWindow from "./pages/ChatWindow.jsx";
// import GroupChat from "./pages/GroupChat.jsx";
// import ChatLayout from "./layouts/ChatLayout.jsx";
// import HomeLayout from "./layouts/HomeLayout.jsx";
// import Home from "./pages/Home.jsx";
// import Signup from "./components/Signup.jsx";
// import SplHomeLay from "./layouts/SplHomeLay.jsx";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//     children: [
//       {
//         path: "",
//         element: (
//           <SplHomeLay>
//             {" "}
//             <Home />
//           </SplHomeLay>
//         ),
//       },
//       {
//         path: "/signup",
//         element: (
//           <HomeLayout>
//             {" "}
//             <Signup />
//           </HomeLayout>
//         ),
//       },
//       {
//         path: "chatWindow",
//         element: (
//           <>
//             <ChatLayout>
//               {" "}
//               <ChatWindow />
//             </ChatLayout>
//           </>
//         ),
//       },
//       {
//         path: "/chatTo/:userID",
//         element: (
//           <>
//             <ChatLayout>
//               {" "}
//               <ChatWindow />
//             </ChatLayout>
//           </>
//         ),
//       },
//       {
//         path: "groupChat",
//         element: (
//           <ChatLayout>
//             <GroupChat />
//           </ChatLayout>
//         ),
//       },
//     ],
//   },
// ]);

// export default router;
