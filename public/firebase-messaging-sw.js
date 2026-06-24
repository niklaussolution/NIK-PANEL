importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCMGrNMyPp9UaaGj42R7xGd6Z_53iR8eNc",
  authDomain: "niklaushost.firebaseapp.com",
  projectId: "niklaushost",
  storageBucket: "niklaushost.firebasestorage.app",
  messagingSenderId: "936533338093",
  appId: "1:936533338093:web:9d6c0e8fbd5ecfa7c0a9e4",
});

const messaging = firebase.messaging();

// Background push notification handler
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "NIKPanel Alert";
  const body = payload.notification?.body || "You have a new notification";
  self.registration.showNotification(title, {
    body,
    icon: "/assets/icons/logo.png",
    badge: "/assets/icons/logo.png",
    tag: payload.data?.type || "nikpanel",
    data: payload.data || {},
  });
});

// Click on notification → open admin notifications page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const target = "https://panel.niklaussolution.com/admin/notifications";
      for (const client of clientList) {
        if (client.url.includes("panel.niklaussolution.com") && "focus" in client) {
          client.focus();
          client.navigate(target);
          return;
        }
      }
      if (clients.openWindow) clients.openWindow(target);
    })
  );
});
