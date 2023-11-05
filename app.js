const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
const bcrypt = require("bcrypt");

let db = null;
app.use(express.json());

const connection = async () => {
  try {
    db = open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Database error: ${e.message}`);
    process.exit(1);
  }
};

// app.post("/register", async (request, response) => {
//   const { username, name, password, gender, location } = request.body;
//   const hasshedPassword = await bcrypt.hash(password, 10);
//   const checkUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
//   const dbUser = await db.get(checkUserQuery);

//   if (dbUser === undefined) {
//     // create new user
//     if (password.length < 5) {
//       // return error password is less than 5 characters
//       response.status(400);
//       response.send("Password is too short");
//     } else {
//       const createUserQuery = `INSERT INTO user (username,name,password,gender,location)
//         VALUES('${username}','${name}','${hasshedPassword}','${gender}','${location}',)`;
//       await db.run(createUserQuery);
//       response.send("User created successfully");
//     }
//   } else {
//     // user already exist
//     response.status(400);
//     response.send("User already exists");
//   }
// });

// second API
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const checkUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(checkUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const checkPass = await bcrypt.compare(password, dbUser.password);
    if (checkPass === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const checkUser = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(checkUser);
  const verifyPassword = await bcrypt.compare(oldPassword, dbUser.password);
  if (verifyPassword === true) {
    // update password
    if (newPassword.length < 5) {
      // password is too short
    } else {
      //update password
      const hashPassword = await bcrypt.hash(newPassword, 10);
      const updatePasswordQuery = `UPDATE user SET password = '${hashPassword}' 
      WHERE username = '${username}'`;
      await db.run(updatePasswordQuery);
      response.status(200);
      response.send("Password updated");
    }
  } else {
    // invalid current password
  }
});

connection();
