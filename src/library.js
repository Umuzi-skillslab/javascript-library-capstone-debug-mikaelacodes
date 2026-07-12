// Library Management System - Starter Code with Complex Errors

// Global state management (scoping issues)
export let books = [];  // Missing declaration
export let members = [];  // Wrong: should use let
export const LATE_FEE_PER_DAY = 0.50;
export const MAX_BOOKS_PER_MEMBER = 5;  // Missing const
export const PREMIUM_MAX_BOOKS = 10;

export function setBooks(newBooks) {
    books = newBooks;
}

export function setMembers(newMembers) {
    members = newMembers;
}

// Book class with multiple issues
export class Book {
    constructor(isbn, title, author, year, copies) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.year = year;
        // Missing: availableCopies and totalCopies properties
        this.totalCopies = copies;
        this.availableCopies = copies;
        this.checkedOut = [];
    }

    // Missing: method to check availability
    isAvailable() {
        return this.availableCopies > 0;
    }

    // Missing: method to get book info using template literals
    getInfo() {
        return `${this.title} by ${this.author} (${this.year}) — ${this.availableCopies}/${this.totalCopies} available`;
    }

    checkOut(memberId) {
        // No validation for available copies
        if (!this.isAvailable()) {
            return false;
        }

        this.availableCopies -= 1;
        this.checkedOut.push({ memberId, checkoutDate: new Date() });
        return true;
    }
}

// Digital book class with inheritance problems
export class DigitalBook extends Book {
    constructor(isbn, title, author, year, fileSize, format) {
        // Missing: super() call with correct parameters
        super(isbn, title, author, year, Infinity);
        this.fileSize = fileSize;
        this.format = format;
        this.downloads = 0;
    }

    isAvailable() {
        return true;
    }

    download(memberId) {
        // Should override differently than physical checkout
        this.downloads = this.downloads + 1;
        this.checkedOut.push({ memberId, checkoutDate: new Date() });
    }
}

// Member class with errors
export class Member {
    constructor(id, name, email, membershipType, joinDate = new Date()) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.membershipType = membershipType;
        this.borrowedBooks = [];
        // Missing: joinDate property
        this.joinDate = joinDate;
    }

    // Missing: method to calculate membership duration
    getMembershipDuration() {
        const msPerDay = 1000 * 60 * 60 * 24;
        return Math.floor((new Date() - this.joinDate) / msPerDay);
    }

    // Missing: method using destructuring
    getMemberInfo() {
        const { id, name, email, membershipType } = this;
        return { id, name, email, membershipType };
    }

    canBorrow() {
        // Wrong comparison operator
        if (this.borrowedBooks.length >= MAX_BOOKS_PER_MEMBER) {
            return false;
        }
        return true;
    }
}

// Premium member with inheritance issues
export class PremiumMember extends Member {
    constructor(id, name, email, joinDate = new Date()) {
        super(id, name, email, "premium", joinDate);
        // Missing: additional premium benefits properties
        this.discountRate = 0.1;
        this.maxBooks = PREMIUM_MAX_BOOKS;
    }

    // Should override canBorrow to allow more books
    canBorrow() {
        if (this.borrowedBooks.length >= this.maxBooks) {
            return false;
        }
        return true;
    }
}

