window.HistogramChart = class {
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

  filters() {
    var filters = {}
    var year = document.getElementById("histYear").value

    if (year === "2020" || year === "2021") {
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

  update() {
    var histData = this.data
    var color = colors.main
    var that = this
    var props = this.filters()

    if ("gender" in props) {
      histData = histData.filter(function(d) {
        return d.Gender === props.gender
      })
      color = colors[props.gender === 'M' ? 'blue' : 'pink']
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
      className: "elite",
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
      className: "sub24",
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
