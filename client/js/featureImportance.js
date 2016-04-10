var FeatureImportanceVis = function(_parentElement) {
  this.parentElement = d3.select("#" + _parentElement);
  this.plotElement = this.parentElement.append("div").attr("class","plot");
  this.selectorsElement = this.parentElement.append("div").attr("class","selectors");
  this.textElement = this.parentElement.append("div").attr("class","text");
  this.data = p171.data.featureImportance;
  this.initVis();  
  
}


FeatureImportanceVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = p171.margin;
  vis.width = 800 - vis.margin.left - vis.margin.right,
  vis.height = 700 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = vis.plotElement.append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.x = d3.scale.linear()
    .range([0, vis.width]).nice();
    .domain([
      d3.min(vis.data, function(feature) { return feature.effect; });
      d3.max(vis.data, function(feature) { return feature.effect; });
    ])

  vis.xAxisGroup = vis.svg.append("g")
      .attr({
        class: "x-axis axis",
        transform: "translate(0,"+vis.height+")"
      });

  vis.xAxis = d3.svg.axis()
    .scale(vis.x)
    .orient("bottom");

  vis.xAxisGroup
    .call(vis.xAxis);

  vis.y = d3.scale.linear()
    .range([vis.height, 0]).nice()
    .domain([0, vis.data.length]);

  vis.yAxisGroup = vis.svg.append("g")
      .attr({ class: "y-axis axis" })

  vis.yAxis = d3.svg.axis()
    .scale(vis.y)
    .tickFormat(function(feature) { featur.name})
    .tickSize(0)
    .orient("left");

  vis.yAxisGroup
    .call(vis.yAxis);

  var barHeight = 20;
  // Create bars
  vis.bars = vis.svg.selectAll(".bars")
    .data(vis.data)
    .enter().append("rect")
      .attr({
        x: 0,
        y: function(d, i){ return vis.y(i)+barHeight; },
        height: barHeight,
        width: function(d){ return 0;}
      })

  vis.barTransition = vis.svg.selectAll(".bars")
    .data(vis.data)
    .transition().duration(1000)
    .attr("width", function(feature){ return vis.y(feature.effect); })



};

FeatureImportanceVis.prototype.updateVis = function(first_argument) {
  var vis = this;


};