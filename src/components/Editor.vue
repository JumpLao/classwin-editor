<template>
  <div>
    <quill-editor :options="options" ref="editor" :class="{'quill-readonly': readOnly}">
      <div id="toolbar" slot="toolbar" >
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
      type: String,
      default: '[]'
    },
    readOnly: {
      type: Boolean
    },
    'gapp-config': {
      type: Object,
      required: true
    }
  },
  data () {
    return {
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
            container: '#toolbar'
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
    console.log(this.$refs.editor.quill)
    let quill = this.$refs.editor.quill
    quill.setContents(JSON.parse(this.value))
    quill.on('text-change', (delta) => {
      let data = quill.getContents()
      self.$emit('input', JSON.stringify(data))
    })
    gapp.init(self.gappConfig)
    // Promise.resolve({})
    // .then(() => gapp.init(self.gappConfig))
    // .then(() => gapp.handleClientLoad())
  }
}
</script>
<style lang='scss'>
  .quill-readonly {
    .ql-toolbar{
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
