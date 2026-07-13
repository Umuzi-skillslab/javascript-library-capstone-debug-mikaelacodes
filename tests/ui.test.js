// Jest Tests - UI / DOM Manipulation
// @jest-environment jsdom

import { Book, Member, setBooks, setMembers, books, members } from "../src/library.js";
import {
    initializeUI, renderBookCatalogue, handleSearch, handleSearchKeyup,
    handleFilterChange, handleBookClick, handleBorrowSubmit, handleNavClick,
    displayBookDetails, updateStatisticsDisplay, createMemberForm,
    handleMemberFormSubmit
} from "../src/ui.js";

function renderFixture() {
    document.body.innerHTML = `
        <nav>
            <button id="catalogue-tab">Catalogue</button>
            <button id="members-tab">Members</button>
            <button id="statistics-tab">Statistics</button>
        </nav>
        <section id="catalogue-section">
            <input type="text" id="search" />
            <select id="filter-category">
                <option value="all">All</option>
                <option value="fiction">Fiction</option>
                <option value="reference">Reference</option>
            </select>
            <div id="catalogue-list"></div>
            <div id="book-details"></div>
        </section>
        <form id="borrow-form">
            <input id="member-id" />
            <input id="isbn" />
            <button type="submit">Borrow</button>
        </form>
        <section id="member-section" style="display: none;">
            <div id="member-form"></div>
            <div id="member-list"></div>
        </section>
        <section id="statistics-section" style="display: none;">
            <p class="total-books">0</p>
            <p class="total-members">0</p>
            <p class="books-borrowed">0</p>
        </section>
    `;
}

beforeEach(() => {
    localStorage.clear();
    setBooks([]);
    setMembers([]);
    window.alert = jest.fn();

    renderFixture();
    initializeUI();
});

describe('DOM Rendering', () => {
    test('renderBookCatalogue creates a card with the correct data-isbn attribute and content', () => {
        const book = new Book('978-1', 'The Great Gatsby', 'F. Scott Fitzgerald', 1925, 2);
        renderBookCatalogue([book]);

        const card = document.querySelector('.book-card');
        expect(card).not.toBeNull();
        expect(card.dataset.isbn).toBe('978-1');
        expect(card.innerHTML).toContain('The Great Gatsby');
        expect(card.innerHTML).toContain('F. Scott Fitzgerald');
    });

    test('renderBookCatalogue clears previous content before re-rendering (no duplicate accumulation)', () => {
        const book = new Book('978-1', 'Book', 'Author', 2020, 1);
        renderBookCatalogue([book]);
        renderBookCatalogue([book]);

        expect(document.querySelectorAll('.book-card')).toHaveLength(1);
    });

    test('displayBookDetails does nothing (no throw) for a missing book (null check, edge case)', () => {
        expect(() => displayBookDetails('nonexistent')).not.toThrow();
        expect(document.getElementById('book-details').innerHTML).toBe('');
    });

    test('displayBookDetails renders book details via template literals', () => {
        const book = new Book('978-1', 'The Great Gatsby', 'F. Scott Fitzgerald', 1925, 2);
        setBooks([book]);

        displayBookDetails('978-1');

        const details = document.getElementById('book-details');
        expect(details.innerHTML).toContain('The Great Gatsby');
        expect(details.innerHTML).toContain('978-1');
    });
});

describe('Search and Filter', () => {
    test('handleSearch filters case-insensitively', () => {
        const book = new Book('978-1', 'The Great Gatsby', 'Author', 1925, 1);
        setBooks([book]);

        const searchInput = document.getElementById('search');
        searchInput.value = 'GATSBY';
        handleSearch({ target: searchInput });

        expect(document.querySelectorAll('.book-card')).toHaveLength(1);
    });

    test('handleSearch shows no results for a non-matching term (edge case)', () => {
        const book = new Book('978-1', 'The Great Gatsby', 'Author', 1925, 1);
        setBooks([book]);

        const searchInput = document.getElementById('search');
        searchInput.value = 'nonexistent title';
        handleSearch({ target: searchInput });

        expect(document.querySelectorAll('.book-card')).toHaveLength(0);
    });

    test('handleSearchKeyup clears the search box and re-renders on Escape', () => {
        const book = new Book('978-1', 'Book', 'Author', 2020, 1);
        setBooks([book]);

        const searchInput = document.getElementById('search');
        searchInput.value = 'something';
        handleSearchKeyup({ key: 'Escape' });

        expect(searchInput.value).toBe('');
        expect(document.querySelectorAll('.book-card')).toHaveLength(1);
    });

    test('handleFilterChange filters by category, and "all" shows everything', () => {
        const fiction = new Book('1', 'Fiction Book', 'Author', 2020, 1);
        fiction.category = 'fiction';
        const reference = new Book('2', 'Reference Book', 'Author', 2020, 1);
        reference.category = 'reference';
        setBooks([fiction, reference]);

        const filterDropdown = document.getElementById('filter-category');
        filterDropdown.value = 'fiction';
        handleFilterChange();
        expect(document.querySelectorAll('.book-card')).toHaveLength(1);

        filterDropdown.value = 'all';
        handleFilterChange();
        expect(document.querySelectorAll('.book-card')).toHaveLength(2);
    });
});

