importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object

// const firebaseConfig = JSON.parse(
//   import.meta.env.VITE_API_FIREBASE_CREDENTIALS
// );
firebase.initializeApp({
  apiKey: "AIzaSyDHiOLv0UfeLZ9QO6rico3RORrzJvecZ-0",
  authDomain: "socialbook-47b9f.firebaseapp.com",
  projectId: "socialbook-47b9f",
  storageBucket: "socialbook-47b9f.firebasestorage.app",
  messagingSenderId: "841294214845",
  appId: "1:841294214845:web:5ab0f1b278014875aca9d4",
  measurementId: "G-WRX9J9T8YC",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // console.log(
  //   "[firebase-messaging-sw.js] Received background message",
  //   payload
  // );

  if (payload.data.isGroup == "true") {
    // console.log("group");

    const notificationTitle = `🌐 ${payload.data.groupName}`;
    const notificationOptions = {
      body: `New message from ${payload.data.sender}: ${payload.data.msg}`,
      icon: payload.data.groupImg,
      actions: [
        {
          action: "open_chat", // Action identifier
          title: "Open Chat", // Button text
          // icon: "/icons/chat-icon.png", // Optional icon
        },
        {
          action: "ignore", // Action identifier
          title: "Ignore", // Button text
          // icon: "/icons/ignore-icon.png", // Optional icon
        },
      ],
      data: {
        url: `https://socialbook-abu.onrender.com/chatWindow`, // Add any custom data (e.g., URL to navigate)
      },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  } else {
    // console.log("not group");

    const notificationTitle = `🌐 ${payload.data.sender}`;
    const notificationOptions = {
      body: `New message: ${payload.data.msg}`,
      icon: payload.data.senderImg,
      actions: [
        {
          action: "open_chat", // Action identifier
          title: "Open Chat", // Button text
          // icon: "/icons/chat-icon.png", // Optional icon
        },
        {
          action: "ignore", // Action identifier
          title: "Ignore", // Button text
          // icon: "/icons/ignore-icon.png", // Optional icon
        },
      ],
      data: {
        url: `https://socialbook-abu.onrender.com/chatTo/${payload.data.toUser_id}`, // Add any custom data (e.g., URL to navigate)
      },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

// Handle notification actions
self.addEventListener("notificationclick", (event) => {
  // console.log("Notification click received:", event);

  const clickedAction = event.action; // The action identifier
  const notification = event.notification; // The notification object

  if (clickedAction === "open_chat") {
    // Open the chat window page
    event.waitUntil(
      clients.openWindow(notification.data.url) // Opens the specified URL
    );
  } else if (clickedAction === "ignore") {
    // Simply close the notification
    notification.close();
  } else {
    // Default action (e.g., clicking on the body of the notification)
    // notification.close();

    // Open the chat window page
    event.waitUntil(
      clients.openWindow(notification.data.url) // Opens the specified URL
    );
  }
});
