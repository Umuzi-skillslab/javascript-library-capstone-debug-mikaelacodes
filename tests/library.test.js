// Jest Tests - Library Management System

import {
    Book, DigitalBook, Member, PremiumMember, LibraryStats,
    MAX_BOOKS_PER_MEMBER, PREMIUM_MAX_BOOKS,
    setBooks, setMembers,
    findOverdueBooks, processReturnQueue, searchBooksByCategory,
    getBooksByAuthor, calculateTotalLateFees, combineBookCollections,
    addMultipleBooks, updateMemberInfo, borrowBook,
    findMemberById, findBookByISBN, formatBookInfo, calculateFineAmount,
    getTopTwoBooks, getAllISBNs, withLogging, createBookFilter
} from "../src/library.js";

beforeEach(() => {
    setBooks([]);
    setMembers([]);
});

describe('Book Class', () => {
    test('should create a book instance', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author Name', 2020, 5);

        expect(book.isbn).toBe('978-0-123');
        expect(book.title).toBe('Test Book');
        expect(book.author).toBe('Author Name');
        expect(book.year).toBe(2020);
        expect(book.totalCopies).toBe(5);
        expect(book.availableCopies).toBe(5);
        expect(book.checkedOut).toEqual([]);
    });

    test('isAvailable reflects remaining copies', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author', 2020, 1);
        expect(book.isAvailable()).toBe(true);

        book.checkOut('m1');
        expect(book.isAvailable()).toBe(false);
    });

    test('getInfo returns a formatted string with title, author, and availability', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author', 2020, 3);
        expect(book.getInfo()).toBe('Test Book by Author (2020) — 3/3 available');
    });

    test('checkOut decrements availableCopies and records the checkout', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author', 2020, 2);
        const result = book.checkOut('m1');

        expect(result).toBe(true);
        expect(book.availableCopies).toBe(1);
        expect(book.checkedOut).toHaveLength(1);
        expect(book.checkedOut[0].memberId).toBe('m1');
        expect(book.checkedOut[0].checkoutDate).toBeInstanceOf(Date);
    });

    test('checkOut returns false when no copies are available (edge case)', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author', 2020, 1);
        book.checkOut('m1');

        const result = book.checkOut('m2');
        expect(result).toBe(false);
        expect(book.availableCopies).toBe(0);
    });
});

describe('DigitalBook Class', () => {
    test('inherits from Book via super() and sets digital-specific properties', () => {
        const digitalBook = new DigitalBook('978-1', 'E-Book', 'Author', 2021, '5MB', 'epub');

        expect(digitalBook).toBeInstanceOf(Book);
        expect(digitalBook.title).toBe('E-Book');
        expect(digitalBook.fileSize).toBe('5MB');
        expect(digitalBook.format).toBe('epub');
        expect(digitalBook.downloads).toBe(0);
    });

    test('is always available regardless of download count', () => {
        const digitalBook = new DigitalBook('978-1', 'E-Book', 'Author', 2021, '5MB', 'epub');

        for (let i = 0; i < 10; i++) {
            digitalBook.download(`m${i}`);
        }

        expect(digitalBook.downloads).toBe(10);
        expect(digitalBook.isAvailable()).toBe(true);
    });

    test('download records a checkout entry distinct from checkOut', () => {
        const digitalBook = new DigitalBook('978-1', 'E-Book', 'Author', 2021, '5MB', 'epub');
        digitalBook.download('m1');

        expect(digitalBook.checkedOut).toHaveLength(1);
        expect(digitalBook.checkedOut[0].memberId).toBe('m1');
    });
});

