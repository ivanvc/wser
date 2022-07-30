window.FinishTimesChart = class {
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

  filters() {
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

  update() {
    var data = this.data
    var that = this
    var props = this.filters()

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
      className: 'higherTemps',
      x: that.x(24 * 60 * 60),
      y: that.y(150),
      dy: -80,
      dx: -250,
    }, {
      note: {
        label: "The lower curves represent less finishers",
        padding: 5
      },
      className: 'lowerTemps',
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
