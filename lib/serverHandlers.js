const requestHandler = client => (req, res, next) => {
  client.trackRequest(req, res)
  next()
}

const errorHandler = client => (error, req, res, next) => {
  // AppInsight really want it to be only error instance via instaceof check
  const e = new Error(error)
  e.stack = error.stack
  client.trackException({ exception: e })
  next(error)
}

module.exports = {
  requestHandler,
  errorHandler
}
