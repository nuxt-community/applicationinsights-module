import getClient, { appInsights, addContextTelemetry } from './appinsights.init'
import { useRuntimeConfig, useCookies } from '#imports'
import options from '#appinsights-config'

export default function (nitro) {
  const client = getClient(options, useRuntimeConfig())
  addContextTelemetry()
  nitro.hooks.hook('render:response', (response, { event }) => {
    if (typeof response.body === 'string' && (response.headers['Content-Type'] || response.headers['content-type'])?.includes('html')) {
      // We deliberately do not await so as not to block the response
      const cookies = useCookies(event)
      const correlationContext = event.req.context.correlationContext
      appInsights.wrapWithCorrelationContext(() => {
        // console.log('ssss', appInsights.getCorrelationContext())
        client.trackRequest({
          name: `${event.req.method} ${event.req.url}`,
          url: event.req.url,
          resultCode: response.statusCode,
          success: response.statusCode === 200,
          duration: Date.now() - event.req.context.startTime,
          id: correlationContext.operation.parentId,
          contextObjects: {
            authData: {
              userId: cookies.ai_user ? cookies.ai_user.split('|')[0] : undefined,
              userAuthUserId: event.req.context.userAuthUserId,
              sessionId: cookies.ai_session
            }
          }
        })
      }, correlationContext)()
    }
  })
}
