// Storage - JSON and LocalStorage operations, extracted from ui.js

import { books, members, setBooks, setMembers } from "./library.js";

// Function missing JSON operations
export function exportLibraryData() {
    // Missing: error handling
    try {
        const data = { books, members };
        // Missing: JSON.stringify
        return JSON.stringify(data);
    } catch (error) {
        console.error(`exportLibraryData failed: ${error.message}`);
        return null;
    }
}

// Function missing JSON parsing
export function importLibraryData(jsonString) {
    // Missing: try-catch for JSON.parse
    try {
        const data = JSON.parse(jsonString);

        // Missing: validation of parsed data
        if (!data || !Array.isArray(data.books) || !Array.isArray(data.members)) {
            throw new Error("parsed data is missing books or members arrays");
        }

        setBooks(data.books);
        setMembers(data.members);
        return true;
    } catch (error) {
        console.error(`importLibraryData failed: ${error.message}`);
        return false;
    }
}

// LocalStorage functions with errors
export function saveToLocalStorage() {
    // Missing: error handling for localStorage
    try {
        // Missing: JSON.stringify
        localStorage.setItem("libraryBooks", JSON.stringify(books));
        localStorage.setItem("libraryMembers", JSON.stringify(members));
        return true;
    } catch (error) {
        console.error(`saveToLocalStorage failed: ${error.message}`);
        return false;
    }
}

export function loadFromLocalStorage() {
    try {
        const booksData = localStorage.getItem("libraryBooks");
        const membersData = localStorage.getItem("libraryMembers");

        // Missing: null check
        if (booksData === null || membersData === null) {
            return false;
        }

        // Missing: JSON.parse
        setBooks(JSON.parse(booksData));
        setMembers(JSON.parse(membersData));
        return true;
    } catch (error) {
        // Missing: error handling
        console.error(`loadFromLocalStorage failed: ${error.message}`);
        return false;
    }
}
