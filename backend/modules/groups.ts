import mysql from "mysql2/promise";
import { MYSQL_CONFIG } from "../config";

export const getGroups = async (_, res) => {
  try {
    const con = await mysql.createConnection(MYSQL_CONFIG);

    const result = await con.execute(
      `SELECT ${MYSQL_CONFIG.database}.groups.id AS "group_id", ${MYSQL_CONFIG.database}.groups.name FROM ${MYSQL_CONFIG.database}.groups ORDER BY ${MYSQL_CONFIG.database}.groups.id;`
    );
    res.send(result[0]).end();
  } catch (err) {
    res.status(500).send(err).end();
    return console.error(err);
  }
};

export const postGroup = async (req, res) => {
  const newGroup = req.body.name.trim();

  const cleanGroup = mysql.escape(newGroup).replaceAll("'", "");

  if (typeof newGroup !== "string" || !newGroup) {
    return res
      .status(400)
      .send(`Incorrect group name provided: ${newGroup}`)
      .end();
  }

  if (cleanGroup.indexOf("\\") > -1) {
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
    const [data] = await con.execute(
      `SELECT * 
      FROM ${MYSQL_CONFIG.database}.groups 
      WHERE name ='${cleanGroup}' ;`
    );

    if (Array.isArray(data) && data.length === 0) {
      try {
        const con = await mysql.createConnection(MYSQL_CONFIG);

        const result = await con.execute(
          `INSERT INTO ${MYSQL_CONFIG.database}.groups (name) VALUES('${cleanGroup}')`
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