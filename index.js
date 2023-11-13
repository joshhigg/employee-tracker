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

function getEmployeeList() {
    return new Promise((resolve, reject) => {
        db.query("SELECT id, first_name, last_name FROM employee", function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id })))
            }
        });
    });
}

function getRoleList() {
    return new Promise((resolve, reject) => {
        db.query("SELECT id, title FROM role", function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results.map(role => ({ name: `${role.title}`, value: role.id })))
            }
        });
    });
}

function getDepartmentList() {
    return new Promise((resolve, reject) => {
        db.query("SELECT id, name FROM department", function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results.map(department => ({ name: `${department.name}`, value: department.id })))
            }
        });
    });
}

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
    // View All Employees
    if (response.selection == 0) {
        console.log('\n')
        db.query(`
        SELECT e.id, e.first_name AS first, e.last_name AS last, r.title AS role, 
        CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        LEFT JOIN role r ON e.role_id = r.id
        LEFT JOIN employee m ON e.manager_id = m.id;
    `, function (err, results) {
            console.table(results);
        });
    }
    // Add Employee
    if (response.selection == 1) {
        getEmployeeList().then(employeeList => {
            getRoleList().then(roleList => {
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'first_name',
                        message: "What is the employee's first name?"
                    },
                    {
                        type: 'input',
                        name: 'last_name',
                        message: "What is the employee's last name?"
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: "What is the employee's role?",
                        choices: roleList
                    },
                    {
                        type: 'list',
                        name: 'manager',
                        message: "Who is the employee's manager?",
                        choices: employeeList
                    }
                ]).then((data) => {
                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${data.first_name}', '${data.last_name}', ${data.role}, ${data.manager})`, function (err, results) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log("Employee added successfully!");
                            // Fetch and display updated employee list
                            db.query(`
                            SELECT e.id, e.first_name AS first, e.last_name AS last, r.title AS role, 
                            CONCAT(m.first_name, ' ', m.last_name) AS manager
                            FROM employee e
                            LEFT JOIN role r ON e.role_id = r.id
                            LEFT JOIN employee m ON e.manager_id = m.id;
                            `, function (err, results) {
                                console.table(results);
                            });
                        }
                    });
                });
            })
        }).catch(err => {
            console.error(err);
        });
    }
    // Update Employee Role
    if (response.selection == 2) {
        getEmployeeList().then(employeeList => {
            getRoleList().then(roleList => {
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'employee',
                        message: "Which employee's role do you want to update?",
                        choices: employeeList
                    },
                    {
                        type: 'list',
                        name: 'new_role',
                        message: "Which role do you want to assign the selected employee?",
                        choices: roleList
                    }
                ]).then((data) => {
                    db.query(`UPDATE employee SET role_id = ${data.new_role} WHERE id = ${data.employee}`, function (err, results) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log("Updated Employee's role");
                            db.query(`
                            SELECT e.id, e.first_name AS first, e.last_name AS last, r.title AS role, 
                            CONCAT(m.first_name, ' ', m.last_name) AS manager
                            FROM employee e
                            LEFT JOIN role r ON e.role_id = r.id
                            LEFT JOIN employee m ON e.manager_id = m.id;
                            `, function (err, results) {
                                console.table(results);
                            });
                        }
                    })
                })

            })
        })
    }
    // View all Roles
    if (response.selection == 3) {
        console.log('\n')
        db.query("SELECT r.id, r.title, r.salary, d.name AS department FROM role r LEFT JOIN department d ON r.department_id = d.id;", function (err, results) {
            console.table(results)
        });
    }
    // Add new role
    if (response.selection == 4) {
        getDepartmentList().then(departmentList => {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: "What is the name of the role you'd like to add?"
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: "What is the salary of this role?"
                },
                {
                    type: 'list',
                    name: 'department',
                    message: "Which department is the new role in?",
                    choices: departmentList
                },
            ]).then((data) => {
                db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${data.title}', '${data.salary}', ${data.department})`, function (err, results) {
                })
            }).then(() => {
                db.query("SELECT r.id, r.title, r.salary, d.name AS department FROM role r LEFT JOIN department d ON r.department_id = d.id;", function (err, results) {
                    console.table(results)
                });
            });

        })
    }
    // View all departments
    if (response.selection == 5) {
        console.log('\n')
        db.query('SELECT * FROM department', function (err, results) {
            console.table(results);
        });
    }
    // Add new department
    if (response.selection == 6) {
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: "What is the name of the department you'd like to add?"
            },
        ]).then((data) => {
            db.query(`INSERT INTO department (name) VALUES ('${data.title}')`, function (err, results) {
            })
        }).then(() => {
            db.query("SELECT * FROM department;", function (err, results) {
                console.table(results)
            });
        });

    }
    // Quit
    if (response.selection == 7) {
        process.exit();
    }
});





// to do:  Anytime the user would see "department ID ", "manager ID", or "Role ID", replace that with the actual names
// Whenever a response is complete, rerun the original prompt