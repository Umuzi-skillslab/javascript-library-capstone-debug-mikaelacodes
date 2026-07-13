// Jest Tests - Storage (JSON + LocalStorage)

import { Book, Member, setBooks, setMembers, books, members } from "../src/library.js";
import { exportLibraryData, importLibraryData, saveToLocalStorage, loadFromLocalStorage } from "../src/storage.js";

beforeEach(() => {
    setBooks([]);
    setMembers([]);
    localStorage.clear();
});

describe('JSON Operations', () => {
    test('exportLibraryData returns a valid JSON string via JSON.stringify', () => {
        const book = new Book('1', 'Book One', 'Author', 2020, 1);
        const member = new Member('m1', 'Jane', 'jane@example.com', 'standard');
        setBooks([book]);
        setMembers([member]);

        const result = exportLibraryData();
        const parsed = JSON.parse(result);

        expect(typeof result).toBe('string');
        expect(parsed.books).toHaveLength(1);
        expect(parsed.books[0].isbn).toBe('1');
        expect(parsed.members).toHaveLength(1);
    });

    test('importLibraryData parses valid JSON and replaces books/members', () => {
        const jsonString = JSON.stringify({
            books: [{ isbn: '1', title: 'Imported Book' }],
            members: [{ id: 'm1', name: 'Imported Member' }]
        });

        const result = importLibraryData(jsonString);

        expect(result).toBe(true);
        expect(books).toHaveLength(1);
        expect(books[0].title).toBe('Imported Book');
        expect(members).toHaveLength(1);
    });

    test('importLibraryData returns false instead of throwing on malformed JSON (error handling)', () => {
        expect(() => importLibraryData('{not valid json')).not.toThrow();
        expect(importLibraryData('{not valid json')).toBe(false);
    });

    test('importLibraryData returns false when parsed data is missing books/members arrays (validation, edge case)', () => {
        expect(importLibraryData(JSON.stringify({ foo: 'bar' }))).toBe(false);
        expect(importLibraryData(JSON.stringify({ books: 'not-an-array', members: [] }))).toBe(false);
    });
});

describe('LocalStorage', () => {
    test('saveToLocalStorage writes JSON-stringified books and members', () => {
        const book = new Book('1', 'Book One', 'Author', 2020, 1);
        setBooks([book]);

        const result = saveToLocalStorage();

        expect(result).toBe(true);
        const stored = JSON.parse(localStorage.getItem('libraryBooks'));
        expect(stored[0].isbn).toBe('1');
    });

    test('loadFromLocalStorage returns false when nothing has been saved yet (edge case)', () => {
        expect(loadFromLocalStorage()).toBe(false);
    });

    test('loadFromLocalStorage parses stored data back into books/members', () => {
        localStorage.setItem('libraryBooks', JSON.stringify([{ isbn: '1', title: 'Saved Book' }]));
        localStorage.setItem('libraryMembers', JSON.stringify([{ id: 'm1', name: 'Saved Member' }]));

        const result = loadFromLocalStorage();

        expect(result).toBe(true);
        expect(books).toHaveLength(1);
        expect(books[0].title).toBe('Saved Book');
    });

    test('loadFromLocalStorage returns false instead of throwing on corrupted stored data (error handling)', () => {
        localStorage.setItem('libraryBooks', 'not valid json');
        localStorage.setItem('libraryMembers', 'not valid json');

        expect(() => loadFromLocalStorage()).not.toThrow();
        expect(loadFromLocalStorage()).toBe(false);
    });

    test('save then load round-trips the same data', () => {
        const book = new Book('1', 'Round Trip', 'Author', 2020, 1);
        setBooks([book]);
        saveToLocalStorage();

        setBooks([]);
        expect(books).toHaveLength(0);

        loadFromLocalStorage();
        expect(books).toHaveLength(1);
        expect(books[0].title).toBe('Round Trip');
    });
});
