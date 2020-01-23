const { DatabaseManager } = require("./../DatabaseManager");

class PermissionResolver {
    constructor (role, query_type) {
        this.role = role;
        this.query_type = query_type;

        this.connection = DatabaseManager.getInstance().getConnection();
        this.acl = this.connection.query('SELECT * FROM acl');
        this.role_tree = this.connection.query('SELECT * FROM role_tree');
        this.acl_table_permission = this.connection.query('SELECT * FROM acl_table_permission');
        this.roles = this.connection.query('SELECT * FROM roles');
        this.table_names = this.connection.query('SELECT * FROM table_names');
    }

    getRoleId() {
        for (let i = 0; i < this.roles.length; i++) {
            if (this.roles[i].name === this.role) {
                return this.roles[i].id;
            }
        }
    }

    getTableName(tableid) {
        for (let i = 0; i < this.table_names.length; i++) {
            if (this.table_names[i].id === tableid) {
                return this.table_names[i].names;
            }
        }
    }

    getChildren(roles_ids) {
        let result = [];

        for (let i = 0; i < roles_ids.length; i++) {
            for (let j = 0; j < this.role_tree.length; j++) {
                if (this.role_tree[j].parentid === roles_ids[i]) {
                    result.push(this.role_tree[j].child);
                }
            }
        }

        if (result.length === 0) {
            return roles_ids;
        }

        return result.concat(this.getChildren(result));
    }

    uniq(array) {
        let seen = {};

        return array.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }

    buildTree(roles_ids) {
        return this.uniq(this.getChildren(roles_ids)).sort(); // sort only for debug purposes
    }

    getInsertableTables(roles_ids) {
        let result = [];

        for (let i = 0; i < this.acl_table_permission.length; i++) {
            for (let j = 0; j < roles_ids.length; j++) {
                if (this.acl_table_permission[i].idrole === roles_ids[j]) {
                    result.push(this.acl_table_permission[i].idtable);
                }
            }
        }

        return this.uniq(result).sort(); // sort only for debug purposes
    }

    getForbiddenRows(roles_ids) {
        let result = [];

        for (let i = 0; i < roles_ids.length; i++) {
            let tmp = [];
            for (let j = 0; j < this.acl.length; j++) {
                if (this.query_type === "SELECT") {
                    if (roles_ids[i] === this.acl[j].idrole && this.acl[j].read === 1) {
                        tmp.push([this.acl[j].idrow, this.acl[j].idtable]);
                    }
                } else if (this.query_type === "UPDATE" || this.query_type === "DELETE") {
                    if (roles_ids[i] === this.acl[j].idrole && this.acl[j].update === 1) {
                        tmp.push([this.acl[j].idrow, this.acl[j].idtable]);
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
            let table_name = this.getTableName(array[i][1]);
            result.push([row, table_name]);
        }

        return result;
    }

    getPermissions() {
        let roles_ids = this.buildTree([this.getRoleId()]);
        if (this.query_type === "INSERT") return this.getInsertableTables(roles_ids);
        return this.replaceTableid(this.getIntersection(this.getForbiddenRows(roles_ids)));
    }

}

module.exports = {PermissionResolver};
