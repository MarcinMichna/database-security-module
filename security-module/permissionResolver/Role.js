const { AclData } = require("./AclData");

class Role {

    constructor(role) {
        this.role = role;
        this.role_id = this.getRoleId();
        this.children = this.getChildren();
    }

    getRoleId() {
        for (let i = 0; i < AclData.roles.length; i++) {
            if (AclData.roles[i].name === this.role) {
                return AclData.roles[i].id;
            }
        }
    }

    getRoleName(id) {
        for (let i = 0; i < AclData.roles.length; i++) {
            if (AclData.roles[i].id === id) {
                return AclData.roles[i].name;
            }
        }
    }

    getTableName(tableid) {
        for (let i = 0; i < AclData.table_names.length; i++) {
            if (AclData.table_names[i].id === tableid) {
                return AclData.table_names[i].names;
            }
        }
    }

    getChildren() {
        let result = [];
        for (let i = 0; i < AclData.role_tree.length; i++) {
            if (AclData.role_tree[i].parentid === this.role_id[i]) {
                result.push(new Role(this.getRoleName(AclData.role_tree[i].child)));
            }
        }
        return result;
    }

    uniq(array) {
        let seen = {};

        return array.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
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

    buildTree(roles_ids) {
        return this.uniq(roles_ids).sort(); // sort only for debug purposes
    }

    getChildrenIds() {
        if (this.children.length === 0) {
            return [this.role_id];
        }

        let result = [];

        for (let i = 0; i < this.children.length; i++) {
            result.push(this.children[i].getChildrenIds());
        }

        return result;
    }

    getInsertableTables(roles_ids) {
        let result = [];

        for (let i = 0; i < AclData.acl_table_permission.length; i++) {
            for (let j = 0; j < roles_ids.length; j++) {
                if (AclData.acl_table_permission[i].idrole === roles_ids[j]) {
                    result.push(AclData.acl_table_permission[i].idtable);
                }
            }
        }

        return this.uniq(result).sort(); // sort only for debug purposes
    }

    getForbiddenRows(roles_ids) {
        let result = [];

        for (let i = 0; i < roles_ids.length; i++) {
            let tmp = [];
            for (let j = 0; j < AclData.acl.length; j++) {
                if (AclData.query_type === "SELECT") {
                    if (roles_ids[i] === AclData.acl[j].idrole && AclData.acl[j].read === 1) {
                        tmp.push([AclData.acl[j].idrow, AclData.acl[j].idtable]);
                    }
                } else if (AclData.query_type === "UPDATE" || AclData.query_type === "DELETE") {
                    if (roles_ids[i] === AclData.acl[j].idrole && AclData.acl[j].update === 1) {
                        tmp.push([AclData.acl[j].idrow, AclData.acl[j].idtable]);
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
        let roles_ids = this.buildTree(this.getChildrenIds());
        if (AclData.query_type === "INSERT") return this.getInsertableTables(roles_ids);
        return this.replaceTableid(this.getIntersection(this.getForbiddenRows(roles_ids)));
    }

}


module.exports = {Role};
