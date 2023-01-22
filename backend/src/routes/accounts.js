import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import { MYSQL_CONFIG } from "../utils/config";
import { jwtSecret } from "../utils/config.js";

export const getUserAccounts = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decryptedToken = jwt.verify(token, jwtSecret);
  const user_id = decryptedToken.id;

  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);
    const [userAccounts] = await connection.execute(
      `SELECT ${MYSQL_CONFIG.database}.groups.id AS group_id, ${MYSQL_CONFIG.database}.groups.name FROM ${MYSQL_CONFIG.database}.accounts INNER JOIN ${MYSQL_CONFIG.database}.groups ON accounts.group_id = ${MYSQL_CONFIG.database}.groups.id WHERE ${MYSQL_CONFIG.database}.accounts.user_id = ${user_id};`
    );
    await connection.end();

    return res.status(200).send(userAccounts).end();
  } catch (error) {
    res.status(500).send(error).end();
    return console.error(error);
  }
};

export const postAccount = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decryptedToken = jwt.verify(token, jwtSecret);
  const user_id = decryptedToken.id;
  const { group_id } = req.body;

  let payload = null;

  if (!token) {
    return res.status(401).send({ error: "User authentication failed" }).end();
  }

  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .send({ error: "User authentication failed" })
        .end();
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

  if (!group_id) {
    return sendBadReqResponse("Please provide group name.");
  }

  if (!user_id) {
    return sendBadReqResponse(`${user_id} is not provided.`);
  }

  const cleanGroupId = +mysql.escape(req.body?.group_id);
  const cleanUserId = +mysql.escape(user_id);

  if (
    typeof cleanGroupId !== "number" ??
    Number.isNaN(cleanGroupId ?? cleanGroupId < 0)
  ) {
    return sendBadReqResponse("Please provide group ID as a number.");
  }

  if (
    typeof cleanUserId !== "number" ??
    Number.isNaN(cleanUserId ?? cleanUserId < 0)
  ) {
    return sendBadReqResponse("Please provide user ID as a number.");
  }

  const userExistsInGroup = `SELECT * FROM ${MYSQL_CONFIG.database}.accounts WHERE group_id = ${cleanGroupId} AND user_id = ${user_id}`;
  const query = `INSERT INTO ${MYSQL_CONFIG.database}.accounts (group_id, user_id) VALUES (${cleanGroupId}, ${cleanUserId})`;

  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);
    const [isUserInGroup] = await connection.execute(userExistsInGroup);

    if (isUserInGroup.length && Array.isArray(isUserInGroup)) {
      return sendBadReqResponse(
        `User ${cleanUserId} is already has account: ${cleanGroupId}.`
      );
    }

    await connection.execute(query);

    await connection.end();

    res.status(200).send({ message: `User successfully added.` }).end();
  } catch (error) {
    res.status(500).send(error).end();

    return console.error(error);
  }
};
