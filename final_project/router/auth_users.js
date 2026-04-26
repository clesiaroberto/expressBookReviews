const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

let SECRET = "superUsersBook";

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  if(!username){
     return false;
  }else if(username.length < 3){
     return false;
  }else{
    return true;
  }

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
      return false;
    }
    return true;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if(!authenticatedUser(username, password)){
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = users.find(u => u.username === username);
  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1h" });
    
  //res.json({token})
  return res.status(200).json({message: "Login was successful"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.SECRET= SECRET;
module.exports.jwt = jwt
module.exports.auth_users = regd_users;
