var Scatter = function(_parentElement, _category) {
  this.parentElement = _parentElement;
  this.data = p171.data.raw;
  for (label in p171.data.labels) {
    if (p171.data.labels[label] == _category) this.category = label;
  }
  this.createElements();
  this.createSelectors();
  //this.createFilters();
  this.initVis();   
}

Scatter.prototype.initVis = function() {
  var vis = this;

  vis.margin = {top: 10, right: 20, bottom: 60, left: 60};
  vis.width = p171.DD.subPlotWidth - vis.margin.left - vis.margin.right,
  vis.height = 600 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = vis.plotElement.append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.x = d3.scale.linear()
    .range([0, vis.width]).nice();

  vis.y = d3.scale.linear()
    .range([vis.height, 0]).nice();

  vis.container = vis.svg.append("g")

  vis.xAxisGroup = vis.svg.append("g")
      .attr({
        class: "x-axis axis",
        transform: "translate(0,"+vis.height+")"
      });
    /*.append("text")
      .attr({
        class:"axis-label",
        x: vis.width,
        y: -vis.margin.left,
        transform: "rotate(-90)",
        dy: ".71em"
      })
      .style("text-anchor", "end")*/

  vis.yAxisGroup = vis.svg.append("g")
      .attr({ class: "y-axis axis" })
    /*.append("text")
      .attr({
        class:"axis-label",
        y: -vis.margin.left,
        transform: "rotate(-90)",
        dy: ".71em"
      })
      .style("text-anchor", "end")*/

  vis.tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10,0])
    .html(function(d) {
      var html = "";
      if (d.isUser) html += "<b>You</b><br>"
      p171.data.quantFactors.forEach(function(feature) {
        html += p171.data.labels[feature] + ": " + d[feature] + "<br>";
      });
      return html;
    });

  vis.zoomBehavior = d3.behavior.zoom()
    .x(vis.x)
    .y(vis.y)
    .scaleExtent([1,100])
    .on("zoom", function(d) {
      vis.zoom(d);
    });

  vis.container
    .call(vis.zoomBehavior);

  vis.background = vis.container.append("rect")
    .attr({
      height: vis.height,
      width: vis.width,
      class: "vis-background"
    })

  vis.drag = d3.behavior.drag()
    .origin(function(d) { return d; })

  vis.updateVis();
}

Scatter.prototype.updateVis = function() {
  var vis = this;

  vis.wrangleData();

  // Add user to dataset
  if (Object.keys(p171.user).length > 1) {
    var userData = p171.user
    userData["isUser"] = true;
    vis.displayData.push(userData);
  }

  // Filter data based on user selections
  var categoryX = vis.xCategory.property('value'),
      categoryY = vis.yCategory.property('value');

  // Create axes for graph
  vis.x
    .domain([
      0, 
      d3.max(vis.displayData, function(d){ return d[categoryX]; })
    ])

  vis.y
    .domain([
      0, 
      d3.max(vis.displayData, function(d){ return d[categoryY]; })
    ])

  vis.xAxis = d3.svg.axis()
    .scale(vis.x)
    .orient("bottom");

  vis.yAxis = d3.svg.axis()
    .scale(vis.y)
    .orient("left");

  vis.xAxisGroup
    .transition().duration(300)
    .call(vis.xAxis);

  vis.yAxisGroup
    .transition().duration(300)
    .call(vis.yAxis);

  var color = d3.scale.category10();

  vis.container
    .call(vis.tip);
  
  // Create data points in scatter plot
  vis.points = vis.container.selectAll(".points")
    .data(vis.displayData);
  
  vis.points
    .enter().append("circle");

  vis.points
    .transition().duration(750)
    .attr({
      class: "points",
      cx: function(d) { return vis.x(d[categoryX]); },
      cy: function(d) { return vis.y(d[categoryY]); },
      r: function(d) { return d.isUser ? 6 : 3; },
      fill: function(d) { 
        if (d.isUser) return "brown";
        return d.acceptStatus == 1 ? "#98fb98" : "lightsteelblue";
      }
    })
    .style({
      opacity: function(d) { 
        if (d.isUser) return 1;
        return d.acceptStatus == 1 ? .8 : .3; }
    });
    

  vis.points
    .on("mouseover", vis.tip.show)
    .on("mouseout", vis.tip.hide)
    .call(vis.drag);;

  vis.points.exit().remove();
}

