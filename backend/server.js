import express from "express";
import cors from "cors";
import db from "./db.js";
import authMiddleware from "./middleware.js";
import jwt from "jsonwebtoken";
import { encodePassword, verifyPassword } from "./password.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import GetDate from "./date.js";

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

// API FOR ACTIONS WITH USERS

// Post method for create user
// Need in body: login:str, surname:str, name:str, patronymic:str, unit:int, role:"admin"||"user", password:str, passwordRepeat:str
// Need Bearer Authorization
// Work only for admins
app.post("/createUser", authMiddleware, (req, res) => {
  let userRole = req.user.role;
  if (userRole === "admin") {
    if (req.body.password === req.body.passwordRepeat) {
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
      res.status(400).send("Passwords aren't same");
    }
  } else {
    res.status(403).send("Forbidden");
  }
});

// Post method for authorization
// Need in body: login:str, password:str
// Return token
app.post("/auth", (req, res) => {
  db.all(
    "SELECT id, password FROM Users WHERE login=?",
    [req.body.login],
    (err, rows) => {
      if (err) {
        res.status(409).send(err);
        return console.log(err.message);
      }
      if (!rows || rows.length === 0) {
        return res.status(403).send("User not found");
      }
      let passwordHash = rows[0].password;
      let userPassword = req.body.password;

      const isPasswordCorrect = verifyPassword(userPassword, passwordHash);
      if (isPasswordCorrect) {
        try {
          const id = rows[0].id;
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
  );
});

// Get method for getting all users information
// Need Bearer Authorization
// Work only for admins
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
// Need Bearer Authorization
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
// Need in body: userId:int
// Need Bearer Authorization
// Work only for admin
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
  } else {
    res.status(403).send("Forbidden");
  }
});

// Put method to update user data
// Need in body: login:str, surname:str, name:str, patronymic:str, unit:int, password:str, passwordRepeat:str, id:int
// Need Bearer Authorization
// Work only for admins
app.put("/updateUser", authMiddleware, (req, res) => {
  if (req.user.role === "admin") {
    if (req.body.password === req.body.passwordRepeat) {
      const hashedPassword = encodePassword(req.body.password);
      db.run(
        "UPDATE users SET login = ?, surname = ?, name = ?, patronymic = ?, unit = ?, password = ? WHERE id = ?",
        [
          req.body.login,
          req.body.surname,
          req.body.name,
          req.body.patronymic,
          req.body.unit,
          hashedPassword,
          req.body.id,
        ],
        (err, row) => {
          if (err) {
            res.status(500).send(err);
            return console.log(err.message);
          }
          res.status(200).send("Updated");
        }
      );
    } else {
      res.status(403).send("Wrong password");
    }
  } else {
    res.status(403).send("Forbidden");
  }
});

// CABINETS

// Get method for getting cabinets by unit
// Need Bearer Authorization
// Work for users from needed unit
app.get("/getCabsByUnit", authMiddleware, (req, res) => {
  db.all(
    "SELECT id, unit, cabinet FROM cabinets WHERE unit=?",
    [req.user.unit],
    (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      } else {
        res.status(200).send(row);
      }
    }
  );
});

// Post method for creating new cabinet
// Need in body: cabinet:str
// Need Bearer Authorization
app.post("/createCabinet", authMiddleware, (req, res) => {
  const unit = req.user.unit;
  db.run(
    "INSERT INTO cabinets(unit, cabinet) VALUES (?, ?)",
    [unit, req.body.cabinet],
    (err) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      }

      res.status(201).send("Created");
    }
  );
});

app.delete('/deleteCabinet', authMiddleware, (req, res) => {
  const unit = req.user.unit;
  db.run("DELETE FROM cabinets WHERE unit = ? AND cabinet = ?", [unit, req.body.cabinet], (err, row) => {
    if (err) {
      res.status(500).send(err);
      return console.log(err.message);
    }
    let result = {
      error: "none",
    };
    res.status(200).send(result);
  });
})

// Get method for getting all cabinets
// Need Bearer Authorization
// Work only for admin
app.get("/getCabs", authMiddleware, (req, res) => {
  if (req.user.role === "admin") {
    db.all("SELECT * FROM cabinets", (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      } else {
        res.status(200).send(row);
      }
    });
  } else {
    res.status(403).send("Forbidden");
  }
});

