const express = require("express");
const bodyParser = require("body-parser");
const MySql = require("sync-mysql");

const { prepareQuery } = require("./../security-module/aspect");
const { DatabaseManager } = require("./../security-module/DatabaseManager");

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, "public")));

// aspect example
console.log(prepareQuery("select * from roles"));

// initialize singleton
const db = new DatabaseManager();

app.get("/something", (req, res, next) => {
  const dbInstance = db.getInstance();
  const con = dbInstance.getConnection();

  const response = con.query(prepareQuery("select * from roles"));
  console.log(response);
  res.send(response);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
