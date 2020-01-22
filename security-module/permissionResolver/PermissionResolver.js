var MySql = require('sync-mysql');

const { DatabaseManager } = require("./../DatabaseManager");
const connection = DatabaseManager.getInstance().getConnection();

const acl = connection.query('SELECT * FROM acl');
const role_tree = connection.query('SELECT * FROM role_tree');
const acl_table_permission = connection.query('SELECT * FROM acl_table_permission');
const roles = connection.query('SELECT * FROM roles');
const table_names = connection.query('SELECT * FROM table_names');


function getRoleId(role, roles) {
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === role) {
            return roles[i].id;
        }
    }
}

function getTableName(tableid, table_names) {
    for (let i = 0; i < table_names.length; i++) {
        if (table_names[i].id === tableid) {
            return table_names[i].names;
        }
    }
}

function getChildren(roles_ids, role_tree) {
    let result = [];

    for (let i = 0; i < roles_ids.length; i++) {
        for (let j = 0; j < role_tree.length; j++) {
            if (role_tree[j].parentid === roles_ids[i]) {
                result.push(role_tree[j].child);
            }
        }
    }

    if (result.length === 0) {
        return roles_ids;
    }

    return result.concat(getChildren(result, role_tree));
}

function uniq(array) {
    let seen = {};

    return array.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

function buildTree(roles_ids, role_tree) {
    return uniq(getChildren(roles_ids, role_tree)).sort(); // sort only for debug purposes
}

function getInsertableTables(roles_ids, acl_table_permission) {
    let result = [];

    for (let i = 0; i < acl_table_permission.length; i++) {
        for (let j = 0; j < roles_ids.length; j++) {
            if (acl_table_permission[i].idrole === roles_ids[j]) {
                result.push(acl_table_permission[i].idtable);
            }
        }
    }

    return uniq(result).sort(); // sort only for debug purposes
}

function getForbiddenRows(roles_ids, acl, type) {
    let result = [];

    for (let i = 0; i < roles_ids.length; i++) {
        let tmp = [];
        for (let j = 0; j < acl.length; j++) {
            if (type === "SELECT") {
                if (roles_ids[i] === acl[j].idrole && acl[j].read === 1) {
                    tmp.push([acl[j].idrow, acl[j].idtable]);
                }
            } else if (type === "UPDATE" || type === "DELETE") {
                if (roles_ids[i] === acl[j].idrole && acl[j].update === 1) {
                    tmp.push([acl[j].idrow, acl[j].idtable]);
                }
            }

        }
        result.push(tmp);
    }

    return result;
}

function getIntersection(array) {
    let tmp = uniq(join_(array));
    let result = [];

    for (let i = 0; i < tmp.length; i++) {
        let warden = true;
        for (let j = 0; j < array.length; j++) {
            if (!isMember(array[j], tmp[i])) {
                warden = false;
                break;
            }
        }
        if (warden) result.push(tmp[i]);
    }

    return result;
}

function isMember(array, elem) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].length !== elem.length) return false;
        let warden = true;
        for (let j = 0; j < array[i].length; j++) {
            if (array[i][j] !== elem[j]) warden = false;
        }
        if (warden) return true;
    }

    return false;
}

function join_(array) {
    let result = [];

    for (let i = 0; i < array.length; i++) {
        if (array[i].length === 0) {
            result.push([]);
        }
        for (let j = 0; j < array[i].length; j++) {
            result.push(array[i][j]);
        }
    }

    return result;
}

function replaceTableid(array) {
    let result = [];

    for (let i = 0; i < array.length; i++) {
        let row = array[i][0];
        let table_name = getTableName(array[i][1], table_names);
        result.push([row, table_name]);
    }

    return result;
}


let roles_ids = buildTree([getRoleId("admin", roles)], role_tree);
let tables_ids = getInsertableTables(roles_ids, acl_table_permission);
let result = replaceTableid(join_(getIntersection(getForbiddenRows(roles_ids, acl, "SELECT"))));
console.log(result);

console.log(replaceTableid(getIntersection([ [ [ 3, 2 ] ], [[3,2]], [ [ 3, 2 ] ], [[3,2]], [ [ 3, 2 ] ], [[3,2]], [ [ 7, 1 ],[3,2] ] ])));
