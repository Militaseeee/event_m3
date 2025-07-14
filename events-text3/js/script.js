import { getEvents, getRoles } from "./services";
import {  setListeners } from "./form";
import { renderEvents,  updateAvailableBooksCount } from "./booksTable";
import {  navigate } from "./navigate";

export let counterId = 0;

// INIT APP
export async function initApp() {
  console.log("🚀 initApp executed from script.js");

  const events = await getEvents();

  if (events.length > 0) {
    const lastBook = events[events.length - 1];
    counterId = Number(lastBook.id) + 1;
  } else {
    counterId = 1;
  }

  renderEvents(events);
  updateAvailableBooksCount(events);
  setListeners();
}

// Function to check if the user is authenticated
export function isAuth() {
  const result = localStorage.getItem("Auth") || null;
  const resultBool = result === 'true'
  return resultBool;
}

// Setup the login form
export async function setupLoginForm() {
  
  const roles = await getRoles();
  const form = document.getElementById("login");

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = document.getElementById("user").value;
    const pass = document.getElementById("password").value

    let userVal = false;
    roles.forEach((showRole) => {
      const userEmail = showRole.email;
      const psw = showRole.password;
      
      if (email === userEmail && pass === psw) {
          localStorage.setItem("Auth", "true");
          localStorage.setItem("UserData", JSON.stringify(showRole));
          navigate("/home");
          userVal = true;
        } 
    });
    if (!userVal){
      alert("username or password is incorrect");
    }
  });
}

// Sign out
const buttonCloseSession = document.getElementById("logout");
buttonCloseSession.addEventListener("click", () => {
  localStorage.setItem("Auth", "false");
  localStorage.removeItem("UserData");
  navigate("/login");
});

// Hide the entire action column (header + cells)
export function hideActionColumn() {
  const th = document.getElementById("actionHide");
  if (th) th.style.display = "none";

  // Find the index of the stock column
  const columnIndex = [...th.parentElement.children].indexOf(th);

  // Hide each <td> at that same position in the <tbody>
  const rows = document.querySelectorAll("#eventTableBody tr");
  rows.forEach((row) => {
    const cells = row.children;
    if (cells[columnIndex]) {
      cells[columnIndex].style.display = "none";
    }
  });
}

// SPA Navigation
document.body.addEventListener("click", (e) => {
  if (e.target.closest("[data-link]")) {
    e.preventDefault();
    const path = e.target.closest("[data-link]").getAttribute("href");
    navigate(path);
  }
});

window.addEventListener("popstate", () => {
  navigate(location.pathname);
});

// navigate(location.pathname);
const initialPath = isAuth() ? location.pathname : "/login";
navigate(initialPath);