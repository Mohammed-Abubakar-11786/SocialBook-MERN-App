import { createSlice } from "@reduxjs/toolkit";

// Define the initial state
const initialState = {
  onlineUsers: [],
};

// Create the slice
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsersData: (state, action) => {
      // console.log(action.payload);
      // delete state.usersData;
      state.usersData = action.payload;
      // delete state.userData;
      // delete state.logedInUsers;
      // delete state.currUser;
      // delete state.onlineUsers;
    },
    updateUsersData: (state, action) => {
      state.usersData = action.payload;
    },
    // updateUsersDataAllPosts: (state, action) => {
    //   state.usersData = action.payload;
    // },
    setOnlineUsers: (state, action) => {
      let isDubli = false;
      state.onlineUsers.forEach((user) => {
        if (user._id === action.payload._id) isDubli = true;
      });
      if (!isDubli) state.onlineUsers.push(action.payload);
    },
    setCurrUser: (state, action) => {
      state.currUser = action.payload;
    },
    setCurrUserAccType: (state, action) => {
      state.currUser = action.payload;
    },
    logoutUser: (state) => {
      localStorage.setItem("token", "");
      state.onlineUsers = state.onlineUsers?.filter(
        (user) => user._id !== state.currUser._id
      );
      delete state.currUser;
    },
  },
});

// Export the actions
export const {
  setUsersData,
  setOnlineUsers,
  setCurrUser,
  logoutUser,
  setCurrUserAccType,
  updateUsersData,
} = userSlice.actions;

// Export the reducer
export default userSlice.reducer;
