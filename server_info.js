//
//  Copyright (c) 2018, Respective Authors all rights reserved.
//
//  The MIT License
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to
//  deal in the Software without restriction, including without limitation the
//  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
//  sell copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
//  IN THE SOFTWARE.
//

const VERSION_NUMBER = 1;
const PORT = process.env.PORT || 8081;
const SUPER_SECRET_JWT_KEY = process.env.SUPER_SECRET_JWT_KEY || "secret_test";
const SEED_AUTH = process.env.SUPER_SECRET_KEY || "admintest1";
const USER_MAIN_LUMEOS = process.env.USER_MAIN_LUMEOS || "lumeos@lumeos.io";

module.exports = {
  VERSION: VERSION_NUMBER,
  PORT: PORT,
  SUPER_SECRET_JWT_KEY: SUPER_SECRET_JWT_KEY,
  SEED_AUTH,
  USER_MAIN_LUMEOS
};
