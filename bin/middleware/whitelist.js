const whitelistedUsers = process.env.WHITELIST ? process.env.WHITELIST.split(',') : []

module.exports = (req, res, next) => {
  if (!res.locals.w3id_userid) {
    res.status(401)
    res.json({
      status: 'ok',
      msg: 'Unauthorised'
    })
  } else {
    if (whitelistedUsers.indexOf(res.locals.w3id_userid) > -1) {
      next()
    } else {
      res.status(401)
      res.json({
        status: 'ok',
        msg: 'Unauthorised'
      })
    }
  }
}
