<!--

Copyright (c) 2018, Respective Authors all rights reserved.

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

-->

# Server

```sh
$ npm install 
$ npm start
```

# Using JWT

First login to get the JSON web token.
```sh
$ curl -H "Content-Type: application/json" --request POST --data '{"email":"some@email.com", "password":"some_password"}' localhost:3000/v1/login/

{"token":"some.hashed.token"}
```

Then use the JWT in your header to access other endpoints. __KEEP YOUR JTW SECRET__
```sh
$ curl  -H "Authorization: Bearer some.hashed.token" localhost:3000/v1/users/1

{"id":1,"email":"some@email.com"}
```
# Run seed for project

> npm run seed-run