import pg, { Pool } from "pg";

const pool: Pool = new pg.Pool({
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  port: Number(process.env.DB_PORT),
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connection to database", err.stack);
  } else {
    console.log("Database connection succesful...");
  }

  release();
});

export { pool };
