const view_name = 'count_participant';
const query = `(SELECT
    c_cc.community_id,
    count(c_cc.user_id)
  FROM communities.community_users AS c_cc
  GROUP BY c_cc.community_id)`;
const new_query = '';
module.exports = {
    up: function (database, Sequelize) {
        return database.query(`CREATE OR REPLACE VIEW ${view_name} AS ${query}`, {schema: 'communities'});
    },
    down: function (database, Sequelize) {
        return database.query(`DROP VIEW ${view_name};`, {schema: 'communities'});
    }
};