// RESOURCES

// Get method for getting resources by unit
// Need Bearer Authorization
app.get("/getResByUnit", authMiddleware, (req, res) => {
  db.all(
    "SELECT * FROM resources WHERE unit=?",
    [req.user.unit],
    (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      } else {
        res.status(200).send(row);
      }
    }
  );
});

// Post method for creating resource
// Need in body: title:str, inventoryNumber:int, worker:str, checkCode:float||int, count:int, price:float||int
// Need Bearer Authorization
app.post("/createRes", authMiddleware, (req, res) => {
  const dateOfRecord = GetDate();

  const price = req.body.price * req.body.count;
  db.run(
    "INSERT INTO resources(title, inventoryNumber, dateOfRecord, worker, checkCode, count, price, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      req.body.title,
      req.body.inventoryNumber,
      dateOfRecord,
      req.body.worker,
      req.body.checkCode,
      req.body.count,
      price,
      req.user.unit,
    ],
    (err) => {
      if (err) {
        res.status(409).send(err);
        return console.log(err.message);
      }

      res.status(201).send("Created");
    }
  );
});

// Get method for getting all resources
// Need Bearer Authorization
// Work only for admin
app.get("/getRes", authMiddleware, (req, res) => {
  if (req.user.role === "admin") {
    db.all("SELECT * FROM resources", (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      } else {
        res.status(200).send(row);
      }
    });
  } else {
    res.status(403).send("Forbidden");
  }
});

// Delete method for deleting resource and create new write in write-off journal
// Need in body: inventoryNumber:int, count:int
// Need Bearer Authorization
app.delete("/deleteRes", authMiddleware, (req, res) => {
  const unit = req.user.unit;
  const inventoryNumber = req.body.inventoryNumber;

  db.all(
    "SELECT * FROM resources WHERE inventoryNumber=? AND unit=?",
    [inventoryNumber, unit],
    (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      } else {
        const resource = row[0];
        if (resource.count >= req.body.count) {
          const worker = resource.worker;
          const count = req.body.count;
          const date = GetDate();

          db.run(
            "INSERT INTO writeoffres(date, inventoryNumber, worker, count, unit) VALUES (?, ?, ?, ?, ?)",
            [date, inventoryNumber, worker, count, unit],
            (err) => {
              if (err) {
                res.status(409).send(err);
                return console.log(err.message);
              }

              if (resource.count === count) {
                db.run(
                  "DELETE FROM resources WHERE inventoryNumber = ?",
                  [inventoryNumber],
                  (err, row) => {
                    if (err) {
                      res.status(500).send(err);
                      return console.log(err.message);
                    }
                    let result = {
                      error: "none",
                    };
                    res.status(200).send(result);
                  }
                );
              } else {
                let newCount = resource.count - count;
                const priceByOne = resource.price / resource.count;
                let newPrice = newCount * priceByOne;
                console.log(resource.count, newCount, priceByOne, newPrice);
                db.run(
                  "UPDATE resources SET count = ?, price = ? WHERE inventoryNumber = ?",
                  [newCount, newPrice, inventoryNumber],
                  (err, row) => {
                    if (err) {
                      res.status(500).send(err);
                      return console.log(err.message);
                    }
                    res.status(200).send("Updated");
                  }
                );
              }
            }
          );
        } else {
          res.status(400).send("Not enough resources");
        }
      }
    }
  );
});

// Put method for updating resource
// Need in body: title:str, inventoryNumber:int, dateOfRecord:str, worker:str, checkCode:float, count:int, price:float, id:int
// Need Bearer Authorization
app.put("/updateRes", authMiddleware, (req, res) => {
  db.run(
    "UPDATE resources SET title = ?, inventoryNumber = ?, dateOfRecord = ?, worker = ?, checkCode = ?, count = ?, price = ? WHERE id = ? AND unit = ?",
    [
      req.body.title,
      req.body.inventoryNumber,
      req.body.dateOfRecord,
      req.body.worker,
      req.body.checkCode,
      req.body.count,
      req.body.count * req.body.price,
      req.body.id,
      req.user.unit,
    ],
    (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      }
      res.status(200).send("Updated");
    }
  );
});

// STOCKS

