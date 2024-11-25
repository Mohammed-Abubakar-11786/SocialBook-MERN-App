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
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = "Background Message Title";
  const notificationOptions = {
    body: "Background Message body.",
    icon: "https://www.gstatic.com/mobilesdk/240501_mobilesdk/firebase_28dp.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
