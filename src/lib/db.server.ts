import { Pool } from "@neondatabase/serverless";

const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("DATABASE_URL is required to connect to the application database.");
}

export const db = new Pool({ connectionString, max: 10 });
