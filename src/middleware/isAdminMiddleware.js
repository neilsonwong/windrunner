const config = require('../../config.json');

async function isAdmin(ctx, next) {
  const email = ctx.state.user;
  if (email && config.ADMINS.includes(email)) {
    await next();
  }
  else {
    ctx.throw(403, 'Administrators Only');
  }
};

module.exports = isAdmin;