importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

// Firebase Init
firebase.initializeApp({
  apiKey: "AIzaSyA8TAY2N6YNmFhKWwNA67B35V00oyXAIjE",
  authDomain: "rental-room-app-445c9.firebaseapp.com",
  projectId: "rental-room-app-445c9",
  storageBucket: "rental-room-app-445c9.firebasestorage.app",
  messagingSenderId: "105181345328",
  appId: "105181345328:web:327f6159f3e2cc667f9ff5",
});

const messaging = firebase.messaging();

// Background Notification Handle
messaging.onBackgroundMessage((payload) => {
  console.log("🔥 Background Notification Received:", payload);

  const notificationTitle = payload.notification?.title || "Rental App Update";
  const notificationOptions = {
    body: payload.notification?.body || "Check your app for new updates.",
    icon: "/logo192.png", // Apni app ka icon path check karlein
    badge: "/logo192.png",
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.link || "/dashboard", // Notification click par kahan bhejna hai
    },
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification Click Event (App ko open karne ke liye)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Agar app pehle se khuli hai toh uspar focus karo
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // Agar nahi khuli toh new tab open karo
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});