// Singleton class

const MySql = require("sync-mysql");

class DatabaseManager {
  constructor() {}

  instance = null;

  getInstance() {
    if (this.instance === null) {
      this.instance = new DatabaseManager();
    }

    return this.instance;
  }

  getConnection() {
    const connection = new MySql({
      host: "michnamarcin.pl",
      user: "DPuser",
      password: "polska1",
      database: "DPbase"
    });

    return connection;
  }
}

// const db = new DatabaseManager();

module.exports = { DatabaseManager };
