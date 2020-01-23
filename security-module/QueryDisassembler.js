/**
 * Rozbija Raw Query aby pozyskać informacje o typie zapytania, talebach do których się odnosi
 * i czy użyto WHERE
 */
class QueryDisassembler
{
    constructor(query)
    {
        this.query = query;
        this.type = null;
        this.tables = [];
        this.where = false;

        this.query = query.toUpperCase();
        let splittedQuery = this.query.split(" ");

        this.type = splittedQuery[0];

        this.where = splittedQuery.includes("WHERE");

        let fromIndex = splittedQuery.indexOf("FROM");
        let whereIndex = splittedQuery.indexOf("WHERE");
        let tablesWithAliases = [];
        if (whereIndex === -1)
        {
            tablesWithAliases  = splittedQuery.slice(fromIndex + 1, splittedQuery.length);
        }
        else
        {
            tablesWithAliases = splittedQuery.slice(fromIndex + 1, whereIndex);
        }

        let tablesRaw = tablesWithAliases.join(" ");
        let tablesRawSplitted = tablesRaw.split(", ");

        for(let s of tablesRawSplitted)
            this.tables.push(s.split(" ")[0]);
    }

    getType()
    {
        return this.type;
    }

    getTables()
    {
        return this.tables;
    }

    isWhere()
    {
        return this.where;
    }

}

module.exports = {QueryDisassembler};

