import { IApplicationInsights } from '@microsoft/applicationinsights-web'
import { TelemetryClient } from 'applicationinsights'

// add type to Vue context
declare module 'vue/types/vue' {
  interface Vue {
    $appInsights: IApplicationInsights|TelemetryClient;
  }
}

// since nuxt 2.7.1 there is "NuxtAppOptions" for app context - see https://github.com/nuxt/nuxt.js/pull/5701
declare module '@nuxt/vue-app' {
  interface NuxtAppOptions {
    $appInsights: IApplicationInsights|TelemetryClient;
  }
}

// add types for Vuex Store
declare module 'vuex/types' {
  interface Store<S> {
    $appInsights: IApplicationInsights|TelemetryClient;
  }
}
