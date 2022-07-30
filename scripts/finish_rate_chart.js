var FinishRateChart = class {
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

    this.annotations = this.svg
      .append("g")
      .attr("class", "annotation-group")

    this.chart = this.svg.append('g')

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

  filters() {
    var filters = {
      temp: 'Temp.High',
      gender: 'All'
    }

    if (document.getElementById("finishRateSub24").checked) {
      filters.sub24h = true
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

  update() {
    var that = this
    var data = this.data
    var props = this.filters()

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
      className: "highestFinishRate",
      dy: -30,
      dx: -50,
      subject: {
        radius: 15,
        radiusPadding: 5
      }
    }, {
      note: {
        label: "Lowest " + (props.sub24h ? "sub 24-hour" : "finish") + " rate",
        padding: 20
      },
      className: "lowestFinishRate",
      x: x(Array.from(data)[minX][0]),
      y: y(minMaxY[0]),
      dy: -30,
      dx: -50,
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
