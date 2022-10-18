import getClient from './appinsights.init'
import { useRuntimeConfig } from '#imports'
import options from '#appinsights-config'

export default function (nitro) {
  const client = getClient(options, useRuntimeConfig())
  nitro.hooks.hook('render:response', (response, { event }) => {
    if (typeof response.body === 'string' && (response.headers['Content-Type'] || response.headers['content-type'])?.includes('html')) {
      // We deliberately do not await so as not to block the response
      // appInsightsClient.trackRequest({ name: `${event.req.method} ${event.req.url}`, url: event.req.url, resultCode: response.statusCode, success: true, duration: 0 })
      client.trackNodeHttpRequest({ request: event.req, response })
    }
  })
}
