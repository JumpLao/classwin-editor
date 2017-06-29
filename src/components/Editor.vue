<template>
  <div>
    <quill-editor :options="options">
      <div id="toolbar" slot="toolbar">
        <span>
          <button class="ql-bold"></button>
          <button class="ql-italic"></button>
          <button class="ql-underline"></button>
        </span>
        <span>
          <button class="ql-align" value=""></button>
          <button class="ql-align" value="center"></button>
          <button class="ql-align" value="right"></button>
          <button class="ql-align" value="justify"></button>
        </span>
        <span>
          <button class="ql-formula"></button>
          <button class="ql-image"></button>
          <button class="ql-graph">graph</button>
        </span>
      </div>
    </quill-editor>
  </div>
</template>
<script>
import Quill from 'quill'
import katex from 'katex'
window.katex = katex
import equationEditor from './modules/equationEditor'
import Graph from './modules/graph'
import { ImageDrop } from 'quill-image-drop-module'
import 'katex/dist/katex.min.css'
import 'font-awesome/css/font-awesome.css'
Quill.register('modules/EquationEditor', equationEditor)
Quill.register('modules/imageDrop', ImageDrop)
Quill.register('modules/Graph', Graph)
// mount with component(can't work in Nuxt.js/SSR)
import {quillEditor} from 'vue-quill-editor'
export default {
  data () {
    return {
      options: {
        modules: {
          EquationEditor: {
            handler (value = '') {
              let formula = prompt('Enter latex formula', value)
              if (formula) {
                return Promise.resolve(formula)
              } else {
                return Promise.reject('Cancel')
              }
            }
          },
          Graph: {
            handler (value = '') {
              let formula = prompt('Enter function', value)
              if (formula) {
                return Promise.resolve(formula)
              } else {
                return Promise.reject('Cancel')
              }
            }
          },
          imageDrop: true,
          formula: true,          // Include formula module
          toolbar: {
            container: '#toolbar'
          }
        }
      }
    }
  },
  components: {
    quillEditor
  }
}
</script>
<style lang='scss'>
</style>
