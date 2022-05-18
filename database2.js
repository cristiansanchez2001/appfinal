const DBSOURCE = "usersdb.sqlite";
var sqlite3 = require('sqlite3').verbose()
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const md5 = require('md5');

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    } 
    else {        
        var salt = bcrypt.genSaltSync(10);
        
        db.run(`CREATE TABLE Users (
            
            firstName text, 
            lastName text,
            email text, 
            password text           
            
            )`,
        (err) => {
            if (err) {
                // Table already created
            } else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO Users (firstName, lastName,  email, password) VALUES (?,?,?,?)'
                db.run(insert, ["John", "Doe", "test@email.com", md5("password")]) 

            }
        });  
    }
});

module.exports = db
/* XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg= */