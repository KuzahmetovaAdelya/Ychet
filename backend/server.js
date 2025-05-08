import express from "express"
import cors from 'cors';
import db from './db.js';
import authMiddleware from './middleware.js';
import jwt from 'jsonwebtoken'
import {encodePassword, verifyPassword} from './password.js'
import bcrypt from "bcrypt";
import 'dotenv/config'

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post("/createUser", authMiddleware, (req, res) => {
    let userRole = req.user.role;
    if (userRole === 'admin') {
        // Password encoding
        const hashedPassword = encodePassword(req.body.password);

        db.run("INSERT INTO Users(login, surname, name, patronymic, unit, role, password) VALUES (?, ?, ?, ?, ?, ?, ?)", [
            req.body.login, 
            req.body.surname, 
            req.body.name, 
            req.body.patronymic, 
            req.body.unit, 
            req.body.role, 
            hashedPassword
        ], (err) => {
            if (err) {
                res.status(409).send(err);
                return console.log(err.message)
            } 

            res.status(201).send('Created')
        })
    }
})

app.post("/auth", (req, res) => {

    db.all('SELECT password, name, surname, patronymic, role, id FROM Users WHERE login=?', [req.body.login], (err, row) => {
        if (err) {
            res.status(409).send(err)
            return console.log(err.message);
        } else {
            let passwordHash = row[0].password
            let userPassword = req.body.password

            const isPasswordCorrect = verifyPassword(userPassword, passwordHash)
            if (isPasswordCorrect) {
                try {
                    const id = row[0].id
                    const role = row[0].role
                    const token = jwt.sign(
                        { 
                          userId: id,
                          userRole: role
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: '24h' }
                    );
                    res.send({token});
                } catch (error) {
                    res.status(500).send('Login failed' );
                    console.log(error)
                }
            } else {
                res.status(403).send("Wrong password")
            }
        }
    });
})

app.get('/getUsers', (req, res) => {
    db.all("SELECT * from users", (err, row) => {
        if (err) {
            res.status(500).send(err)
            console.log(err.message)
        } else {
            try {
                res.status(200).send(row)
            } catch (error) {
                res.status(500).send(error)
            }
        }
    })
})


app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}/`);
})