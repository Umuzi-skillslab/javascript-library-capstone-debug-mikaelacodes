# Issues Analysis — Library Management System

## Critical Errors (breaks functionality)

At least 19 bugs here could crash the app outright or quietly corrupt data:

1. `books = []` (library.js:4) and `MAX_BOOKS_PER_MEMBER = 5` (library.js:7) were never declared, leaking as undeclared globals.
2. `DigitalBook`'s constructor (library.js:33) never called `super()`, throwing a `ReferenceError` on every instantiation.
3. `Member.canBorrow` (library.js:61) used `=` instead of `===`, silently overwriting `borrowedBooks.length` on every borrow attempt.
4. `processReturnQueue` (library.js:100-106) never incremented its loop index — an infinite loop that hangs the tab.
5. `searchBooksByCategory` (library.js:111-121) had no base case and read past the end of the array.
6. The same function also used `=` instead of `===` in its comparison.
7. `getBooksByAuthor` (library.js:129) compared with `==` instead of `===`.
8. `findMemberById` (library.js:202) used `=` instead of `===`; its implicit `undefined` return was never checked by callers.
9. `borrowBook` (library.js:180-196) never checked whether `member`/`book` existed before calling methods on them — a bad ID threw.
10. `ui.js:12` called `querySelector("filter-category")` without the leading `#`, so it always returned `null`, unchecked.
11. The filter dropdown listened for `"click"` instead of `"change"` (ui.js:24), so picking an option did nothing.
12. The borrow form's submit handler never called `event.preventDefault()` (ui.js:55), so submitting reloaded the page.
13. `handleFilterChange` (ui.js:113) used `=` instead of `===`.
14. `saveToLocalStorage` (ui.js:151-152) passed arrays straight to `setItem` without `JSON.stringify`, storing the literal string `"[object Object]"`.
15. `initializeUI()` ran at parse time instead of on `DOMContentLoaded` (ui.js:226), and loaded before `library.js`, so `books`/`members` didn't exist yet.
16. `index.html` referenced a `styles.css` that didn't exist anywhere in the repo.
17. `findOverdueBooks` (library.js:126) was flagged as missing date-checking logic — impossible without a design change, since `checkedOut` only stored a member ID, no date to compare against.
18. Fixing #17 with real `Date`s gave us a second bug: after reloading the page, `JSON.parse` returns plain objects and date strings, not class instances, breaking every method call. Fixed with `reviveBook`/`reviveMember`.

## Major Issues by JS Concept

- **Scoping**: `var` everywhere instead of `let`/`const`.
- **OOP**: `Book` missing `availableCopies`/`totalCopies`/`isAvailable()`/`getInfo()`; `checkOut()` never validated copies; `Member` had no `joinDate` or duration/info methods; `PremiumMember` never overrode `canBorrow`; `LibraryStats` missing three methods.
- **Functional programming**: hand-written loops stood in for `filter`/`map`/`reduce` in `getBooksByAuthor`, `calculateTotalLateFees`, and `getMostPopularBook`.
- **Modern JS**: no destructuring, no spread/rest, every string built with `+` concatenation.
- **DOM/events**: no search-input listener, no event delegation, no null checks before touching the DOM, and `renderBookCatalogue` never cleared its container before re-rendering.
- **JSON**: `importLibraryData`/`loadFromLocalStorage` called `JSON.parse` with no `try-catch` or validation.
- **Testing**: only 3 real assertions existed; every other `describe` block was comments only.

## Missing Features

An ES module split across `library.js`/`ui.js`/`storage.js`, `styles.css`, `.gitignore`, 15+ passing Jest tests with jsdom/localStorage mocks, try-catch on I/O-adjacent functions, parameter validation, and a real README.

## Fix Strategy

I worked bottom-up: clean up scoping/operators/control-flow, complete the OOP layer, layer in modern syntax while already touching those functions, split into ES modules, fix DOM/events/storage, add the stylesheet, and expand tests last, once behaviour was stable enough not to rewrite them twice.
