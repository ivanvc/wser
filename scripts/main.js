// Colors: https://flatuicolors.com/palette/us
window.colors = {
  main: '#27ae60',
  blue: '#2980b9',
  pink: '#8e44ad',
  black: '#2d3436',
  gray: '#636e72',
  lightGray: '#b2bec3',
  darkRed: '#900900',
  lightRed: '#ff6c5c',
  darkBlue: '#096099',
  lightBlue: '#54a8fb',
  yellow: '#f39c12'
}

window.formatDuration = function(duration) {
  var d = parseInt(duration)
  return ('0' + Math.trunc(d / 60 / 60)).slice(-2) +
    ':' +
    ('0' + Math.trunc(d / 60 % 60)).slice(-2)
}

var ready = function() {
  if (document.readyState != 'loading'){
    init()
  } else {
    document.addEventListener('DOMContentLoaded', init)
  }
}

var init = async function() {
  var data = await d3.csv('data/ws100.csv')
  var parsedData = data.map(function(d) {
    d['Finish.Time'] = parseInt(d['Finish.Time'])
    d['Finish.Time.Parsed'] = formatDuration(d['Finish.Time'])
    d['Overall.Place'] = parseInt(d['Overall.Place'])
    d['Temp.High'] = parseInt(d['Temp.High'])
    d['Temp.Low'] = parseInt(d['Temp.Low'])
    return d
  })

  initializeHistogramChart(parsedData)
  initializeFinishTimesChart(parsedData)
  initializeFinishRateChart(parsedData)
}

var initializeFinishTimesChart = function(parsedData) {
  var finishTimes = new FinishTimesChart(parsedData)
  finishTimes.update()
  var previousYear

  document.getElementById("finishTimesYear").oninput = function() {
    var val = "All"
    if (this.value === "2020" || this.value == "2021") {
      val = parseInt(this.value) + 1
    } else if (this.value !== "2009") {
      val = this.value
    }
    document.getElementById("finishTimesYearValue").innerText = val
    finishTimes.update()
  }

  document.getElementById("finishTimesGenderAll").oninput =
    document.getElementById("finishTimesGenderMale").oninput =
    document.getElementById("finishTimesGenderFemale").oninput = function() {
      finishTimes.update()
    }

  document.getElementById("finishTimesTempDiff").oninput =
    document.getElementById("finishTimesTempLow").oninput =
    document.getElementById("finishTimesTempHigh").oninput = function() {
      finishTimes.update()
    }

  document.getElementById('tempHigh').onclick = function() {
    return false
  }
  document.getElementById('tempHigh').onmouseover = function() {
    d3.selectAll('.annotation.higherTemps text').style('fill', colors.yellow)
    d3.selectAll('.annotation.higherTemps path').style('stroke', colors.yellow)
    d3.selectAll('.annotation.higherTemps .annotation-subject path')
      .style('fill', colors.yellow)
  }
  document.getElementById('tempHigh').onmouseout = function() {
    d3.selectAll('.annotation.higherTemps text').style('fill', null)
    d3.selectAll('.annotation.higherTemps path').style('stroke', null)
    d3.selectAll('.annotation.higherTemps .annotation-subject path')
      .style('fill', null)
  }

  document.getElementById('tempLow').onclick = function() {
    return false
  }
  document.getElementById('tempLow').onmouseover = function() {
    d3.selectAll('.annotation.lowerTemps text').style('fill', colors.yellow)
    d3.selectAll('.annotation.lowerTemps path').style('stroke', colors.yellow)
    d3.selectAll('.annotation.lowerTemps .annotation-subject path')
      .style('fill', colors.yellow)
  }
  document.getElementById('tempLow').onmouseout = function() {
    d3.selectAll('.annotation.lowerTemps text').style('fill', null)
    d3.selectAll('.annotation.lowerTemps path').style('stroke', null)
    d3.selectAll('.annotation.lowerTemps .annotation-subject path')
      .style('fill', null)
  }

  document.getElementById('temp2021').onclick = function() {
    previousYear = ""
    return false
  }

  document.getElementById('temp2021').onmouseover = function() {
    previousYear = document.getElementById('finishTimesYear').value
    document.getElementById('finishTimesYear').value = "2020"
    document.getElementById("finishTimesYearValue").innerText = '2021'
    finishTimes.update()
  }

  document.getElementById('temp2021').onmouseout = function() {
    if (previousYear === "") {
      return
    }
    document.getElementById('finishTimesYear').value = previousYear
    var year = previousYear
    if (previousYear === "2020" || previousYear === "2021") {
      year = parseInt(year) + 1
    } else if (previousYear === "2009") {
      year = "All"
    }
    document.getElementById("finishTimesYearValue").innerText = year
    finishTimes.update()
  }

  document.getElementById('temp2013').onclick = function() {
    previousYear = ""
    return false
  }

  document.getElementById('temp2013').onmouseover = function() {
    previousYear = document.getElementById('finishTimesYear').value
    document.getElementById('finishTimesYear').value = "2013"
    document.getElementById("finishTimesYearValue").innerText = '2013'
    finishTimes.update()
  }

  document.getElementById('temp2013').onmouseout = function() {
    if (previousYear === "") {
      return
    }
    document.getElementById('finishTimesYear').value = previousYear
    var year = previousYear
    if (previousYear === "2020" || previousYear === "2021") {
      year = parseInt(year) + 1
    } else if (previousYear === "2009") {
      year = "All"
    }
    document.getElementById("finishTimesYearValue").innerText = year
    finishTimes.update()
  }
}

