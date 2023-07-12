// // const mysql = require("mysql2");
// const dotenv = require("dotenv");

// const { createPool } = require("mysql2/promise");

// dotenv.config({ path: "./config.env" });

// // async function createDatabaseIfNotExists() {
// //   const connection = await mysql.createConnection({
// //     host: process.env.DB_HOST,
// //     user: process.env.DB_USER,
// //     password: process.env.DB_PASSWORD,
// //   });

// //   const databaseName = process.env.DB_NAME;
// //   const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${databaseName}`;

// //   await connection.query(createDatabaseQuery);
// //   // console.log(`Database ${databaseName} created successfully`);

// //   await connection.end();
// // }

// // async function Pool() {
// // await createDatabaseIfNotExists();
// const pool = createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   connectionLimit: 10,
// });

// // .promise();
// console.log("Pool created successfully");
// // console.log(pool);
// //   return pool;
// // }

// // module.exports = { Pool };
// module.exports = pool;

const dotenv = require("dotenv");
const { createPool } = require("mysql2/promise");

dotenv.config({ path: "./config.env" });

function createDatabaseIfNotExists() {
  const connection = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
console.log({ host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT})
  const databaseName = process.env.DB_NAME;
  const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${databaseName}`;

  connection
    .query(createDatabaseQuery)
    .then(() => {
      console.log(`Database ${databaseName} created successfully`);
      connection.end();
    })
    .catch((err) => {
      console.error("Error creating database:", err);
      connection.end();
    });
}

createDatabaseIfNotExists();

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 10,
});

// .promise();

console.log("Pool created successfully");

module.exports = pool;
