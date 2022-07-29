var dataLoad = d3.csv('data/ws100.csv')
var parsedData;
var hist, ft, fr;

// Colors: https://flatuicolors.com/palette/us
var colors = {
  main: '#27ae60',
  M: '#2980b9',
  F: '#8e44ad',
  black: '#2d3436',
  gray: '#636e72',
  lightGray: '#b2bec3',
  darkRed: '#900900',
  lightRed: '#ff6c5c',
  darkBlue: '#096099',
  lightBlue: '#54a8fb'
}

var formatDuration = function(duration) {
  var d = parseInt(duration)
  return ('0' + Math.trunc(d / 60 / 60)).slice(-2) +
    ':' +
    ('0' + Math.trunc(d / 60 % 60)).slice(-2)
}

var HistogramChart = class {
  constructor(data) {
    this.data = data.filter(function(d) { return d.Finished == 'F' })
    this.margin = 50
    this.height = parseInt(d3.select('.chart').style('height')) - this.margin * 2
    this.width = parseInt(d3.select('.chart').style('width')) - this.margin * 2
    this.svg = d3.select("#hist")
      .attr("width", this.width + this.margin * 2)
      .attr("height", this.height + this.margin * 2)
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")")
    this.x = d3.scaleLinear()
      .domain(d3.extent(this.data, function(d) {
        return d['Finish.Time']
      }))
      .range([0, this.width])
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(
        d3.axisBottom(this.x)
        .tickFormat(function(d) {
          return formatDuration(d)
        })
      )
    this.svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", this.width)
      .attr("y", this.height + 35)
      .text("Finish Time (hours)")
      .attr('font-size', '0.8rem')
    this.svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -this.margin + 20)
      .attr("x", 0)
      .text("Number of Runners (count)")
      .attr('font-size', '0.8rem')
    this.histogram = d3.histogram()
      .value(function(d) {
        return d['Finish.Time'];
      })
      .domain(this.x.domain())
      .thresholds(this.x.ticks(30));
    this.yAxis = this.svg.append("g")

    this.annotations = this.svg
      .append("g")
      .attr("class", "annotation-group")
    this.chart = this.svg
      .append("g")
  }

  update(props = {}) {
    var histData = this.data
    var color = colors.main
    var that = this
    if ("gender" in props) {
      histData = histData.filter(function(d) {
        return d.Gender === props.gender
      })
      color = colors[props.gender]
    }
    if ("year" in props && props.year !== 2009) {
      histData = histData.filter(function(d) {
        return d.Year == props.year
      })
    }

    var bins = this.histogram(histData);
    var y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([0, d3.max(bins, function(d) {
        return d.length;
      })]);
    this.yAxis.call(d3.axisLeft(y))

    var u = this.chart.selectAll("rect")
      .data(bins)
    u.enter()
      .append("rect")
      .merge(u)
      .transition()
      .attr("x", function(d) {
        return that.x(d.x0)
      })
      .attr("y", function(d) {
        return y(d.length)
      })
      .attr("width", function(d) {
        return that.x(d.x1) - that.x(d.x0) - 1;
      })
      .attr("height", function(d) {
        return that.height - y(d.length);
      })
      .style("fill", color)
    this.chart.selectAll("rect")
      .on('mouseover', function(e, d) {
        d3.select('#tooltip')
          .style('opacity', 1)
          .html("<div>" + formatDuration(d.x0) + " — " + formatDuration(d.x1) + "</div><div style='color:" + colors.black + "'>" + d.length + " runners</div>")
      })
      .on('mouseout', function() {
        d3.select('#tooltip').style('opacity', 0)
      })
      .on('mousemove', function(e) {
        d3.select('#tooltip').style('left', (e.pageX + 10) + 'px')
          .style('top', (e.pageY + 10) + 'px')
      })

    var bisect = d3.bisector(function(d) { return d.x1 }).left
    var idx = bisect(bins, 20 * 60 * 60)
    var idxs = bisect(bins, 23.50 * 60 * 60)
    var maxY = d3.max(bins.slice(0, idx + 1), function(d) {
      return d.length
    }) * 1.03
    var maxYs = d3.max(bins.slice(idx, idxs + 1), function(d) {
      return d.length
    }) * 1.03
    var annotations = [{
      note: { label: "Elite Runners" },
      x: 0,
      y: y(maxY),
      dy: -100,
      dx: 300,
      subject: {
        width: that.x(bins[idx].x1),
        height: that.height - y(maxY)
      }
    }, {
      note: { label: "Sub-24h Runners" },
      x: that.x(bins[idx].x1),
      y: y(maxYs),
      dy: -10,
      dx: 300,
      subject: {
        width: that.x(bins[idxs].x1) - that.x(bins[idx].x1),
        height: that.height - y(maxYs)
      }
    }]

    const makeAnnotations = d3.annotation()
      .notePadding(15)
      .type(d3.annotationCalloutRect)
      .annotations(annotations)

    this.annotations
      .call(makeAnnotations)
  }
}

