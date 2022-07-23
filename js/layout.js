var hideAllSections = function() {
  document.querySelectorAll('section').forEach(function(x) {
    x.style.display = 'none'
  })
  document.getElementById('tooltip').style.opacity = '0'
}

document.querySelectorAll('.slides').forEach(function(s) {
  s.querySelector('button:nth-child(2)').onclick = function(x) {
    hideAllSections()
    document.getElementById('the-distribution').style.display = 'block'
    window.location.hash = 'the-distribution'
  }
  s.querySelector('button:nth-child(3)').onclick = function(x) {
    hideAllSections()
    document.getElementById('finishing-the-hundred-miler').style.display = 'block'
    window.location.hash = 'finishing-the-hundred-miler'
  }
  s.querySelector('button:nth-child(4)').onclick = function(x) {
    hideAllSections()
    document.getElementById('finish-rate').style.display = 'block'
    window.location.hash = 'finish-rate'
  }
})

document.querySelector('#the-distribution .slides button:last-child').onclick = function(x) {
  hideAllSections()
  document.getElementById('finishing-the-hundred-miler').style.display = 'block'
  window.location.hash = 'finishing-the-hundred-miler'
}

document.querySelector('#finishing-the-hundred-miler .slides button:first-child').onclick = function(x) {
  hideAllSections()
  document.getElementById('the-distribution').style.display = 'block'
  window.location.hash = 'the-distribution'
}

document.querySelector('#finishing-the-hundred-miler .slides button:last-child').onclick = function(x) {
  hideAllSections()
  // window.location.hash = 'finish-rate'
  document.getElementById('finish-rate').style.display = 'block'
}

document.querySelector('#finish-rate .slides button:first-child').onclick = function(x) {
  hideAllSections()
  document.getElementById('finishing-the-hundred-miler').style.display = 'block'
  window.location.hash = 'finishing-the-hundred-miler'
}

function init() {
  if (window.location.hash === "the-distribution" ||
      window.location.hash === "finishing-the-hundred-miler" ||
      window.location.hash === "finish-rate") {
    hideAllSections()
    document.getElementById(window.location.hash).style.display = 'block'
  }
}
