const express = require('express');
const axios = require('axios');   // Axios imported
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// --------------------
// Task 6: Register a new user
// --------------------
public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if(!username || !password){
    return res.status(400).json({message: "Username and password are required"});
  }
  if(users.find(u => u.username === username)){
    return res.status(409).json({message: "User already exists"});
  }
  users.push({username, password});
  return res.status(201).json({message: "User registered successfully"});
});

// --------------------
// Task 10: Get all books (Axios + async/await)
// --------------------
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/books");
    res.send(JSON.stringify(response.data, null, 2));
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

// --------------------
// Task 11: Get book details by ISBN (Axios + Promise)
// --------------------
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  axios.get("http://localhost:5000/books")
    .then(response => {
      const book = response.data[isbn];
      if(book){
        res.send(JSON.stringify(book, null, 2));
      } else {
        res.status(404).json({message: "Book not found"});
      }
    })
    .catch(err => res.status(500).json({message: err.message}));
});

// --------------------
// Task 12: Get book details by Author (Axios + async/await)
// --------------------
public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params;
  try {
    const response = await axios.get("http://localhost:5000/books");
    const matches = Object.values(response.data).filter(b => b.author === author);
    if(matches.length > 0){
      res.send(JSON.stringify(matches, null, 2));
    } else {
      res.status(404).json({message: "No books found for this author"});
    }
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

// --------------------
// Task 13: Get book details by Title (Axios + Promise)
// --------------------
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  axios.get("http://localhost:5000/books")
    .then(response => {
      const matches = Object.values(response.data).filter(b => b.title === title);
      if(matches.length > 0){
        res.send(JSON.stringify(matches, null, 2));
      } else {
        res.status(404).json({message: "No books found with this title"});
      }
    })
    .catch(err => res.status(500).json({message: err.message}));
});

// --------------------
// Task 5: Get book reviews by ISBN
// --------------------
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if(book && book.reviews){
    res.send(JSON.stringify(book.reviews, null, 2));
  } else {
    res.status(404).json({message: "Reviews not found"});
  }
});

// --------------------
// Review CRUD with Async/Await
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
