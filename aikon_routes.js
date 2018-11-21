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

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const jwtdecode = require('jwt-decode');

//Load settings from file
var settings = require('./.env.json');
const APP_ID = settings.APP_ID; //This is provided after you register your app with ORE ID
var CALLBACK = settings.CALLBACK; // The url called by the server when login flow is finished - must match one of the callback strings listed in the App Registration
var PROVIDER = settings.PROVIDER; // ('facebook', 'google', 'twitter', etc.) - If provided, will start the login flow automatically for this provider 
var ENVIRONMENT = settings.ENVIRONMENT;  // ('prod', 'staging', or 'dev') - If this setting is wrong, you'll get an invalid_token error e.g. `state` does not match
var OREID_URI = settings.OREID_URI; // HTTP Address of OREID server
var BACKGROUND_COLOR = settings.BACKGROUND_COLOR; // Background color shown during login flow 

//Configure and connect to the apimarketclient
const { ApiMarketClient } = require('@apimarket/apimarket');
const config = require("./apimarket_config.json"); // You'll need a config file... This can be downloaded from api.market after licensing the OREID API
const apimarketClient = new ApiMarketClient(config);
apimarketClient.connect();

//Names of the OREID api endpoints (used by apimarketClient)
const ORE_API_NAME_APPTOKEN = "com.aikon.oreid.appToken";
const ORE_API_NAME_USERTOKEN = "com.aikon.oreid.userToken";
const ORE_API_NAME_USER = "com.aikon.oreid.user";
const CLAIM_BASE_URI = "https://oreid.aikon.com";

const aikonRouter = express.Router();

aikonRouter.use(bodyParser.json());
aikonRouter.use(bodyParser.urlencoded({ extended: false }));

//AUTH endpoint
aikonRouter.use('/auth-info', async function(req, res) {
  var params = {
    app_id: APP_ID,
    env: ENVIRONMENT
  };

  console.log(`params:`,params)

  try {
    const response = await apimarketClient.fetch(ORE_API_NAME_APPTOKEN, params);
    console.log(`apimarketClient ORE_API_NAME_APPTOKEN response: `, response)
    const { appAccessToken } = response;
    const returnPayload = {
      appAccessToken: appAccessToken,
      callbackUrl: CALLBACK,
      oreidUri: OREID_URI,
      provider: PROVIDER,
      backgroundColor: BACKGROUND_COLOR,
      oreIdAuthUrl: `${OREID_URI}/auth#app_access_token=${appAccessToken}?provider=${PROVIDER}?callback_url=${encodeURIComponent(CALLBACK)}?background_color=${BACKGROUND_COLOR}`
    };
    res.status(200).json(returnPayload);
  }
  catch (error) {
    console.error("Error:", error);
  }
});

//USER endpoint
aikonRouter.use('/user', async function(req, res) {
    // TODO Verify the access token has a valid signature
    const { account } = req.query;

    if(!account || account === undefined) {
      res.status(400).json({error:`Missing the account parameter`});
    }

   try {

     var params = {
        app_id: APP_ID,
        account: account,
        env: ENVIRONMENT
     };

     const response = await apimarketClient.fetch(ORE_API_NAME_USER, params);
     const returnPayload = {
       ...response
     };

     res.status(200).json(returnPayload);

   } catch (error) {
      console.error("Error:", error);
   }
});

module.exports = aikonRouter;