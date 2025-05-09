import express from "express";
import cors from "cors";
import db from "./db.js";
import authMiddleware from "./middleware.js";
import jwt from "jsonwebtoken";
import { encodePassword, verifyPassword } from "./password.js";
import bcrypt from "bcrypt";
import "dotenv/config";

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

// API FOR ACTIONS WITH USERS

// Post method for create user
// Need in body: login:str, surname:str, name:str, patronymic:str, unit:int, role:"admin"||"user", password:str
// Needs Bearer Authorization
// Works only for admins
app.post("/createUser", authMiddleware, (req, res) => {
  let userRole = req.user.role;
  if (userRole === "admin") {
    const hashedPassword = encodePassword(req.body.password);

    db.run(
      "INSERT INTO Users(login, surname, name, patronymic, unit, role, password) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        req.body.login,
        req.body.surname,
        req.body.name,
        req.body.patronymic,
        req.body.unit,
        req.body.role,
        hashedPassword,
      ],
      (err) => {
        if (err) {
          res.status(409).send(err);
          return console.log(err.message);
        }

        res.status(201).send("Created");
      }
    );
  } else {
    res.status(403).send("Forbidden");
  }
});

// Post method for authorization
// Needs in body: login:str, password:str
// Returns token
app.post("/auth", (req, res) => {
  db.all("SELECT id FROM Users WHERE login=?", [req.body.login], (err, row) => {
    if (err) {
      res.status(409).send(err);
      return console.log(err.message);
    } else {
      let passwordHash = row[0].password;
      let userPassword = req.body.password;

      const isPasswordCorrect = verifyPassword(userPassword, passwordHash);
      if (isPasswordCorrect) {
        try {
          const id = row[0].id;
          const token = jwt.sign(
            {
              userId: id,
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
          );
          res.send({ token });
        } catch (error) {
          res.status(500).send("Login failed");
          console.log(error);
        }
      } else {
        res.status(403).send("Wrong password");
      }
    }
  });
});

// Get method for getting all users information
// Needs Bearer Authorization
// Works only for admins
app.get("/getUsers", authMiddleware, (req, res) => {
  if (req.user.role === "admin") {
    db.all("SELECT * from users", (err, row) => {
      if (err) {
        res.status(500).send(err);
        console.log(err.message);
      } else {
        try {
          res.status(200).send(row);
        } catch (error) {
          res.status(500).send(error);
        }
      }
    });
  } else {
    res.status(403).send("Forbidden");
  }
});

// Get method for get information about current user
// Needs Bearer Authorization
app.get("/getMe", authMiddleware, (req, res) => {
  const userData = {
    surname: req.user.surname,
    name: req.user.name,
    patronymic: req.user.patronymic,
    unit: req.user.unit,
  };
  res.status(200).send(userData);
});

// Delete method for deleting user
// Needs in body: userId:int
// Needs Bearer Authorization
// Works only for admin
app.delete("/deleteUser", authMiddleware, (req, res) => {
  if (req.user.role === "admin") {
    db.run("DELETE FROM users WHERE id = ?", [req.body.userId], (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      }
      let result = {
        error: "none",
      };
      res.status(200).send(result);
    });
  }
});

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}/`);
});
