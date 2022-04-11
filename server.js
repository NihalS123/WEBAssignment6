/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
* assignment has been copied manually or electronically from any other source (including web sites) or
* distributed to other students.
*
* Name: ______________________ Student ID: ______________ Date: ________________
*
* Online (Heroku) Link: ________________________________________________________
*
********************************************************************************/ 

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");
const session = require('express-session');	//To Acquire it
const req = require("express/lib/request");
const cookieParser = require('cookie-parser');

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: path.join(__dirname, '/views/partials'),
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));

app.use(session({ 	
    secret: 'verysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(cookieParser());

app.set('view engine', '.hbs');

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

const AuthRestrict = (req, res, next) => {
    if(req.session.isLoggedIn)
    next();
    else
    res.redirect('/login');
};

app.get("/", (req,res) => {
    res.render("home");
});

app.get("/about", (req,res) => {
    res.render("about");
});

app.get("/htmlDemo", (req,res) => {
    res.render("htmlDemo");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.post("/login", (req, res)=>{
    const credentials = {
        username: "sampleuser",
        password: "samplepassword"
    };

    if(req.session.isLoggedIn)
    {
        res.redirect("/students");
        return;
    }

    if(req.body.username == credentials.username && req.body.password == credentials.password)
    {
        req.session.isLoggedIn = true;
        req.session.username = req.body.username;
        res.cookie('isLoggedIn', 'true', { signed: false });
        res.redirect("/students");
    }
    else
    {
        res.render("login", {formStatus:"Invalid Credentials"});
    }
});

app.get("/students", AuthRestrict, (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((data) => {
            if(data.length>0)
                res.render("students", {students: data});
            else
                res.render("students", {message: "no results"});
        }).catch((err) => {
            res.render("students", {message:  "no results"});
        });
    } else {
        data.getAllStudents().then((data) => {
            if(data.length>0)
                res.render("students", {students: data});
            else
                res.render("students", {message: "no results"});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    }
});

app.get("/students/add", AuthRestrict, async(req,res) => {
    res.render("addStudent", {courses: await data.getCourses()});
});


app.post("/students/add", AuthRestrict, (req, res) => {
    data.addStudent(req.body).then(async()=>{
        res.redirect("/students");
    });
});

app.get("/student/:studentNum", AuthRestrict, async(req, res) => {
    let viewData = {};
    data.getStudentByNum(req.params.studentNum).then((data) => {
        if (data) {
            viewData.student = data; 
        } else {
            viewData.student = null; 
        }
    }).catch(() => {
        viewData.student = null; // set student to null if there was an error
    }).then(data.getCourses).then((data) => {
        viewData.courses = data; 
        for (let i = 0; i < viewData.courses.length; i++) {
            if (viewData.courses[i].courseId == viewData.student.course) {
                viewData.courses[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.courses = []; // set courses to empty if there was an error
    }).then(() => {
        if (viewData.student == null) { // if no student - return an error
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData: viewData }); // render the "student" view
        }
    });
});

app.post("/student/update", AuthRestrict, (req, res) => {
    data.updateStudent(req.body).then(() => {
        res.redirect("/students");
    });
});

app.get("/student/delete/:id", AuthRestrict, (req, res) => {
    data.deleteStudentByNum(req.params.id).then((data)=>{
        res.redirect("/students");
    }).catch((err)=>{
        res.status(500).send("Unable to Remove Student / Student not found");
    });
});

// Course routes
app.get("/courses", AuthRestrict, (req,res) => {
    data.getCourses().then((data)=>{
        if(data.length>0)
            res.render("courses", {courses: data});
        else
            res.render("courses", {message: "no results"});
    }).catch(err=>{
        res.render("courses", {message: "no results"});
    });
});

app.get("/courses/add", AuthRestrict, (req, res) => {
    res.render("addCourse")
});

app.post("/courses/add", AuthRestrict, (req, res) => {
    data.addCourse(req.body).then(()=>{
        res.redirect("/courses");
    });
});

app.post("/course/update", AuthRestrict, (req, res) => {
    data.updateCourse(req.body).then(()=>{
        res.redirect("/courses");
    });
});

app.get("/course/:id", AuthRestrict, (req, res) => {
    data.getCourseById(req.params.id).then((data) => {
        res.render("course", {course: data});
    }).catch((err) => {
        res.render("course",{message:"no results"}); 
    });
});

app.get("/course/delete/:id", AuthRestrict, (req, res) => {
    data.deleteCourseById(req.params.id).then((data)=>{
        res.redirect("/courses");
    }).catch((err)=>{
        res.status(500).send("Unable to Remove Course / Course not found");
    });
});

app.get('/logout', (req,res)=>{
    req.session.destroy();
    res.clearCookie("isLoggedIn");
    res.redirect("/");
});

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});


data.initialize().then(function(data){
    app.listen(HTTP_PORT, function(){
        console.log(data);
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

