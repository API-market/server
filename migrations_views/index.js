
exports.constansts = {
    countParticipant: 'count_participant',
    pollAnswers: 'poll_answers',
    communityCountAnswers: 'community_count_answers',
};
/**
 * Count user in community (joined users or members community)
 * @returns {string}
 */
exports[exports.constansts.countParticipant] = () => {
    return `(
        SELECT
            c_cc.community_id,
            count(c_cc.user_id)
        FROM communities.community_users AS c_cc
        GROUP BY c_cc.community_id)`;
};

/**
 * Count answers by each polls
 * @returns {string}
 */
exports[exports.constansts.pollAnswers] = () => {
    return `(
        SELECT
            c_pa.poll_id,
            count(c_pa.poll_id) AS count_answers
        FROM communities.polls_answers AS c_pa
        GROUP BY c_pa.poll_id)`;
};

/**
 * Count answers by unique poll_id for community
 * @returns {string}
 */
exports[exports.constansts.communityCountAnswers]= () => {
    return `(
        SELECT
            c_ct.id,
            count(DISTINCT c_pa.poll_id) AS count_answers,
            rank()
          OVER (
            ORDER BY count(DISTINCT c_pa.poll_id) ASC ) AS rank
          FROM ((communities.polls c_pl
            JOIN communities.community c_ct ON ((c_ct.id = c_pl.community_id)))
            INNER JOIN communities.polls_answers c_pa ON ((c_pa.poll_id = c_pl.id)))
          GROUP BY c_ct.id, c_pa.poll_id)`;
};