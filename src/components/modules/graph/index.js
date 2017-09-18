import Quill from 'quill'
import functionPlot from 'imports-loader?window.math=mathjs,window.d3=d3!function-plot'
var Embed = Quill.import('blots/embed')
var Module = Quill.import('core/module')
var icons = Quill.import('ui/icons')
icons['graph'] = '<i class="fa fa-line-chart" aria-hidden="true"></i>'

function findAncestor (el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls)) {
  }
  return el
}
class GraphBlot extends Embed {
  static create (value) {
    let node = super.create(value)
    node.style.display = 'inline-block'
    if (typeof value === 'string') {
      try {
        functionPlot({
          target: node,
          width: 300,
          height: 300,
          data: [{
            fn: value,
            sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
            graphType: 'polyline'
          }]
        })
      } catch (err) {
        console.log(err)
      }
      node.setAttribute('data-value', value)
    }
    node.setAttribute('contenteditable', false)
    return node
  }

  static value (domNode) {
    return domNode.getAttribute('data-value')
  }

  index () {
    return 1
  }
  resize (width = 500, height = 300) {
    let node = this.domNode
    let value = this.domNode.getAttribute('data-value')
    console.log(node)
    console.log(value)
    try {
      functionPlot({
        target: node,
        data: [{
          fn: value,
          sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
          graphType: 'polyline',
          width,
          height
        }]
      })
    } catch (err) {
      console.log(err)
    }
  }
}
GraphBlot.blotName = 'graph'
GraphBlot.className = 'ql-graph'
GraphBlot.tagName = 'SPAN'

export default class Graph extends Module {
  constructor (quill, options) {
    options = options || {}
    super(quill, options)
    let self = this
    this.quill = quill
    this.options = options
    this.quill.root.addEventListener('click', this.handleClick.bind(this), false)
    this.handler = options.handler
    this.quill.theme.modules.toolbar.handlers.graph = () => {
      self.prompt()
    }
  }
  static register () {
    console.log('Registering blot')
    Quill.register(GraphBlot, true)
  }
  show (target) {
    let self = this
    this.graphObj = target
    /* this.prompt(target.getAttribute('data-value')).then(() => {
    }) */
    let index = self.quill.getIndex(Quill.find(self.graphObj)) + 1
    self.quill.setSelection(index, 0)
    this.prompt(target.getAttribute('data-value')).then(() => {
      self.quill.deleteText(index - 1, 1) // remove graph
      self.quill.deleteText(index + 1, 1) // remove extra spacebar
    }).catch((e) => {
      console.log(e)
    })
    // show ui
  }
  hide (target) {
    // hide ui
  }
  prompt (curValue) {
    curValue = curValue || ''
    let self = this
    return this.handler(curValue).then((value) => {
      let range = self.quill.getSelection(true)
      if (range != null) {
        let index = range.index + range.length
        self.quill.insertEmbed(index, 'graph', value, 'user')
        self.quill.insertText(index + 1, ' ', 'user')
        self.quill.setSelection(index + 2, 'user')
        return Promise.resolve(value)
      }
    }).catch((e) => {
      // cancel
      console.log(e)
      return Promise.reject(e)
    })
  }
  handleClick (evt) {
    let self = this
    let graphObj = findAncestor(evt.target, 'ql-graph')
    let isGraph = graphObj !== null
    if (evt.target && isGraph && self.quill.isEnabled()) {
      if (this.graphObj === isGraph) {
        // we are already focused on this formula
        return
      }
      if (this.graphObj) {
        // we were just focused on another formula
        this.hide()
      }
      // clicked on an formula inside the editor
      this.show(graphObj)
    } else if (this.graphObj) {
      // clicked on a non formula
      this.hide()
    }
  }
}
if (window.Quill) {
  window.Quill.register('modules/Graph', Graph)
}
