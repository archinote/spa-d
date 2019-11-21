export default {
  methods:{
    deleteNodeByProp(prop, value, tree){
      for (let index in tree){
        if ( tree[index][prop] === value){
          return tree.splice(index, 1)[0]
        } else if( tree[index].children && tree[index].children.length ){
          this.deleteNodeByProp(prop, value, tree[index].children )
        }
      }
    },
    
    insertNode(data, mode='before', id, tree){
      for (let index in tree){
        if ( tree[index].id === id){
          switch(mode){
            case 'before':
              tree.splice(index, 0, data)
              break
            case 'after':
              index++
              tree.splice(index, 0, data)
              break
            case 'firstChild':
              tree.children.unshift(data)
              break
            case 'lastChild':
              tree.children.push(data)
              break
          }
          break
        } else if( tree[index].children && tree[index].children.length ){
          this.insertNode(data, mode, id, tree[index].children )
        }
      }
    },
    
    //Returns single node or null if not found
    getNodeByProp(prop, value, tree){
      let root = [...tree]
      let stack = []
      let node, result = null
      
      for(let item of root){
        stack.push(item)
        while (stack.length > 0) {
          node = stack.shift();
          if (node[prop] === value) {
            result = node
            break;
          } else if (node.children && node.children.length) {
            for (let i = 0, len = node.children.length; i < len; i += 1) {
              stack.push(node.children[i]);
            }
          }
        }
      }
      return result
    },
    
    //Returns array of nodes or empty array if not found
    getNodesByProp(prop, value, tree){
      let root = [...tree]
      let stack = []
      let node, result = []
      
      for(let item of root){
        stack.push(item)
        while (stack.length > 0) {
          node = stack.shift();
          if (node[prop] === value) {
            result.push(node)
          }
          if (node.children && node.children.length) {
            for (let i = 0, len = node.children.length; i < len; i += 1) {
              stack.push(node.children[i]);
            }
          }
        }
      }
      return result
    },
    
    setNodeProps(tree, prop, value){
      let node
      let stack = [...tree]
      let idx = 0
      let result = []
      while (node = stack[idx++]) {
        node[prop] = value
        result.push(node.id)
        let children = node.children || []
        for (let i = 0, len = children.length; i < len; i++) {
          stack.push(children[i]);
        }
      }
      return result
    },
    
    isDescendant(el, id){
      let node
      let stack = [el]
      let idx = 0
      let result = false
      
      while (node = stack[idx++]) {
        if (node.id === id) {
          result = true
          break
        } else if (node.children && node.children.length) {
          for (let i = 0, len = node.children.length; i < len; i += 1) {
            stack.push(node.children[i]);
          }
        }
      }
      return result
    },
  }
}