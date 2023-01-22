import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import joi from "joi";
import { MYSQL_CONFIG } from "../config.js";
import { jwtSecret } from "../config.js";

const userRegSchema = joi.object({
  fullName: joi.string().trim().required(),
  email: joi.string().email().trim().lowercase().required(),
  password: joi.string().required(),
  reapetPassword: joi.string().required(),
});

export const registerUser = async (req, res) => {
  let userData = req.body;

  try {
    userData = await userRegSchema.validateAsync(userData);
  } catch (error) {
    return res.status(400).send({ error: error.message }).end();
  }

  try {
    const hashedPassword = bcrypt.hashSync(userData.password);

    const connection = await mysql.createConnection(MYSQL_CONFIG);
    await connection.execute(
      `INSERT INTO users (full_name, email, password) VALUES (${mysql.escape(
        userData.fullName
      )},${mysql.escape(userData.email)}, '${hashedPassword}')`
    );

    await connection.end();

    return res.status(200).send("User registered successfully!").end();
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const userLogSchema = joi.object({
  email: joi.string().email().trim().lowercase().required(),
  password: joi.string().required(),
});

export const loginUser = async (req, res) => {
  let userData = req.body;

  try {
    userData = await userLogSchema.validateAsync(userData);
  } catch (error) {
    return res.status(400).send({ error: "Incorrect  or password." }).end();
  }

  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);
    const [data] = await connection.execute(
      `SELECT * FROM users WHERE email = ${mysql.escape(userData.email)}`
    );

    await connection.end();

    if (!data.length) {
      return res
        .status(400)
        .send({ error: "Incorrect email or password." })
        .end();
    }

    const isAuthed = bcrypt.compareSync(userData.password, data[0].password);

    if (isAuthed) {
      const token = jwt.sign(
        { id: data[0].id, email: data[0].email },
        jwtSecret
      );

      return res
        .send({ id: data[0].id, message: "Log In success!", token })
        .end();
    }

    return res
      .status(400)
      .send({ error: "Incorrect email or password." })
      .end();
  } catch (error) {
    return res.status(500).send({ error: "Unexpected error." });
  }
};
