const { DatabaseManager } = require("./../DatabaseManager");

class AclData {
    static connection = undefined;
    static acl = undefined;
    static role_tree = undefined;
    static acl_table_permission = undefined;
    static roles = undefined;
    static table_names = undefined;
    static query_type = undefined;

    static setConnection(value) {
        this.connection = value;
    }

    static setAcl(value) {
        this.acl = value;
    }

    static setRole_tree(value) {
        this.role_tree = value;
    }

    static setAcl_table_permission(value) {
        this.acl_table_permission = value;
    }

    static setRoles(value) {
        this.roles = value;
    }

    static setTable_names(value) {
        this.table_names = value;
    }

    static setQuery_type(value) {
        this.query_type = value;
    }

}

module.exports = {AclData};
