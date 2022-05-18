const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose()
var db = require("./database2.js")
const crypto = require('crypto');
const app = express();
const authTokens = {};
const md5 = require('md5');
/* const users = [
     //This user is added to the array to avoid creating new user on each restart
    { 
        firstName: 'John',
        lastName: 'Doe',
       email: 'johndoe@email.com',
       // This is the SHA256 hash for value of `password`
        password: 'XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg='
    }
]; */
app.listen(3000);



const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use((req, res, next) => {
    const authToken = req.cookies['AuthToken'];
    req.user = authTokens[authToken];
    next();
});

app.engine('hbs', exphbs({
    extname: '.hbs'
}));

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.post("/login", (req, res, next) => {

var email = req.body.email;
var password = md5(req.body.password);


db.all('SELECT email,password FROM Users WHERE email="'+email+'" AND password="'+password+'"',(err,data)=>{
    if (err) {
    res.status(400).json({ "error": err.message })
     return;
      }

    if (data.length==1) {
            const authToken = generateAuthToken();
            authTokens[authToken] = email;
            res.cookie('AuthToken', authToken);
            res.redirect('/protected');
            /* return; */
        } else {
            res.render('login', {
                message: 'Contraseña o correo incorrecto',
                messageClass: 'alert-danger'
            });
    }
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
//    const { email, firstName, lastName, password, confirmPassword } = req.body;
var email = req.body.email;
var firstName = req.body.firstName;
var lastName = req.body.lastName;
var password = md5(req.body.password);
var confirmPassword = md5(req.body.confirmPassword);

    if (password === confirmPassword) {
        var sql ='INSERT INTO Users (firstName, lastName, email, password) VALUES (?,?,?,?)'
        db.all(sql, [firstName, lastName, email, password], (err, result) => {
            if (err) {
                console.log(err)
                res.render('register', {
                    message: 'User already registered.',
                    messageClass: 'alert-danger'
                })
            } else {
                res.render('login', {
                    message: 'Registration Complete. Please login to continue.',
                    messageClass: 'alert-success'
                });
            }
        }); 
    } else {
        res.render('register', {
            message: 'Password does not match.',
            messageClass: 'alert-danger'
        });
    }
});

app.get('/protected', (req, res) => {
    if (req.user) {
        res.render('protected');
    } else {
        res.render('login', {
            message: 'Tienes que logearte para poder entrar',
            messageClass: 'alert-danger'
        });
    }
});

