const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const SECRET = require("./auth_users.js").SECRET;
const jwt = require("./auth_users.js").jwt;
const public_users = express.Router();


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
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
