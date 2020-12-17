import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { setupVueErrorHandling, setupPageTracking } from './appinsights-vue'
import Vue from 'vue'

export default function (ctx, inject) {
  const config = <%= serialize(options.config) %>
  // runtimeConfig
  const runtimeConfig = ctx.$config && ctx.$config.appInsights || {}

  const appInsights = new ApplicationInsights({
     config: {...config, ...runtimeConfig}
  })

  inject('appInsights', appInsights)

  // Initialize appInsights

  <% if (options.initialize) { %>// Initialize appInsights

  appInsights.loadAppInsights()
  setupVueErrorHandling(Vue, appInsights)
  <% if (options.trackPageView) { %>
  setupPageTracking(ctx.app.router, appInsights)
  <% } %>

  <% } %>
}
