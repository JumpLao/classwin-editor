<template>
  <div>
    <quill-editor :options="options" ref="editor" :class="{'quill-readonly': readOnly}">
      <div :id="`toolbar-${uuid}`" slot="toolbar" class="quill-toolbar">
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
  props: ['value', 'readOnly'],
  data () {
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0
      let v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    return {
      uuid,
      options: {
        readOnly: this.readOnly || false,
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
            container: `#toolbar-${uuid}`
          }
        }
      }
    }
  },
  components: {
    quillEditor
  },
  mounted () {
    let self = this
    let quill = this.$refs.editor.quill
    this.updateEditor()
    quill.on('text-change', (delta) => {
      let data = quill.getContents()
      self.$emit('input', JSON.stringify(data))
    })
  },
  watch: {
    value (newVal, oldVal) {
      if (!oldVal || oldVal === '') {
        this.updateEditor()
      }
    }
  },
  methods: {
    updateEditor () {
      let quill = this.$refs.editor.quill
      let data
      try {
        data = JSON.parse(this.value)
      } catch (e) {
        data = []
      }
      quill.setContents(data)
    }
  }
}
</script>
<style lang='scss'>
  .quill-readonly {
    .quill-toolbar{
      display:none !important;
    }
    .ql-container{
      border: 0 !important;
    }
  }
  .ql-editor{
    img {
      width: 300px !important;
    }
  }
</style>
