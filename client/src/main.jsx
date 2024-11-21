import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ChatWindow from "./pages/ChatWindow.jsx";
import GroupChat from "./pages/GroupChat.jsx";
import ChatLayout from "./layouts/ChatLayout.jsx";
import HomeLayout from "./layouts/HomeLayout.jsx";
import Home from "./pages/Home.jsx";
import Signup from "./components/Signup.jsx";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store.js";
import { PersistGate } from "redux-persist/integration/react";
import AuthLayout from "./layouts/AuthLayout.jsx";
import Login from "./components/Login.jsx";
import FlashMessage from "./components/FlashMessage.jsx";
import NewPostForm from "./components/NewPostForm.jsx";
import NewStoryForm from "./components/NewStoryForm.jsx";
import SignUpLayout from "./layouts/SignUpLayout.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AllUsers from "./components/adminComponenets/AllUsers.jsx";
import AllPosts from "./components/adminComponenets/AllPosts.jsx";
import AllStories from "./components/adminComponenets/AllStories.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import ForgetPassPage from "./pages/ForgetPassPage.jsx";
// import router from "./routes/index.js";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/forgetPass",
        element: (
          <>
            <SignUpLayout>
              <ForgetPassPage />
            </SignUpLayout>
          </>
        ),
      },
      {
        path: "admin/allUsers",
        element: (
          <SignUpLayout>
            {" "}
            <AdminPage>
              <AllUsers />
            </AdminPage>
          </SignUpLayout>
        ),
      },
      {
        path: "admin/allPosts",
        element: (
          <SignUpLayout>
            {" "}
            <AdminPage>
              <AllPosts />
            </AdminPage>
          </SignUpLayout>
        ),
      },
      {
        path: "admin/allStories",
        element: (
          <SignUpLayout>
            {" "}
            <AdminPage>
              <AllStories />
            </AdminPage>
          </SignUpLayout>
        ),
      },
      {
        path: "",
        element: (
          <HomeLayout>
            {" "}
            <Home />
          </HomeLayout>
        ),
      },
      {
        path: "/login",
        element: (
          <>
            <HomeLayout>
              {" "}
              <Home />
              <Login />
            </HomeLayout>
          </>
        ),
      },
      {
        path: "/signup",
        element: (
          <SignUpLayout>
            {" "}
            <Signup />
          </SignUpLayout>
        ),
      },
      {
        path: "/newPostForm",
        element: (
          <>
            <AuthLayout>
              <HomeLayout>
                {" "}
                <NewPostForm />
              </HomeLayout>
            </AuthLayout>
          </>
        ),
      },
      {
        path: "chatWindow",
        element: (
          <>
            <AuthLayout>
              <HomeLayout>
                {" "}
                <ChatWindow />
              </HomeLayout>
            </AuthLayout>
          </>
        ),
      },
      {
        path: "/chatTo/:userID",
        element: (
          <>
            <AuthLayout>
              <HomeLayout>
                {" "}
                <ChatWindow />
              </HomeLayout>
            </AuthLayout>
          </>
        ),
      },
      {
        path: "newStory",
        element: (
          <>
            <AuthLayout>
              <HomeLayout>
                {" "}
                <NewStoryForm />
              </HomeLayout>
            </AuthLayout>
          </>
        ),
      },
      {
        path: "groupChat",
        element: (
          <>
            <AuthLayout>
              <HomeLayout>
                <GroupChat />
              </HomeLayout>
            </AuthLayout>
          </>
        ),
      },
      {
        path: "*",
        element: (
          <>
            <HomeLayout>
              {" "}
              <PageNotFound />
            </HomeLayout>
          </>
        ),
      },
    ],
  },
]);

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: (
//       <SplHomeLay>
//         {" "}
//         <Home />
//       </SplHomeLay>
//     ),
//   },
//   {
//     path: "chatWindow",
//     element: (
//       <>
//         <ChatLayout>
//           {" "}
//           <ChatWindow />
//         </ChatLayout>
//       </>
//     ),
//   },
//   {
//     path: "/chatTo/:userID",
//     element: (
//       <>
//         <ChatLayout>
//           {" "}
//           <ChatWindow />
//         </ChatLayout>
//       </>
//     ),
//   },
// ]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
