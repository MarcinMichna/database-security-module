const {QueryDisassembler} = require("./../QueryDisassembler");
const {Query} = require("./Query");

class QueryBuilder
{
    constructor(query)
    {
        this.query = query;
        this.queryDisassembler = new QueryDisassembler(query);
        this.whereInQuery = this.queryDisassembler.isWhere();
    }

    withPermission(table, id)
    {
        if (this.whereInQuery)
        {
            this.query += " AND " + table + ".id <> " + id;
        }
        else
        {
            this.whereInQuery = true;
            this.query += " WHERE " + table + ".id <> " + id;
        }
        return this;
    }

    build()
    {
        return new Query(this.query, this.queryDisassembler.getType(), this.queryDisassembler.getTables())
    }
}

module.exports = {QueryBuilder};