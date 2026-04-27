const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register
public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if(!isValid(username) || !password){
    return res.status(400).json({message: "Invalid username or password"});
  }
  if(users.find(u => u.username === username)){
    return res.status(409).json({message: "User already exists"});
  }
  users.push({username, password});
  return res.status(201).json({message: "User registered successfully"});
});

// Login
public_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  return res.status(200).json({ message: "Login was successful" });
});

// --------------------
// Async/Callback style
// --------------------
public_users.get('/books', (req, res) => {
  setTimeout(() => res.status(200).json(books), 0);
});

// --------------------
// Promise style routes
// --------------------
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    book ? resolve(book) : reject("Book not found");
  })
  .then(book => res.json(book))
  .catch(err => res.status(404).json({ message: err }));
});

public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  new Promise((resolve, reject) => {
    const matches = Object.values(books).filter(b => b.author === author);
    matches.length ? resolve(matches) : reject("No books found for this author");
  })
  .then(matches => res.json(matches))
  .catch(err => res.status(404).json({ message: err }));
});

public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  new Promise((resolve, reject) => {
    const matches = Object.values(books).filter(b => b.title === title);
    matches.length ? resolve(matches) : reject("No books found with this title");
  })
  .then(matches => res.json(matches))
  .catch(err => res.status(404).json({ message: err }));
});

public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    (book && book.reviews) ? resolve(book.reviews) : reject("Reviews not found");
  })
  .then(reviews => res.json(reviews)) // raw reviews object
  .catch(err => res.status(404).json({ message: err }));
});

// --------------------
// CRUD with Async/Await
// --------------------
public_users.post('/review/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const { review } = req.body;
    if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
    books[isbn].reviews = books[isbn].reviews || {};
    books[isbn].reviews[`review${Object.keys(books[isbn].reviews).length+1}`] = review;
    res.json({ message: "Review added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

public_users.put('/review/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const { key, review } = req.body;
    if (!books[isbn] || !books[isbn].reviews[key]) {
      return res.status(404).json({ message: "Review not found" });
    }
    books[isbn].reviews[key] = review;
    res.json({ message: "Review updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

public_users.delete('/review/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const { key } = req.body;
    if (!books[isbn] || !books[isbn].reviews[key]) {
      return res.status(404).json({ message: "Review not found" });
    }
    delete books[isbn].reviews[key];
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports.general = public_users;
