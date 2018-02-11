<template>
  <div :id="`editor-${uuid}`" >
    <quill-editor
      ref="editor"
      :options="options"
      :class="{'quill-readonly': readOnly}"
    >
      <div :id="`toolbar-${uuid}`" slot="toolbar" class="quill-toolbar">
        <span>
          <select class="ql-size" title="size"></select>
        </span>
        <span>
          <button class="ql-bold"></button>
          <button class="ql-italic"></button>
          <button class="ql-underline"></button>
        </span>
        <span>
          <select class="ql-color" title="color"></select>
          <select class="ql-background" title="color"></select>
        </span>
        <span>
          <button class="ql-align" value=""></button>
          <button class="ql-align" value="center"></button>
          <button class="ql-align" value="right"></button>
          <button class="ql-align" value="justify"></button>
        </span>
        <span>
          <button class="ql-script" value="sub"></button>
          <button class="ql-script" value="super"></button>
        </span>
        <span>
          <button class="ql-formula"></button>
          <button class="ql-image"></button>
          <button class="ql-video"></button>
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
import ImagePicker from './modules/ImagePicker'
import { ImageDrop } from 'quill-image-drop-module'
import 'katex/dist/katex.min.css'
import 'font-awesome/css/font-awesome.css'
Quill.register('modules/EquationEditor', equationEditor)
Quill.register('modules/imageDrop', ImageDrop)
Quill.register('modules/Graph', Graph)
Quill.register('modules/ImagePicker', ImagePicker)
// mount with component(can't work in Nuxt.js/SSR)
import {quillEditor} from 'vue-quill-editor'
import Gapp from '../utils/googlePicker'
const gapp = new Gapp()

export default {
  props: {
    value: {
      type: [String, Array, Object],
      default: {ops: []}
    },
    readOnly: {
      type: Boolean
    },
    placeholder: {
      type: String
    },
    'gapp-config': {
      type: Object,
      required: true
    }
  },
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
        placeholder: this.placeholder || ' ',
        bounds: `#editor-${uuid}`,
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
          ImagePicker: {
            handler (value = '') {
              let promise = new Promise((resolve, reject) => {
                const pickerCallback = (data) => {
                  const file = data.docs[0]
                  const url = `https://drive.google.com/uc?id=${file.id}`
                  console.log(file, url)
                  console.log(promise)
                  gapp.createPermission(file.id)
                  .then(() => {
                    console.log(url)
                    resolve(url)
                  })
                  .catch(() => {
                    reject('Cancel')
                  })
                }
                gapp.handleClientLoad()
                .then((data) => gapp.createPicker(pickerCallback))
              })
              return promise
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
    gapp.init(self.gappConfig)
  },
  watch: {
    value (newVal, oldVal) {
      this.updateEditor()
    }
  },
  methods: {
    updateEditor () {
      let quill = this.$refs.editor.quill
      let data = this.value
      if (data instanceof Array) {
        data = {ops: data}
      }
      if (typeof data === 'string') {
        try {
          data = JSON.parse(this.value)
        } catch (e) {
          data = {ops: []}
        }
      }
      let refocus = quill.hasFocus()
      quill.setContents(data)
      if (refocus) {
        let range = quill.getLength()
        quill.focus()
        quill.setSelection(range)
      }
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
    min-height: 100px;
    img {
      width: 300px !important;
    }
  }
</style>
