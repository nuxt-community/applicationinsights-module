import { useRuntimeConfig } from '#imports'
import getClient from './appinsights.init'

export default defineNuxtPlugin(nuxtApp => {
  const client = getClient(<%= serialize(options) %>, useRuntimeConfig())
  nuxtApp.provide('appInsights', client)
  // now available on `nuxtApp.$injected`
})
