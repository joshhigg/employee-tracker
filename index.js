const inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection

inquirer.prompt([
    {
        type: 'list',
        name: 'selection',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Deparments', 'Add Department', 'Quit'],
        message: 'What would you like to do?'
    }



])











// Inquirer starts on node index.js
// Presented with options to view all departments, view all roles, view all employees.  Can also add a department, role, employee, or update employee role
// When they select what they want to do, they can do that, and the initial prompt shows up again