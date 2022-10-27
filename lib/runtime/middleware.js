import { defineEventHandler } from 'h3'
import { appInsights } from './appinsights.init'

export default defineEventHandler((event) => {
  const correlationContext = appInsights.startOperation(event.req)
  event.req.context.startTime = Date.now()
  event.req.context.correlationContext = correlationContext
})
