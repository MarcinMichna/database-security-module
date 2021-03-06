const { DatabaseManager } = require("./DatabaseManager");
const {
  PermissionResolver
} = require("./permissionResolver/PermissionResolver");
const { QueryDisassembler } = require("./QueryDisassembler");
const { QueryBuilder } = require("./Query-Builder/QueryBuilder");

let role = null;
const before = (fn, args) => {
  return function() {
    // here code will execute before 'prepareQuery' function

    // user query
    let queryStr = `${arguments[0]}`;

    // query information
    let queryDisassembler = new QueryDisassembler(queryStr);

    // resolving raw permissions
    let permissions = new PermissionResolver(
      role,
      queryDisassembler.getType()
    ).getPermissions();

    let usedTables = queryDisassembler.getTables();
    let permissionsFiltered = [];
    for (let p of permissions) {
      if (usedTables.includes(p[1].toUpperCase())) {
        permissionsFiltered.push(p);
      }
    }
    // modifying query
    let queryBuilder = new QueryBuilder(queryStr);

    for (let perm of permissionsFiltered) {
      queryBuilder.withPermission(perm[1], perm[0]);
    }

    return fn.call(this, queryBuilder.build().query);
  };
};

let sendQuery = query => {
  let connection = DatabaseManager.getInstance().getConnection();
  return connection.query(query);
};

sendQuery = before(sendQuery);

function securityInit(config) {
  const db = DatabaseManager.getInstance();
  db.setConfig(config);
}

function setRole(r) {
  role = r;
}

function getRole() {
  return role;
}

module.exports = { sendQuery, DatabaseManager, securityInit, setRole, getRole };

// securityInit({
//     host: "michnamarcin.pl",
//     user: "DPuser",
//     password: "polska1",
//     database: "DPbase"
// });
//
// setRole("userL2");
// console.log(sendQuery("select * from products"));
