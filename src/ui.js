// Library UI - DOM Manipulation

import { books, members, borrowBook, findBookByISBN, Book, Member, PremiumMember, LibraryStats, setBooks } from "./library.js";
import { saveToLocalStorage, loadFromLocalStorage } from "./storage.js";

let catalogueContainer;
let searchInput;
let filterDropdown;

export function initializeUI() {
    catalogueContainer = document.querySelector("#catalogue-list");
    searchInput = document.getElementById("search");
    filterDropdown = document.querySelector("#filter-category");

    if (!catalogueContainer || !searchInput || !filterDropdown) {
        console.error("initializeUI: required DOM elements not found");
        return;
    }

    setupEventListeners();
    loadCatalogue();
}

async function loadCatalogue() {
    const loadedFromStorage = loadFromLocalStorage();

    if (!loadedFromStorage) {
        await loadSeedData();
    }

    renderBookCatalogue(books);
    renderMemberList();
    updateStatisticsDisplay();
}

async function loadSeedData() {
    try {
        const response = await fetch("data/sample-books.json");
        const seedBooks = await response.json();

        setBooks(seedBooks.map((entry) => {
            const book = new Book(entry.isbn, entry.title, entry.author, entry.year, entry.copies);
            book.category = entry.category;
            return book;
        }));

        saveToLocalStorage();
    } catch (error) {
        console.error(`loadSeedData failed: ${error.message}`);
    }
}

function renderMemberList() {
    const memberListContainer = document.getElementById("member-list");
    if (!memberListContainer) {
        return;
    }

    memberListContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();

    for (const member of members) {
        const memberRow = document.createElement("div");
        memberRow.className = "member-row";
        memberRow.dataset.memberId = member.id;

        memberRow.innerHTML = `
            <span class="member-name">${member.name}</span>
            <span class="member-id">ID: ${member.id}</span>
            <span class="member-email">${member.email}</span>
            <span class="member-borrowed">${member.borrowedBooks.length} borrowed</span>
        `;

        fragment.appendChild(memberRow);
    }

    memberListContainer.appendChild(fragment);
}

function setupEventListeners() {
    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("keyup", handleSearchKeyup);

    filterDropdown.addEventListener("change", handleFilterChange);

    const borrowForm = document.getElementById("borrow-form");
    if (borrowForm) {
        borrowForm.addEventListener("submit", handleBorrowSubmit);
    }

    catalogueContainer.addEventListener("click", handleBookClick);

    const nav = document.querySelector("nav");
    if (nav) {
        nav.addEventListener("click", handleNavClick);
    }
}

export function handleNavClick(event) {
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

export function renderBookCatalogue(bookList) {
    if (!catalogueContainer) {
        return;
    }

    catalogueContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();

    for (const book of bookList) {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        bookCard.dataset.isbn = book.isbn;

        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Available: ${book.availableCopies}</p>
        `;

        fragment.appendChild(bookCard);
    }

    catalogueContainer.appendChild(fragment);
}

export function handleBorrowSubmit(event) {
    event.preventDefault();

    const memberIdInput = document.getElementById("member-id");
    const isbnInput = document.getElementById("isbn");

    if (!memberIdInput || !isbnInput) {
        return;
    }

    const memberId = memberIdInput.value.trim();
    const isbn = isbnInput.value.trim();

    if (!memberId || !isbn) {
        alert("Please enter both a member ID and an ISBN.");
        return;
    }

    const success = borrowBook(memberId, isbn);

    if (success) {
        alert("Book borrowed successfully");
        renderBookCatalogue(books);
        renderMemberList();
        updateStatisticsDisplay();
        saveToLocalStorage();
    } else {
        alert("Unable to borrow this book. Check the member ID and ISBN.");
    }

    event.target.reset();
}

export function handleBookClick(event) {
    const bookCard = event.target.closest(".book-card");
    if (!bookCard) {
        return;
    }

    displayBookDetails(bookCard.dataset.isbn);
}

export function handleSearchKeyup(event) {
    if (event.key === "Escape") {
        searchInput.value = "";
        renderBookCatalogue(books);
    }
}

export function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const results = books.filter((book) => book.title.toLowerCase().includes(searchTerm));

    renderBookCatalogue(results);
}

export function handleFilterChange() {
    const selectedCategory = filterDropdown.value;

    const filtered = selectedCategory === "all"
        ? books
        : books.filter((book) => book.category === selectedCategory);

    renderBookCatalogue(filtered);
}

export function displayBookDetails(isbn) {
    const book = findBookByISBN(isbn);
    const detailsContainer = document.getElementById("book-details");

    if (!book || !detailsContainer) {
        return;
    }

    detailsContainer.innerHTML = `
        <div class="book-details">
            <h2>${book.title}</h2>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn}</p>
            <p><strong>Year:</strong> ${book.year}</p>
        </div>
    `;
}

export function updateStatisticsDisplay() {
    const totalBooksEl = document.querySelector(".total-books");
    const totalMembersEl = document.querySelector(".total-members");
    const booksBorrowedEl = document.querySelector(".books-borrowed");

    if (!totalBooksEl || !totalMembersEl || !booksBorrowedEl) {
        return;
    }

    LibraryStats.updateStats();

    totalBooksEl.textContent = LibraryStats.totalBooks;
    totalMembersEl.textContent = LibraryStats.totalMembers;
    booksBorrowedEl.textContent = books.reduce((sum, book) => sum + book.checkedOut.length, 0);
}

export function createMemberForm() {
    const formContainer = document.getElementById("member-form");
    if (!formContainer) {
        return;
    }

    const form = document.createElement("form");

    const nameLabel = document.createElement("label");
    nameLabel.htmlFor = "name";
    nameLabel.textContent = "Full name";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "name";
    nameInput.placeholder = "Full name";
    nameInput.required = true;

    const emailLabel = document.createElement("label");
    emailLabel.htmlFor = "email";
    emailLabel.textContent = "Email address";

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "email";
    emailInput.placeholder = "Email address";
    emailInput.required = true;

    const membershipLabel = document.createElement("label");
    membershipLabel.htmlFor = "membership-type";
    membershipLabel.textContent = "Membership type";

    const membershipSelect = document.createElement("select");
    membershipSelect.id = "membership-type";
    membershipSelect.innerHTML = `
        <option value="standard">Standard</option>
        <option value="premium">Premium</option>
    `;

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Add Member";

    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(emailLabel);
    form.appendChild(emailInput);
    form.appendChild(membershipLabel);
    form.appendChild(membershipSelect);
    form.appendChild(submitButton);
    form.addEventListener("submit", handleMemberFormSubmit);

    formContainer.appendChild(form);
}

export function handleMemberFormSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const membershipTypeInput = document.getElementById("membership-type");

    if (!nameInput || !emailInput || !nameInput.value.trim() || !emailInput.value.trim()) {
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const membershipType = membershipTypeInput ? membershipTypeInput.value : "standard";

    const newMemberId = String(members.length + 1);
    const newMember = membershipType === "premium"
        ? new PremiumMember(newMemberId, name, email)
        : new Member(newMemberId, name, email, membershipType);
    members.push(newMember);

    event.target.reset();
    renderMemberList();
    updateStatisticsDisplay();
}

document.addEventListener("DOMContentLoaded", () => {
    initializeUI();
    createMemberForm();
});
