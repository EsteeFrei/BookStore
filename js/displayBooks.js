import initialData from '.././books.json' with {type: "json"};

let all_books;
let currentPage = 1;
const itemsPerPage = 7;

let books = loadBooks();
renderTable(books); 

function loadBooks() {
    all_books = JSON.parse(localStorage.getItem('books')) || [];
    if (all_books.length > 0) {
        return all_books;
    }
    else {
        saveBooks(initialData)
        return initialData
    }
}

function saveBooks(books) {
    localStorage.setItem('books', JSON.stringify(books));
}

function createTable(data) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');

    const headers = ['ID', 'Title', 'Price', 'Actions'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    
    paginatedData.forEach(item => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.textContent = item.id;

        row.appendChild(idCell);

        const titleCell = document.createElement('td');
        titleCell.textContent = item.title;
        row.appendChild(titleCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = item.price.toFixed(2);
        row.appendChild(priceCell);

        const actionCell = document.createElement('td');
        actionCell.classList.add('buttonContainer');

        // כפתור Read
        const readButton = document.createElement('button');
        readButton.textContent = 'Read';
        readButton.className = 'readButton';
        readButton.onclick = () => showBookDetails(item);

        actionCell.appendChild(readButton);

        // כפתור Update
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.className = 'updateButton';
        updateButton.onclick = () => updateBook(item);
        actionCell.appendChild(updateButton);

        // כפתור Delete
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'deleteButton';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            deleteBook(item.id);
        };
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        table.appendChild(row);
    });

    //return table;
    tableContainer.appendChild(table);
    createPagination(data.length);
}

function createPagination(totalItems) {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = ''; 

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.onclick = () => changePage(currentPage - 1);
        paginationContainer.appendChild(prevButton);
    }

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('pageButton')
        pageButton.onclick = () => changePage(i);
        if (i === currentPage) {
            pageButton.disabled = true; 
        }
        paginationContainer.appendChild(pageButton);
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => changePage(currentPage + 1);
        paginationContainer.appendChild(nextButton);
    }
}

function changePage(pageNumber) {
    currentPage = pageNumber;
    let a= loadBooks()
    createTable(a); 
}

function showBookDetails(book) {
    const bookTitle = document.getElementById('bookTitle');
    bookTitle.textContent = book.title;

    const bookImage = document.getElementById('bookImage');
    bookImage.src = book.img;
    bookImage.alt = book.title;
    bookImage.style.display = 'block';

    const bookPrice = document.getElementById('bookPrice');
    bookPrice.textContent = `₪${book.price.toFixed(2)}`;

    const description = document.getElementById('bookDescription');
    description.textContent = book.description;

    const storedRating = localStorage.getItem(`rating-${book.id}`);
    currentRating = storedRating ? parseInt(storedRating) : 0;
    document.getElementById('ratingValue').textContent = currentRating;

    currentBookId = book.id;
}

function updateRatingDisplay() {
    document.getElementById('ratingValue').textContent = currentRating;
    if (currentBookId) {
        localStorage.setItem(`rating-${currentBookId}`, currentRating);
    }
}

function deleteBook(bookId) {
    const books = loadBooks();
    const filteredBooks = books.filter(book => book.id !== bookId);
    saveBooks(filteredBooks);
    renderTable(filteredBooks);
    clearBookDetails();
}

function updateBook(book) {
    const newTitle = prompt("Enter new title:", book.title);
    const newPrice = prompt("Enter new price:", book.price);
    const newImg = prompt("Enter new image URL:", book.img);

    if (newTitle && newPrice && newImg) {
        book.title = newTitle;
        book.price = parseFloat(newPrice);
        book.img = newImg;

        const books = loadBooks();
        const updatedBooks = books.map(b => b.id === book.id ? book : b);
        saveBooks(updatedBooks);
        renderTable(updatedBooks);
        showBookDetails(book);
    }
}

function clearAddBookForm() {
    document.getElementById('bookTitleInput').value = '';
    document.getElementById('bookPriceInput').value = '';
    document.getElementById('bookImageInput').value = '';
}

function clearBookDetails() {
    document.getElementById('bookTitle').textContent = "Select a book to see the details.";
    document.getElementById('bookImage').style.display = 'none';
    document.getElementById('bookPrice').textContent = "";
    document.getElementById('ratingValue').textContent = "0";
}

function renderTable(data) {

    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    const table = createTable(data);
    tableContainer.appendChild(table);
}

document.getElementById('decreaseRating').onclick = () => {
    if (currentRating > 0) {
        currentRating--;
        updateRatingDisplay();
    }
};

document.getElementById('increaseRating').onclick = () => {
    currentRating++;
    updateRatingDisplay();
};

document.getElementById('addBookButton').onclick = () => {
    document.getElementById('addBookModal').style.display = 'flex';
};

document.getElementById('cancelButton').onclick = () => {
    document.getElementById('addBookModal').style.display = 'none';
};

document.getElementById('submitBookButton').onclick = () => {
    const title = document.getElementById('bookTitleInput').value;
    const price = parseFloat(document.getElementById('bookPriceInput').value);
    const img = document.getElementById('bookImageInput').value;
    const description = document.getElementById('bookDescriptionInput').value;

    if (title && !isNaN(price) && img) {
        const books = loadBooks();
        const newBook = {
            id: books.length ? books[books.length - 1].id + 1 : 1,
            title,
            price,
            img,
            description
        };
        document.getElementById('addBookModal').style.display = 'none';
        clearAddBookForm();
        books.push(newBook);
        saveBooks(books);
        renderTable(books);  
    } else {
        alert("Please enter valid details.");
    }
};



