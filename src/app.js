require("dotenv").config();

const express = require("express");
const router = require("./config/router.config");
const app = express();
const cors = require("cors");

app.use(cors());

require("./config/db.config");

app.use(express.json());

app.use("/", router);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
