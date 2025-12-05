import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

const db = new Database("./db.sqlite");
const migration = readFileSync(
  join(__dirname, "../db/migrations/0000_tiresome_robin_chapel.sql"),
  "utf-8"
);

db.exec(migration);
console.log("Migration completed");
db.close();