// Post method for creating stock
// Need in body: title:str, inventoryNumber:str, measurement:str, worker:str, kfo:int, score:str, count:float, price:float
// Need Bearer Authorization
app.post("/createStock", authMiddleware, (req, res) => {
  const price = req.body.price * req.body.count;
  db.run(
    "INSERT INTO stocks(title, inventoryNumber, measurement, worker, kfo, score, count, price, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      req.body.title,
      req.body.inventoryNumber,
      req.body.measurement,
      req.body.worker,
      req.body.kfo,
      req.body.score,
      req.body.count,
      price,
      req.user.unit,
    ],
    (err) => {
      if (err) {
        res.status(409).send(err);
        return console.log(err.message);
      }

      res.status(201).send("Created");
    }
  );
});

// Get method for getting all stocks
// Need Bearer Authorization
// Works only for admin
app.get("/getStocks", authMiddleware, (req, res) => {
  if (req.user.role === "admin") {
    db.all("SELECT * FROM stocks", (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      } else {
        res.status(200).send(row);
      }
    });
  } else {
    res.status(403).send("Forbidden");
  }
});

// Get method for getting stocks by unit
// Needs Bearer Authorization
app.get("/getStocksByUnit", authMiddleware, (req, res) => {
  db.all("SELECT * FROM stocks WHERE unit=?", [req.user.unit], (err, row) => {
    if (err) {
      res.status(500).send(err);
      return console.log(err.message);
    } else {
      res.status(200).send(row);
    }
  });
});

// Put method for updating stock
// Needs in body: title:str, inventoryNumber:str, measurement:str, worker:str, kfo:int, score:str, count:float, price:float, id:int
// Needs Bearer Authorization
app.put("/updateStock", authMiddleware, (req, res) => {
  db.run(
    "UPDATE stocks SET title = ?, inventoryNumber = ?, measurement = ?, worker = ?, kfo = ?, score = ?, count = ?, price = ? WHERE id = ? AND unit = ?",
    [
      req.body.title,
      req.body.inventoryNumber,
      req.body.measurement,
      req.body.worker,
      req.body.kfo,
      req.body.score,
      req.body.count,
      req.body.count * req.body.price,
      req.body.id,
      req.user.unit,
    ],
    (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      }
      res.status(200).send("Updated");
    }
  );
});

// Delete method for deleting stocks and create new write in write-off journal
// Need in body: inventoryNumber:str, count:int
// Need Bearer Authorization
app.delete("/deleteStock", authMiddleware, (req, res) => {
  const unit = req.user.unit;
  const inventoryNumber = req.body.inventoryNumber;

  db.all(
    "SELECT * FROM stocks WHERE inventoryNumber=? AND unit=?",
    [inventoryNumber, unit],
    (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.log(err.message);
      } else {
        const stock = row[0];
        if (stock.count >= req.body.count) {
          const worker = stock.worker;
          const count = req.body.count;
          const measurement = stock.measurement;
          const date = GetDate();

          db.run(
            "INSERT INTO writeoffstocks(date, inventoryNumber, worker, measurement, count, unit) VALUES (?, ?, ?, ?, ?, ?)",
            [date, inventoryNumber, worker, measurement, count, unit],
            (err) => {
              if (err) {
                res.status(409).send(err);
                return console.log(err.message);
              }

              if (stock.count === count) {
                db.run(
                  "DELETE FROM stocks WHERE inventoryNumber = ?",
                  [inventoryNumber],
                  (err, row) => {
                    if (err) {
                      res.status(500).send(err);
                      return console.log(err.message);
                    }
                    let result = {
                      error: "none",
                    };
                    res.status(200).send(result);
                  }
                );
              } else {
                let newCount = stock.count - count;
                const priceByOne = stock.price / stock.count;
                let newPrice = newCount * priceByOne;
                // console.log(stock.count, newCount, priceByOne, newPrice);
                db.run(
                  "UPDATE stocks SET count = ?, price = ? WHERE inventoryNumber = ?",
                  [newCount, newPrice, inventoryNumber],
                  (err, row) => {
                    if (err) {
                      res.status(500).send(err);
                      return console.log(err.message);
                    }
                    res.status(200).send("Updated");
                  }
                );
              }
            }
          );
        } else {
          res.status(400).send("Not enough stocks");
        }
      }
    }
  );
});

// app.get("/test", (req, res) => {
//   res.status(200).send(result);
// });

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}/`);
});
