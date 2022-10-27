import getClient, { appInsights } from './appinsights.init'
import defaultErrorHandler from '#existing-error-handler'
import { useRuntimeConfig, useCookies } from '#imports'
import options from '#appinsights-config'

export default function (error, event) {
  const client = getClient(options, useRuntimeConfig())
  const correlationContext = event.req.context.correlationContext
  const cookies = useCookies(event)
  appInsights.wrapWithCorrelationContext(() => {
    client.trackException({
      exception: error,
      properties: {
        headers: event.req.headers,
        url: event.req.headers.host + event.req.url
      },
      contextObjects: {
        authData: {
          userId: cookies.ai_user ? cookies.ai_user.split('|')[0] : undefined,
          sessionId: cookies.ai_session,
          userAuthUserId: event.req.context.userAuthUserId
        }
      }
    })
  }, correlationContext)()
  defaultErrorHandler(error, event)
}
