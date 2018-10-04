import * as request from 'supertest';
import * as dotenv from 'dotenv';

// TODO: Move config loader to server loader
dotenv.config({ silent: true });

import * as server from '../server';
import {expectCorrectUser, expectSuccessResponse, expectValidationError, generateNewUserCredentials} from './e2e-helpers';

jest.setTimeout(25000);

describe('Global e2e tests', () => {

    const credentials: any = generateNewUserCredentials();

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

    it('Can GET /versions', async () => {
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

    it('Can POST /users', async () => {
        let response;

        // empty request
        response = await request(server)
            .post(`/v1/users`)
            .send({});
        await expectValidationError(response);

        // some fields empty
        response = await request(server)
            .post(`/v1/users`)
            .send(credentials);
        await expectValidationError(response);

        credentials.dob = `2005-08-09T18:31:42+03:30`;
        credentials.password = `password1`;

        // can't use common password
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
        credentials.password = `A1b2C+D0`;

        // can't create user without phone tokens
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
    });

    it('Can POST /login', async () => {
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
    });

});
