const { DatabaseManager } = require("./../DatabaseManager");
const connection = DatabaseManager.getInstance().getConnection();

class PermissionResolver {
    constructor (role, query_type) {
        this.role = role;
        this.query_type = query_type;

        this.acl = connection.query('SELECT * FROM acl');
        this.role_tree = connection.query('SELECT * FROM role_tree');
        this.acl_table_permission = connection.query('SELECT * FROM acl_table_permission');
        this.roles = connection.query('SELECT * FROM roles');
        this.table_names = connection.query('SELECT * FROM table_names');
    }

    getRoleId(role, roles) {
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === role) {
                return roles[i].id;
            }
        }
    }

    getTableName(tableid, table_names) {
        for (let i = 0; i < table_names.length; i++) {
            if (table_names[i].id === tableid) {
                return table_names[i].names;
            }
        }
    }

    getChildren(roles_ids, role_tree) {
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

        return result.concat(this.getChildren(result, role_tree));
    }

    uniq(array) {
        let seen = {};

        return array.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }

    buildTree(roles_ids, role_tree) {
        return this.uniq(this.getChildren(roles_ids, role_tree)).sort(); // sort only for debug purposes
    }

    getInsertableTables(roles_ids, acl_table_permission) {
        let result = [];

        for (let i = 0; i < acl_table_permission.length; i++) {
            for (let j = 0; j < roles_ids.length; j++) {
                if (acl_table_permission[i].idrole === roles_ids[j]) {
                    result.push(acl_table_permission[i].idtable);
                }
            }
        }

        return this.uniq(result).sort(); // sort only for debug purposes
    }

    getForbiddenRows(roles_ids, acl, type) {
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

    getIntersection(array) {
        let tmp = this.uniq(this.join_(array));
        let result = [];

        for (let i = 0; i < tmp.length; i++) {
            let warden = true;
            for (let j = 0; j < array.length; j++) {
                if (!this.isMember(array[j], tmp[i])) {
                    warden = false;
                    break;
                }
            }
            if (warden) result.push(tmp[i]);
        }

        return result;
    }

    isMember(array, elem) {
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

    join_(array) {
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

    replaceTableid(array) {
        let result = [];

        for (let i = 0; i < array.length; i++) {
            let row = array[i][0];
            let table_name = this.getTableName(array[i][1], this.table_names);
            result.push([row, table_name]);
        }

        return result;
    }

    getPermissions() {
        let roles_ids = this.buildTree([this.getRoleId(this.role, this.roles)], this.role_tree);
        if (this.query_type === "INSERT") return this.getInsertableTables(roles_ids, this.acl_table_permission);
        return this.replaceTableid(this.join_(this.getIntersection(this.getForbiddenRows(roles_ids, this.acl, this.query_type))));
    }

}

module.exports = {PermissionResolver};
