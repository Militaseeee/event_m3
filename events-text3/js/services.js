const BASE_URL = "http://localhost:3000/events";
const BASE_URL_ROLE = "http://localhost:3000/roles"

// Get all events
export async function getEvents() {
    const res = await fetch(BASE_URL);
    return res.json();
}

// Get all roles
export async function getRoles() {
    const res = await fetch(BASE_URL_ROLE);
    return res.json();
}

// Create a new user
export async function createRoles(roles) {
    const res = await fetch(BASE_URL_ROLE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roles),
    });
    return res.json();
}

// Create a new event
export async function createEvent(event) {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
    });
    return res.json();
}

// Update event
export async function updateEvent(id, event) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
    });
    return res.json();
}

// Delete event
export async function deleteEvent(id) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    return res.ok;
}