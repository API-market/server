import * as request from 'supertest';
import * as dotenv from 'dotenv';

// TODO: Move config loader to server loader
dotenv.config({ silent: true });

import * as server from '../server';
import {
    delay,
    expectBadRequestError,
    expectCorrectAddCommunityResponse,
    expectCorrectCollection,
    expectCorrectCommunity, expectCorrectPoll, expectCorrectSchool,
    expectCorrectUser, expectCorrectUserShortForm, expectCorrectUserUpdate,
    expectErrorResponse, expectNotFoundError,
    expectSuccessResponse,
    expectUnauthorizedError,
    expectValidationError,
    generateNewUserCredentials, generateRandomString,
} from './e2e-helpers';

jest.setTimeout(25000);

describe('Global e2e tests', () => {

    const credentials: any = generateNewUserCredentials();
    let user;
    let authToken;
    let community;
    let schools;

    beforeAll(async () => {
    });

    afterAll(async () => {
        await server.close();
    });

    it('Test runner works', async () => {
        await expect(true).toBe(true);
    });

    it('Can GET /', async () => {
        const response = await request(server).get(`/`);
        await expect(response).toBeDefined();
    });

    it('Valid /versions flow', async () => {
        let response;

        // invalid semver string
        response = await request(server).get(`/v1/versions/0.0`);
        await expectErrorResponse(response, 500);

        // valid string, but old version
        response = await request(server).get(`/v1/versions/0.0.0`);
        await expectSuccessResponse(response);
        await expect(response.body).toHaveProperty('supported');
        await expect(response.body.supported).toBe(false);

        // valid and supported version
        response = await request(server).get(`/v1/versions/999.999.999`);
        await expectSuccessResponse(response);
        await expect(response.body).toHaveProperty('supported');
        await expect(response.body.supported).toBe(true);

    });

    it('Valid /schools flow', async () => {
        let response;

        // valid request-response
        response = await request(server).get(`/v1/schools`);
        await expectSuccessResponse(response);
        await expectCorrectCollection(response.body.data, expectCorrectSchool, 2);

        schools = response.body.data;

    });

    it('Valid registration flow', async () => {
        let response;

        // empty request
        response = await request(server)
            .post(`/v1/users`)
            .send({});
        await expectValidationError(response);

        // some fields empty
        response = await request(server)
            .post(`/v1/users`)
            .send({email: credentials.email});
        await expectValidationError(response);

        // can't use common password
        credentials.password = `password1`;
        response = await request(server)
            .post(`/v1/users`)
            .send(credentials);
        await expectValidationError(response);

        // can't use complicated but short password
        credentials.password = `A1b2C+D`;
        response = await request(server)
            .post(`/v1/users`)
            .send(credentials);
        await expectValidationError(response);

        // can't create user without phone tokens
        credentials.password = `A1b2C+D0`;
        response = await request(server)
            .post(`/v1/users`)
            .send(credentials);
        await expectValidationError(response);

        // well done
        credentials.token_phone = Math.random().toString(36).slice(-8);
        credentials.name_phone = Math.random().toString(36).slice(-8);
        credentials.platform = `android`;
        credentials.email = `new` + credentials.email;

        response = await request(server)
            .post(`/v1/users`)
            .send(credentials);
        await expectSuccessResponse(response);
        await expectCorrectUser(response.body);

        user = response.body;
    });

    it('Valid schools validation on registration flow', async () => {
        let response;
        const school = schools[0];

        const schoolsTestingCredentials = Object.assign(
            { schoolId: school[`schoolId`]},
            credentials,
            {email: `new_new` + credentials.email},
        );

        // can't register with non-school domain while using schoolId
        response = await request(server)
            .post(`/v1/users`)
            .send(schoolsTestingCredentials);
        await expectBadRequestError(response);

        // can register with school email domain
        schoolsTestingCredentials[`email`] = generateRandomString() + `@${school.emailDomain}`;
        response = await request(server)
            .post(`/v1/users`)
            .send(schoolsTestingCredentials);
        await expectSuccessResponse(response);
        await expectCorrectUser(response.body);
        await expect(response.body.schoolId).toBe(school.schoolId);

    });

    it('Valid login flow', async () => {
        let response;

        // empty request
        response = await request(server)
            .post(`/v1/login`)
            .send({});
        await expectValidationError(response);

        // can't login without phone tokens
        response = await request(server)
            .post(`/v1/login`)
            .send({
                email: credentials.email,
                password: credentials.password,
            });
        await expectValidationError(response);

        response = await request(server)
            .post(`/v1/login`)
            .send(credentials);
        await expectSuccessResponse(response);
        await expectCorrectUser(response.body);

        authToken = response.body.token;
    });

    it('Valid user update flow', async () => {
        let response;

        // unauthorized
        response = await request(server)
            .put(`/v1/users`)
            .send({firstName: `TEST STRING`});
        await expectUnauthorizedError(response);

        // empty request
        response = await request(server)
            .put(`/v1/users`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({});
        await expectSuccessResponse(response);

        // well done
        response = await request(server)
            .put(`/v1/users`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({firstName: `TEST STRING`});
        await expectSuccessResponse(response);
        await expectCorrectUserUpdate(response.body);
        await expect(response.body[`firstName`]).toBe(`TEST STRING`);

        // can't update email if using schoolId without valid email domain
        const school = schools[0];
        response = await request(server)
            .put(`/v1/users`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({schoolId: school.schoolId});
        await expectBadRequestError(response);

        // can update email using valid email domain
        response = await request(server)
            .put(`/v1/users`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                schoolId: school.schoolId,
                email: generateRandomString() + `@` + school.emailDomain,
            });
        await expectSuccessResponse(response);
        await expectCorrectUserUpdate(response.body);
        await expect(response.body.schoolId).toBe(school.schoolId);

    });

    it('Valid users flow', async () => {
        let response;

        response = await request(server)
            .get(`/v1/users/${user.user_id}/rank`)
            .set('Authorization', `Bearer ${authToken}`);

        await expectSuccessResponse(response);
        await expect(response.body).toHaveProperty('rank');
        await expect(response.body.rank).toBeDefined();

        response = await request(server)
            .get(`/v1/users/`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectCollection(response.body, expectCorrectUserShortForm, 1);

        response = await request(server)
            .get(`/v1/users/${user.user_id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectUserShortForm(response.body);

    });

    it('Valid community flow', async () => {
        let response;
        const communityOptions = {
            name: `Community for testing ` + Math.random().toString(36).slice(-8),
            description: `Was created by test runner ` + Math.random().toString(36).slice(-8),
        };

        // unauthorized request
        response = await request(server)
            .post(`/v1/community`)
            .send({});
        await expectUnauthorizedError(response);

        // can't create community without all fields
        response = await request(server)
            .post(`/v1/community`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({name: communityOptions.name});
        await expectValidationError(response);

        // well done
        response = await request(server)
            .post(`/v1/community`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(communityOptions);
        await expectSuccessResponse(response);
        await expectCorrectAddCommunityResponse(response.body.data);
        community = response.body.data;

        // can't create community with same name
        response = await request(server)
            .post(`/v1/community`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(communityOptions);
        await expectBadRequestError(response);

        // can find created community in list
        response = await request(server)
            .get(`/v1/community?createdAt=desc`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectCollection(response.body.data, expectCorrectCommunity);

        let searchResult = response.body.data.find(communityEl => communityEl.id === community.id);
        await expect(searchResult).toBeDefined();

        // can't get community with wrong id
        response = await request(server)
            .get(`/v1/community/0`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectNotFoundError(response);

        // can't get community without auth
        response = await request(server).get(`/v1/community/${community.id}`);
        await expectUnauthorizedError(response);

        // can get community by id
        response = await request(server)
            .get(`/v1/community/${community.id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectCommunity(response.body.data);
        await expect(response.body.data.polls).toHaveProperty('count_polls');
        await expect(parseInt(response.body.data.polls.count_polls, 10)).toBe(0);
        await expect(response.body.data.answers).toBe(null);

        // can delete community
        response = await request(server)
            .delete(`/v1/community/${community.id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);

        // can't find deleted community in list
        response = await request(server)
            .get(`/v1/community?createdAt=desc`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectCollection(response.body.data, expectCorrectCommunity);

        searchResult = response.body.data.find(communityEl => communityEl.id === community.id);
        await expect(searchResult).toBeUndefined();

        // can't get community by id
        response = await request(server)
            .get(`/v1/community/${community.id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectNotFoundError(response);

        // creating community for other suites flow
        response = await request(server)
            .post(`/v1/community`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: communityOptions.name + `+1`,
                description: communityOptions.description + `+2`,
            });
        await expectSuccessResponse(response);
        await expectCorrectAddCommunityResponse(response.body.data);

        community = response.body.data;
    });

    it('Valid community polls flow', async () => {
        let response;
        const pollOptions = {
            question: Math.random().toString(36).slice(-8),
            answers: [Math.random().toString(36).slice(-8), Math.random().toString(36).slice(-8), Math.random().toString(36).slice(-8)],
            tags: [Math.random().toString(36).slice(-8), Math.random().toString(36).slice(-8), Math.random().toString(36).slice(-8)],
            community_id: community.id,
        };

        // unauthorized request
        response = await request(server)
            .post(`/v1/community/${community.id}/polls/`)
            .send({});
        await expectUnauthorizedError(response);

        // empty body request
        response = await request(server)
            .post(`/v1/community/${community.id}/polls/`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({});
        await expectValidationError(response);

        // can add poll
        response = await request(server)
            .post(`/v1/community/${community.id}/polls/`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(pollOptions);
        await expectSuccessResponse(response);
        await expectCorrectPoll(response.body.data);

        const poll = response.body.data;

        // can get poll
        response = await request(server)
            .get(`/v1/community/${community.id}/polls/${poll.poll_id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectPoll(response.body.data);
        await expect(response.body.data).toHaveProperty('participant_count');
        await expect(response.body.data.participant_count).toBe(0);

        // polls count incremented after poll added
        response = await request(server)
            .get(`/v1/community/${community.id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectCommunity(response.body.data);
        await expect(response.body.data.polls).toHaveProperty('count_polls');
        await expect(parseInt(response.body.data.polls.count_polls, 10)).toBe(1);

        // can find new poll in list
        response = await request(server)
            .get(`/v1/community/${community.id}/polls/`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectCollection(response.body.data, expectCorrectPoll);
        let searchResult = response.body.data.find(pollEl => pollEl.poll_id === poll.poll_id);
        await expect(searchResult).toBeDefined();

        // isAnswered = 0 before user voted
        response = await request(server)
            .get(`/v1/community/${community.id}/polls/${poll.poll_id}?isAnswered=${user.user_id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectPoll(response.body.data);
        await expect(response.body.data).toHaveProperty('is_answered');
        await expect(response.body.data.is_answered).toBe(0);

        // is_bought = 0 before user requested results
        response = await request(server)
            .get(`/v1/community/${community.id}/polls/${poll.poll_id}?isBought=${user.user_id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectPoll(response.body.data);
        await expect(response.body.data).toHaveProperty('is_bought');
        await expect(response.body.data.is_bought).toBe(0);

        // can edit poll while nobody voted already
        response = await request(server)
            .put(`/v1/community/${community.id}/polls/${poll.poll_id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({poll_id: poll.poll_id, ...pollOptions});
        await expectSuccessResponse(response);
        await expectCorrectPoll(response.body.data);

        // can vote
        await delay(2000);
        response = await request(server)
            .post(`/v1/community/${community.id}/polls/${poll.poll_id}/answers`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({answer: 1});
        await expectSuccessResponse(response);

        // participant_count should be +1 after 1 person voted
        response = await request(server)
            .get(`/v1/community/${community.id}/polls/${poll.poll_id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectPoll(response.body.data);
        await expect(response.body.data).toHaveProperty('participant_count');
        await expect(response.body.data.participant_count).toBe(1);

        // community answers_count count incremented after somebody voted
        response = await request(server)
            .get(`/v1/community/${community.id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectCommunity(response.body.data);
        await expect(response.body.data.answers).toHaveProperty('count_answers');
        await expect(parseInt(response.body.data.answers.count_answers, 10)).toBe(1);

        // isAnswered = 1 after user voted
        response = await request(server)
            .get(`/v1/community/${community.id}/polls/${poll.poll_id}?isAnswered=${user.user_id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectPoll(response.body.data);
        await expect(response.body.data).toHaveProperty('is_answered');
        await expect(response.body.data.is_answered).toBe(1);

        // is_bought = 1 after user requested results
        await request(server)
            .get(`/v1/community/${community.id}/polls/${poll.poll_id}/results`)
            .set('Authorization', `Bearer ${authToken}`);

        response = await request(server)
            .get(`/v1/community/${community.id}/polls/${poll.poll_id}?isBought=${user.user_id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectPoll(response.body.data);
        await expect(response.body.data).toHaveProperty('is_bought');
        await expect(response.body.data.is_bought).toBe(1);

        // can't edit poll after somebody voted
        response = await request(server)
            .put(`/v1/community/${community.id}/polls/${poll.poll_id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({poll_id: poll.poll_id, ...pollOptions});
        await expectErrorResponse(response, 403);

        // can delete poll
        response = await request(server)
            .delete(`/v1/community/${community.id}/polls/${poll.poll_id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);

        // can't get deleted poll
        response = await request(server)
            .get(`/v1/community/${community.id}/polls/${poll.poll_id}`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectNotFoundError(response);

        // can find deleted poll in list
        response = await request(server)
            .get(`/v1/community/${community.id}/polls/`)
            .set('Authorization', `Bearer ${authToken}`);
        await expectSuccessResponse(response);
        await expectCorrectCollection(response.body.data, expectCorrectPoll);
        searchResult = response.body.data.find(pollEl => pollEl.poll_id === poll.poll_id);
        await expect(searchResult).toBeUndefined();

    });

});
