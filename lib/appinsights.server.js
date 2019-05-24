export default function (ctx, inject) {
  // Inject AppInsights to the context as $appInsights
  inject('appInsights', process.appInsights || {})
}
