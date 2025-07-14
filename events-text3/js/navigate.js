import { setupSearch } from "./booksTable";
import { formatDateToSave, setDateInputValidation } from "./form";
import { counterId, hideActionColumn, initApp, isAuth, setupLoginForm } from "./script";
import { createEvent, getEvents, updateEvent, createRoles } from "./services";

const routes = {
  "/": "./index.html",
  "/home": "./views/home.html",
  "/login": "./views/login.html",
  "/events": "./views/events.html",
  "/add_book": "./views/add_book.html",
  "/about": "./views/about.html",
  "/available_events": "./views/available_events.html",
  "/my_books": "./views/my_books.html",
  "/register": "./views/register.html",
};
// Main function to load views
export async function navigate(pathname) {

  // Block to replace the values of HTML elements with their respective user role
  const userData = await JSON.parse(localStorage.getItem("UserData"));
  let valRol = false;
  if (userData) {
    document.getElementById("nameUser").textContent = userData.name;
    document.getElementById("role").textContent = userData.role;
  }

  // If the user is not authenticated, we redirect to login
  if( !isAuth()&& location.pathname === '/register'){
    pathname = '/register'
  } else if(!isAuth) {pathname='/login'
    
  }

  const route = routes[pathname];
  if (!route) return console.error("Invalid route");

  // We load the corresponding HTML view
  const html = await fetch(route).then((res) => res.text());
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // We replace the content dynamically
  const newContent = doc.getElementById("content");
  const content = document.getElementById("content");

  content.innerHTML = newContent ? newContent.innerHTML : doc.body.innerHTML;
  history.pushState({}, "", pathname);

  // Show or hide "Add event" button depending on the role
  const linkAddBook = document.getElementById("addBook");
  if (userData && linkAddBook) {
    linkAddBook.style.display = userData.role === "Admin" ? "flex" : "none";
  }

  // Show or hide "Borrow events" link only for Admin
  const borrowedMenu = document.querySelector('[href="/available_events"]');
  if (borrowedMenu) {
    borrowedMenu.style.display = userData?.role === "Admin" ? "flex" : "none";
  }

  // We changed avatar and items according to the role in overviews
  if (pathname === "/home" || pathname === "/events" || pathname === "/add_book" || pathname === "/about" || pathname === "/my_books" || pathname === "/available_events") {
    
    const changeImg = document.getElementById('changePicture');

    if (userData.role === "User") {
      changeImg.src = './assets/img/user.png';
    } else if (userData.role === "Admin") {
      changeImg.src = './assets/img/admin2.png';
    }

    const userBooksLink = document.getElementById("userBooksLink");
    userBooksLink.style.display = userData.role === "User" ? "flex" : "none";
        
  }

  // Special settings for login view
  if (pathname === "/login") {
    const main = document.getElementById('content');
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = "none";
    main.classList.add("login-centered");
    setupLoginForm();

    // Show sidebar if we are not logged in
  } else {
    const main = document.getElementById('content');
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = "flex";
    main.classList.remove("login-centered");
  }

  // We handle the highlighting of the active option of the sidebar
  // Update the .active class in the sidebar
  document.querySelectorAll(".sidebar nav ul li").forEach((li) => {
    const a = li.querySelector("a");
    if (a && a.getAttribute("href") === pathname) {
      li.classList.add("active");
    } else {
      li.classList.remove("active");
    }
  });

  // Special logic for book viewing
  if (pathname === "/events") {
    const changeImg = document.getElementById('changePicture');

    if (userData.role === "User") {
      changeImg.src = './assets/img/user.png';
    } else if (userData.role === "Admin") {
      changeImg.src = './assets/img/admin2.png';
    }

    await initApp()

    setupSearch();

    switch(userData.role){
      case 'Admin':

        const deleteWrapper = document.getElementById('addEventsBtn')
        deleteWrapper.style.display = 'block'

        // Hide the "Borrow" buttons for the admin
        document.querySelectorAll(".borrow-btn").forEach((btn) => {
          btn.style.display = "none";
        });

        break;
      case 'User':

        hideActionColumn();

        // Hide edit and delete buttons
        const editButton = document.querySelectorAll('.edit-btn').forEach(btnEdit => {
          btnEdit.style.display = 'none';
        })
        const deleteButton = document.querySelectorAll('.delete-btn').forEach(deleteBtn => {
          deleteBtn.style.display = 'none';
        })

        const addBtn = document.getElementById('addEventsBtn');
        if (addBtn) addBtn.style.display = 'none';

        const actionDelete = document.getElementById('actionDeleteEvent');
        if (actionDelete) actionDelete.style.display = 'none';
  
        break;
        
      default:
        break
    }
  }

  // Logic for the add book view
  if (pathname === "/add_book") {
    setDateInputValidation(); 

    const form = document.getElementById("addEventForm");
    
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // We created a new book
      const newBook  = {
        "id": counterId,
        "name": form.name.value,
        "description": form.description.value,
        "capacity": form.capacity.value,
        "dateOfEntry": formatDateToSave(form.dateOfEntry.value),
        "borrowedBy": []
      };
      
      await createEvent(newBook);
      navigate("/events");
    });

    const goBackBtn = document.getElementById("goBackBtn");
    if (goBackBtn) {
      goBackBtn.addEventListener("click", () => {
        navigate("/events");
      });
    }
  }

  // Logic for viewing borrowed books (Admin only)
  if (pathname === "/available_events") {
  if (!userData || userData.role !== "Admin") {
    navigate("/home");
    return;
  }

  const borrowedBooksTableBody = document.getElementById("borrowedBooksTableBody");
  if (!borrowedBooksTableBody) return;

  const events = await getEvents();
  const borrowedBooks = events.filter(
    (event) => Array.isArray(event.borrowedBy) && event.borrowedBy.length > 0
  );

  borrowedBooksTableBody.innerHTML = "";

  borrowedBooks.forEach((event) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${event.name}</td>
      <td>${event.description}</td>
      <td>${event.capacity}</td>
      <td>${event.dateOfEntry}</td>
      <td>${event.borrowedBy}</td>
    `;
    borrowedBooksTableBody.appendChild(row);
  });
  }

  // Logic for viewing user's borrowed books
  if (pathname === "/my_books") {
    if (!userData || userData.role !== "User") {
      navigate("/home");
      return;
    }

    const events = await getEvents();
    const userBooks = events.filter(event => 
      Array.isArray(event.borrowedBy) && event.borrowedBy.includes(userData.name)
    );

    const tableBody = document.getElementById("myBorrowedBooksTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    userBooks.forEach(event => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${event.name}</td>
      <td>
        <button class="return-btn" data-id="${event.id}">Return</button>
      </td>
    `;
    tableBody.appendChild(row);
    });

    // Logic for returning a book (visually remove it)
    document.querySelectorAll(".return-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault(); // Prevents unexpected browsing

        const id = btn.dataset.id;
        const events = await getEvents();
        const event = events.find((b_books) => b_books.id == id);
        if (!event) return;
      
        const updatedEvent = {
          ...event,
          borrowedBy: [], // we remove the user
        };
      
        await updateEvent(event.id, updatedEvent);
      
        // Visually delete the row without reloading anything
        btn.closest("tr").remove();
      });
    });

  }

  if (pathname === "/register") {
    const main = document.getElementById('content');
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = "none";
    main.classList.add("login-centered");
  }

  // register.js
    if (pathname === "/register") {

    const roles = document.getElementById("registerForm");

    const psw = document.getElementById("password");
    const pswCon = document.getElementById("confirm_password");
    
    roles.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newUser  = {
        "id": counterId,
        "email": roles.email.value,
        "name": roles.name.value,
        "role": "User",
        "password": roles.password.value,
        "confirm_password": roles.confirm_password.value,
      };

      if (newUser.password !== newUser.confirm_password) {
        alert("The password and password confirmation must be the same.");
        return;
      }
      
      alert("User created successfully! You will be redirected to the login page.");
      await createRoles(newUser);
      navigate("/login");
    });
  }
}