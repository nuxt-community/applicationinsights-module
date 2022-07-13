import * as applicationinsights from 'applicationinsights'

export default function (ctx, inject) {
  // Inject AppInsights to the context as $appInsights
  const config = <%= serialize(options.config) %>
  const appInsightsServer = applicationinsights.setup(<%= serialize(options.instrumentationKey) %>)
  applicationinsights.defaultClient.config = config
  if (optionsServer.initialize) {
     appInsightsServer.start()
  }
  inject('appInsights', applicationinsights || {})
}
