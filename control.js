const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const control = express();
var md5 = require('md5');
const session = require('express-session');

var connection = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "ezarbooking"
})

connection.getConnection((err) => {
    if (err) {
        throw err;
    }
    console.log("Database Connected");
})

control.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

control.set('view engine', 'ejs');
// control.use(express.static("./public"));
control.use('/css', express.static(__dirname + '/public/css'));
control.use('/img', express.static(__dirname + '/public/img'));
control.use('/js', express.static(__dirname + '/public/js'));
control.use('/assets', express.static(__dirname + '/assets'));
control.use(bodyParser.json());
control.use(bodyParser.urlencoded({ extended: true }));

control.get("/", (req, res) => {
    res.redirect("/login");
})
control.get("/login", (req, res) => {
    res.render("login");
    // res.send("hello");
})

control.get("/signup", (req, res) => {
    res.render("signup");
    // res.send("hello");
})

control.get("/home", (req, res) => {
    res.locals.user = req.session.user;
    res.render("home");
    // res.send("hello");
})
control.get("/apartmentProfiles/:id", (req, res) => {
    // res.locals.user = req.session.user;
    res.redirect("/apartmentProfiles?id=" + req.params.id);
    // res.send("hello");
})
control.get("/apartmentProfiles", (req, res) => {
    var id = req.session.user.accUID;
    connection.query("SELECT * FROM apartment WHERE accUID='" + req.session.user.accUID + "'", (err, results) => {
        if (err) {
            throw err
        }
        // res.send(results);
        res.render("ownerApartmentProfiles", { data: results });

    })
})

control.get("/requestedRents/:id", (req, res) => {
    res.locals.user = req.session.user;
    res.redirect("/requestedRents?id=" + req.params.id);
})

control.get("/forums", (req, res) => {
    res.locals.user = req.session.user;
    res.render("forums");
})
control.get("/requestedRents", (req, res) => {
    res.locals.user = req.session.user;
    var a = 0;
    var x = 0;
    var datas = new Array();
    var bigD = new Array();
    connection.query("SELECT * FROM rentrequest WHERE tenantUID ='" + req.query.id + "'", (err, requests) => {
        if (err) {
            throw err
        }

        // res.send(requests);
        for (x = 0; x < requests.length; x++) {
            connection.query("SELECT * FROM apartment WHERE appID ='" + requests[x].appID + "'", (err, results) => {
                if (err) {
                    throw err
                }


                datas = results;
                bigD[a] = datas;
                a++;
                res.render("tenantRequestedRents", { data: results });

            })
            console.log(bigD[0]);
            // datas[a] = requests[x];
        }
        // // res.send(results);
        // res.send(datas);


    })

})

control.get("/addApartment", (req, res) => {
    // res.send(req.session.user.accUID);
    res.render("apartmentAdd", { user: req.session.user });
    // res.send("hello");
})


control.get("/about", (req, res) => {
    res.render("about");
    // res.send("hello");
})

control.get("/editApartment/:id", (req, res) => {
    // res.render("apartmentEdit", { app: req.params.id });
    res.redirect("/editApartment?id=" + req.params.id);
    // res.send("hello");
})

control.get("/editApartment", (req, res) => {

    res.locals.app = req.session.app;
    res.render("apartmentEdit", { app: req.query });
    // res.send("hello");
})

control.get("/deleteApartment/:id", (req, res) => {
    connection.query('DELETE FROM apartment WHERE appID="' + req.params.id + '"', (err, results) => {
        if (err) {
            throw err;
        } else {
            res.redirect('back');
        }
    })
})

control.get("/deleteRequest/:id", (req, res) => {
    res.locals.user = req.session.user;
    connection.query('DELETE FROM rentrequest WHERE appID="' + req.params.id + '"', (err, results) => {
        if (err) {
            throw err;
        } else {
            res.redirect("/profile");
        }
    })
})

control.get("/signup", (req, res) => {
    res.render("signup");
    // res.send("hello");
})

control.get("/home", (req, res) => {
    res.render("home");
})

control.get("/about", (req, res) => {
    res.render("about");
})

control.get("/about", (req, res) => {
    res.render("about");
})

control.get("/editProfile", (req, res) => {

    if (req.session.user.accType == 1) {
        res.redirect("/editOwnerprofile=" + req.session.user.fname + "." + req.session.user.lname);
    } else {
        res.redirect("/profile=" + req.session.user.fname + "." + req.session.user.lname);
    }

})

control.get("/editOwnerprofile=:username", (req, res) => {

    res.locals.user = req.session.user;
    res.render("ownerProfileEdit");

})

control.get("/edit/:id", (req, res) => {
    res.render("/edit/:id");
})


control.post("/apartmentAdd/:id", (req, res) => {

    connection.query('INSERT INTO `apartment`( `accUID`, `city`, `street`, `baranggay`, `type`, `capacity`, `restriction`, `price`, `description`) VALUES ("' + req.params.id + '","' + req.body.city + '","' + req.body.street + '","' + req.body.baranggay + '","' + req.body.type + '","' + req.body.capacity + '","' + req.body.restriction + '","' + req.body.price + '","' + req.body.description + '")', (err, results) => {
        if (err) {
            throw err;
        } else {
            // req.session.user.fname;

            res.redirect("/apartmentProfiles?id=" + req.params.id);
        }
    })
})

