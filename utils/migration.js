class MigrationUtils {

    constructor() {
        this.viewName = '';
    }

    /**
     *
     * @this MigrationUtils
     * @param queryInterface
     * @param tableName
     * @param fields
     * @param options
     * @returns {*}
     */
    multipleUnique(queryInterface, {tableName, fields}, options) {
        if (!tableName) throw new Error('Set tableName');
        if (!(fields instanceof Array)) throw new Error('The fields must be array');
        const query = `ALTER TABLE ${tableName} ADD UNIQUE (${fields})`;

        return queryInterface.sequelize.query(query, options);
    }

    /**
     *
     * @this MigrationUtils
     * @param queryInterface
     * @param viewName
     * @param query
     * @param options
     * @returns {*}
     */
    createView(queryInterface, viewName, query, options) {
        this.viewName = viewName;
        this._checkSchema(options);
        return queryInterface.sequelize.query(`CREATE OR REPLACE VIEW ${this.viewName} AS ${query}`, options);
    }

    /**
     *
     * @this MigrationUtils
     * @param queryInterface
     * @param viewName
     * @param query
     * @param options
     * @returns {*}
     */
    dropView(queryInterface, viewName, query, options) {
        this.viewName = viewName;
        this._checkSchema(options);
        if (!query) {
            query = '';
        }

        return queryInterface.sequelize.query(`DROP VIEW IF EXISTS ${this.viewName} ${query};`, options);
    }

    _checkSchema(options) {
        if (options.schema) {
            this.viewName = `${options.schema}.${this.viewName}`;
        }
    }
}

module.exports = MigrationUtils;