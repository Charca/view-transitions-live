export function shouldNotIntercept(navigationEvent) {
  return (
    navigationEvent.canIntercept === false ||
    // If this is just a hashChange,
    // just let the browser handle scrolling to the content.
    navigationEvent.hashChange ||
    // If this is a download,
    // let the browser perform the download.
    navigationEvent.downloadRequest ||
    // If this is a form submission,
    // let that go to the server.
    navigationEvent.formData
  )
}

export function updateTheDOMSomehow(data) {
  document.getElementById('content').innerHTML = data
}

export function findCardByPath(path, parent = document) {
  return parent.querySelector(`[href="${path}"]`)
}
