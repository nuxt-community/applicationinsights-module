import * as AppInsights from 'applicationinsights'

let initialized = false

const getClient = (options, runtimeConfig) => {
  if (!initialized) {
    const runtimeConfigLocal = { ...(runtimeConfig.public.appInsights || {}), ...(runtimeConfig.appInsights || {}) }
    const mergedConfig = { ...options, ...runtimeConfigLocal }
    const appInsightsServer = AppInsights.setup(mergedConfig.serverConnectionString)
    for (const [key, value] of Object.entries(mergedConfig.serverConfig)) {
      AppInsights.defaultClient.config[key] = value
    }
    if (mergedConfig.initialize) {
      appInsightsServer.start()
    }
    initialized = true
  }
  return AppInsights.default ? AppInsights.default.defaultClient : AppInsights.defaultClient
}
export default getClient
