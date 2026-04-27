const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const SECRET = require("./auth_users.js").SECRET;
const jwt = require("./auth_users.js").jwt;
const public_users = express.Router();
const axios = require("axios");



public_users.get("/list", (req, res) => {
  res.json(books);
});

public_users.post("/register", (req,res) => {
  
  //Write your code here
  const {username, password} = req.body;
  if(!isValid(username) || !password){
   return res.status(400).json({message: "Invalid username or password"});
  }

  const userExists = users.find(u => u.username == username);

  if(userExists){
    return res.status(409).json({message: "User already exists"});
  }

  
  const user = {id: users.length + 1, username, password};

    users.push(user);
 
  const token = jwt.sign({userId:user.id}, SECRET,{expiresIn: "1h"})

  return res.status(201).json({message: "User registered successfully"});
});


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  try{
    const book_list = await axios.get("http://localhost:5000/list");

    res.status(200).json(book_list.data)

  }catch(error){
    res.status(404).json({message: "Book record was not found"})
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
 
try{
     const {isbn} = req.params;
     
    const book_li = await axios.get("http://localhost:5000/list");
    const booksArray = Object.values(book_li.data);

    // Find the book by author
    const bo = booksArray.find(a => a.ISBN === isbn);

    if(!bo){
      return res.status(404).json({message: "Record was not found"})
    }
    res.status(200).json(bo);
    

  }catch(error){
    res.status(500).json({message: error.message})
  }
 
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
  try{
   const {author} = req.params;
     
    const book_list = await axios.get("http://localhost:5000/list");

    const booksArray = Object.values(book_list.data);

    // Find the book by author
    const book = booksArray.find(b => b.author === author);

    if(!book){
      return res.status(404).json({message:"Book was not found"})
    }
    res.status(200).json(book)

    //const book = book_list.data[isbn];
  }catch(error){
    res.status(500).json({message: error.message})
  }

});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  try{
   const {title} = req.params;
     
    const book_list2 = await axios.get("http://localhost:5000/list");

    const booksArray = Object.values(book_list2.data);

    // Find the book by author
    const book2 = booksArray.find(i => i.title === title);

    if(!book2){
      return res.status(404).json({message:"Book was not found"})
    }
    res.status(200).json(book2)

  }catch(error){
    res.status(500).json({message: error.message})
  }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  //Write your code here
  try{
     const {isbn} = req.params;
     
    const book_list3 = await axios.get("http://localhost:5000/list");
    const booksArray = Object.values(book_list3.data);

    // Find the book by author
    const book3 = booksArray.find(u => u.ISBN === isbn);

    if(!book3){
      return res.status(404).json({message: "Record was not found"})
    }
    res.status(200).json(book3.reviews);
    

  }catch(error){
    res.status(500).json({message: error.message})
  }
 
});

module.exports.general = public_users;
