export default function (ctx, inject) {
  inject('appInsights', ctx.req.$appInsights || {})
}
