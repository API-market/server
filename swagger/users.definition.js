// module.exports = {
//     User: {
//         required: [
//             'email',
//             '_id'
//         ],
//         properties: {
//             _id: {
//                 type: 'string',
//                 uniqueItems: true
//             },
//             email: {
//                 type: 'string',
//                 uniqueItems: true
//             },
//             lastName: {
//                 type: 'string'
//             },
//             firstName: {
//                 type: 'string'
//             }
//         }
//     },
//     Users: {
//         type: 'array',
//         $ref: '#/definitions/User'
//     },
//     '/users/{userId}': {
//         parameters: [
//             {
//                 name: 'userId',
//                 in: 'path',
//                 required: true,
//                 description: 'ID of user that we want to find',
//                 type: 'string'
//             }
//         ],
//         get: {
//             tags: [
//                 'Users'
//             ],
//             summary: 'Get user with given ID',
//             responses: {
//                 200: {
//                     description: 'User is found',
//                     schema: {
//                         $ref: '#/definitions/User'
//                     }
//                 }
//             }
//         },
//         delete: {
//             summary: 'Delete user with given ID',
//             tags: [
//                 'Users'
//             ],
//             responses: {
//                 200: {
//                     description: 'User is deleted',
//                     schema: {
//                         $ref: '#/definitions/User'
//                     }
//                 }
//             }
//         },
//         put: {
//             summary: 'Update user with give ID',
//             tags: [
//                 'Users'
//             ],
//             parameters: [
//                 {
//                     name: 'user',
//                     in: 'body',
//                     description: 'User with new values of properties',
//                     schema: {
//                         $ref: '#/definitions/User'
//                     }
//                 }
//             ],
//             responses: {
//                 200: {
//                     description: 'User is updated',
//                     schema: {
//                         $ref: '#/definitions/User'
//                     }
//                 }
//             }
//         }
//     }
// };