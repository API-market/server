export function generateNewUserCredentials() {
    return {
        email: 'test' + Math.random().toString(36).slice(-8) + '@example.com',
    };
}

export function generateRandomString() {
    return Math.random().toString(36).slice(-8);
}

export async function expectCorrectCollection(items, checker, expectingMinimalCollectionSize = 0) {
    await expect(Array.isArray(items)).toBe(true);
    await expect(items.length).toBeGreaterThanOrEqual(expectingMinimalCollectionSize);
    for (const item of items) {
        await checker(item);
    }
}

export async function expectCorrectUser(user) {
    await expect(user).toBeDefined();
    const fields = [
        'firstName', 'lastName', 'email', 'dob', 'balance', 'followee_count', 'follower_count',
        'answer_count', 'user_id', 'token', 'schoolId', 'emails',
    ];
    for (const field of fields){
        await expect(user).toHaveProperty(field);
        await expect(user[field]).toBeDefined();
    }

    await expect(user).not.toHaveProperty('password');
    await expect(user).not.toHaveProperty('id');
    await expect(user).not.toHaveProperty('createdAt');
}

export async function expectCorrectUserShortForm(user) {
    await expect(user).toBeDefined();
    const fields = [
        'firstName', 'lastName', 'email', 'dob', 'balance', 'followee_count', 'follower_count',
        'answer_count', 'user_id', 'schoolId',
    ];
    for (const field of fields){
        await expect(user).toHaveProperty(field);
        await expect(user[field]).toBeDefined();
    }

    await expect(user).not.toHaveProperty('password');
    await expect(user).not.toHaveProperty('id');
    await expect(user).not.toHaveProperty('createdAt');
}

export async function expectCorrectUserUpdate(user) {
    await expect(user).toBeDefined();
    const fields = [
        'firstName', 'lastName', 'email', 'dob', 'balance', 'followee_count', 'follower_count', 'schoolId',
    ];
    for (const field of fields){
        await expect(user).toHaveProperty(field);
        await expect(user[field]).toBeDefined();
    }

    await expect(user).not.toHaveProperty('password');
    await expect(user).not.toHaveProperty('id');
    await expect(user).not.toHaveProperty('createdAt');
}

export async function expectCorrectSchool(user) {
    await expect(user).toBeDefined();
    const fields = ['schoolId', 'name', 'emailDomain'];
    for (const field of fields){
        await expect(user).toHaveProperty(field);
        await expect(user[field]).toBeDefined();
    }
}

export async function expectCorrectCommunity(community) {
    await expect(community).toBeDefined();
    const fields = ['image', 'id', 'name', 'description', 'created_at', 'polls_at',
                        'members', 'answers', 'user', 'polls', 'is_joined'];
    for (const field of fields){
        await expect(community).toHaveProperty(field);
        await expect(community[field]).toBeDefined();
    }
}

export async function expectCorrectAddCommunityResponse(community) {
    await expect(community).toBeDefined();
    const fields = ['image', 'id', 'name', 'description', 'created_at', 'polls_at'];
    for (const field of fields){
        await expect(community).toHaveProperty(field);
        await expect(community[field]).toBeDefined();
    }
}

export async function expectCorrectAddPollResponse(poll) {
    await expect(poll).toBeDefined();
    const fields = ['answers', 'creator_id', 'createdAt', 'updatedAt', 'poll_id', 'price', 'question', 'tags'];
    for (const field of fields){
        await expect(poll).toHaveProperty(field);
        await expect(poll[field]).toBeDefined();
    }

    await expect(Array.isArray(poll[`answers`])).toBe(true);
    await expect(Array.isArray(poll[`tags`])).toBe(true);
}

export async function expectCorrectPoll(poll) {
    await expect(poll).toBeDefined();
    const fields = ['answers', 'creator_id', 'createdAt', 'poll_id', 'price', 'question', 'tags', 'images'];
    for (const field of fields){
        await expect(poll).toHaveProperty(field);
        await expect(poll[field]).toBeDefined();
    }

    await expect(Array.isArray(poll[`answers`])).toBe(true);
    await expect(Array.isArray(poll[`tags`])).toBe(true);
    await expect(Array.isArray(poll[`images`])).toBe(true);
}

export async function expectCorrectCommunityPoll(poll) {
    await expect(poll).toBeDefined();
    const fields = ['answers', 'avatar', 'creator_id', 'createdAt', 'creator_image', 'poll_id', 'price', 'question', 'tags'];
    for (const field of fields){
        await expect(poll).toHaveProperty(field);
        await expect(poll[field]).toBeDefined();
    }

    await expect(Array.isArray(poll[`answers`])).toBe(true);
    await expect(Array.isArray(poll[`tags`])).toBe(true);
}

export async function expectCorrectImage(image) {
    await expect(image).toBeDefined();
    const fields = ['imageId', 'userId', 'entityType', 'entityId', 'imageUrl', 'originalImageUrl', 'key', 'name', 'createdAt'];
    for (const field of fields){
        await expect(image).toHaveProperty(field);
        await expect(image[field]).toBeDefined();
    }

}

export async function expectCorrectErrorMessage(error) {
    await expect(error).toBeDefined();
    const fields = [];
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

export async function expectValidationError(response) {
    await expectErrorResponse(response, 422);
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

export function delay(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, duration);
    });
}