var FinishTimesChart = class {
  constructor(data) {
    this.data = data.filter(function(d) {
      return d.Finished === "F"
    })
    this.margin = 50
    this.height = parseInt(d3.select('.chart').style('height')) - this.margin * 2
    this.width = parseInt(d3.select('.chart').style('width')) - this.margin * 2
    this.svg = d3.select("#finishtimes")
      .attr("width", this.width + this.margin * 2)
      .attr("height", this.height + this.margin * 2)
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")")
    this.yAxis = this.svg.append("g")
    this.xAxis = this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")

    this.annotations = this.svg
      .append("g")
      .attr("class", "annotation-group")

    this.lines = this.svg.append("g").attr("class", "years")
    this.tooltip = d3.select('#tooltip')
    this.svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", this.width)
      .attr("y", this.height + 35)
      .text("Finish Time (hours)")
      .attr('font-size', '0.8rem')
    this.svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -this.margin + 20)
      .attr("x", 0)
      .text("Overall Place")
      .attr('font-size', '0.8rem')
  }

  update(props = {}) {
    var data = this.data
    var that = this

    if ("gender" in props) {
      data = data.filter(function(d) {
        return d.Gender === props.gender
      })
    }

    this.y = d3.scaleLinear()
      .domain(d3.extent(data, function(d) {
        return d.Finished == 'F' ? d['Overall.Place'] : NaN
      }))
      .range([this.height, 0])
    this.yAxis.call(d3.axisLeft(this.y))

    this.x = d3.scaleLinear()
      .domain(d3.extent(data, function(d) {
        return d.Finished == 'F' ? d['Finish.Time'] : NaN
      }))
      .range([0, this.width])
    this.xAxis
      .call(
        d3.axisBottom(this.x)
        .tickFormat(function(d) {
          return formatDuration(d)
        })
      )

    var groups = d3.group(data, function(d) {
      return d.Year
    })
    if (!("temp" in props)) {
      props.temp = "Temp.High"
    }
    var colorFn = function(d) {
      return d[props.temp]
    }
    if (props.temp === "Diff") {
      colorFn = function(d) {
        return d['Temp.High'] - d['Temp.Low']
      }
    }
    var colorRange = [colors.lightRed, colors.darkRed]
    if (props.temp == 'Temp.Low') {
      colorRange = [colors.darkBlue, colors.lightBlue]
    } else if (props.temp == 'Diff') {
      colorRange = [colors.lightGray, colors.black]
    }

    this.props = props
    this.colorFn = colorFn

    this.color = d3.scaleLinear()
      .domain(d3.extent(data, colorFn))
      .range(colorRange)

    var annotations = [{
      note: {
        label: "The higher the curve, the more finishers",
        padding: 20
      },
      x: that.x(24 * 60 * 60),
      y: that.y(150),
      className: "show-bg",
      dy: -80,
      dx: -250,
    }, {
      note: {
        label: "The lower curves represent less finishers",
        padding: 5
      },
      x: that.x(24 * 60 * 60),
      y: that.y(56),
      dy: 30,
      dx: 100
    }]

    const makeAnnotations = d3.annotation()
      .type(d3.annotationCalloutElbow)
      .annotations(annotations)

    this.annotations
      .call(makeAnnotations)

    var u = this.lines.
      selectAll("path")
      .data(groups)

    u.enter()
      .append("path")
      .merge(u)
      .transition()
      .attr("fill", "none")
      .attr("class", function(d) {
        return "year " + d[0]
      })
      .attr("stroke", function(d) {
        return that.color(colorFn(d[1][0]))
      })
      .attr("stroke-width", 1.5)
      .attr("d", function(d) {
        return d3.line()
          .x(function(d) {
            return that.x(d['Finish.Time']);
          })
          .y(function(d) {
            return that.y(d['Overall.Place']);
          })(d[1])
      })
      .style('opacity', function(d) {
        if ("year" in props && (props.year === "2009" || props.year === d[0]) || !("year" in props)) {
          return '1'
        }
        return '0.15'
      })
    var mouseG = this.svg.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path")
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(groups)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", function(d) {
        return that.color(colorFn(d[1][0]));
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(10,3)");

    mouseG.append('svg:rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() {
        mouseG.select(".mouse-line")
          .style("opacity", "0")
        mouseG.selectAll(".mouse-per-line circle")
          .style("opacity", "0")
        mouseG.selectAll(".mouse-per-line text")
          .style("opacity", "0")
        that.tooltip.style('opacity', '0')
      })
      .on('mouseover', function() {
        mouseG.select(".mouse-line")
          .style("opacity", "1");
        mouseG.selectAll(".mouse-per-line circle")
          .style('opacity', function(d) {
            if ("year" in props && (props.year === "2009" || props.year === d[0]) || !("year" in props)) {
              return '1'
            }
            return '0.15'
          })

        mouseG.selectAll(".mouse-per-line text")
          .style('opacity', function(d) {
            if ("year" in props && (props.year === "2009" || props.year === d[0]) || !("year" in props)) {
              return '1'
            }
            return '0.15'
          })
      })
      .on('mousemove', function(e) { // mouse moving over canvas
        var localX = e.offsetX - that.margin
        mouseG.select(".mouse-line")
          .attr("d", function() {
            return "M" + localX + "," + that.height + " " + localX + "," + 0;
          });

        mouseG.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            var lines = document.querySelectorAll('#finishtimes .year');
            var x = that.x.invert(localX)
            var bisect = d3.bisector(function(d) {
              return d['Finish.Time']
            }).right

            var idx = bisect(d[1], x)
            var beginning = 0
            var end = lines[i].getTotalLength()
            var target = null;
            var pos;

            while (true) {
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== localX) {
                break;
              }
              if (pos.x > localX)
                end = target;
              else if (pos.x < localX)
                beginning = target;
              else
                break;
            }
            return "translate(" + localX + "," + pos.y +")";
          })
        that.updateTooltipContent(localX, groups, e, props)
      })
  }

  updateTooltipContent(localX, data, e, props = {}) {
    var that = this
    var sortingObj = []
    var x = this.x.invert(localX)

    Array.from(data).forEach(function(d) {
      var bisect = d3.bisector(function (d) {
        return d['Finish.Time']
      }).left
      var idx = bisect(d[1], x)
      if (idx >= d[1].length) {
        idx = d[1].length - 1
      }
      sortingObj.push({key: d[0], value: d[1][idx]['Overall.Place']})
    })

    sortingObj.sort(function(a, b) {
      return d3.descending(a.value, b.value)
    })
    var sortingArr = sortingObj.map(function(d) { return d.key })
    var res_nested1 = Array.from(data).slice().sort(function(a, b){
      return sortingArr.indexOf(a[0]) - sortingArr.indexOf(b[0])
    })

    this.tooltip.html(formatDuration(x))
      .style('display', 'block')
      .style('opacity', 1)
      .style('font-size', '0.9rem')
      .selectAll()
      .data(res_nested1).enter()
      .append('div')
      .style('color', function(d) {
        return that.color(that.colorFn(d[1][0]))
      })
      .style('font-size', '0.8rem')
      .style('display', function(d) {
        var x = that.x.invert(localX)
        return x < d[1][0]['Finish.Time'] ? "none" : "block"
      })
      .style('font-weight', function(d) {
        if ("year" in props && props.year === d[0]) {
          return 'bold'
        }
        return 'normal'
      })
      .style('opacity', function(d) {
        if ("year" in props && (props.year === "2009" || props.year === d[0]) || !("year" in props)) {
          return '1'
        }
        return '0.75'
      })
      .html(function(d) {
        var x = that.x.invert(localX)
        var bisect = d3.bisector(function (d) { return d['Finish.Time'] }).left
        var idx = bisect(d[1], x)
        if (idx >= d[1].length)
          return ""
        var dd = d[1][idx]
        var text = d[0] + " ("
        if (that.props.temp == "Diff") {
          text += dd['Temp.High'] - dd['Temp.Low']
        } else {
          text += dd[props.temp]
        }
        var suffix = "th"
        var place = dd["Overall.Place"] + ""
        switch (place.charAt(place.length - 1)) {
          case '1': suffix = "st"; break
          case '2': suffix = "nd"; break
          case '3': suffix = "rd"
        }
        return text + '°F): ' + dd['Overall.Place'] + suffix + " place"
      })

    this.tooltip
      .style('left', function() {
        if (e.pageX + 10 + that.tooltip.node().offsetWidth > window.innerWidth)
          return (e.pageX - that.tooltip.node().offsetWidth - 10) + 'px'
        return (e.pageX + 10) + 'px'
      })
      .style('top', function() {
        if (e.clientY + 10 + that.tooltip.node().offsetHeight > window.innerHeight)
          return (e.pageY - that.tooltip.node().offsetHeight - 10) + 'px'
        return (e.pageY + 10) + 'px'
      })
  }
}

