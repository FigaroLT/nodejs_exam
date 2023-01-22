import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5_100;
export const jwtSecret = process.env.JWT_SECRET;
export const MYSQL_CONFIG = {
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  port: +process.env.port,
};
