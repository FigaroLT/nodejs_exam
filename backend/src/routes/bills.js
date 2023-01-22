import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { MYSQL_CONFIG } from "../utils/config.js";
import { jwtSecret } from "../utils/config.js";

export const getGroupBills = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const groupId = +req.params.group_id;

  let payload = null;

  if (!groupId) {
    return res
      .status(400)
      .send({
        error: `Please provide correct id`,
      })
      .end();
  }

  if (!token) {
    return res.status(401).send({ error: "User unauthorised." }).end();
  }

  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ error: "User unauthorised." }).end();
    }
    return res.status(400).end();
  }

  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);
    const [res] = await connection.execute(
      `SELECT * FROM ${MYSQL_CONFIG.database}.bills WHERE group_id = ${groupId}`
    );
    await connection.end();

    return res.status(200).send(res).end();
  } catch (error) {
    res.status(500).send(error).end();
    return console.error(error);
  }
};

export const postBill = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const groupId = +req.body.groupId;
  const amount = +req.body.amount;
  const description = req.body.description;

  let payload = null;

  if (!token) {
    return res.status(401).send({ error: "User unauthorised!" }).end();
  }

  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ error: "User unauthorised!" }).end();
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

  if (!groupId && !amount && !description) {
    return sendBadReqResponse("Please provide group data.");
  }

  const cleanGroupId = mysql.escape(groupId).replaceAll("'", "");
  const cleanAmmount = mysql.escape(amount).replaceAll("'", "");
  const cleanDescription = mysql.escape(description).replaceAll("'", "");

  if (groupId < 0 || Number.isNaN(groupId) || typeof groupId !== "number") {
    return sendBadReqResponse("Incorrect group ID provided.");
  }

  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);

    const query = `INSERT INTO ${MYSQL_CONFIG.database}.bills (group_id, amount, description) VALUES('${cleanGroupId}', '${cleanAmmount}', '${cleanDescription}')`;

    await connection.execute(query);

    await connection.end();

    res.status(201).send({ message: `Bill was added successfully.` }).end();
  } catch (error) {
    res.status(500).send(error).end();

    return console.error(error);
  }
};
