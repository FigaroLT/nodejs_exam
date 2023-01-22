import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { MYSQL_CONFIG } from "../config.js";
import { jwtSecret } from "../config.js";

export const getGroups = async (req, res) => {
  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);

    const [groups] = await connection.execute("SELECT * FROM groupsdb.groups");

    await connection.end();

    return res.status(200).send(groups).end();
  } catch (error) {
    res.status(500).send(error).end();

    return console.error(error);
  }
};

export const getUserGroups = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const id = mysql.escape(req.params.id.trim());
  const cleanId = +id.replaceAll("'", "");

  if (cleanId < 0 || Number.isNaN(cleanId) || typeof cleanId !== "number") {
    return res
      .status(400)
      .send({
        error: `Please provide correct ID.`,
      })
      .end();
  }

  let payload = null;

  if (!token) {
    return res.status(401).send({ error: "User unauthorised" }).end();
  }

  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ error: "User unauthorised" }).end();
    }
    return res.status(400).end();
  }

  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);
    const [result] = await connection.execute(
      `SELECT * FROM groupsdb.accounts WHERE user_id=${cleanId}`
    );

    await connection.end();

    return res.status(200).send(result).end();
  } catch (error) {
    res.status(500).send(error).end();
    return console.error(error);
  }
};

export const postGroup = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  const { name } = req.body;

  let payload = null;

  if (!token) {
    return res.status(401).send({ error: "User unauthorised" }).end();
  }

  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ error: "User unauthorised" }).end();
    }
    return res.status(400).end();
  }

  const sendBadReqResponse = (message) => {
    res
      .status(400)
      .send({
        error: message,
      })
      .end();
  };

  if (!name) {
    return sendBadReqResponse("Please provide group name.");
  }

  const cleanName = mysql.escape(req.body.name?.trim());

  if (typeof cleanName !== "string") {
    return sendBadReqResponse("Please provide group name in letters.");
  }

  const query = `INSERT INTO groupsdb.groups (name) VALUES (${cleanName})`;

  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);

    await connection.execute(query);

    await connection.end();

    res.status(200).send({ message: `Group was added successfully.` }).end();
  } catch (error) {
    res.status(500).send(error).end();

    return console.error(error);
  }
};