describe('Member Class', () => {
    test('creates a member with a default joinDate', () => {
        const member = new Member(1, 'John Doe', 'john@example.com', 'standard');

        expect(member.joinDate).toBeInstanceOf(Date);
        expect(member.borrowedBooks).toEqual([]);
    });

    test('getMembershipDuration returns 0 for a member who just joined', () => {
        const member = new Member(1, 'John Doe', 'john@example.com', 'standard');
        expect(member.getMembershipDuration()).toBe(0);
    });

    test('getMemberInfo destructures the member into a plain object', () => {
        const member = new Member(1, 'John Doe', 'john@example.com', 'standard');
        expect(member.getMemberInfo()).toEqual({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            membershipType: 'standard'
        });
    });

    test('canBorrow returns boolean and respects MAX_BOOKS_PER_MEMBER as a boundary (edge case)', () => {
        const member = new Member(1, 'John Doe', 'john@example.com', 'standard');
        expect(typeof member.canBorrow()).toBe('boolean');

        for (let i = 0; i < MAX_BOOKS_PER_MEMBER; i++) {
            member.borrowedBooks.push(`isbn-${i}`);
        }

        expect(member.canBorrow()).toBe(false);
    });
});

describe('PremiumMember Class', () => {
    test('inherits from Member and sets premium properties', () => {
        const premium = new PremiumMember('p1', 'Sam', 'sam@example.com');

        expect(premium).toBeInstanceOf(Member);
        expect(premium.membershipType).toBe('premium');
        expect(premium.maxBooks).toBe(PREMIUM_MAX_BOOKS);
    });

    test('canBorrow allows up to PREMIUM_MAX_BOOKS, unlike a standard member (edge case)', () => {
        const premium = new PremiumMember('p1', 'Sam', 'sam@example.com');

        for (let i = 0; i < MAX_BOOKS_PER_MEMBER; i++) {
            premium.borrowedBooks.push(`isbn-${i}`);
        }
        expect(premium.canBorrow()).toBe(true);

        for (let i = MAX_BOOKS_PER_MEMBER; i < PREMIUM_MAX_BOOKS; i++) {
            premium.borrowedBooks.push(`isbn-${i}`);
        }
        expect(premium.canBorrow()).toBe(false);
    });
});

describe('Library Functions', () => {
    test('findBookByISBN returns the matching book', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author', 2020, 1);
        setBooks([book]);

        expect(findBookByISBN('978-0-123')).toBe(book);
    });

    test('findBookByISBN returns null for a missing ISBN or invalid input (edge case)', () => {
        setBooks([]);
        expect(findBookByISBN('nonexistent')).toBeNull();
        expect(findBookByISBN(null)).toBeNull();
        expect(findBookByISBN(undefined)).toBeNull();
    });

    test('findMemberById returns null for a null/undefined id (edge case)', () => {
        expect(findMemberById(null)).toBeNull();
        expect(findMemberById(undefined)).toBeNull();
    });

    test('getBooksByAuthor filters using Array.filter', () => {
        const b1 = new Book('1', 'Book One', 'Author A', 2020, 1);
        const b2 = new Book('2', 'Book Two', 'Author B', 2021, 1);
        const b3 = new Book('3', 'Book Three', 'Author A', 2019, 1);
        setBooks([b1, b2, b3]);

        expect(getBooksByAuthor('Author A')).toEqual([b1, b3]);
    });

    test('borrowBook succeeds when the member and book are eligible', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author', 2020, 1);
        const member = new Member('m1', 'Jane', 'jane@example.com', 'standard');
        setBooks([book]);
        setMembers([member]);

        expect(borrowBook('m1', '978-0-123')).toBe(true);
        expect(book.availableCopies).toBe(0);
        expect(member.borrowedBooks).toContain('978-0-123');
    });

    test('borrowBook fails gracefully when member or book does not exist (edge case)', () => {
        setBooks([]);
        setMembers([]);

        expect(borrowBook('missing-member', 'missing-isbn')).toBe(false);
    });

    test('borrowBook returns false instead of throwing on invalid input types (try-catch)', () => {
        expect(() => borrowBook(123, 456)).not.toThrow();
        expect(borrowBook(123, 456)).toBe(false);
        expect(borrowBook(null, null)).toBe(false);
    });
});

