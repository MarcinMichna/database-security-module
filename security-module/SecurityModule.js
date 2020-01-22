const { DatabaseManager } = require("./../security-module/DatabaseManager");

let role = null;
const before = (fn, args) => {
    return function() {
        // here code will execute before 'prepareQuery' function

        const queryStr = `${arguments[0]} WHERE ID=1`;

        // queryStr += checkSomething1();
        // queryStr += checkSomething2();
        // queryStr += checkSomething3();

        return fn.call(this, queryStr);
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
