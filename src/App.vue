<template>
  <div id="app">
    <img src="./assets/logo.png">
    <editor v-model="data" :readOnly="false" :gapp-config="config"></editor>
    {{data}}
  </div>
</template>

<script>
import Hello from './components/Hello'
import Editor from './components/Editor'
export default {
  name: 'app',
  components: {
    Hello,
    Editor
  },
  data: () => {
    return {
      data: '',
      config: {
        APP_ID: '<APP_ID>',
        CLIENT_ID: '<CLIENT_ID>',
        API_KEY: '<API_KEY>'
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.ql-editor{
  img{
    width: 300px
  }
}
</style>