describe('Recursive Functions', () => {
    test('searchBooksByCategory finds matching books recursively', () => {
        const b1 = new Book('1', 'Book One', 'Author', 2020, 1);
        b1.category = 'fiction';
        const b2 = new Book('2', 'Book Two', 'Author', 2020, 1);
        b2.category = 'reference';

        expect(searchBooksByCategory([b1, b2], 'fiction')).toEqual([b1]);
    });

    test('searchBooksByCategory hits its base case on an empty array without recursing forever (edge case)', () => {
        expect(searchBooksByCategory([], 'fiction')).toEqual([]);
    });

    test('searchBooksByCategory returns [] for null/invalid input instead of throwing (edge case)', () => {
        expect(() => searchBooksByCategory(null, 'fiction')).not.toThrow();
        expect(searchBooksByCategory(null, 'fiction')).toEqual([]);
        expect(searchBooksByCategory([{ category: 'fiction' }], 123)).toEqual([]);
    });

    test('findOverdueBooks base case returns [] for an empty books array (edge case)', () => {
        setBooks([]);
        expect(findOverdueBooks(14)).toEqual([]);
    });

    test('findOverdueBooks recursively filters checkouts older than daysOverdue', () => {
        const book = new Book('1', 'Old Loan', 'Author', 2020, 2);
        book.checkedOut.push({ memberId: 'm1', checkoutDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) });
        book.checkedOut.push({ memberId: 'm2', checkoutDate: new Date() });
        setBooks([book]);

        const overdue = findOverdueBooks(14);
        expect(overdue).toHaveLength(1);
        expect(overdue[0].memberId).toBe('m1');
    });
});

describe('Array Operations', () => {
    test('calculateTotalLateFees uses reduce to sum fees', () => {
        const total = calculateTotalLateFees({ overdueBooks: [{ daysLate: 2 }, { daysLate: 3 }] });
        expect(total).toBeCloseTo(2.5, 5);
    });

    test('calculateTotalLateFees returns 0 for an empty overdueBooks array (edge case)', () => {
        expect(calculateTotalLateFees({ overdueBooks: [] })).toBe(0);
    });

    test('combineBookCollections uses the spread operator to merge three arrays', () => {
        const combined = combineBookCollections(['a'], ['b', 'c'], ['d']);
        expect(combined).toEqual(['a', 'b', 'c', 'd']);
    });

    test('addMultipleBooks uses rest parameters to accept any number of books', () => {
        setBooks([]);
        addMultipleBooks({ isbn: '1' }, { isbn: '2' }, { isbn: '3' });
        expect(getAllISBNs()).toEqual(['1', '2', '3']);
    });

    test('updateMemberInfo destructures the updates object', () => {
        const member = new Member(1, 'Old Name', 'old@example.com', 'standard');
        const updated = updateMemberInfo(member, { name: 'New Name', email: 'new@example.com', membershipType: 'premium' });

        expect(updated.name).toBe('New Name');
        expect(updated.email).toBe('new@example.com');
        expect(updated.membershipType).toBe('premium');
    });

    test('getTopTwoBooks uses array destructuring to pick the two most popular books', () => {
        const b1 = new Book('1', 'Low', 'Author', 2020, 5);
        const b2 = new Book('2', 'High', 'Author', 2020, 5);
        const b3 = new Book('3', 'Mid', 'Author', 2020, 5);
        b2.checkedOut.push({ memberId: 'a', checkoutDate: new Date() }, { memberId: 'b', checkoutDate: new Date() });
        b3.checkedOut.push({ memberId: 'a', checkoutDate: new Date() });
        setBooks([b1, b2, b3]);

        const { mostPopular, secondMostPopular } = getTopTwoBooks();
        expect(mostPopular.isbn).toBe('2');
        expect(secondMostPopular.isbn).toBe('3');
    });

    test('LibraryStats.getBookSummaries uses map to format every book', () => {
        const book = new Book('1', 'Book One', 'Author', 2020, 1);
        setBooks([book]);

        expect(LibraryStats.getBookSummaries()).toEqual([book.getInfo()]);
    });

    test('LibraryStats.hasAvailableBooks uses some to check availability', () => {
        const unavailable = new Book('1', 'Book One', 'Author', 2020, 1);
        unavailable.checkOut('m1');
        setBooks([unavailable]);
        expect(LibraryStats.hasAvailableBooks()).toBe(false);

        setBooks([unavailable, new Book('2', 'Book Two', 'Author', 2020, 1)]);
        expect(LibraryStats.hasAvailableBooks()).toBe(true);
    });

    test('LibraryStats.getAvailableBooksCount uses a for-of loop', () => {
        setBooks([
            new Book('1', 'Book One', 'Author', 2020, 1),
            new Book('2', 'Book Two', 'Author', 2020, 0)
        ]);

        expect(LibraryStats.getAvailableBooksCount()).toBe(1);
    });

    test('LibraryStats.getSummary returns a destructured object', () => {
        setBooks([new Book('1', 'Book One', 'Author', 2020, 1)]);
        setMembers([new Member(1, 'Jane', 'jane@example.com', 'standard')]);

        expect(LibraryStats.getSummary()).toEqual({
            totalBooks: 1,
            totalMembers: 1,
            totalBorrowings: 0
        });
    });

    test('LibraryStats.getMostPopularBook uses reduce and handles an empty library (edge case)', () => {
        setBooks([]);
        expect(LibraryStats.getMostPopularBook()).toBeNull();
    });
});

