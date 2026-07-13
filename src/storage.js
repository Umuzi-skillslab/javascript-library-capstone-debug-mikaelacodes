// Storage - JSON and LocalStorage operations, extracted from ui.js

import { books, members, setBooks, setMembers, reviveBook, reviveMember } from "./library.js";

export function exportLibraryData() {
    try {
        const data = { books, members };
        return JSON.stringify(data);
    } catch (error) {
        console.error(`exportLibraryData failed: ${error.message}`);
        return null;
    }
}

export function importLibraryData(jsonString) {
    try {
        const data = JSON.parse(jsonString);

        if (!data || !Array.isArray(data.books) || !Array.isArray(data.members)) {
            throw new Error("parsed data is missing books or members arrays");
        }

        setBooks(data.books.map(reviveBook));
        setMembers(data.members.map(reviveMember));
        return true;
    } catch (error) {
        console.error(`importLibraryData failed: ${error.message}`);
        return false;
    }
}

export function saveToLocalStorage() {
    try {
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

        if (booksData === null || membersData === null) {
            return false;
        }

        setBooks(JSON.parse(booksData).map(reviveBook));
        setMembers(JSON.parse(membersData).map(reviveMember));
        return true;
    } catch (error) {
        console.error(`loadFromLocalStorage failed: ${error.message}`);
        return false;
    }
}
