<template>
  <div>
    Works!
    <button @click="triggerEvent">
      trigger event
    </button>
    <button @click="triggerError">
      trigger error
    </button>
    <button @click="triggerErrorU">
      trigger error unh
    </button>
  </div>
</template>

<script>
export default {
  methods: {
    triggerEvent () {
      this.$appInsights.trackEvent({ name: 'new module event', properties: { customProperty: 'custom property value' } })
    },
    triggerError () {
      this.$appInsights.trackException({ error: new Error('new module exception') })
    },
    triggerErrorU () {
      throw new Error('UNHANDLED ERROR')
    }
  }

}
</script>
