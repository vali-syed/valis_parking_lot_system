require("dotenv").config();

const pool = require("./src/config/db");

async function testDatabase() {
  try {
    const result = await pool.query("SELECT * FROM tickets");

    console.log("Database connected");
    console.log(result.rows);

    await pool.end();
  } catch (error) {
    console.error("Database connection failed");
    console.error(error.message);
  }
}

testDatabase();