import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import Joi from "joi";

import { MYSQL_CONFIG } from "../config";

const userSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
  fullName: Joi.string(),
});

export const register = async (req, res) => {
  let userData = req.body;

  try {
    userData = await userSchema.validateAsync(userData);
  } catch (error) {
    return res.status(400).send({ error: error.message }).end();
  }

  const hashedPassword = bcrypt.hashSync(userData.password);
  const cleanFullName = mysql.escape(userData.fullName).replaceAll("'", "");

  if (cleanFullName.indexOf("\\") > -1) {
    res
      .status(400)
      .send({
        error:
          "Data provided has reserved characters, like ! * ' ( ) ; : @ & = + $ , / ? % # [ ]",
      })
      .end();
  } else {
    try {
      const con = await mysql.createConnection(MYSQL_CONFIG);

      const result = await con.execute(
        `INSERT INTO users ( email, password, full_name) VALUES( '${userData.email}', '${hashedPassword}', '${cleanFullName}')`
      );

      await con.end();

      res.send(result[0]).end();
    } catch (err) {
      res.status(500).send(err).end();
      return console.error(err);
    }
  }
};