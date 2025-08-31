let birthdays = [];

// Listen for updates from the main app
self.addEventListener("message", (event) => {
  if (event.data.type === "updateBirthdays") {
    birthdays = event.data.birthdays;
    console.log("🎂 Birthdays updated in SW:", birthdays);
  }
});

// Helper: format date YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Schedule notifications daily
function checkBirthdaysAndNotify() {
  const now = new Date();
  const today = formatDate(now);

  birthdays.forEach((b) => {
    if (!b.date) return;

    const bday = new Date(b.date);
    const month = bday.getMonth();
    const day = bday.getDate();

    // Create current year date
    const thisYearBday = new Date(now.getFullYear(), month, day);

    // Adjust for passed birthdays (schedule for next year)
    if (thisYearBday < now) {
      thisYearBday.setFullYear(now.getFullYear() + 1);
    }

    const diffDays = Math.floor(
      (thisYearBday - new Date(today)) / (1000 * 60 * 60 * 24)
    );

    let notifyTime = null;
    let notifyMsg = "";

    if (b.reminder === "same" && diffDays === 0) {
      notifyTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);
      notifyMsg = `🎉 Today is ${b.name}'s Birthday!`;
    } else if (b.reminder === "dayBefore" && diffDays === 1) {
      notifyTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
      notifyMsg = `⏰ Tomorrow is ${b.name}'s Birthday!`;
    } else if (b.reminder === "weekBefore" && diffDays === 7) {
      notifyTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
      notifyMsg = `📅 ${b.name}'s Birthday is in 1 week!`;
    }

    if (notifyTime && now.getTime() < notifyTime.getTime()) {
      const delay = notifyTime.getTime() - now.getTime();
      setTimeout(() => {
        self.registration.showNotification("Birthday Reminder", {
          body: notifyMsg,
          icon: "https://cdn-icons-png.flaticon.com/512/869/869636.png"
        });
      }, delay);
    }
  });
}

// Run check once when SW starts
checkBirthdaysAndNotify();

// Run daily at midnight
setInterval(() => {
  checkBirthdaysAndNotify();
}, 24 * 60 * 60 * 1000);

// Required for notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
