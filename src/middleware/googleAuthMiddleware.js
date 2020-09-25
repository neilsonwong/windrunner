'use strict';

const axios = require('axios');
const logger = require('../logger');
const config = require('../../config.json');

const GOOGLE_TOKEN_AUTH_URL = 'https://www.googleapis.com/oauth2/v3/tokeninfo';

async function authenticateGoogleAccessToken(ctx, next) {
  const accessToken = ctx.request.token;

  try {
    const idToken = await retrieveIdToken(accessToken);

    // ensure token not expired
    if (idToken.expires_in <= 0) {
      throw 'access token expired';
    }

    if (idToken.aud !== config.GOOGLE_CLIENT_ID) {
      throw 'incorrect audience';
    }

    ctx.state.user = idToken.email;
    logger.verbose(`Authenticated ${ctx.state.user}`);
  }
  catch (e) {
    // if google returns bad request, this catches it
    // this seems to handle expired tokens automatically
    logger.verbose(`Rejected token auth due to: ${e}`);
  }

  await next();
};

async function retrieveIdToken(accessToken) {
  try {
    const { data } = await axios.get(GOOGLE_TOKEN_AUTH_URL, {
      params: { access_token: accessToken }
    });
    return data;
  }
  catch(e) {
    throw 'Error retrieving ID Token from Google' + e;
  }
}

module.exports = authenticateGoogleAccessToken;
