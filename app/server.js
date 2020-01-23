const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const {
  prepareQuery,
  DatabaseManager,
  securityInit,
  setRole
} = require("./../security-module/SecurityModule");

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// aspect example
// console.log(prepareQuery("select * from roles"));

securityInit({
  host: "michnamarcin.pl",
  user: "DPuser",
  password: "polska1",
  database: "DPbase"
});

app.post("/something", (req, res, next) => {
  try {
    const con = DatabaseManager.getInstance().getConnection();
    const userQuery = req.body.userQuery;
    const checkedRole = req.body.checkedRole;

    setRole(checkedRole);
    const response = con.query(prepareQuery(userQuery));
    // console.log(response);
    res.status(200).send(response);

    // setRole("admin");
    // const response = con.query(prepareQuery("select * from roles"));
    // console.log(response);
    // res.send(response);
  } catch (err) {
    throw new Error(err);
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
