var Histogram = function(_parentElement, _category) {
  this.parentElement = _parentElement;
  this.data = p171.data.raw;
  for (label in p171.data.labels) {
      if (p171.data.labels[label] == _category) this.category = label
    }
  this.createElements();
  this.wrangleData();
  this.initVis();
}

Histogram.prototype.initVis = function () {
  var vis = this;

  vis.margin = { top: 40, right: 250, bottom: 60, left:20};
  vis.width = (.9*p171.DD.wrapperWidth) - vis.margin.left - vis.margin.right,
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

  vis.updateVis();
}

Histogram.prototype.createFilters = createFilters

Histogram.prototype.updateVis = function() {
  var vis = this;
  
  vis.wrangleData();

  var min = Math.min(...vis.displayData);
  var max = Math.max(...vis.displayData);

  if (vis.category in p171.data.nomFactors) {
    vis.xScale
      .domain(p171.data.nomFactors[vis.category])
  } else {
    vis.x
      .domain([min, max])
  }


  vis.histogramData = d3.layout.histogram()
    .bins(vis.x.ticks(vis.bins))
    (vis.displayData);

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