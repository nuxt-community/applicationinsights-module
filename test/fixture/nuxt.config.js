module.exports = {
  srcDir: __dirname,
  dev: false,
  render: {
    resourceHints: false
  },
  modules: [
    require('../..')
  ],
  appInsights: {
    instrumentationKey: '1111'
  },
  server: {
    port: 3001
  },
  build: {
    standalone: true
  }
}
