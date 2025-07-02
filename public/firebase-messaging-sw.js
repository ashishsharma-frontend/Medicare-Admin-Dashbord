// public/firebase-messaging-sw.js

importScripts(
  "https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js"
);

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlPpt4AD3pYpM_9kO8lJmu5rubwyvFtAQ",
  authDomain: "healthcare-ecosystem.firebaseapp.com",
  projectId: "healthcare-ecosystem",
  storageBucket: "healthcare-ecosystem.firebasestorage.app",
  messagingSenderId: "964053573791",
  appId: "1:964053573791:web:a00deebd44c61fb8f882aa",
  measurementId: "G-890702JPD7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.svg", // Optional: Custom notification icon
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
