const express = require("express");
const bodyParser = require("body-parser");

const { prepareQuery, DatabaseManager, securityInit, setRole} = require("./../security-module/SecurityModule");

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, "public")));

// aspect example
console.log(prepareQuery("select * from roles"));

securityInit({
  host: "michnamarcin.pl",
  user: "DPuser",
  password: "polska1",
  database: "DPbase"
});


app.get("/something", (req, res, next) => {
  const con = DatabaseManager.getInstance().getConnection();

  setRole("admin");
  const response = con.query(prepareQuery("select * from roles"));
  console.log(response);
  res.send(response);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
