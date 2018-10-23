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


const { ApiMarketClient } = require('@apimarket/apimarket');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const jwtdecode = require('jwt-decode');
// NOTE You'll need a config file... This can be downloaded from the api.market after licensing the OREID API
const config = require("./apimarket_config.json");


const apimarketClient = new ApiMarketClient(config);
apimarketClient.connect();

const ORE_API_NAME_AUTH = "exchange.openrights.id.auth";
const ORE_API_NAME_USER = "exchange.openrights.id.user";
const CLAIM_BASE_URI = "https://id.openrights.exchange";
const APP_ID = "68aab02c-505c-4eeb-a355-bbaa8cfa2597"; //This is provided after you register your app with OREID

var CALLBACK = `https://callback.sampleapp.com`;
var WEB_URI;
var PROVIDER = 'facebook'; //will start the Facebook login flow automatically


//IMPORTANT: Uncomment the correct line below for prod, staging, or dev
//If this setting is wrong, you'll get an invalid_token error e.g. `state` does not match

// const environment = 'prod';      //Production
// const environment = 'staging';   //Staging - Use this value for testing your app flow
const environment = 'staging';          // Local dev

switch (environment) {
  case 'prod':
    WEB_URI = "https://id.openrights.exchange";
    break;
  case 'staging':
    WEB_URI = "https://id-staging.openrights.exchange";
    break;
  case 'dev':
    WEB_URI = "http://localhost:3000";
    break;
}


var aikonRouter = express.Router();

aikonRouter.use('/auth', async function(req, res) {
  //AUTH endpoint
  console.log("Step 1")
  var params = {
    appId: APP_ID
  };
  console.log("Step 2")
  //add 'env' param for ORE to know which endpoint to use
  if(environment != 'prod') {
    params.env = environment;
  }
  console.log("Step 3")
  try {
    console.log(ORE_API_NAME_AUTH)
    const response = await apimarketClient.fetch(ORE_API_NAME_AUTH, params);
    console.log("Step 4")
    const { authToken } = response;
    console.log(authToken)
    console.log("Step 5")
    const returnPayload = {
      access_token: authToken,
      callback_url: CALLBACK,
      oreid_uri: WEB_URI,
      provider: PROVIDER,
      oreid_auth_url: `${WEB_URI}/auth#access_token=${authToken}?provider=${PROVIDER}?callbackUrl=${encodeURIComponent(CALLBACK)}`
    };
    console.log("Step 6")
    console.log(returnPayload);
    res.status(200).json(returnPayload);
  }
  catch (error) {
    console.error("Error:", error);
  }
});

aikonRouter.get('/user', async function (req, res) {
  // TODO Verify the access token has a valid signature
  const { access_token } = req.query;

  if(!access_token) {
    res.status(400, 'Missing a user access_token');
  }

 try {
   let accessToken = jwtdecode(access_token);
   let account = accessToken[`${CLAIM_BASE_URI}/account`];

   if(!account) {
    res.status(400, 'Missing account parameter in access_token');
   }

   var params = {
      appId: APP_ID,
      account: account
   };

   //add 'env' param for ORE to know which endpoint to use
   if(environment != 'prod') {
     params.env = environment;
   }

   const response = await apimarketClient.fetch(ORE_API_NAME_USER, params);
   const returnPayload = {
     ...response,
     ...accessToken
   };

   res.status(200).json(returnPayload);

 } catch (error) {
    console.error("Error:", error);
 }
});
// 
// aikonRouter.get('/send/push', function (req, res) {});


module.exports = aikonRouter;