var FinishRatioChart = class {
  constructor(data) {
    this.data = data
    this.highTemps = d3.rollup(data,
      function(v) {
        return v[0]['Temp.High']
      },
      function(d) {
        return d.Year
      })
    this.lowTemps = d3.rollup(data,
      function(v) {
        return v[0]['Temp.Low']
      },
      function(d) {
        return d.Year
      })

    this.margin = 50
    this.height = parseInt(d3.select('.chart').style('height')) - this.margin * 2
    this.width = parseInt(d3.select('.chart').style('width')) - this.margin * 2
    this.svg = d3.select("#finishratio")
      .attr("width", this.width + this.margin * 2)
      .attr("height", this.height + this.margin * 2)
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")")
    this.xAxis = this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
    this.yAxis = this.svg.append("g")

    this.chart = this.svg.append('g')

    this.annotations = this.svg
      .append("g")
      .attr("class", "annotation-group")

    this.svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", this.width)
      .attr("y", this.height + 35)
      .text("Year")
      .attr('font-size', '0.8rem')
    this.svg.append("text")
      .attr("class", "x-axis")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -this.margin + 20)
      .attr("x", 0)
      .text("Finish Rate (%)")
      .attr('font-size', '0.8rem')
  }

  update(props = {}) {
    var that = this
    var data = this.data

    if (props.gender !== "All") {
      data = data.filter(function(d) { return d.Gender === props.gender })
    }

    if (props.sub24h) {
      data = d3.rollup(data.filter(function (d) { return d.Finished === 'F'}),
        function(v) {
          return v.length
        },
        function(d) {
          return d.Year
        },
        function(d) {
          return d['Finish.Time'] < 24 * 60 * 60 ? 'F' : 'DNF'
        })
    } else {
      data = d3.rollup(data,
        function(v) {
          return v.length
        },
        function(d) {
          return d.Year
        },
        function(d) {
          return d.Finished
        })
    }

    var x = d3.scalePoint()
      .domain(Array.from(data.keys()))
      .range([0, this.width])
      .padding(1)
      .round(true)
    this.xAxis.call(d3.axisBottom(x))

    var colorFn = function(d) {
      var p = props.temp === 'Temp.High' ? 'highTemps' : 'lowTemps'
      var high = that.highTemps.get(d[0])
      if (props.temp === 'Temp.High')
        return high
      var low = that.lowTemps.get(d[0])
      if (props.temp === 'Temp.Low')
        return low
      return high - low
    }
    var colorRange = [colors.lightRed, colors.darkRed]
    if (props.temp == 'Temp.Low') {
      colorRange = [colors.darkBlue, colors.lightBlue]
    } else if (props.temp == 'Diff') {
      colorRange = [colors.lightGray, colors.black]
    }

    var color = d3.scaleLinear()
      .domain(d3.extent(data, colorFn))
      .range(colorRange)

    var finishFn = function(padding) {
      return function(d) {
        return d[1].get('F') / (d[1].get('F') + d[1].get('DNF')) * 100 + padding
      }
    }
    var y = d3.scaleLinear()
      .domain([d3.min(data, finishFn(-3)), d3.max(data, finishFn(3))])
      .range([this.height, 0])

    this.yAxis.call(d3.axisLeft(y))

    var minMaxY = d3.extent(data, finishFn(0))
    var minX = Array.from(data).map(finishFn(0)).indexOf(minMaxY[0])
    var maxX = Array.from(data).map(finishFn(0)).indexOf(minMaxY[1])

    var annotations = [{
      note: {
        label: "Highest " + (props.sub24h ? "sub 24-hour" : "finish") + " rate",
        padding: 20
      },
      x: x(Array.from(data)[maxX][0]),
      y: y(minMaxY[1]),
      className: "show-bg",
      dy: -30,
      dx: -150,
      subject: {
        radius: 15,
        radiusPadding: 5
      }
    }, {
      note: {
        label: "Lowest " + (props.sub24h ? "sub 24-hour" : "finish") + " rate",
        padding: 20
      },
      x: x(Array.from(data)[minX][0]),
      y: y(minMaxY[0]),
      dy: -30,
      dx: -150,
      subject: {
        radius: 15,
        radiusPadding: 5
      }
    }]

    const makeAnnotations = d3.annotation()
      .type(d3.annotationCalloutCircle)
      .annotations(annotations)

    this.annotations
      .call(makeAnnotations)

    var u = this.chart.selectAll("circle")
      .data(data)

    u.enter()
      .append("circle")
      .merge(u)
      .transition()
      .attr("cx", function(d) {
        return x(d[0])
      })
      .attr("cy", function(d) {
        return y(d[1].get('F') / (d[1].get('F') + d[1].get('DNF')) * 100)
      })
      .attr("fill", function(d) { return color(colorFn(d)) })
      .attr("r", 5)

    this.chart.selectAll("circle")
      .on('mouseover', function(e, d) {
        var tooltip = d3.select('#tooltip')
          .style('opacity', 1)
          .html("<div>" + d[0] +
            "</div><div style='color:"+ color(colorFn(d)) +"'><div>"+
            (props.sub24h ? 'Sub-24 hour' : 'Finish') +
            " Rate: " +
            finishFn(0)(d).toFixed(2) +
            "%</div><div>Temperature: " +
            that.lowTemps.get(d[0]) +
            "°F - " +
            that.highTemps.get(d[0]) +
            "°F</div><div>Difference: " +
            (that.highTemps.get(d[0]) - that.lowTemps.get(d[0])) +
            "°F</div></div>")
        tooltip
          .style('left', function() {
            if (e.pageX + 10 + tooltip.node().offsetWidth > window.innerWidth)
              return (e.pageX - tooltip.node().offsetWidth - 10) + 'px'
            return (e.pageX + 10) + 'px'
          })
          .style('top', function() {
            if (e.clientY + 10 + tooltip.node().offsetHeight > window.innerHeight)
              return (e.pageY - tooltip.node().offsetHeight - 10) + 'px'
            return (e.pageY + 10) + 'px'
          })
      })
      .on('mouseout', function() {
        d3.select('#tooltip').style('opacity', 0)
      })
      .on('mousemove', function(e) {
        var tooltip = d3.select('#tooltip')
        tooltip
          .style('left', function() {
            if (e.pageX + 10 + tooltip.node().offsetWidth > window.innerWidth)
              return (e.pageX - tooltip.node().offsetWidth - 10) + 'px'
            return (e.pageX + 10) + 'px'
          })
          .style('top', function() {
            if (e.clientY + 10 + tooltip.node().offsetHeight > window.innerHeight)
              return (e.pageY - tooltip.node().offsetHeight - 10) + 'px'
            return (e.pageY + 10) + 'px'
          })

      })

  }
}

