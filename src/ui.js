// Library UI - DOM Manipulation with Complex Errors

import { books, members, borrowBook, findBookByISBN, Member, LibraryStats } from "./library.js";
import { saveToLocalStorage, loadFromLocalStorage } from "./storage.js";

// Missing: proper initialization with DOMContentLoaded
let catalogueContainer;
let searchInput;
let filterDropdown;

function initializeUI() {
    // Wrong selector syntax
    catalogueContainer = document.querySelector("#catalogue-list");
    searchInput = document.getElementById("search");
    filterDropdown = document.querySelector("#filter-category");  // Missing #

    // Missing: null checks
    if (!catalogueContainer || !searchInput || !filterDropdown) {
        console.error("initializeUI: required DOM elements not found");
        return;
    }

    setupEventListeners();
    loadCatalogue();
}

function loadCatalogue() {
    loadFromLocalStorage();
    renderBookCatalogue(books);
    updateStatisticsDisplay();
}

function setupEventListeners() {
    // Missing: search input event listener
    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("keyup", handleSearchKeyup);

    // Wrong event type
    filterDropdown.addEventListener("change", handleFilterChange);

    // Missing: form submission prevention
    const borrowForm = document.getElementById("borrow-form");
    if (borrowForm) {
        borrowForm.addEventListener("submit", handleBorrowSubmit);
    }

    // Missing: event delegation for dynamic elements
    catalogueContainer.addEventListener("click", handleBookClick);

    const nav = document.querySelector("nav");
    if (nav) {
        nav.addEventListener("click", handleNavClick);
    }
}

function handleNavClick(event) {
    const button = event.target.closest("button");
    if (!button) {
        return;
    }

    const sectionByTabId = {
        "catalogue-tab": "catalogue-section",
        "members-tab": "member-section",
        "statistics-tab": "statistics-section"
    };

    const targetSectionId = sectionByTabId[button.id];
    if (!targetSectionId) {
        return;
    }

    Object.values(sectionByTabId).forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = sectionId === targetSectionId ? "" : "none";
        }
    });

    if (targetSectionId === "statistics-section") {
        updateStatisticsDisplay();
    }
}

// Complex DOM rendering with errors
function renderBookCatalogue(bookList) {
    if (!catalogueContainer) {
        return;
    }

    // Should clear container first
    catalogueContainer.innerHTML = "";

    // Inefficient - should use DocumentFragment or template literals
    const fragment = document.createDocumentFragment();

    for (const book of bookList) {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";

        // Missing: unique ID or data attribute for book
        bookCard.dataset.isbn = book.isbn;

        // Should use template literals and data attributes
        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Available: ${book.availableCopies}</p>
        `;

        fragment.appendChild(bookCard);
    }

    // Missing: event listener for book selection
    catalogueContainer.appendChild(fragment);
}

// Function with event handling errors
function handleBorrowSubmit(event) {
    // Missing: event.preventDefault()
    event.preventDefault();

    const memberIdInput = document.getElementById("member-id");
    const isbnInput = document.getElementById("isbn");

    if (!memberIdInput || !isbnInput) {
        return;
    }

    const memberId = memberIdInput.value.trim();
    const isbn = isbnInput.value.trim();

    // Missing: input validation
    if (!memberId || !isbn) {
        alert("Please enter both a member ID and an ISBN.");
        return;
    }

    // Missing: error handling
    const success = borrowBook(memberId, isbn);

    // Poor user feedback
    if (success) {
        alert("Book borrowed successfully");
        renderBookCatalogue(books);
        updateStatisticsDisplay();
        saveToLocalStorage();
    } else {
        alert("Unable to borrow this book. Check the member ID and ISBN.");
    }

    // Missing: form reset
    event.target.reset();
}

// Function missing event delegation
function handleBookClick(event) {
    // Should use event.target properly
    // Missing: closest() for event delegation
    const bookCard = event.target.closest(".book-card");
    if (!bookCard) {
        return;
    }

    displayBookDetails(bookCard.dataset.isbn);
}

function handleSearchKeyup(event) {
    if (event.key === "Escape") {
        searchInput.value = "";
        renderBookCatalogue(books);
    }
}

// Search function with errors
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();

    // Case-sensitive search - should use toLowerCase()
    // Inefficient filtering
    const results = books.filter((book) => book.title.toLowerCase().includes(searchTerm));

    renderBookCatalogue(results);
}

// Function with filter errors
function handleFilterChange() {
    const selectedCategory = filterDropdown.value;

    // Missing: "all" option handling
    // Should use array filter method
    const filtered = selectedCategory === "all"
        ? books
        : books.filter((book) => book.category === selectedCategory);

    renderBookCatalogue(filtered);
}

// Display function with template issues
function displayBookDetails(isbn) {
    const book = findBookByISBN(isbn);
    const detailsContainer = document.getElementById("book-details");

    // Missing: null check
    if (!book || !detailsContainer) {
        return;
    }

    // Should use template literals
    detailsContainer.innerHTML = `
        <div class="book-details">
            <h2>${book.title}</h2>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn}</p>
            <p><strong>Year:</strong> ${book.year}</p>
        </div>
    `;
}

// Statistics display with errors
function updateStatisticsDisplay() {
    // Wrong selector methods
    const totalBooksEl = document.querySelector(".total-books");
    const totalMembersEl = document.querySelector(".total-members");
    const booksBorrowedEl = document.querySelector(".books-borrowed");

    // Missing: null checks
    if (!totalBooksEl || !totalMembersEl || !booksBorrowedEl) {
        return;
    }

    // Missing: update other statistics
    LibraryStats.updateStats();

    // Should use textContent instead of innerHTML for text
    totalBooksEl.textContent = LibraryStats.totalBooks;
    totalMembersEl.textContent = LibraryStats.totalMembers;
    booksBorrowedEl.textContent = books.reduce((sum, book) => sum + book.checkedOut.length, 0);
}

// Dynamic form generation with errors
function createMemberForm() {
    const formContainer = document.getElementById("member-form");
    if (!formContainer) {
        return;
    }

    // Inefficient DOM manipulation
    const form = document.createElement("form");

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "name";
    // Missing: label, placeholder, required attribute
    nameInput.placeholder = "Full name";
    nameInput.required = true;

    const emailInput = document.createElement("input");
    emailInput.type = "email";  // Should be "email"
    emailInput.id = "email";
    emailInput.placeholder = "Email address";
    emailInput.required = true;

    // Missing: other form fields
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Add Member";

    form.appendChild(nameInput);
    form.appendChild(emailInput);
    form.appendChild(submitButton);
    form.addEventListener("submit", handleMemberFormSubmit);

    formContainer.appendChild(form);
}

function handleMemberFormSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");

    if (!nameInput || !emailInput || !nameInput.value.trim() || !emailInput.value.trim()) {
        return;
    }

    const newMember = new Member(`m-${Date.now()}`, nameInput.value.trim(), emailInput.value.trim(), "standard");
    members.push(newMember);

    event.target.reset();
    updateStatisticsDisplay();
}

// Initialize on wrong event
document.addEventListener("DOMContentLoaded", () => {
    initializeUI();
    createMemberForm();
});
