import "./config/env.js";

import { Pool } from "pg";

const connectionString =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : process.env.DEV_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    process.env.NODE_ENV === "production"
      ? "DATABASE_URL is not defined"
      : "DEV_DATABASE_URL is not defined",
    );
}

const databaseUrl = new URL(connectionString);
databaseUrl.searchParams.set("sslmode", "verify-full");

const pool = new Pool({
  connectionString: databaseUrl.toString(),
});

export default pool;