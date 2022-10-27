import * as AppInsights from 'applicationinsights'

let initialized = false
const appInsights = AppInsights.default ? AppInsights.default : AppInsights

const getClient = (options, runtimeConfig) => {
  if (!initialized) {
    const runtimeConfigLocal = { ...(runtimeConfig.public.appInsights || {}), ...(runtimeConfig.appInsights || {}) }
    const mergedConfig = { ...options, ...runtimeConfigLocal }
    const appInsightsServer = appInsights.setup(mergedConfig.serverConnectionString)
    for (const [key, value] of Object.entries(mergedConfig.serverConfig)) {
      appInsights.defaultClient.config[key] = value
    }
    if (mergedConfig.initialize) {
      appInsightsServer.start()
    }
    initialized = true
  }
  return appInsights.defaultClient
}

const addContextTelemetry = () => {
  appInsights.defaultClient.addTelemetryProcessor(
    (envelope, context) => {
      const setContextKey = (key, value) => {
        envelope.tags[key] = value
      }
      const getContextKey = (key) => {
        return appInsights.defaultClient.context.keys[key]
      }

      // custom context that I set on per-request basis
      const requestContext = context.authData || {}

      for (const [key, value] of Object.entries(requestContext)) {
        if (value) {
          setContextKey(
            getContextKey(key),
            value
          )
        }
      }

      return true
    }
  )
}

export default getClient
export { appInsights, addContextTelemetry }
