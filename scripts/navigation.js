var hideAllSections = function() {
  document.querySelectorAll('section').forEach(function(x) {
    x.style.display = 'none'
  })
  d3.selectAll('section')
    .transition()
    .duration(50)
    .style('opacity', '0')
    .style('display', 'none')
  document.getElementById('tooltip').style.opacity = '0'
}

var showSection = function(sect) {
  hideAllSections()
  d3.select('#' + sect)
    .transition()
    .duration(150)
    .style('opacity', '1')
    .style('display', 'block')
  window.location.hash = sect
}

document.querySelectorAll('.slides').forEach(function(s) {
  s.querySelector('button:nth-child(2)').onclick = function(x) {
    showSection('the-distribution')
  }
  s.querySelector('button:nth-child(3)').onclick = function(x) {
    showSection('finishing-the-hundred-miler')
  }
  s.querySelector('button:nth-child(4)').onclick = function(x) {
    showSection('finish-rate')
  }
})

document.querySelector('#the-distribution .slides button:last-child').onclick = function(x) {
  showSection('finishing-the-hundred-miler')
}

document.querySelector('#finishing-the-hundred-miler .slides button:first-child').onclick = function(x) {
  showSection('the-distribution')
}

document.querySelector('#finishing-the-hundred-miler .slides button:last-child').onclick = function(x) {
  showSection('finish-rate')
}

document.querySelector('#finish-rate .slides button:first-child').onclick = function(x) {
  showSection('finishing-the-hundred-miler')
}

function init() {
  if (window.location.hash === "the-distribution" ||
      window.location.hash === "finishing-the-hundred-miler" ||
      window.location.hash === "finish-rate") {
    hideAllSections()
    document.getElementById(window.location.hash).style.display = 'block'
  }
}
