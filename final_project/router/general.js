const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

// Register a new user
public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if(!isValid(username) || !password){
    return res.status(400).json({message: "Invalid username or password"});
  }
  const userExists = users.find(u => u.username === username);
  if(userExists){
    return res.status(409).json({message: "User already exists"});
  }
  users.push({username, password});
  return res.status(201).json({message: "User registered successfully"});
});

// Login route
public_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  return res.status(200).json({ message: "Login was successful" });
});

// --------------------
// Async/Callback style
// --------------------

// Get all books (callback style)
public_users.get('/books', function (req, res) {
  setTimeout(() => {
    return res.status(200).json(books);
  }, 0);
});

// --------------------
// Promise style routes
// --------------------

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) resolve(book);
    else reject("Book not found");
  })
  .then(book => res.status(200).json(book))
  .catch(err => res.status(404).json({ message: err }));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;
  new Promise((resolve, reject) => {
    const matches = Object.values(books).filter(b => b.author === author);
    if (matches.length > 0) resolve(matches);
    else reject("No books found for this author");
  })
  .then(matches => res.status(200).json(matches))
  .catch(err => res.status(404).json({ message: err }));
});

// Get book details based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;
  new Promise((resolve, reject) => {
    const matches = Object.values(books).filter(b => b.title === title);
    if (matches.length > 0) resolve(matches);
    else reject("No books found with this title");
  })
  .then(matches => res.status(200).json(matches))
  .catch(err => res.status(404).json({ message: err }));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book && book.reviews) resolve(book.reviews);
    else reject("Reviews not found");
  })
  .then(reviews => res.status(200).json(reviews))
  .catch(err => res.status(404).json({ message: err }));
});

// --------------------
// CRUD with Async/Await + Axios
// --------------------

// Add or modify a review
public_users.post('/review/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const { review } = req.body;
    if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
    books[isbn].reviews = books[isbn].reviews || {};
    books[isbn].reviews[`review${Object.keys(books[isbn].reviews).length+1}`] = review;
    return res.status(200).json({ message: "Review added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Modify a review
public_users.put('/review/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const { key, review } = req.body;
    if (!books[isbn] || !books[isbn].reviews[key]) {
      return res.status(404).json({ message: "Review not found" });
    }
    books[isbn].reviews[key] = review;
    return res.status(200).json({ message: "Review updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a review
public_users.delete('/review/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const { key } = req.body;
    if (!books[isbn] || !books[isbn].reviews[key]) {
      return res.status(404).json({ message: "Review not found" });
    }
    delete books[isbn].reviews[key];
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports.general = public_users;
