const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('connected to database')
})

inquirer.prompt([
    {
        type: 'list',
        name: 'selection',
        choices: [{ name: 'View All Employees', value: 0 }, 
        { name: 'Add Employee', value: 1 }, 
        { name: 'Update Employee Role', value: 2 },
        { name: 'View All Roles', value: 3 }, 
        { name: 'Add Role', value: 4 }, 
        { name: 'View All Departments', value: 5 },
        { name: 'Add Department', value: 6 }, 
        { name: 'Quit', value: 7 }],
        message: 'What would you like to do?'
    }
]).then(function (response) {
    if (response.selection == 0) {
        console.log('\n')
        db.query('SELECT * FROM employee', function (err, results) {
            console.table(results);
        });
    }
    if (response.selection == 3) {
        console.log('\n')
        db.query('SELECT * FROM role', function (err, results) {
            console.table(results);
        });
    }
    if (response.selection == 5) {
        console.log('\n')
        db.query('SELECT * FROM department', function (err, results) {
            console.table(results);
        });
    }
    if (response.selection == 7) {
        process.exit();
    }
});


// db.query('SELECT * FROM department', function (err, results) {
//     console.log(results);
//   });









// Inquirer starts on node index.js
// Presented with options to view all departments, view all roles, view all employees.  Can also add a department, role, employee, or update employee role
// When they select what they want to do, they can do that, and the initial prompt shows up again