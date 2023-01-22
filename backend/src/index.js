import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import { loginUser, registerUser } from "./routes/auth.js";
import { getGroups, getUserGroups, postGroup } from "./routes/groups.js";
import { getUserAccounts, postAccount } from "./routes/accounts.js";
import { getGroupBills, postBill } from "./routes/bills.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("auth/register", registerUser);
app.post("/auth/login", loginUser);
app.post("/groups", postGroup);
app.post("/accounts", postAccount);
app.post("/bills", postBill);

app.get("/groups", getGroups);
app.get("/user-groups/", getUserGroups);
app.get("/accounts", getUserAccounts);
app.get("/bills/:group_id", getGroupBills);

app.get("/", (_, res) => {
  res.send({ message: "Server is running" });
});

app.all("*", (_, res) => {
  res.status(404).send({ error: "Page not found" });
});

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
