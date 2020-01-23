const { DatabaseManager } = require("./../DatabaseManager");
const { Role } = require("./Role");
const { AclData } = require("./AclData");

class PermissionResolver {

    constructor(role, query_type) {
        this.role = role;
        this.connection = DatabaseManager.getInstance().getConnection();
        this.acl = this.connection.query('SELECT * FROM acl');
        this.role_tree = this.connection.query('SELECT * FROM role_tree');
        this.acl_table_permission = this.connection.query('SELECT * FROM acl_table_permission');
        this.roles = this.connection.query('SELECT * FROM roles');
        this.table_names = this.connection.query('SELECT * FROM table_names');
        AclData.setQuery_type(query_type);
        AclData.setConnection(this.connection);
        AclData.setAcl(this.acl);
        AclData.setAcl_table_permission(this.acl_table_permission);
        AclData.setRole_tree(this.role_tree);
        AclData.setRoles(this.roles);
        AclData.setTable_names(this.table_names);
    }

    getPermissions() {
        return new Role(this.role).getPermissions();
    }

}

module.exports = {PermissionResolver};
