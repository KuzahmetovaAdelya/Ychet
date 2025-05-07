import express from "express"
import cors from 'cors';
import db from './db.js';
import authMiddleware from './middleware.js';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post("/registration", (req, res) => {
    db.run("INSERT INTO Users(email, name, surname, city, password) VALUES (?, ?, ?, ?, ?)", [req.body.email, req.body.name, req.body.surname, req.body.city, req.body.password], (err) => {
        if (err) {
            res.status(409).send(err);
            return console.log(err.message)
        } 
        
        db.all("SELECT id FROM Users WHERE email = ?", [req.body.email], (err, row) => {
            if (err) {
                res.status(401).send(err);
                return console.log(err.message)
            } else {
                try {
                    let id = row[0].id
                    const token = jwt.sign(
                        { 
                          userId: id
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: '24h' }
                    );
                    res.send({token});
                } catch (error) {
                    res.status(500).send('Login failed' );
                    console.log(error)
                }
            }
        })
    })
})

app.get('/getusers', (req, res) => {
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