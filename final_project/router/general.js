const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const SECRET = require("./auth_users.js").SECRET;
const jwt = require("./auth_users.js").jwt;
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

  const user = {id: users.length + 1, username, password};
  users.push(user);

  const token = jwt.sign({userId:user.id}, SECRET,{expiresIn: "1h"});
  return res.status(201).json({message: "User registered successfully", token});
});

// Get all books
public_users.get("/books", (req, res) => {
  res.json(books);
});

// Get book list (async)
public_users.get('/', async function (req, res) {
  try {
    const book_list = await axios.get("http://localhost:5000/books");
    res.status(200).json(book_list.data);
  } catch(error) {
    res.status(404).json({message: "Book record was not found"});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const {isbn} = req.params;
    const book_list = await axios.get("http://localhost:5000/books");
    const book = book_list.data[isbn];

    if(book){
      return res.status(200).json(book);
    }
    return res.status(404).json({message: "Record was not found"});
  } catch(error) {
    res.status(500).json({message: error.message});
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const {author} = req.params;
    const book_list = await axios.get("http://localhost:5000/books");
    const booksArray = Object.values(book_list.data);

    const matches = booksArray.filter(b => b.author === author);

    if(matches.length === 0){
      return res.status(404).json({message:"No books found for this author"});
    }
    res.status(200).json(matches);
  } catch(error) {
    res.status(500).json({message: error.message});
  }
});

// Get book details based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const {title} = req.params;
    const book_list = await axios.get("http://localhost:5000/books");
    const booksArray = Object.values(book_list.data);

    const matches = booksArray.filter(b => b.title === title);

    if(matches.length === 0){
      return res.status(404).json({message:"No books found with this title"});
    }
    res.status(200).json(matches);
  } catch(error) {
    res.status(500).json({message: error.message});
  }
});

// Get book review
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const {isbn} = req.params;
    const book_list = await axios.get("http://localhost:5000/books");
    const book = book_list.data[isbn];

    if(book){
      return res.status(200).json(book.reviews);
    }
    return res.status(404).json({message: "Record was not found"});
  } catch(error) {
    res.status(500).json({message: error.message});
  }
});

module.exports.general = public_users;
