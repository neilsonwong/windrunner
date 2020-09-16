const axios = require('axios');

const GOOGLE_TOKEN_AUTH_URL = 'https://www.googleapis.com/oauth2/v3/tokeninfo';

async function authenticateGoogleAccessToken(ctx, next) {
  const accessToken = ctx.request.token;

  try {
    const { data } = await axios.get(GOOGLE_TOKEN_AUTH_URL, {
      params: { access_token: accessToken }
    });

    // ensure token not expired
    if (data.expires_in <= 0) {
      throw new 'access token expired';
    }
    // else {
    //   console.log('token expires in ' + data.expires_in);
    // }

    ctx.state.user = data.email;
    console.log('authenticated ' + ctx.state.user);

    await next();
  }
  catch (e) {
    // if google returns bad request, this catches it
    // this seems to handle expired tokens automatically
    ctx.throw(401, 'Unauthorized');
  }
};

module.exports = authenticateGoogleAccessToken;