control.post("/editOwner/:id", (req, res) => {

    connection.query('UPDATE `account` SET `fname`="' + req.body.fname + '",`lname`="' + req.body.lname + '",`gender`="' + req.body.gender + '",`contact`="' + req.body.contact + '",`details`="' + req.body.details + '" WHERE accUID="' + req.params.id + '"', (err, results) => {
        if (err) {
            throw err;
        } else {
            // req.session.user.fname;
            req.session.user.accUID = req.params.id;
            req.session.user.fname = req.body.fname;
            req.session.user.lname = req.body.lname;
            req.session.user.gender = req.body.gender;
            req.session.user.contact = req.body.contact;
            res.locals.user = req.session.user;
            res.redirect("/profile");
        }
    })
})


control.post("/apartmentEdit/:id", (req, res) => {
    connection.query('UPDATE `apartment` SET `city`="' + req.body.city + '",`street`="' + req.body.street + '",`baranggay`="' + req.body.baranggay + '",`type`="' + req.body.type + '",`capacity`="' + req.body.capacity + '",`restriction`="' + req.body.restriction + '",`price`="' + req.body.price + '",`description`="' + req.body.decription + '" WHERE appID = "' + req.params.id + '"', (err, results) => {
        if (err) {
            throw err;
        } else {
            // req.session.user.fname;

            res.redirect("/apartmentProfiles?id=" + req.session.user.accUID);

        }
    })

})

control.get("/profile=:username", (req, res) => {

    res.locals.user = req.session.user;
    res.render("tenantProfile");

})

control.get("/profile", (req, res) => {


    if (req.session.user.accType == 1) {
        res.redirect("/Ownerprofile=" + req.session.user.fname + "." + req.session.user.lname);
    } else {
        res.redirect("/profile=" + req.session.user.fname + "." + req.session.user.lname);
    }

})

control.get("/profile=:username", (req, res) => {

    res.locals.user = req.session.user;
    res.render("tenantProfile");

})

control.get("/Ownerprofile=:username", (req, res) => {

    res.locals.user = req.session.user;
    res.render("ownerProfile");

})

control.get("/requestRent/:id/:id2", (req, res) => {

    connection.query('INSERT INTO `rentrequest`( `tenantUID`, `appID`) VALUES ("' + req.params.id2 + '","' + req.params.id + '")', (err, results) => {
        if (err) {
            throw err;
        } else {
            // req.session.user.fname;

            res.redirect("/profile");
        }
    })

    // res.redirect("/requestRent");
    // res.send(req.params.id2);
})



control.get("/logout", (req, res) => {

    req.session.destroy;
    res.redirect("/login");

    // res.send("hello");
})

control.get("/apartments", (req, res) => {

    res.locals.user = req.session.user;
    // connection.query("SELECT * FROM rentrequest WHERE tenantUID ='" + req.session.user.accUID + "'", (err, accounts) => {
    //     if (err) {
    //         throw err
    //     }
    connection.query("SELECT * FROM apartment WHERE accUID !='" + req.session.user.accUID + "'", (err, results) => {
            if (err) {
                throw err
            }

            // res.send(results);
            res.render("apartments", { data: results });

        })
        // res.send(results);

    // })

})

control.get("/apartmentDetails/:id", (req, res) => {
    res.locals.user = req.session.user;
    res.redirect("/apartmentDetails?id=" + req.params.id);

})

control.get("/apartmentDetails", (req, res) => {

    res.locals.user = req.session.user;
    connection.query("SELECT * FROM apartment WHERE appID='" + req.query.id + "'", (err, accounts) => {
        if (err) {
            throw err
        }
        // res.send(results);
        connection.query("SELECT * FROM account WHERE accUID='" + accounts[0].accUID + "'", (err, results) => {
            if (err) {
                throw err
            }
            // // res.send(results);
            accounts[0].fname = results[0].fname;
            accounts[0].lname = results[0].lname;
            accounts[0].contact = results[0].contact;
            accounts[0].emailadd = results[0].emailadd;
            accounts[0].accountType = req.session.user.accType;
            // res.send(accounts[0]);
            res.render("apartmentDetails", { app: accounts[0], });

        })


    })
})

control.post("/signup", (req, res) => {

    req.body.uuid = generateCode();
    if (req.body.password === req.body.repeatpass) {
        var md5Hash = md5(req.body.password + req.body.email);
        connection.query("INSERT INTO `account`( `accUID`, `fname`, `lname`,`gender`,`contact`,`birthdate`, `emailadd`, `password`,`accType`) VALUES ('" + req.body.uuid + "','" + req.body.fname + "','" + req.body.lname + "','" + req.body.gender + "','" + req.body.contact + "','" + req.body.birthdate + "','" + req.body.email + "','" + md5Hash.toString() + "'," + req.body.acctype + ")", (err, results) => {

                if (err) {
                    throw err
                } else {
                    // res.send("Account added");
                    res.render("login");

                }
            })
            // res.send("Sakto ra");
    } else {
        res.send("Password Mismatch");
    }

})

control.post("/login", (req, res) => {
    connection.query('SELECT * FROM account WHERE emailadd="' + req.body.email + '"', (err, results) => {
        var md5Hash = md5(req.body.password + results[0].emailadd);
        // res.send(md5Hash.toString().substring(0, 20) + " " + results[0].password);
        if (err) {
            throw err
        } else {
            if (results[0].password === md5Hash.toString().substring(0, 20)) {
                // req.session.accUID = JSON.stringify(results[0].accUID);
                var string = encodeURIComponent(results[0].accUID);
                req.session.user = results[0];
                res.locals.user = req.session.user;
                // res.render('home');

                res.redirect("/home");
            } else {
                res.send("This account does not exist");
            }

        }

    })
})

generateCode = () => {
    let generate = "";
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    for (var i = 0; i < length; i++) {
        generate += char.charAt(Math.floor(Math.random() * char.length));
    }
    return generate;
}


control.listen(3000);