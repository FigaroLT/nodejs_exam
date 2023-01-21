import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.port || 5_100;

export const MYSQL_CONFIG = {
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  port: +process.env.databasePort,
};

export const jwtSecret = process.env.jwtSecret;
export const jwtExpires = process.env.jwtExpires;