// Complex function with nested loops and errors
export function findOverdueBooks(daysOverdue, bookIndex = 0) {
    if (bookIndex >= books.length) {
        return [];
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const now = new Date();
    const overdueFromThisBook = books[bookIndex].checkedOut.filter(({ checkoutDate }) => {
        const daysSinceCheckout = (now - checkoutDate) / msPerDay;
        return daysSinceCheckout >= daysOverdue;
    });

    return overdueFromThisBook.concat(findOverdueBooks(daysOverdue, bookIndex + 1));
}

// Function with while loop error
export function processReturnQueue(queue) {
    for (const item of queue) {
        // Process item
        console.log(`Processing return: ${item}`);
    }
}

// Recursive function with multiple errors
export function searchBooksByCategory(bookList, category, index = 0) {
    // Missing: undefined/null checks
    if (!Array.isArray(bookList) || typeof category !== "string") {
        return [];
    }

    // Missing: base case
    if (index >= bookList.length) {
        return [];
    }

    // Wrong comparison
    if (bookList[index].category === category) {
        return [bookList[index]].concat(searchBooksByCategory(bookList, category, index + 1));
    }

    return searchBooksByCategory(bookList, category, index + 1);
}

// Function missing array methods
export function getBooksByAuthor(authorName) {
    // Should use filter method
    return books.filter((book) => book.author === authorName);
}

// Function that should use reduce
export function calculateTotalLateFees(memberRecord) {
    // Should use reduce on array
    return memberRecord.overdueBooks.reduce(
        (total, overdueBook) => total + overdueBook.daysLate * LATE_FEE_PER_DAY,
        0
    );
}

// Function missing spread operator
export function combineBookCollections(fiction, nonFiction, reference) {
    // Should use spread operator
    return [...fiction, ...nonFiction, ...reference];
}

// Function missing rest parameters
export function addMultipleBooks(...newBooks) {
    // Should use rest parameters to accept unlimited books
    books.push(...newBooks);
}

// Function missing destructuring
export function updateMemberInfo(member, { name, email, membershipType }) {
    // Should destructure updates object
    member.name = name;
    member.email = email;
    member.membershipType = membershipType;

    return member;
}

// Function with no error handling
export function borrowBook(memberId, isbn) {
    // Missing: try-catch block
    try {
        // Missing: validation for undefined/null
        if (!memberId || !isbn) {
            throw new Error("memberId and isbn are required");
        }

        // Missing: typeof checks
        if (typeof memberId !== "string" && typeof memberId !== "number") {
            throw new Error("memberId must be a string or number");
        }
        if (typeof isbn !== "string") {
            throw new Error("isbn must be a string");
        }

        const member = findMemberById(memberId);
        const book = findBookByISBN(isbn);

        // No check if member or book exists
        if (!member || !book) {
            return false;
        }

        if (member.canBorrow()) {
            const checkedOutSuccessfully = book.checkOut(memberId);
            if (!checkedOutSuccessfully) {
                return false;
            }
            member.borrowedBooks.push(isbn);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`borrowBook failed: ${error.message}`);
        return false;
    }
}

// Helper functions with errors
export function findMemberById(id) {
    // Returns undefined implicitly - should handle explicitly
    if (id === null || id === undefined) {
        return null;
    }

    // Should use find method
    return members.find((member) => member.id === id) || null;
}

export function findBookByISBN(isbn) {
    if (typeof isbn !== "string") {
        return null;
    }

    // Wrong loop choice
    for (const book of books) {
        if (book.isbn === isbn) {
            return book;
        }
    }

    return null;
}

// Statistics object with missing methods
export const LibraryStats = {
    totalBooks: 0,
    totalMembers: 0,
    totalBorrowings: 0,

    // Missing: method using Math object for calculations
    getAverageCheckoutsPerBook: function() {
        if (books.length === 0) {
            return 0;
        }

        const totalCheckouts = books.reduce((sum, book) => sum + book.checkedOut.length, 0);
        return Math.round((totalCheckouts / books.length) * 100) / 100;
    },

    // Missing: method using for-of loop
    getAvailableBooksCount: function() {
        let count = 0;

        for (const book of books) {
            if (book.isAvailable()) {
                count += 1;
            }
        }

        return count;
    },

    // Missing: method returning object with destructuring
    getSummary: function() {
        this.updateStats();
        const { totalBooks, totalMembers, totalBorrowings } = this;
        return { totalBooks, totalMembers, totalBorrowings };
    },

    getBookSummaries: function() {
        return books.map((book) => book.getInfo());
    },

    hasAvailableBooks: function() {
        return books.some((book) => book.isAvailable());
    },

    updateStats: function() {
        this.totalBooks = books.length;
        this.totalMembers = members.length;
    },

    getMostPopularBook: function() {
        // Inefficient implementation - should use reduce
        return books.reduce((popular, book) => {
            const popularCheckouts = popular ? popular.checkedOut.length : 0;
            return book.checkedOut.length > popularCheckouts ? book : popular;
        }, null);
    }
};

// Function with string manipulation errors
export function formatBookInfo(book) {
    // Should use template literals
    // Missing: proper string methods (trim, toUpperCase, etc.)
    return `Title: ${book.title.trim()}\nAuthor: ${book.author.trim()}\nYear: ${book.year}`;
}

// Function with number/type issues
export function calculateFineAmount(daysLate) {
    // Missing: null/undefined check
    if (daysLate === null || daysLate === undefined) {
        throw new Error("daysLate is required");
    }

    // Missing: typeof check
    // Missing: NaN handling
    if (typeof daysLate !== "number" || Number.isNaN(daysLate)) {
        throw new Error("daysLate must be a valid number");
    }

    const fine = daysLate * LATE_FEE_PER_DAY;

    // Should use toFixed for currency
    return Number(fine.toFixed(2));
}

export function getTopTwoBooks() {
    const sortedByPopularity = [...books].sort((a, b) => b.checkedOut.length - a.checkedOut.length);
    const [mostPopular, secondMostPopular] = sortedByPopularity;

    return { mostPopular, secondMostPopular };
}

export function getAllISBNs() {
    return books.map((book) => book.isbn);
}

export function withLogging(fn) {
    return function(...args) {
        console.log(`Calling ${fn.name} with ${JSON.stringify(args)}`);
        return fn(...args);
    };
}

export function createBookFilter(predicate) {
    return function(bookList) {
        return bookList.filter(predicate);
    };
}

// Missing: proper data structure for ISBN lookups (Map/Set)
