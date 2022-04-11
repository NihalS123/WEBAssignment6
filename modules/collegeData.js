const Sequelize = require('sequelize');
var sequelize = new Sequelize('dbks4v908e1hum', 'fjtbbfbiywffat', '79e8e7be1c7eeaf644ea753e7f4b2e7474ae4aae8a56eccd8429449607175226', {
    host: 'ec2-18-214-134-226.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
});
const DataTypes = Sequelize.DataTypes;

const Student = sequelize.define('Student', {
    studentNum: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING
    },
    lastName: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    addressStreet: {
        type: DataTypes.STRING
    },
    addressCity: {
        type: DataTypes.STRING
    },
    addressProvince: {
        type: DataTypes.STRING
    },
    TA: {
        type: DataTypes.BOOLEAN
    },
    status: {
        type: DataTypes.STRING
    },
}, {
    
});

const Course = sequelize.define('Course', {
    courseId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    courseCode: {
        type: DataTypes.STRING
    },
    courseDescription: {
        type: DataTypes.STRING
    },
}, {
    
});

Course.hasMany(Student, {foreignKey: 'course'});

module.exports.initialize = function () {
    return new Promise( async(resolve, reject) => {
        sequelize.sync().then((result)=>{
            resolve("Connected to Postgres Database");
        }).catch((err)=>{
            reject("Unable to sync the Database");
        });
    });
}

module.exports.getAllStudents = function(){
    return new Promise((resolve,reject)=>{
        Student.findAll().then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        })
    });
}

module.exports.getCourses = function(){
    return new Promise((resolve,reject)=>{
        Course.findAll().then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        })
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {
                studentNum: num
            }
        }).then((data)=>{
            resolve(data[0]);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
};

module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise(async function (resolve, reject) {
        Student.destroy({
            where: {
                studentNum: studentNum
            }
        }).then((data)=>{
            resolve("destroyed")
        }).catch((err)=>{
            reject("Failed to delete student");
        });
    });
};



module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {
                course: course
            }
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("No results returned");
        });
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve,reject)=>{
        Course.findAll({
            where: {
                courseId: id
            }
        }).then((data)=>{
            resolve(data[0]);
        }).catch((err)=>{
            reject("No results returned");
        })
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise(async function (resolve, reject) {
        studentData.TA = (studentData.TA)?true:false;
        Object.entries(studentData).forEach(
            ([key, value]) => {
                if(value=="" || !value)
                    studentData[key]=null;
            }
        );

        if(await Student.create(studentData))
            resolve("student created successfully");
        else
            reject("unable to create student");
    });

};

module.exports.updateStudent = function (studentData) {
    return new Promise(async function (resolve, reject) {
        
        studentData.TA = (studentData.TA)?true:false;
        Object.entries(studentData).forEach(
            ([key, value]) => {
                if(value=="" || !value)
                    studentData[key]=null;
            }
        );

        Student.update(studentData, {
            where: {
                studentNum: studentData.studentNum
            }
        }).then((data)=>{
            resolve("student updated successfully");
        }).catch((err)=>{
            reject("unable to update student");
        });
    });
};

module.exports.addCourse = function (courseData) {
    return new Promise(async function (resolve, reject) {
        Object.entries(courseData).forEach(
            ([key, value]) => {
                if(value=="" || !value)
                    courseData[key]=null;
            }
        );

        if(await Course.create(courseData))
            resolve("Course created successfully");
        else
            reject("unable to create course");
    });
};

module.exports.updateCourse = function (courseData) {
    return new Promise(async function (resolve, reject) {
        Object.entries(courseData).forEach(
            ([key, value]) => {
                if(value=="" || !value)
                    courseData[key]=null;
            }
        );

        Course.update(courseData, {
            where: {
                courseId: courseData.courseId
            }
        }).then((data)=>{
            resolve("course updated successfully");
        }).catch((err)=>{
            reject("unable to update course");
        });
    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise(async function (resolve, reject) {
        Course.destroy({
            where: {
                courseId: id
            }
        }).then((data)=>{
            resolve("destroyed")
        }).catch((err)=>{
            reject("Failed to delete course");
        });
    });
};

