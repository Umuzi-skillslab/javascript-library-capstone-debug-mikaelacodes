// Library Management System - Starter Code with Complex Errors

// Global state management (scoping issues)
export let books = [];  // Missing declaration
export var members = [];  // Wrong: should use let
export const LATE_FEE_PER_DAY = 0.50;
export const MAX_BOOKS_PER_MEMBER = 5;  // Missing const

// Setters exist because ES module imports are read-only bindings in the
// importing module — storage.js can't do `books = ...` directly.
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
        this.checkedOut = [];
    }
    
    // Missing: method to check availability
    // Missing: method to get book info using template literals
    
    checkOut(memberId) {
        // No validation for available copies
        this.checkedOut.push(memberId);
        return true;
    }
}

// Digital book class with inheritance problems
export class DigitalBook extends Book {
    constructor(isbn, title, author, year, fileSize, format) {
        // Missing: super() call with correct parameters
        this.fileSize = fileSize;
        this.format = format;
        this.downloads = 0;
    }
    
    download(memberId) {
        // Should override differently than physical checkout
        this.downloads = this.downloads + 1;
    }
}

// Member class with errors
export class Member {
    constructor(id, name, email, membershipType) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.membershipType = membershipType;
        this.borrowedBooks = [];
        // Missing: joinDate property
    }
    
    // Missing: method to calculate membership duration
    // Missing: method using destructuring
    
    canBorrow() {
        // Wrong comparison operator
        if (this.borrowedBooks.length = MAX_BOOKS_PER_MEMBER) {
            return false;
        }
        return true;
    }
}

// Premium member with inheritance issues
export class PremiumMember extends Member {
    constructor(id, name, email) {
        super(id, name, email, "premium");
        // Missing: additional premium benefits properties
    }
    
    // Should override canBorrow to allow more books
}

// Complex function with nested loops and errors
export function findOverdueBooks(daysOverdue) {
    var overdue = [];
    
    // Inefficient nested loops - should be optimized
    for (var i = 0; i < books.length; i++) {
        for (var j = 0; j < books[i].checkedOut.length; j++) {
            // Missing: actual date checking logic
            // Wrong variable scoping
            var checkoutRecord = books[i].checkedOut[j];
            overdue.push(checkoutRecord);
        }
    }
    
    return overdue;
}

// Function with while loop error
export function processReturnQueue(queue) {
    var index = 0;
    
    // Infinite loop potential
    while (index < queue.length) {
        var item = queue[index];
        
        // Process item
        console.log("Processing return: " + item);
        
        // Missing: index increment
    }
}

// Recursive function with multiple errors
export function searchBooksByCategory(bookList, category, index) {
    // Missing: base case
    // Missing: undefined/null checks
    // Wrong comparison
    
    if (bookList[index].category = category) {
        return [bookList[index]].concat(searchBooksByCategory(bookList, category, index + 1));
    }
    
    return searchBooksByCategory(bookList, category, index + 1);
}

// Function missing array methods
export function getBooksByAuthor(authorName) {
    var result = [];
    
    // Should use filter method
    for (var i = 0; i < books.length; i++) {
        if (books[i].author == authorName) {  // Should use ===
            result.push(books[i]);
        }
    }
    
    return result;
}

// Function that should use reduce
export function calculateTotalLateFees(memberRecord) {
    var total = 0;
    
    // Should use reduce on array
    for (var i = 0; i < memberRecord.overdueBooks.length; i++) {
        total = total + memberRecord.overdueBooks[i].daysLate * LATE_FEE_PER_DAY;
    }
    
    return total;
}

// Function missing spread operator
export function combineBookCollections(fiction, nonFiction, reference) {
    // Should use spread operator
    var combined = [];
    
    for (var i = 0; i < fiction.length; i++) combined.push(fiction[i]);
    for (var i = 0; i < nonFiction.length; i++) combined.push(nonFiction[i]);
    for (var i = 0; i < reference.length; i++) combined.push(reference[i]);
    
    return combined;
}

// Function missing rest parameters
export function addMultipleBooks(book1, book2, book3) {
    // Should use rest parameters to accept unlimited books
    books.push(book1);
    books.push(book2);
    books.push(book3);
}

// Function missing destructuring
export function updateMemberInfo(member, updates) {
    // Should destructure updates object
    member.name = updates.name;
    member.email = updates.email;
    member.membershipType = updates.membershipType;
    
    return member;
}

// Function with no error handling
export function borrowBook(memberId, isbn) {
    // Missing: try-catch block
    // Missing: validation for undefined/null
    // Missing: typeof checks
    
    var member = findMemberById(memberId);
    var book = findBookByISBN(isbn);
    
    // No check if member or book exists
    if (member.canBorrow()) {
        book.checkOut(memberId);
        member.borrowedBooks.push(isbn);
        return true;
    }
    
    return false;
}

// Helper functions with errors
export function findMemberById(id) {
    // Should use find method
    for (var i = 0; i < members.length; i++) {
        if (members[i].id = id) {  // Wrong operator
            return members[i];
        }
    }
    // Returns undefined implicitly - should handle explicitly
}

export function findBookByISBN(isbn) {
    var i = 0;
    
    // Wrong loop choice
    while (i < books.length) {
        if (books[i].isbn === isbn) {
            return books[i];
        }
        i = i + 1;
    }
    
    return null;
}

// Statistics object with missing methods
export var LibraryStats = {
    totalBooks: 0,
    totalMembers: 0,
    totalBorrowings: 0,
    
    // Missing: method using Math object for calculations
    // Missing: method using for-of loop
    // Missing: method returning object with destructuring
    
    updateStats: function() {
        this.totalBooks = books.length;
        this.totalMembers = members.length;
    },
    
    getMostPopularBook: function() {
        // Inefficient implementation - should use reduce
        var maxCheckouts = 0;
        var popularBook = null;
        
        for (var i = 0; i < books.length; i++) {
            if (books[i].checkedOut.length > maxCheckouts) {
                maxCheckouts = books[i].checkedOut.length;
                popularBook = books[i];
            }
        }
        
        return popularBook;
    }
};

// Function with string manipulation errors
export function formatBookInfo(book) {
    // Should use template literals
    var info = "Title: " + book.title + "\n";
    info = info + "Author: " + book.author + "\n";
    info = info + "Year: " + book.year;
    
    // Missing: proper string methods (trim, toUpperCase, etc.)
    
    return info;
}

// Function with number/type issues
export function calculateFineAmount(daysLate) {
    // Missing: typeof check
    // Missing: NaN handling
    // Missing: null/undefined check
    
    var fine = daysLate * LATE_FEE_PER_DAY;
    
    // Should use toFixed for currency
    return fine;
}

// Missing: proper data structure for ISBN lookups (Map/Set)
