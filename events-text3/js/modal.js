import { getEvents } from "./services";
import { formatDateInput } from "./form";

// Function that opens the edit modal and loads the book data
export async function openModalEdit(id) {
    const events = await getEvents();
    const event = events.find((u) => u.id == id); // Buscamos el libro con el ID especificado
    if (!event) return;

    // We load the book values into the form
    document.getElementById("eventsId").value = event.id;
    document.getElementById("name").value = event.name;
    document.getElementById("description").value = event.description;
    document.getElementById("capacity").value = event.capacity;
    document.getElementById("dateOfEntry").value=formatDateInput(event.dateOfEntry);

    // We changed the title of the modal to "Edit event"
    document.getElementById("modalTitle").textContent = "Edit event";
    document.getElementById("bookModal").style.display = "flex";
}

// Function that closes the modal and clears the form
export function closeModal() {
    const modal = document.getElementById("bookModal");
    modal.style.display = "none";

    // Clears the form when it is closed
    const form = document.getElementById("eventForm");
    if (form) {
        form.reset();
        document.getElementById("eventsId").value = ""; // Vaciamos el campo de ID
        document.getElementById("capacity").value = ""; // ⚠ si tienes un campo oculto de isbn
    }
}