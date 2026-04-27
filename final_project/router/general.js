const express = require('express');
const axios = require('axios');   // Axios imported
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// --------------------
// User Registration & Login
// --------------------
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
// Promise style routes with Axios
// --------------------
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  axios.get("http://localhost:5000/books")
    .then(response => {
      const book = response.data[isbn];
      book ? res.json(book) : res.status(404).json({ message: "Book not found" });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  axios.get("http://localhost:5000/books")
    .then(response => {
      const matches = Object.values(response.data).filter(b => b.author === author);
      matches.length ? res.json(matches) : res.status(404).json({ message: "No books found for this author" });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  axios.get("http://localhost:5000/books")
    .then(response => {
      const matches = Object.values(response.data).filter(b => b.title === title);
      matches.length ? res.json(matches) : res.status(404).json({ message: "No books found with this title" });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  axios.get("http://localhost:5000/books")
    .then(response => {
      const book = response.data[isbn];
      if (book && book.reviews) res.json(book.reviews); // raw reviews object
      else res.status(404).json({ message: "Reviews not found" });
    })
    .catch(err => res.status(500).json({ message: err.message }));
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
