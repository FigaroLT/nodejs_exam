import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { MYSQL_CONFIG } from "../config";
import { jwtSecret } from "../config";

export const getBills = async (req, res) => {
  const groupId = +req.params.group_id;
  const accessToken = req.headers.authorization;
  let payload = null;

  if (groupId < 0 || Number.isNaN(groupId) || typeof groupId !== "number") {
    res.status(400).send({ error: "Please provide group ID!" }).end();
  } else {
    try {
      payload = jwt.verify(accessToken.replace("Bearer ", ""), jwtSecret);
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        return res
          .status(401)
          .send({ error: "User unauthorised groups" })
          .end();
      }
      return res.status(400).end();
    }

    try {
      const con = await mysql.createConnection(MYSQL_CONFIG);
      const result = await con.execute(
        `SELECT users.full_name, bills.id AS "bill_id", bills.description, bills.ammount  ,${MYSQL_CONFIG.database}.groups.name
        FROM (${MYSQL_CONFIG.database}.groups INNER JOIN bills ON ${MYSQL_CONFIG.database}.groups.id = bills.group_id) INNER JOIN users ON bills.user_id = users.id
        WHERE ${MYSQL_CONFIG.database}.groups.id= ${groupId} ORDER BY bills.id;`
      );

      res.send(result[0]).end();
    } catch (err) {
      res.status(500).send(err).end();
      return console.error(err);
    }
  }
};

export const postBill = async (req, res) => {
  const groupId = +req.body.groupId;
  const ammount = +req.body.ammount;
  const description = req.body.description;
  const accessToken = req.headers.authorization;
  let payload = null;

  try {
    payload = jwt.verify(accessToken.replace("Bearer ", ""), jwtSecret);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .send({ error: "User unauthorised accounts" })
        .end();
    }
    return res.status(400).end();
  }

  const cleanGroupId = mysql.escape(groupId).replaceAll("'", "");
  const cleanAmmount = mysql.escape(ammount).replaceAll("'", "");
  const cleanDescription = mysql.escape(description).replaceAll("'", "");

  if (groupId < 0 || Number.isNaN(groupId) || typeof groupId !== "number") {
    return res
      .status(400)
      .send(`Incorrect group ID provided: ${groupId}`)
      .end();
  }
  if (
    cleanAmmount.indexOf("\\") > -1 ||
    cleanDescription.indexOf("\\") > -1 ||
    cleanGroupId.indexOf("\\") > -1
  ) {
    res
      .status(400)
      .send({
        error:
          "Data provided has reserved characters, like ! * ' ( ) ; : @ & = + $ , / ? % # [ ]",
      })
      .end();
  }
  try {
    const con = await mysql.createConnection(MYSQL_CONFIG);
    const result = await con.execute(
      `INSERT INTO bills (group_id, ammount, description, user_id) VALUES('${cleanGroupId}', '${cleanAmmount}', '${cleanDescription}','${payload.id}')`
    );

    await con.end();

    res.send(result[0]).end();
  } catch (err) {
    res.status(500).send(err).end();
    return console.error(err);
  }
};