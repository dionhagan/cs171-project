var EffectGraph = function(_parentElement, _factorLabel) {
  this.parentElement = _parentElement;
  this.factorLabel = _factorLabel
  this.data = p171.data.factorEffect;
  this.colleges = Object.keys(p171.data.colleges);
  this.initVis();
}

EffectGraph.prototype.initVis = function() {
  var vis = this;

  vis.margin = {top: 10, right: 20, bottom: 60, left: 60};
  vis.outerHeight = 600;
  vis.outerWidth = 800;
  vis.width = vis.outerWidth - vis.margin.left - vis.margin.right,
  vis.height = vis.outerHeight - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = vis.parentElement.append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.xScale = d3.scale.ordinal()
    .rangeRoundBands([0, vis.width], .2);

  vis.yScale = d3.scale.linear()
    .range([vis.height, 0]).nice();

  vis.xAxisGroup = vis.svg.append("g")
      .attr({
        class: "x-axis axis",
        transform: "translate(0,"+vis.height+")"
      });

  vis.yAxisGroup = vis.svg.append("g")
      .attr({ class: "y-axis axis" })

  vis.updateVis();
  
};

EffectGraph.prototype.wrangleData = function() {
  var vis = this;

  for (label in p171.data.labels) {
    if (vis.factorLabel== p171.data.labels[label]) vis.factor = label;
  }

  var data = vis.data[vis.factor];

  vis.displayData = [];
  
  for (var i=0; i<data.vals.length;i++) {
    vis.displayData.push({
      name: data.names[i],
      val: data.vals[i]
    });
  }

  console.log(Object.keys(p171.data.colleges).length)

  vis.displayData = vis.displayData.filter(function(d) {
    var isInSelectedColleges = vis.colleges.indexOf(d.name) > -1;
    return isInSelectedColleges;
  })

  console.log(vis.displayData.length)


};

EffectGraph.prototype.updateVis = function() {
  var vis = this;

  vis.wrangleData();

   // Create axes for graph
  vis.xScale
    .domain(vis.displayData.map(function(d) { return d.name }))

  vis.yScale
    .domain([
      d3.min(vis.displayData, function(d){ return d.val; }), 
      d3.max(vis.displayData, function(d){ return d.val; })
    ])

  vis.xAxis = d3.svg.axis()
    .scale(vis.xScale)
    .orient("bottom")
    .tickSize(0)

  vis.yAxis = d3.svg.axis()
    .scale(vis.yScale)
    .orient("left");

  vis.xAxisGroup
    .transition().duration(300)
    .call(vis.xAxis)
    .selectAll("text")
      .attr({
        transform:"rotate(90) translate(50,0)"
      });

  vis.yAxisGroup
    .transition().duration(300)
    .call(vis.yAxis);
  
  // Create bars 
  var barWidth = 20;

  vis.bars = vis.svg.selectAll(".bar")
    .data(vis.displayData);
  
  vis.bars
    .enter().append("rect");

  vis.bars
    .transition().duration(750)
      .attr({
        class: "bar",
        y: function(d) { return vis.yScale(Math.min(0, d.val)); },
        x: function(d,i){ return i*barWidth; },
        width: function(d) { return vis.xScale.rangeBand(); },
        height: function(d) { return Math.abs(vis.yScale(d.val)); },
      });

  vis.bars.exit().remove(); 

};