dataLoad.then(function(data) {
  parsedData = data.map(function(d) {
    d['Finish.Time'] = parseInt(d['Finish.Time'])
    d['Finish.Time.Parsed'] = formatDuration(d['Finish.Time'])
    d['Overall.Place'] = parseInt(d['Overall.Place'])
    d['Temp.High'] = parseInt(d['Temp.High'])
    d['Temp.Low'] = parseInt(d['Temp.Low'])
    return d
  });
  hist = new HistogramChart(parsedData)
  hist.update(histFilters())
  ft = new FinishTimesChart(parsedData)
  ft.update(finishTimesFilters())
  fr = new FinishRatioChart(parsedData)
  fr.update(finishRateFilters())
})

var finishTimesFilters = function() {
  var filters = {
    temp: 'Temp.High'
  }
  var year = document.getElementById("finishTimesYear").value
  if (year === "2020" || year == "2021") {
    filters.year = (parseInt(year) + 1) + ""
  } else if (year !== "2009") {
    filters.year = year
  }

  if (document.getElementById("finishTimesGenderFemale").checked) {
    filters.gender = "F"
  }
  if (document.getElementById("finishTimesGenderMale").checked) {
    filters.gender = "M"
  }

  if (document.getElementById("finishTimesTempDiff").checked) {
    filters.temp = "Diff"
  }
  if (document.getElementById("finishTimesTempLow").checked) {
    filters.temp = "Temp.Low"
  }


  return filters
}

