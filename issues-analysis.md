# Issues Analysis — Library Management System

## Critical Errors (breaks functionality) — 15+

1. `library.js:4` `books = []` — undeclared global (silent global leak in non-strict mode)
2. `library.js:7` `MAX_BOOKS_PER_MEMBER = 5` — undeclared global
3. `library.js:33` `DigitalBook` constructor never calls `super()` — throws `ReferenceError` on every instantiation
4. `library.js:61` `Member.canBorrow`: `this.borrowedBooks.length = MAX_BOOKS_PER_MEMBER` — assignment instead of `===`, corrupts array length
5. `library.js:100-106` `processReturnQueue` — `while` loop never increments `index` — infinite loop, hangs the browser tab
6. `library.js:111-121` `searchBooksByCategory` — no base case; recursion reads past array end → `TypeError`
7. `library.js:116` same function — `=` instead of `===` in condition
8. `library.js:129` `getBooksByAuthor` — `==` instead of `===`
9. `library.js:202` `findMemberById` — `=` instead of `===`, plus implicit `undefined` return never checked by callers
10. `library.js:180-196` `borrowBook` — no null check on `member`/`book` before calling methods → `TypeError` when either lookup fails
11. `ui.js:12` `querySelector("filter-category")` — missing `#`, selector matches nothing, returns `null`, used unchecked
12. `ui.js:24` filter dropdown listens for `"click"` instead of `"change"` — never fires on selection
13. `ui.js:55` form submit handler missing `event.preventDefault()` — triggers real page reload
14. `ui.js:113` `handleFilterChange` — `=` instead of `===`
15. `ui.js:151-152` `saveToLocalStorage` — arrays passed directly to `setItem` without `JSON.stringify`, stored as `"[object Object]"`
16. `ui.js:226` `initializeUI()` called at parse time, before `DOMContentLoaded`, and `ui.js` loads before `library.js` in `index.html` — `books`/`members` don't exist yet
17. `index.html:7` references `styles.css`, which doesn't exist in the repo

## Major Issues by JS Concept

- **Scoping**: `var` used throughout every function instead of `let`/`const` (both files)
- **OOP**: `Book` missing `availableCopies`/`totalCopies`/`isAvailable()`/`getInfo()`; `checkOut()` never validates copy availability; `Member` missing `joinDate` and duration/info methods; `PremiumMember` never overrides `canBorrow`; `LibraryStats` missing 3 required methods
- **Functional programming**: manual `for` loops used where `filter`/`map`/`reduce` are required (`getBooksByAuthor`, `calculateTotalLateFees`, `getMostPopularBook`)
- **Modern JS**: zero destructuring, zero spread/rest, all string building via `+` concatenation instead of template literals
- **DOM/events**: no listener on the search input at all; no event delegation; no null checks before any DOM read/write; `renderBookCatalogue` never clears its container before re-rendering (duplicates accumulate)
- **JSON**: `importLibraryData`/`loadFromLocalStorage` call `JSON.parse` with no `try-catch` and no validation of the parsed shape
- **Testing**: only 3 real test cases exist; every other `describe` block is comments only

## Missing Features Required

ES module structure (`src/library.js`, `src/ui.js`, `src/storage.js`), `styles.css`, `.gitignore`, 15+ passing Jest tests with jsdom/localStorage mocks, try-catch coverage on all I/O-adjacent functions, parameter validation, and a populated `README.md`.

## Systematic Fix Strategy

Work bottom-up: (1) fix scoping/operators/control-flow so nothing throws, (2) complete the OOP layer, (3) layer in modern JS syntax while touching the same functions, (4) split into ES modules with a Babel/Jest transform, (5) fix DOM/events/storage in `ui.js`/`storage.js`, (6) add `styles.css`, (7) expand the test suite last, once behavior is stable, so tests assert final intended behavior rather than being rewritten twice.
