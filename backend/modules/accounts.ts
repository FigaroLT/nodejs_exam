import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { MYSQL_CONFIG } from "../config";
import { jwtSecret } from "../config";

export const getAccounts = async (req, res) => {
  const accessToken = req.headers.authorization;
  let payload = null;

  try {
    payload = jwt.verify(accessToken.replace("Bearer ", ""), jwtSecret);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ error: "User unauthorised groups" }).end();
    }
    return res.status(400).end();
  }

  try {
    const con = await mysql.createConnection(MYSQL_CONFIG);
    const result = await con.execute(
      `SELECT users.id, ${MYSQL_CONFIG.database}.groups.id AS "group_id", ${MYSQL_CONFIG.database}.groups.name 
      FROM (${MYSQL_CONFIG.database}.groups INNER JOIN accounts ON ${MYSQL_CONFIG.database}.groups.id = accounts.group_id) INNER JOIN users ON accounts.user_id = users.id
      WHERE users.id= ${payload.id};`
    );

    res.send(result[0]).end();
  } catch (err) {
    res.status(500).send(err).end();
    return console.error(err);
  }
};

export const postAccount = async (req, res) => {
  const groupId = +req.body.groupId;
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
  console.log(groupId);
  const cleanGroupId = mysql.escape(groupId).replaceAll("'", "");

  if (groupId < 0 || Number.isNaN(groupId) || typeof groupId !== "number") {
    return res
      .status(400)
      .send(`Incorrect group ID provided: ${groupId}`)
      .end();
  }
  try {
    const con = await mysql.createConnection(MYSQL_CONFIG);
    const [data] = await con.execute(
      `SELECT id, group_id , user_id 
      FROM accounts 
      WHERE user_id= ${payload.id} AND group_id=${cleanGroupId} ;`
    );

    if (Array.isArray(data) && data.length === 0) {
      try {
        const con = await mysql.createConnection(MYSQL_CONFIG);

        const result = await con.execute(
          `INSERT INTO accounts (group_id, user_id) VALUES('${cleanGroupId}', '${payload.id}')`
        );

        await con.end();

        res.send(result[0]).end();
      } catch (err) {
        res.status(500).send(err).end();
        return console.error(err);
      }
    } else {
      return res.status(409).send("Error! Record already exists").end();
    }
  } catch (err) {
    res.status(500).send(err).end();
    return console.error(err);
  }
};