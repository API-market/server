import * as request from 'supertest';
import * as dotenv from 'dotenv';

// TODO: Move config loader to server loader
dotenv.config({ silent: true });

import * as server from '../server';
import {expectErrorResponse, expectSuccessResponse, generateNewUserCredentials} from './e2e-helpers';

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

    it('Can POST /users', async () => {
        let response;

        // empty request
        response = await request(server)
            .post(`/v1/users`)
            .send({});
        await expectErrorResponse(response, 422);

        // some fields empty
        response = await request(server)
            .post(`/v1/users`)
            .send(credentials);
        await expectErrorResponse(response, 422);

        credentials.dob = `2005-08-09T18:31:42+03:30`;
        credentials.password = `password1`;

        // can't use common password
        response = await request(server)
            .post(`/v1/users`)
            .send(credentials);
        await expectErrorResponse(response, 422);

        // can't use complicated but short password
        credentials.password = `A1b2C+D`;
        response = await request(server)
            .post(`/v1/users`)
            .send(credentials);
        await expectErrorResponse(response, 422);
        credentials.password = `A1b2C+D0`;

        // can't create user without phone tokens
        response = await request(server)
            .post(`/v1/users`)
            .send(credentials);
        await expectErrorResponse(response, 422);

        // well done
        credentials.token_phone = Math.random().toString(36).slice(-8);
        credentials.name_phone = Math.random().toString(36).slice(-8);
        credentials.platform = Math.random().toString(36).slice(-8);
        credentials.email = `new` + credentials.email;

        response = await request(server)
            .post(`/v1/users`)
            .send(credentials);
        await expectSuccessResponse(response);
    });

});
