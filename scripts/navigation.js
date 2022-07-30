var showSection = function(sect) {
  d3.select('section.active')
    .classed('active', false)
    .style('left', '0vw')
    .style('position', 'absolute')
    .transition()
    .duration(250)
    .ease(d3.easeCubic)
    .style('left', '-100vw')
    .on('end', function() {
      d3.select(this)
        .style('opacity', '0')
        .style('display', 'none')
        .style('position', null)
        .style('left', null)
    })

  d3.select('#' + sect)
    .classed('active', true)
    .style('opacity', '1')
    .style('display', 'flex')
    .style('left', '100vw')
    .style('position', 'absolute')
    .transition()
    .duration(500)
    .ease(d3.easeCubic)
    .style('left', '0vw')
    .on('end', function() {
      d3.select(this)
        .style('position', null)
        .style('left', null)
        .style('display', 'flex')
    })

  document.getElementById('tooltip').style.opacity = '0'
  window.location.hash = sect
}

document.querySelectorAll('.slides').forEach(function(s) {
  s.querySelector('button:nth-child(2)').onclick = function() {
    showSection('the-distribution')
  }
  s.querySelector('button:nth-child(3)').onclick = function() {
    showSection('finishing-the-hundred-miler')
  }
  s.querySelector('button:nth-child(4)').onclick = function() {
    showSection('finish-rate')
  }
})

document.querySelector('#the-distribution .slides button:last-child').onclick = function() {
  showSection('finishing-the-hundred-miler')
}

document.querySelector('#finishing-the-hundred-miler .slides button:first-child').onclick = function() {
  showSection('the-distribution')
}

document.querySelector('#finishing-the-hundred-miler .slides button:last-child').onclick = function() {
  showSection('finish-rate')
}

document.querySelector('#finish-rate .slides button:first-child').onclick = function() {
  showSection('finishing-the-hundred-miler')
}
