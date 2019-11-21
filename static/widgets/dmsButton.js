function parseQuery ( query ){
  let Params = {}
  if ( ! query ) return Params // return empty object
  let Pairs = query.split(/[;&]/)
  for ( let i = 0; i < Pairs.length; i++ ) {
    let KeyVal = Pairs[i].split('=')
    if ( ! KeyVal || KeyVal.length !== 2 ) continue
    let key = decodeURI( KeyVal[0] )
    let val = decodeURI( KeyVal[1] )
    val = val.replace(/\+/g, ' ')
    Params[key] = val
  }
  return Params
}

if(typeof SimpleWidget==='undefined'){
  const SimpleWidget = (function() {
    
    let XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest
    
    function Widget() {
      this.driver_id = null
      this.options_url = 'https://0.0.0.0:8080/api/analytics/v1/options/'
      this.url = 'https://0.0.0.0:8080/api/analytics/v1/save-data/'
      this.ui = {
        widgetBtn: null,
      }
      this.options = {}
      this.sending = false
      this.init()
    }
    
    Widget.prototype._getOptions  = function(e) {
      e && e.preventDefault()
      let xhr = new XHR()
  
      xhr.open('GET', this.options_url, true)
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.send()
  
      let widget = this
      
      xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return
        if (this.status !== 200) {
          console.log('Request error')
          return
        }
        let options = JSON.parse(this.responseText)
        widget._applyOptions(options)
      }
    }
    
    Widget.prototype._sendData = function(e) {
      e && e.preventDefault()
      let xhr = new XHR()
      
      let dataObject = {
        data: [{value:this.options.value || 1}]
      }
      
      let data = JSON.stringify(dataObject)
      
      xhr.open('POST', this.url, true)
      xhr.setRequestHeader('Content-Type', 'application/json')
      if(!this.sending) {
        xhr.send(data)
        this._imitLoading()
      }
      
      xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return
        if (this.status !== 200) {
          console.log('Request error')
          return
        }
      }
    }
    
    Widget.prototype._initUI = function() {
      if(this.ui.widgetBtn){
        this.ui.widgetBtn = document.getElementById('dms-btn-widget')
      }
    }
    
    Widget.prototype._bindHandlers = function() {
      if(this.ui.widgetBtn){
        this.ui.widgetBtn.addEventListener('click', Widget.prototype._sendData.bind(this))
      }
    }
  
    Widget.prototype._imitLoading = function() {
      this.sending = true
      let el = this.ui.widgetBtn
      let count = 0
      let text = this.options.text
      el.style.cursor = 'not-allowed'
      
      let timerId = setInterval(function() {
        count++
        let i = 0
        let points = ''
        while(i<count){
          points+='.'
          i++
        }
        el.innerHTML = points
      }, 500)

      let widget = this
      
      setTimeout(function() {
        clearInterval(timerId);
        el.style.cursor = 'pointer'
        el.innerHTML = text
        widget.sending = false
      }, 4000);
    }
  
    Widget.prototype._applyOptions = function(options) {
      this.options = options
      if(this.ui.widgetBtn){
        let el = this.ui.widgetBtn
        el.style.cursor = 'pointer'
        el.style.textAlign = 'center'
        if(this.options.bgcolor) el.style.background = this.options.bgcolor
        if(this.options.color) el.style.color = this.options.color
        if(this.options.height) el.style.height = this.options.height+'px'
        if(this.options.height) el.style.lineHeight = this.options.height+'px'
        if(this.options.width) el.style.width = this.options.width+'px'
        if(this.options.size) el.style.fontSize = this.options.size+'px'
        if(this.options.text) el.innerHTML = this.options.text
  
        el.addEventListener('mouseenter', function(e){e.target.style.background=options.hover})
        el.addEventListener('mouseleave', function(e){e.target.style.background=options.bgcolor})
      }
      
    }
    
    Widget.prototype.init = function() {
      let scripts = document.getElementsByTagName('script')
      let length = scripts.length
      let myScript = null
      
      for(let i=0; i<length; i++ ){
        if(scripts[i].src.indexOf('static/widgets/dmsButton.js')>-1) myScript = scripts[i]
      }
      
      let queryString = myScript.src.replace(/^[^\?]+\??/,'')
      let params = parseQuery( queryString )
      
      if(params.id) {
        this.options_url = this.options_url+params.id
        this.url = this.url+params.id
        this.driver_id = params.id
      }
      this._initUI()
      this._getOptions()
      this._bindHandlers()
    }
    
    return Widget
  })()
  
  new SimpleWidget()
}

