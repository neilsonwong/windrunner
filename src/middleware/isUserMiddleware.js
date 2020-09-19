async function isUser(ctx, next) {
  const email = ctx.state.user;
  if (email) {
    await next();
  }
  else {
    ctx.throw(403, 'Users Only');
  }
};

module.exports = isUser;