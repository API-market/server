export function generateNewUserCredentials() {
    return {
        email: 'test' + Math.random().toString(36).slice(-8) + '@example.com',
        firstName: Math.random().toString(36).slice(-8),
        lastName: Math.random().toString(36).slice(-8),
    };
}

export async function expectCorrectCollection(items, checker) {
    await expect(Array.isArray(items)).toBe(true);
    for (const item of items) {
        await checker(item);
    }
}

export async function expectCorrectUser(user) {
    await expect(user).toBeDefined();
}

export async function expectCorrectErrorMessage(error) {
    await expect(error).toBeDefined();
    const fields = ['errors'];
    for (const field of fields) {
        await expect(error).toHaveProperty(field);
        await expect(error[field]).toBeDefined();
    }
}

export async function expectErrorResponse(response, expectedCode = 400, expectedTextCode = null) {
    await expect(response).toBeDefined();
    await expect(response.body).toBeDefined();
    await expect(response.error).toBeDefined();
    await expect(response.status).toBe(expectedCode);

    await expectCorrectErrorMessage(response.body);
    if (expectedTextCode) await await expect(response.body.errorTextCode).toBe(expectedTextCode);
}

export async function expectUnauthorizedError(response) {
    await expectErrorResponse(response, 401);
}

export async function expectBadRequestError(response) {
    await expectErrorResponse(response, 400);
}

export async function expectNotFoundError(response) {
    await expectErrorResponse(response, 404);
}

export async function expectSuccessResponse(response, expectedCode = 200) {
    await expect(response).toBeDefined();
    await expect(response.body).toBeDefined();
    if (response.error) { // to see error message
        await expect(response.body).toBeFalsy();
    }
    await expect(response.error).toBeFalsy();
    await expect(response.status).toBe(expectedCode);
}
