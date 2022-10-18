import getClient from './appinsights.init'
import defaultErrorHandler from '#existing-error-handler'
import { useRuntimeConfig } from '#imports'
import options from '#appinsights-config'

export default function (error, event) {
  const client = getClient(options, useRuntimeConfig())
  client.trackException({
    exception: error,
    properties: {
      headers: event.req.headers
    }
  })
  defaultErrorHandler(error, event)
}
