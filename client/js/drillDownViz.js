var Scatter = function(_parentElement) {
  this.parentElement = d3.select("#" + _parentElement);
  this.plotElement = this.parentElement.select("#plot");
  this.selectorsElement = this.parentElement.select("#selectors")
    .style({
      position: "relative",
      float: "right"
    });
  this.data = p171.data.raw;
  this.createSelectors();
  this.createFilters();
  this.initVis();  
  
}

Scatter.prototype.initVis = function() {
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

  vis.zoomBehavior = d3.behavior.zoom()
    .x(vis.x)
    .y(vis.y)
    .scaleExtent([1,100])
    .on("zoom", zoom);

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
    //.on("dragstart", dragstarted)
    //.on("drag", dragged)
    //.on("dragend", dragended);

  vis.updateVis();
}

Scatter.prototype.updateVis = function() {
  var vis = this;

  // Filter data based on user selections
  var categoryX = vis.xCategory.property('value'),
      categoryY = vis.yCategory.property('value'),
      college = vis.collegeSelector.property('value');

  console.log('Updating Visualization');

  vis.data = p171.data.raw.filter(function(d){

    var collegeFilter = college == 'All' ? true : d.collegeID == college,
        factorFilter = true,
        filters = vis.filters;

    for (factor in vis.filters) {
      for (var subFactorIndex=0; subFactorIndex<2; subFactorIndex++) {
        var subFactor = p171.data.nomFactors[factor][subFactorIndex];
        var isChecked = vis.filters[factor][subFactor];
        if (!isChecked) {
          if (subFactorIndex==0 && d[factor]==1) {
            factorFilter = false
          } else if (subFactorIndex==1 && d[factor]==-1) {
            factorFilter = false;
          }
        }
      }
    }

    return collegeFilter && factorFilter;
  });

  // Add user to dataset
  var userData = p171.user
  userData["isUser"] = true;
  vis.data.push(userData);

  // Create axes for graph
  vis.x
    .domain([
      0, 
      d3.max(p171.data.raw, function(d){ return d[categoryX]; })
    ])

  vis.y
    .domain([
      0, 
      d3.max(p171.data.raw, function(d){ return d[categoryY]; })
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

  vis.tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10,0])
    .html(function(d) {
      var html = "";
      if (d.isUser) html += "<b>You</b><br>"
      p171.data.quantFactors.forEach(function(feature) {
        html += feature + ": " + d[feature] + "<br>";
      });
      return html;
    });

  vis.container
    .call(vis.tip);
  
  // Create data points in scatter plot
  vis.points = vis.container.selectAll(".points")
    .data(vis.data);
  
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
        if (d.isUser) return "yellow";
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

function zoom() {
  var vis = p171.scatter;

  // Filter data based on user selections
  var categoryX = vis.xCategory.property('value'),
      categoryY = vis.yCategory.property('value'),
      college = vis.collegeSelector.property('value');

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

Scatter.prototype.createFilters = function() {
  var vis = this;

  // Create title for filter section
  vis.selectorsElement.append("b")
    .text("Filters: ");

  vis.selectorsElement.append("br");

  // Create form element to hold checkboxes
  var filters = vis.selectorsElement.append("form")
    .attr({
      id: "filters",
      class: "form-horizontal",
      role: "form"
    })

  // Create object in vis to store filter options
  vis.filters = {};

  // Get factors that need to be filtered
  var factorsToFilter = Object.keys(p171.data.nomFactors);

  // Create a form group for each application factor 
  for (var factorIndex=0; factorIndex<factorsToFilter.length; factorIndex++) {
    var factor = factorsToFilter[factorIndex];

    filters.append("div")
      .attr("class","filter-label")
      .text(factor)
    
    vis.filters[factor] = {};
    
    for (var subFactorIndex=0; subFactorIndex<2; subFactorIndex++) {
      var subFactor = p171.data.nomFactors[factor][subFactorIndex];
      // Set initial filter status for each sub factor
      vis.filters[factor][subFactor] = true;

      // Append form group
      var formGroup = filters.append("div")
        .attr("class","form-group");

      formGroup.append("label")
        .attr({
          class: "control-label col-sm-1",
          for: subFactor
        })
        .text(subFactor);

      formGroup.append("div")
          .append("input")
            .attr({
              class:"form-control",
              id: subFactor.replace(" ","_"),
              value: factor,
              type: "checkbox",
              checked: ""
            })
            .on("change", function() {
              var checkBox = this;
              var factor = checkBox.value;
              var subFactor = checkBox.id.replace("_"," ");
              vis.updateFilters(factor, subFactor);
            });
    }
    


    
  }
}

Scatter.prototype.updateFilters = function(factor, subFactor) {
  var vis = this;
  var prevValue = vis.filters[factor][subFactor];

  vis.filters[factor][subFactor] = prevValue ? false : true;

  vis.updateVis();
}

Scatter.prototype.createSelectors = function() {
  var vis = this; 

  var options = p171.data.quantFactors;

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
      .text(category);
  }

  vis.xCategory
    .property('value','GPA');

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
      .text(category);
  }

  vis.yCategory
    .property('value','admissionstest');

  vis.selectorsElement.append("b")
    .text("College: ");

  vis.collegeSelector = vis.selectorsElement.append("select")
    .attr({
      id:"college-selector"
    })
    .on('change', function(d) {
      vis.updateVis();
    });

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

var Histogram = function(_parentElement, _data) {
  this.parentElement = d3.select("#" + _parentElement);
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
  var category = vis.categorySelector.property('value');

  vis.displayData = p171.data.colleges[college][category];
}

Histogram.prototype.addSelectors = function() {
  var vis = this;

  var options = p171.data.mainFactors;

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