describe('Event Delegation', () => {
    test('handleBookClick shows details when a book card is clicked', () => {
        const book = new Book('978-1', 'The Great Gatsby', 'Author', 1925, 1);
        setBooks([book]);
        renderBookCatalogue([book]);

        const card = document.querySelector('.book-card');
        handleBookClick({ target: card });

        expect(document.getElementById('book-details').innerHTML).toContain('The Great Gatsby');
    });

    test('handleBookClick does nothing when the click target is not inside a book card (edge case)', () => {
        const catalogueList = document.getElementById('catalogue-list');
        expect(() => handleBookClick({ target: catalogueList })).not.toThrow();
        expect(document.getElementById('book-details').innerHTML).toBe('');
    });

    test('handleNavClick switches the visible section', () => {
        handleNavClick({ target: document.getElementById('members-tab') });

        expect(document.getElementById('catalogue-section').style.display).toBe('none');
        expect(document.getElementById('member-section').style.display).toBe('');
    });

    test('handleNavClick ignores clicks on non-tab elements (edge case)', () => {
        const nav = document.querySelector('nav');
        expect(() => handleNavClick({ target: nav })).not.toThrow();
        expect(document.getElementById('catalogue-section').style.display).not.toBe('none');
    });
});

describe('Form Submissions', () => {
    test('handleBorrowSubmit prevents default and rejects empty input without calling borrowBook', () => {
        const preventDefault = jest.fn();
        const form = document.getElementById('borrow-form');

        handleBorrowSubmit({ preventDefault, target: form });

        expect(preventDefault).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Please enter both a member ID and an ISBN.');
    });

    test('handleBorrowSubmit succeeds, alerts, and resets the form on a valid borrow', () => {
        const book = new Book('978-1', 'Book', 'Author', 2020, 1);
        const member = new Member('m1', 'Jane', 'jane@example.com', 'standard');
        setBooks([book]);
        setMembers([member]);

        const form = document.getElementById('borrow-form');
        document.getElementById('member-id').value = 'm1';
        document.getElementById('isbn').value = '978-1';

        handleBorrowSubmit({ preventDefault: jest.fn(), target: form });

        expect(window.alert).toHaveBeenCalledWith('Book borrowed successfully');
        expect(book.availableCopies).toBe(0);
    });

    test('handleBorrowSubmit alerts failure when the member/book does not exist (edge case)', () => {
        const form = document.getElementById('borrow-form');
        document.getElementById('member-id').value = 'missing';
        document.getElementById('isbn').value = 'missing';

        handleBorrowSubmit({ preventDefault: jest.fn(), target: form });

        expect(window.alert).toHaveBeenCalledWith('Unable to borrow this book. Check the member ID and ISBN.');
    });

    test('createMemberForm builds an email input with type="email" and required fields', () => {
        createMemberForm();

        const emailInput = document.getElementById('email');
        const nameInput = document.getElementById('name');
        expect(emailInput.type).toBe('email');
        expect(emailInput.required).toBe(true);
        expect(nameInput.required).toBe(true);
    });

    test('handleMemberFormSubmit adds a new member and resets the form', () => {
        createMemberForm();
        document.getElementById('name').value = 'Test User';
        document.getElementById('email').value = 'test@example.com';

        const form = document.querySelector('#member-form form');
        handleMemberFormSubmit({ preventDefault: jest.fn(), target: form });

        expect(members).toHaveLength(1);
        expect(members[0].name).toBe('Test User');
    });

    test('handleMemberFormSubmit does nothing when fields are empty (validation, edge case)', () => {
        createMemberForm();

        const form = document.querySelector('#member-form form');
        handleMemberFormSubmit({ preventDefault: jest.fn(), target: form });

        expect(members).toHaveLength(0);
    });
});

describe('Statistics Display', () => {
    test('updateStatisticsDisplay reflects the current books/members counts', () => {
        setBooks([new Book('1', 'Book One', 'Author', 2020, 1)]);
        setMembers([new Member(1, 'Jane', 'jane@example.com', 'standard')]);

        updateStatisticsDisplay();

        expect(document.querySelector('.total-books').textContent).toBe('1');
        expect(document.querySelector('.total-members').textContent).toBe('1');
    });

    test('updateStatisticsDisplay does nothing (no throw) when stat elements are missing (null check, edge case)', () => {
        document.querySelector('.total-books').remove();

        expect(() => updateStatisticsDisplay()).not.toThrow();
    });
});
