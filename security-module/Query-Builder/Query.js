class Query
{
    constructor(query, type, tables)
    {
        this.query = query;
        this.tables = tables;
        this.type = type;
    }
}

module.exports = {Query};