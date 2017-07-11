<template>
  <div id="app">
    <img src="./assets/logo.png">
    <editor v-model="data" :readOnly="false"></editor>
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
      data: [
        {
          insert: {
            graph: 'x+2'
          }
        }
      ]
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
