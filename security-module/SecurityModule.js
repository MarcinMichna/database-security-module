const { DatabaseManager } = require("./DatabaseManager");
const { PermissionResolver } = require("./permissionResolver/PermissionResolver");
const { QueryDisassembler } = require("./QueryDisassembler");
const { QueryBuilder } = require("./Query-Builder/QueryBuilder")

let role = null;
const before = (fn, args) => {
    return function() {
        // here code will execute before 'prepareQuery' function

        // user query
        let queryStr = `${arguments[0]}`;

        // query information
        let queryDisassembler = new QueryDisassembler(queryStr);

        // resolving permissions
        let permissions = PermissionResolver(role, queryDisassembler.getType());

        // modifying query
        let queryBuilder = new QueryBuilder(queryStr);
        for(let perm of permissions) {queryBuilder.withPermission(perm[1], perm[0]);}

        return fn.call(this, queryBuilder.build());
    };
};

let prepareQuery = query => {
    // here code will execute after 'before' function
    return `${query}`;
};

prepareQuery = before(prepareQuery);

function securityInit(config)
{
    const db = DatabaseManager.getInstance();
    db.setConfig(config);
}

function setRole(r)
{
    role = r;
}

function getRole()
{
    return role;
}

module.exports = { prepareQuery, DatabaseManager, securityInit, setRole, getRole };

setRole("admin");
prepareQuery("select * from roles");