var initializeHistogramChart = function(parsedData) {
  var histogramChart = new HistogramChart(parsedData)
  histogramChart.update()
  var previousGender

  document.getElementById("histYear").oninput = function() {
    var val = "All"
    if (this.value === "2020" || this.value == "2021") {
      val = parseInt(this.value) + 1
    } else if (this.value !== "2009") {
      val = this.value
    }
    document.getElementById("histYearValue").innerText = val
    histogramChart.update()
  }

  document.getElementById("histGenderAll").oninput =
    document.getElementById("histGenderMale").oninput =
    document.getElementById("histGenderFemale").oninput = function() {
      histogramChart.update()
    }

  document.getElementById('histFemales').onclick = function() {
    previousGender = ""
    return false
  }
  document.getElementById('histFemales').onmouseover = function() {
    previousGender = document.querySelector('input[name=histgender]:checked').value
    document.getElementById('histGenderFemale').checked = true
    histogramChart.update()
  }
  document.getElementById('histFemales').onmouseout = function() {
    if (previousGender === "") {
      return
    }
    document.getElementById('histGender' + previousGender).checked = true
    histogramChart.update()
  }

  document.getElementById('histMales').onclick = function() {
    if (previousGender === "") {
      previousGender = ""
      return
    }
    return false
  }
  document.getElementById('histMales').onmouseover = function() {
    previousGender = document.querySelector('input[name=histgender]:checked').value
    document.getElementById('histGenderMale').checked = true
    histogramChart.update()
  }
  document.getElementById('histMales').onmouseout = function() {
    if (previousGender === "") {
      return
    }
    document.getElementById('histGender' + previousGender).checked = true
    histogramChart.update()
  }

  document.getElementById('histElite').onclick = function() {
    return false
  }
  document.getElementById('histElite').onmouseover = function() {
    d3.selectAll('.annotation.elite text').style('fill', colors.yellow)
    d3.selectAll('.annotation.elite path').style('stroke', colors.yellow)
    d3.selectAll('.annotation.elite .annotation-subject path')
      .style('fill', colors.yellow)
  }
  document.getElementById('histElite').onmouseout = function() {
    d3.selectAll('.annotation.elite text').style('fill', null)
    d3.selectAll('.annotation.elite path').style('stroke', null)
    d3.selectAll('.annotation.elite .annotation-subject path')
      .style('fill', null)
  }

  document.getElementById('histSub24').onclick = function() {
    return false
  }
  document.getElementById('histSub24').onmouseover = function() {
    d3.selectAll('.annotation.sub24 text').style('fill', colors.yellow)
    d3.selectAll('.annotation.sub24 path').style('stroke', colors.yellow)
    d3.selectAll('.annotation.sub24 .annotation-subject path')
      .style('fill', colors.yellow)
  }
  document.getElementById('histSub24').onmouseout = function() {
    d3.selectAll('.annotation.sub24 text').style('fill', null)
    d3.selectAll('.annotation.sub24 path').style('stroke', null)
    d3.selectAll('.annotation.sub24 .annotation-subject path')
      .style('fill', null)
  }
}

var initializeFinishRateChart = function(parsedData) {
  var finishRate = new FinishRateChart(parsedData)
  finishRate.update()
  var previousRate, previousGender

  document.getElementById("finishRateSub24").oninput =
    document.getElementById("finishRateF").oninput = function() {
      finishRate.update()
    }

  document.getElementById("finishRateGenderAll").oninput =
    document.getElementById("finishRateGenderMale").oninput =
    document.getElementById("finishRateGenderFemale").oninput = function() {
      finishRate.update()
    }

  document.getElementById("finishRateTempDiff").oninput =
    document.getElementById("finishRateTempLow").oninput =
    document.getElementById("finishRateTempHigh").oninput = function() {
      finishRate.update()
    }

  document.getElementById('ratesub24').onclick = function() {
    previousRate = ""
    return false
  }
  document.getElementById('ratesub24').onmouseover = function() {
    previousRate = document.querySelector('input[name=finishRate]:checked').value
    document.getElementById('finishRateSub24').checked = true
    finishRate.update()
  }
  document.getElementById('ratesub24').onmouseout = function() {
    if (previousRate === "") {
      return
    }
    document.getElementById('finishRate' + previousRate).checked = true
    finishRate.update()
  }

  document.getElementById('ratefemales').onclick = function() {
    previousGender = ""
    return false
  }
  document.getElementById('ratefemales').onmouseover = function() {
    previousGender = document.querySelector('input[name=finishRategender]:checked').value
    document.getElementById('finishRateGenderFemale').checked = true
    finishRate.update()
  }
  document.getElementById('ratefemales').onmouseout = function() {
    if (previousGender === "") {
      return
    }
    document.getElementById('finishRateGender' + previousGender).checked = true
    finishRate.update()
  }

  document.getElementById('ratefemalessub24').onclick = function() {
    previousGender = ""
    previousRate = ""
    return false
  }
  document.getElementById('ratefemalessub24').onmouseover = function() {
    previousRate = document.querySelector('input[name=finishRate]:checked').value
    document.getElementById('finishRateSub24').checked = true
    previousGender = document.querySelector('input[name=finishRategender]:checked').value
    document.getElementById('finishRateGenderFemale').checked = true

    finishRate.update()
  }
  document.getElementById('ratefemalessub24').onmouseout = function() {
    if (previousGender === "" && previousRate === "") {
      return
    }
    document.getElementById('finishRateGender' + previousGender).checked = true
    document.getElementById('finishRate' + previousRate).checked = true
    finishRate.update()
  }

}
