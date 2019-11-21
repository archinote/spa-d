const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1
const isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1
/**
 * Download file
 */
export function downloadFile(sUrl, fileName = '') {
  //If in Chrome or Safari - download via virtual link click
  if (isChrome || isSafari) {
    //Creating new link node.
    var link = document.createElement('a')
    link.href = sUrl

    if (link.download !== undefined && !!fileName) {
      link.download = fileName
    }

    //Dispatching click event.
    if (document.createEvent) {
      var e = document.createEvent('MouseEvents')
      e.initEvent('click', true, true)
      link.dispatchEvent(e)
      return true
    }
  }
  window.open(sUrl, '_self')
  return true
}
