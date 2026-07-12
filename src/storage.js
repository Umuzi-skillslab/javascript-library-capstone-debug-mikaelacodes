// Storage - JSON and LocalStorage operations, extracted from ui.js
// Still contains the original starter-code errors; fixed in a later pass.

import { books, members, setBooks, setMembers } from "./library.js";

// Function missing JSON operations
export function exportLibraryData() {
    // Should convert to JSON
    // Missing: error handling

    var data = {
        books: books,
        members: members
    };

    // Missing: JSON.stringify
    return data;
}

// Function missing JSON parsing
export function importLibraryData(jsonString) {
    // Missing: try-catch for JSON.parse
    // Missing: validation of parsed data

    var data = JSON.parse(jsonString);

    setBooks(data.books);
    setMembers(data.members);
}

// LocalStorage functions with errors
export function saveToLocalStorage() {
    // Missing: error handling for localStorage
    // Missing: JSON.stringify

    localStorage.setItem("libraryBooks", books);
    localStorage.setItem("libraryMembers", members);
}

export function loadFromLocalStorage() {
    // Missing: null check
    // Missing: JSON.parse
    // Missing: error handling

    var booksData = localStorage.getItem("libraryBooks");
    var membersData = localStorage.getItem("libraryMembers");

    setBooks(booksData);
    setMembers(membersData);
}