Scatter.prototype.wrangleData = applyFilter;

Scatter.prototype.zoom = function(d) {
  var vis = this;

  // Filter data based on user selections
  var categoryX = vis.xCategory.property('value'),
      categoryY = vis.yCategory.property('value');

  var xMax = d3.max(p171.data.raw, function(d){ return d[categoryX]; });
      yMax = d3.max(p171.data.raw, function(d){ return d[categoryY]; });

  
  vis.x
    .domain(vis.x.domain().map(function(d) {
      return d*xMax;
    }))

  vis.y
    .domain(vis.y.domain().map(function(d) {
      return d*yMax;
    }))
  
  vis.container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  vis.xAxisGroup.call(vis.xAxis);
  vis.yAxisGroup.call(vis.yAxis);
}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {

  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
  d3.select(this).classed("dragging", false);
}

Scatter.prototype.createElements = createElements;

Scatter.prototype.showFilters = showFilters;

Scatter.prototype.updateFilters = function(factor, subFactor) {
  var vis = this;
  var prevValue = vis.filters[factor][subFactor];

  vis.filters[factor][subFactor] = prevValue ? false : true;

  vis.updateVis();
}

Scatter.prototype.createSelectors = function() {
  var vis = this; 

  var options = p171.data.quantFactors;

  // Add selectors to the filters section 
  vis.selectorsElement = vis.filtersElement.insert("div",".filter-choices")
    .attr({class:"scatter-selectors"});

  vis.selectorsElement.append("b")
    .text("X Axis: ");

  vis.xCategory = vis.selectorsElement.append("select")
    .attr({
      id:'category-selector',
    })
    .on('change', function(){
      vis.updateVis();
    })

  for (var optionIndex=0; optionIndex<options.length; optionIndex++) {
    var category = options[optionIndex];
    var option = vis.xCategory.append("option")
      .attr({
        value:category
      })
      .text(p171.data.labels[category]);
  }

  vis.xCategory
    .property('value', vis.category);

  vis.selectorsElement.append("br");

  vis.selectorsElement.append("b")
    .text("Y Axis: ")

  vis.yCategory = vis.selectorsElement.append("select")
    .attr({
      id:'category-selector',
    })
    .on('change', function(){
      vis.updateVis();
    });

  for (var optionIndex=0; optionIndex<options.length; optionIndex++) {
    var category = options[optionIndex];
    var option = vis.yCategory.append("option")
      .attr({
        value:category
      })
      .text(p171.data.labels[category]);
  }

  var initCategory  = vis.category == "GPA" ? "admissionstest" : "GPA";

  vis.yCategory
    .property('value', initCategory);

  vis.selectorsElement.append("br");

  vis.selectorsElement.append("b")
    .text("College: ");

  vis.collegeSelector = vis.selectorsElement.append("select")
    .attr({
      id:"college-selector"
    })
    .on('change', function(d) {
      vis.updateVis();
    });

  vis.selectorsElement.append("br");

  var colleges = Object.keys(p171.data.colleges)

  for (var collegeIndex=0; collegeIndex<colleges.length; collegeIndex++) {
    var college = colleges[collegeIndex];
    var option = vis.collegeSelector.append("option")
      .attr({
        value:college
      })
      .text(college);
  }

  if ("collegeID" in p171.user) {
    vis.collegeSelector.property('value', p171.user.collegeID);
  }
  

}