var finishRateFilters = function() {
  var filters = {
    temp: 'Temp.High',
    gender: 'All'
  }

  if (document.getElementById("finishRateSub24").checked) {
    filters.sub24h = true;
  }

  if (document.getElementById("finishRateGenderFemale").checked) {
    filters.gender = "F"
  }
  if (document.getElementById("finishRateGenderMale").checked) {
    filters.gender = "M"
  }

  if (document.getElementById("finishRateTempDiff").checked) {
    filters.temp = "Diff"
  }
  if (document.getElementById("finishRateTempLow").checked) {
    filters.temp = "Temp.Low"
  }

  return filters
}

document.getElementById("finishTimesYear").oninput = function() {
  var val = "All"
  if (this.value === "2020" || this.value == "2021") {
    val = parseInt(this.value) + 1
  } else if (this.value !== "2009") {
    val = this.value
  }
  document.getElementById("finishTimesYearValue").innerText = val;
  ft.update(finishTimesFilters())
}

var histFilters = function() {
  var filters = {}
  var year = document.getElementById("histYear").value
  if (year === "2020" || year == "2021") {
    filters.year = parseInt(year) + 1
  } else if (year !== "2009") {
    filters.year = year
  }
  if (document.getElementById("histGenderFemale").checked) {
    filters.gender = "F"
  }
  if (document.getElementById("histGenderMale").checked) {
    filters.gender = "M"
  }
  return filters
}
document.getElementById("histYear").oninput = function() {
  var val = "All"
  if (this.value === "2020" || this.value == "2021") {
    val = parseInt(this.value) + 1
  } else if (this.value !== "2009") {
    val = this.value
  }
  document.getElementById("histYearValue").innerText = val;
  hist.update(histFilters())
}
document.getElementById("histGenderAll").oninput =
  document.getElementById("histGenderMale").oninput =
  document.getElementById("histGenderFemale").oninput = function() {
    hist.update(histFilters())
  }

document.getElementById("finishTimesGenderAll").oninput =
  document.getElementById("finishTimesGenderMale").oninput =
  document.getElementById("finishTimesGenderFemale").oninput = function() {
    ft.update(finishTimesFilters())
  }

document.getElementById("finishTimesTempDiff").oninput =
  document.getElementById("finishTimesTempLow").oninput =
  document.getElementById("finishTimesTempHigh").oninput = function() {
    ft.update(finishTimesFilters())
  }

document.getElementById("finishRateSub24").oninput =
  document.getElementById("finishRateF").oninput = function() {
    fr.update(finishRateFilters())
  }

document.getElementById("finishRateGenderAll").oninput =
  document.getElementById("finishRateGenderMale").oninput =
  document.getElementById("finishRateGenderFemale").oninput = function() {
    fr.update(finishRateFilters())
  }

document.getElementById("finishRateTempDiff").oninput =
  document.getElementById("finishRateTempLow").oninput =
  document.getElementById("finishRateTempHigh").oninput = function() {
    fr.update(finishRateFilters())
  }


