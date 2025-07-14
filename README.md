📚 Event Management SPA
This is a Single Page Application (SPA) built with HTML, CSS, and Vanilla JavaScript. It allows two types of users to interact with the system: Administrators and Regular Users, each with different permissions.

---

👩‍💼 Administrator Features
An administrator can:

➕ Add new events.
👁️ View all registered events.
📝 Edit existing events.
❌ Delete events.
📋 See which users have booked each event.

Administrators must log in with valid credentials. Their role must be "admin" in the database.

---

🙋 User Features
A regular user can:

📅 View all available events.
✅ Make reservations for events.
📝 Register through the "Register here" link on the login page.
🔐 After successful registration, users are automatically redirected to the login page.

Users cannot create, edit, or delete events.

---

⚙️ Technologies
HTML5
CSS3
JavaScript (Vanilla)
json-server (for local REST API simulation)
