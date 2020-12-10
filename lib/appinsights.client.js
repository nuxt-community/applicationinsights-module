import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { setupVueErrorHandling, setupPageTracking } from './appinsights-vue'
import Vue from 'vue'

export default function (ctx, inject) {
  const config = {"instrumentationKey":"12345678-def7-4b3f-bb63-03dcc962af89"}
  // runtimeConfig
  const runtimeConfig = ctx.$config && ctx.$config.appInsights || {}

  const appInsights = new ApplicationInsights({
     config: {...config, ...runtimeConfig}
  })

  inject('appInsights', appInsights)

  // Initialize appInsights

  appInsights.loadAppInsights()
  setupVueErrorHandling(Vue, appInsights)

  setupPageTracking(ctx.app.router, appInsights)
}