describe('Higher-Order Functions', () => {
    test('withLogging wraps a function and forwards its arguments/return value', () => {
        const add = (a, b) => a + b;
        const loggedAdd = withLogging(add);

        expect(loggedAdd(2, 3)).toBe(5);
    });

    test('createBookFilter returns a reusable filter function', () => {
        const b1 = new Book('1', 'Book One', 'Author', 2020, 1);
        b1.category = 'fiction';
        const b2 = new Book('2', 'Book Two', 'Author', 2020, 1);
        b2.category = 'reference';

        const fictionFilter = createBookFilter((book) => book.category === 'fiction');
        expect(fictionFilter([b1, b2])).toEqual([b1]);
    });
});

describe('Error Handling', () => {
    test('calculateFineAmount throws on null/undefined input', () => {
        expect(() => calculateFineAmount(null)).toThrow();
        expect(() => calculateFineAmount(undefined)).toThrow();
    });

    test('calculateFineAmount throws on non-number and NaN input (type validation)', () => {
        expect(() => calculateFineAmount('five')).toThrow();
        expect(() => calculateFineAmount(NaN)).toThrow();
    });

    test('processReturnQueue does not hang on a queue of any size (regression test for the former infinite loop)', () => {
        expect(() => processReturnQueue(['a', 'b', 'c'])).not.toThrow();
    });
});

describe('String Operations', () => {
    test('formatBookInfo uses template literals and trims whitespace', () => {
        const book = { title: '  Test Book  ', author: '  Author  ', year: 2020 };
        expect(formatBookInfo(book)).toBe('Title: Test Book\nAuthor: Author\nYear: 2020');
    });
});

describe('Math Operations', () => {
    test('calculateFineAmount returns a correctly rounded number', () => {
        const fine = calculateFineAmount(5);

        expect(typeof fine).toBe('number');
        expect(fine).toBe(2.5);
    });

    test('LibraryStats.getAverageCheckoutsPerBook uses Math.round for a clean average', () => {
        const b1 = new Book('1', 'Book One', 'Author', 2020, 5);
        const b2 = new Book('2', 'Book Two', 'Author', 2020, 5);
        b1.checkOut('m1');
        setBooks([b1, b2]);

        expect(LibraryStats.getAverageCheckoutsPerBook()).toBe(0.5);
    });

    test('LibraryStats.getAverageCheckoutsPerBook returns 0 for an empty library (edge case)', () => {
        setBooks([]);
        expect(LibraryStats.getAverageCheckoutsPerBook()).toBe(0);
    });
});
