var Histogram = function(_parentElement, _factor) {
  this.parentElement = _parentElement;
  this.category =  _factor
  this.addSelectors();
  this.updateData();
  this.initVis();
}

Histogram.prototype.initVis = function () {
  var vis = this;

  vis.margin = { top: 40, right: 60, bottom: 60, left: 5 };

  vis.width = 800 - vis.margin.left - vis.margin.right,
  vis.height = 400 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = vis.parentElement.append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.bins = 10;
  
  vis.x = d3.scale.linear()
    .range([0, vis.width]);

  vis.y = d3.scale.linear()
    .range([vis.height, 0]);

  vis.xAxis = vis.svg.append("g")
    .attr({
      class: "x-axis",
      transform: "translate(0,"+vis.height+")"
    })

  vis.updateVis();
}

Histogram.prototype.updateVis = function() {
  var vis = this;
  
  vis.updateData();

  var min = Math.min(...vis.displayData);
  var max = Math.max(...vis.displayData);

  vis.x
    .domain([min, max])

  vis.histogramData = d3.layout.histogram()
    .bins(vis.x.ticks(vis.bins))
    (vis.displayData);

  vis.y
    .domain([0, d3.max(vis.histogramData, function(d){ return d.y; })]);

  var xAxis = d3.svg.axis()
    .scale(vis.x)
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
      y: function(d) { return vis.y(d.y)+20; },
      x: function(d,i){ return (i*barWidth) + (0.4*barWidth); },
      fill: "white"
    })
    .text(function(d){
      return d.y;
    })

  vis.labels.exit().remove();

  vis.xAxis
    .transition().duration(300)
    .call(xAxis);
}

Histogram.prototype.updateData = function() {
  var vis = this;

  var college = vis.collegeSelector.property('value');
  // var category = vis.categorySelector.property('value');

  for (label in p171.data.labels) {
    if (vis.category == p171.data.labels[label]) vis.category = label;
  }

  vis.displayData = p171.data.colleges[college][vis.category];
}

Histogram.prototype.addSelectors = function() {
  var vis = this;

  var options = p171.data.mainFactors;

  /*
  vis.categorySelector = vis.parentElement.append("select")
    .attr({
      id:'category-selector',
    })
    .on('change', function(){
      vis.updateVis();
    });

  for (var optionIndex=0; optionIndex<options.length; optionIndex++) {
    var category = options[optionIndex];
    var option = vis.categorySelector.append("option")
      .attr({
        value:category
      })
      .text(category);
  }

  vis.categorySelector
    .property('value','admissionstest');
  */

  vis.parentElement.append("div")
    .text("Select a college: ")

  vis.collegeSelector = vis.parentElement.append("select")
    .attr({
      id:"college-selector"
    })
    .on('change', function(d) {
      vis.updateVis();
    });

  var colleges = Object.keys(p171.data.colleges);

  for (var collegeIndex=0; collegeIndex<colleges.length; collegeIndex++) {
    var college = colleges[collegeIndex];
    var option = vis.collegeSelector.append("option")
      .attr({
        value:college
      })
      .text(college);
  }

  vis.collegeSelector
    .property('value','All');
}