// Singleton class
const MySql = require("sync-mysql");

let instance = null;

class DatabaseManager {
  constructor( ) {
    this.config = null;
  }

  static getInstance() {
    if (instance === null) {
      instance = new DatabaseManager();
    }

    return instance;
  }

  setConfig(conf) {this.config = conf}

  getConnection() {
    return new MySql(this.config);
  }
}

// const db = new DatabaseManager();

module.exports = { DatabaseManager };
