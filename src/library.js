// Library Management System

export let books = [];
export let members = [];
export const LATE_FEE_PER_DAY = 0.50;
export const MAX_BOOKS_PER_MEMBER = 5;
export const PREMIUM_MAX_BOOKS = 10;

// Kept in sync with `books` so findBookByISBN is an O(1) lookup instead of a scan.
let booksByIsbn = new Map();

export function setBooks(newBooks) {
    books = newBooks;
    booksByIsbn = new Map(newBooks.map((book) => [book.isbn, book]));
}

export function setMembers(newMembers) {
    members = newMembers;
}

export class Book {
    constructor(isbn, title, author, year, copies) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.year = year;
        this.totalCopies = copies;
        this.availableCopies = copies;
        this.checkedOut = [];
    }

    isAvailable() {
        return this.availableCopies > 0;
    }

    getInfo() {
        return `${this.title} by ${this.author} (${this.year}) — ${this.availableCopies}/${this.totalCopies} available`;
    }

    checkOut(memberId) {
        if (!this.isAvailable()) {
            return false;
        }

        this.availableCopies -= 1;
        this.checkedOut.push({ memberId, checkoutDate: new Date() });
        return true;
    }
}

export class DigitalBook extends Book {
    constructor(isbn, title, author, year, fileSize, format) {
        super(isbn, title, author, year, Infinity);
        this.fileSize = fileSize;
        this.format = format;
        this.downloads = 0;
    }

    isAvailable() {
        return true;
    }

    download(memberId) {
        this.downloads = this.downloads + 1;
        this.checkedOut.push({ memberId, checkoutDate: new Date() });
    }
}

// JSON.parse returns plain objects, not class instances, so anything read back
// from storage needs to be rebuilt into a real Book/DigitalBook to regain its methods.
export function reviveBook(data) {
    const book = typeof data.format === "string"
        ? new DigitalBook(data.isbn, data.title, data.author, data.year, data.fileSize, data.format)
        : new Book(data.isbn, data.title, data.author, data.year, data.totalCopies);

    book.availableCopies = data.availableCopies;
    if (data.category) {
        book.category = data.category;
    }
    if (typeof data.downloads === "number") {
        book.downloads = data.downloads;
    }
    book.checkedOut = (data.checkedOut || []).map(({ memberId, checkoutDate }) => ({
        memberId,
        checkoutDate: new Date(checkoutDate)
    }));

    return book;
}

export class Member {
    constructor(id, name, email, membershipType, joinDate = new Date()) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.membershipType = membershipType;
        this.borrowedBooks = [];
        this.joinDate = joinDate;
    }

    getMembershipDuration() {
        const msPerDay = 1000 * 60 * 60 * 24;
        return Math.floor((new Date() - this.joinDate) / msPerDay);
    }

    getMemberInfo() {
        const { id, name, email, membershipType } = this;
        return { id, name, email, membershipType };
    }

    canBorrow() {
        if (this.borrowedBooks.length >= MAX_BOOKS_PER_MEMBER) {
            return false;
        }
        return true;
    }
}

export class PremiumMember extends Member {
    constructor(id, name, email, joinDate = new Date()) {
        super(id, name, email, "premium", joinDate);
        this.discountRate = 0.1;
        this.maxBooks = PREMIUM_MAX_BOOKS;
    }

    canBorrow() {
        if (this.borrowedBooks.length >= this.maxBooks) {
            return false;
        }
        return true;
    }
}

// Same problem as reviveBook: a member read back from storage is a plain
// object until it's rebuilt into a real Member/PremiumMember instance.
export function reviveMember(data) {
    const joinDate = new Date(data.joinDate);
    const member = data.membershipType === "premium"
        ? new PremiumMember(data.id, data.name, data.email, joinDate)
        : new Member(data.id, data.name, data.email, data.membershipType, joinDate);

    member.borrowedBooks = data.borrowedBooks || [];

    return member;
}

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

export function processReturnQueue(queue) {
    for (const item of queue) {
        console.log(`Processing return: ${item}`);
    }
}

export function searchBooksByCategory(bookList, category, index = 0) {
    if (!Array.isArray(bookList) || typeof category !== "string") {
        return [];
    }

    if (index >= bookList.length) {
        return [];
    }

    if (bookList[index].category === category) {
        return [bookList[index]].concat(searchBooksByCategory(bookList, category, index + 1));
    }

    return searchBooksByCategory(bookList, category, index + 1);
}

export function getBooksByAuthor(authorName) {
    return books.filter((book) => book.author === authorName);
}

export function calculateTotalLateFees(memberRecord) {
    return memberRecord.overdueBooks.reduce(
        (total, overdueBook) => total + overdueBook.daysLate * LATE_FEE_PER_DAY,
        0
    );
}

export function combineBookCollections(fiction, nonFiction, reference) {
    return [...fiction, ...nonFiction, ...reference];
}

export function addMultipleBooks(...newBooks) {
    books.push(...newBooks);
    newBooks.forEach((book) => booksByIsbn.set(book.isbn, book));
}

export function updateMemberInfo(member, { name, email, membershipType }) {
    member.name = name;
    member.email = email;
    member.membershipType = membershipType;

    return member;
}

export function borrowBook(memberId, isbn) {
    try {
        if (!memberId || !isbn) {
            throw new Error("memberId and isbn are required");
        }

        if (typeof memberId !== "string" && typeof memberId !== "number") {
            throw new Error("memberId must be a string or number");
        }
        if (typeof isbn !== "string") {
            throw new Error("isbn must be a string");
        }

        const member = findMemberById(memberId);
        const book = findBookByISBN(isbn);

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

export function findMemberById(id) {
    if (id === null || id === undefined) {
        return null;
    }

    return members.find((member) => member.id === id) || null;
}

export function findBookByISBN(isbn) {
    if (typeof isbn !== "string") {
        return null;
    }

    return booksByIsbn.get(isbn) || null;
}

export const LibraryStats = {
    totalBooks: 0,
    totalMembers: 0,
    totalBorrowings: 0,

    getAverageCheckoutsPerBook: function() {
        if (books.length === 0) {
            return 0;
        }

        const totalCheckouts = books.reduce((sum, book) => sum + book.checkedOut.length, 0);
        return Math.round((totalCheckouts / books.length) * 100) / 100;
    },

    getAvailableBooksCount: function() {
        let count = 0;

        for (const book of books) {
            if (book.isAvailable()) {
                count += 1;
            }
        }

        return count;
    },

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
        return books.reduce((popular, book) => {
            const popularCheckouts = popular ? popular.checkedOut.length : 0;
            return book.checkedOut.length > popularCheckouts ? book : popular;
        }, null);
    }
};

export function formatBookInfo(book) {
    return `Title: ${book.title.trim()}\nAuthor: ${book.author.trim()}\nYear: ${book.year}`;
}

export function calculateFineAmount(daysLate) {
    if (daysLate === null || daysLate === undefined) {
        throw new Error("daysLate is required");
    }

    if (typeof daysLate !== "number" || Number.isNaN(daysLate)) {
        throw new Error("daysLate must be a valid number");
    }

    const fine = daysLate * LATE_FEE_PER_DAY;

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
