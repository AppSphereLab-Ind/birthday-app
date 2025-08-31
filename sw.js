// Service Worker for Birthday Reminder Notifications

// Install
self.addEventListener("install", (event) => {
  console.log("Service Worker installed ✅");
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated ✅");
  return self.clients.claim();
});

// Handle push events (future use if you want server push)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "🎂 Birthday Reminder";
  const options = {
    body: data.body || "You have upcoming birthdays today!",
    icon: "https://cdn-icons-png.flaticon.com/512/2917/2917995.png",
    badge: "https://cdn-icons-png.flaticon.com/512/2917/2917995.png"
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Local daily notifications using setInterval (works only when app/browser is active)
function scheduleLocalNotifications() {
  setInterval(async () => {
    const now = new Date();

    // Load stored birthdays from IndexedDB/localStorage via postMessage
    const allClients = await self.clients.matchAll({ includeUncontrolled: true });
    allClients.forEach(client => {
      client.postMessage({ type: "CHECK_BIRTHDAYS", time: now.toISOString() });
    });

  }, 60 * 60 * 1000); // check every hour
}
scheduleLocalNotifications();

// Listen for messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body } = event.data;
    self.registration.showNotification(title, {
      body: body,
      icon: "https://cdn-icons-png.flaticon.com/512/2917/2917995.png",
      badge: "https://cdn-icons-png.flaticon.com/512/2917/2917995.png"
    });
  }
});
