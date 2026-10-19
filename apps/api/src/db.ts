
import { Pool } from "pg";
import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({
  path: resolve(process.cwd(), "../../.env.local"),
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const databaseUrl = new URL(connectionString);
databaseUrl.searchParams.set("sslmode", "verify-full");

const pool = new Pool({
    connectionString: databaseUrl.toString(),
});

export default pool;
