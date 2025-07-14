import { createEvent, getEvents, updateEvent } from "./services";
import { closeModal } from "./modal";
import { renderEvents } from "./booksTable";
import { navigate } from "./navigate";
import { counterId } from "./script";

// FORM LOGIC
// Main logic of the form
export function setListeners() {
    // We get the necessary DOM elements
    const addBtn = document.getElementById("addEventsBtn");
    const closeBtn = document.querySelector(".close-btn");
    const modal = document.getElementById("bookModal");
    const form = document.getElementById("eventForm");

     // If the add book button exists, we add an event to navigate to the form
    if (addBtn) {
        addBtn.addEventListener("click", () => navigate("/add_book"));
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (modal) {
        window.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Listener to submit the form (create or edit book)
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id = form.eventsId.value;
            let borrowedBy = []; // We initialize the list of users who have lent it

            // If the book already exists (edit mode), we recover its loan status
            if (id) {
                const events = await getEvents();
                const existingBook = events.find((b_books) => b_books.id == id);
                borrowedBy = existingBook?.borrowedBy || []; // We maintain the original state
            }

            // We create the book object with the form data
            const event = {
                "id": id ? id : counterId, // We use the current ID or a new one
                "name": form.name.value,
                "description": form.description.value,
                "capacity": form.capacity.value,
                "dateOfEntry": form.dateOfEntry.value,
                "borrowedBy": borrowedBy,
            };

            // If the ID exists, we update the book; if not, we create a new one.
            // const id = form.eventsId.value;
            if (id) {
                await updateEvent(id, event);
            } else {
                await createEvent(event);
            }

            const events = await getEvents();
            renderEvents(events);
            closeModal();
        });
    }
}

// Function that formats the date to save it in the format: day-month abbreviated-year
export const formatDateToSave = (inputDate) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const [year, month, day] = inputDate.split("-"); // We split the date string
    const monthAbbr = months[parseInt(month, 10) - 1]; // We get the shortened name

    return `${day}-${monthAbbr}-${year}`;
}

// Function that validates that a future date cannot be selected
export function setDateInputValidation() {
    const dateInput = document.getElementById("dateOfEntry");
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0]; // Today's date in "yyyy-mm-dd" format
        dateInput.max = today; // We set the maximum allowed value (today)

        // We listen if a future date is entered
        dateInput.addEventListener("input", () => {
            if (dateInput.value > today) {
                alert("You cannot select a future date");
                dateInput.value = today;
            }
        });
    }
}

// Función que convierte una fecha estilo "dd-Mmm-yyyy" a formato válido para input type="date"
export function formatDateInput(dateStr) {
    setDateInputValidation();
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0]; // para que funcione en inputs type="date"
}
