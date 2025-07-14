import { getEvents, deleteEvent, updateEvent } from "./services";
import { openModalEdit } from "./modal";

// Function to render the books table
// Render users
export function renderEvents(events) {
    const tbody = document.getElementById("eventTableBody");
    if (!tbody) return; // Si no existe el tbody, salimos de la función

    tbody.innerHTML = "";

    // We get the current role
    const userData = JSON.parse(localStorage.getItem("UserData"));
    const isAdmin = userData && userData.role === "Admin";

    // We go through the list of books
    events.forEach((event) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="./assets/img/concert.jpeg" alt="Avatar" /></td>
            <td>${event.name}</td>
            <td>${event.description}</td>
            <td>${event.capacity}</td>
            <td>${event.dateOfEntry}</td>
            <td>
                ${
                    isAdmin
                        ? (Array.isArray(event.borrowedBy) && event.borrowedBy.length === 0
                            ? `<span style="color:green;">Available</span>`
                            : `<span style="color:red;">sold out</span>`)
                        : (Array.isArray(event.borrowedBy) && event.borrowedBy.length === 0
                            ? `<button class="borrow-btn style-borrow" data-id="${event.id}">Borrow</button>`
                            : "Borrowed")
                }
            </td>
            ${isAdmin ? `
                <td>
                    <button class="edit-btn" data-id="${event.id}">
                        <img src="./assets/icons/pencil.png" alt="Edit" class="edit-icon"/>
                    </button>
                    <button class="delete-btn" data-id="${event.id}">
                        <img src="./assets/icons/trash.png" alt="Delete" class="delete-icon"/>
                    </button>
                </td>
            ` : ""}
            `;
        tbody.appendChild(row); // We add the row to the body of the table
    });
    addRowListeners(); // We activate the listeners for the buttons
}

// Function that adds listeners to the buttons in each row
export function addRowListeners() {
    // Listener for edit button
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            openModalEdit(id);
        });
    });

    // Listener for delete button
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (confirm("Are you sure you want to delete this event?")) {
                await deleteEvent(id);
                const events = await getEvents();
                renderEvents(events);
            }
        });
    });

    // Listener for the book loan button
    document.querySelectorAll(".borrow-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {

            const id = btn.dataset.id;
            const userData = JSON.parse(localStorage.getItem("UserData")); // Obtenemos los datos del usuario

            if (!userData) return alert("You must be logged in");
            const events = await getEvents();
            const event = events.find((b) => b.id == id);
            if (!event) return;

            if (event.borrowedBy && event.borrowedBy.length > 0) {
                alert("Event already borrowed!");
                return;
            }

            // We create a new book object updated with the user's name
            const updatedEvent = {
                ...event,
              borrowedBy: [userData.name], // We leave it as an array so that it is compatible with your db.json
            };

            await updateEvent(event.id, updatedEvent); // This must do a PUT or PATCH

            const updatedEvents = await getEvents();
            renderEvents(updatedEvents);
            updateAvailableBooksCount(updatedEvents);
        });
    });
}

// Function that updates the available books counter
export function updateAvailableBooksCount(events) {
    const available = events.filter(event => !event.borrowedBy || event.borrowedBy.length === 0).length;
    const countSpan = document.getElementById("availableCount");
    if (countSpan) countSpan.textContent = available;
}

// Function to configure the search bar
// Search bar logic
export function setupSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", async () => {
        const searchTerm = searchInput.value.toLowerCase();
        const allBooks = await getEvents(); // We get all the books

        // We filter the books whose title matches what we are searching for.
        const filtered = allBooks.filter((event) =>
            event.name.toLowerCase().includes(searchTerm)
        );

        renderEvents(filtered);
    });
}