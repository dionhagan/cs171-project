var Histogram = function(_parentElement, _category) {
  this.parentElement = _parentElement;
  this.data = p171.data.raw;
  for (label in p171.data.labels) {
      if (p171.data.labels[label] == _category) this.category = label
    }
  if (this.category in p171.data.nomFactors) this.subFactors = p171.data.nomFactors[this.category].reverse()
  this.createElements();
  this.wrangleData();
  this.initVis();
}

Histogram.prototype.initVis = function () {
  var vis = this;

  vis.margin = { top: 60, right: 270, bottom: 60, left:20};
  vis.width = p171.DD.wrapperWidth- vis.margin.left - vis.margin.right,
  vis.height = 600 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = vis.parentElement.append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .attr("class","histogram")
    .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.createFilters(colleges=true, applicants=true, offset=10)
  vis.bins = 10;
  
  if (vis.category in p171.data.nomFactors) {
    vis.xScale = d3.scale.ordinal()
      .rangeRoundBands([0, vis.width]);
  }
  
  vis.x = d3.scale.linear()
    .range([0, vis.width]);

  vis.y = d3.scale.linear()
    .range([vis.height, 0]);

  vis.xAxis = vis.svg.append("g")
    .attr({
      class: "x-axis axis",
      transform: "translate(0,"+vis.height+")"
    })

  var closeButton = vis.svg.append("g") 
    .attr({
      class: "close-button"
    })

  closeButton.append("rect")
    .attr({
      height: 20,
      width: 60,
      fill: "lightsteelblue",
      opacity: 0.6,
      x: vis.width + vis.margin.left + 20,
      y: vis.height - 15
    })
    .on("click", function(d) {
      d3.select(this.parentNode.parentNode.parentNode.parentNode).html("")
    })

  closeButton.append("text")
    .attr({
      x: vis.width + vis.margin.left + 25,
      y: vis.height
    })
    .text("Close")
    .on("click", function(d) {
      d3.select(this.parentNode.parentNode.parentNode.parentNode).html("")
    })

  var title = "Distribution for "+p171.data.labels[vis.category]

  vis.title = vis.svg.append("g")
    .attr({
      transform: "translate(0,-50)"
    })

  vis.title.append("rect")
    .attr({
      fill: "none",
      stroke: "steelblue",
      "stroke-width": "1.5px",
      height: 25,
      width: title.length * 8
    })

  vis.title.append("text")
    .attr({
      x: 5, 
      y: 16
    })
    .text(title);


  vis.updateVis();
}

Histogram.prototype.createFilters = createFilters

Histogram.prototype.updateVis = function() {
  var vis = this;
  
  vis.wrangleData();

  if (vis.category in p171.data.nomFactors) {
    vis.xScale
      .domain(vis.subFactors)
      vis.displayData.remove(0)
  } else {
    var min = Math.min(...vis.displayData);
    var max = Math.max(...vis.displayData);

    vis.x
      .domain([min, max])
  }




  vis.histogramData = d3.layout.histogram()
    .bins(vis.x.ticks(vis.bins))
    (vis.displayData);
  
  if (vis.category in p171.data.nomFactors) {
    if (vis.histogramData[0].length > 0) vis.histogramData[9].push(1)
    if (vis.histogramData[9].length > 0) vis.histogramData[0].push(-1)
  }


  if (vis.category in p171.data.nomFactors) {
    vis.histogramData = vis.histogramData.filter(function(d) {
      return d.length > 0
    })
  }

    
  vis.y
    .domain([0, d3.max(vis.histogramData, function(d){ return d.y; })]);

  var xScale = (vis.category in p171.data.nomFactors) ? vis.xScale : vis.x;
  
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");
  
  vis.bar = vis.svg.selectAll(".bar")
    .data(vis.histogramData)

  var barWidth = (vis.width / vis.histogramData.length)

  vis.bar
    .enter().append("rect")
  
  vis.bar
    .transition().duration(750)
      .attr({
        class: "bar",
        y: function(d) { return vis.y(d.y); },
        x: function(d,i){ return i*barWidth; },
        width: barWidth,
        height: function(d) { return vis.height - vis.y(d.y); },
      })
      .style("fill", function(d, i) {
        if (i+1 < vis.histogramData.length) {
          var nextBin = vis.histogramData[i+1];
          if ((p171.user[vis.category] > d.x) && (p171.user[vis.category] <= nextBin.x)) {
            return "green";
          }
        } else if (p171.user[vis.category] > d.x) {
          return "green"
        } else {
          return "lightgreen";
        }
        
      });

  vis.bar.exit().remove();  

  vis.labels = vis.svg.selectAll(".labels")
    .data(vis.histogramData)

  vis.labels
    .enter().append("text")
  
  vis.labels
    .transition().duration(750)
    .attr({
      class:"labels",
      y: function(d) { return vis.y(d.y)-10; },
      x: function(d,i){ return (i*barWidth) + (0.2*barWidth); },
      fill: "steelblue"
    })
    .text(function(d){
      var pct = ((d.y / vis.displayData.length)*100).toFixed(1)
      return pct+"%";
    })

  vis.labels.exit().remove();

  vis.xAxis
    .transition().duration(300)
    .call(xAxis);
}

Histogram.prototype.wrangleData = function() {
  var vis = this;

  var filteredData = vis.data.filter(function(d){

    var collegeFilter = p171.DD.filters[d.collegeID],
        factorFilter = true;

    // Filter out application types
    for (factor in p171.DD.filters) {
      if (typeof p171.DD.filters[factor] == "object") {

        for (var subFactorIndex=0; subFactorIndex<2; subFactorIndex++) {

          var subFactor = p171.data.nomFactors[factor][subFactorIndex];
          var isChecked = p171.DD.filters[factor][subFactor];

          if (!isChecked) {
            if (subFactorIndex==0 && d[factor]==1) {
              factorFilter = false
            } else if (subFactorIndex==1 && d[factor]==-1) {
              factorFilter = false;
            }
          }
        }
      } 
    }

    return collegeFilter && factorFilter && d.acceptStatus == 1;
  });


  
  vis.displayData = filteredData.map(function(d) {
    return d[vis.category];
  });

}

Histogram.prototype.createElements =createElements;

Histogram.prototype.showFilters = showFilters;

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
