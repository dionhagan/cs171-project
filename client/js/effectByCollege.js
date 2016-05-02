var EffectGraph = function(_parentElement, _factor) {
  this.parentElement = d3.select("#"+_parentElement);
  this.factor= _factor
  this.data = p171.data.factorEffect;
  this.colleges = {};
  this.createElements();
  this.initVis();
}

EffectGraph.prototype.initVis = function() {
  var vis = this;

  vis.wrangleData();

  vis.margin = {top: 10, right: 20, bottom: 125, left: 60};
  vis.outerWidth = p171.DD.subPlotWidth;
  vis.outerHeight = 600;
  vis.width = vis.outerWidth - vis.margin.left - vis.margin.right,
  vis.height = vis.outerHeight - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = vis.parentElement.append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  // Define the range of the vis scale
  vis.xScale = d3.scale.ordinal()
    .domain(vis.displayData.map(function(d) { return d.name }))
    .rangeRoundBands([0, vis.width]);

  vis.yScale = d3.scale.linear()
    .range([vis.height, 0]).nice()
    .domain([
      d3.min(vis.displayData, function(d){ return d.val; }), 
      d3.max(vis.displayData, function(d){ return d.val; })
    ]); 

  // Create axes for graph

  vis.xAxisGroup = vis.svg.append("g")
    .attr({
      class: "x-axis axis"
    })

  vis.yAxisGroup = vis.svg.append("g")
    .attr({ class: "y-axis axis" })

  // Create the vis
  vis.updateVis();
  
};

EffectGraph.prototype.wrangleData = function() {
  var vis = this;

  // Get relevant subset of data 
  var data; 
  if (vis.showAllColleges) {
    data = p171.data.factorEffect[vis.factor]
  } else {
    data = vis.data[vis.factor];
  }
console.log(vis.data)
console.log(vis.factorLabel)
  // Format the data to be displayed
  vis.displayData = [];
  
  for (var i=0; i<data.vals.length;i++) {
    vis.displayData.push({
      name: data.names[i],
      val: data.vals[i],
      shown: vis.colleges[data.names[i]]
    });
  }

  // Filter the display data
  vis.displayData = vis.displayData.filter(function(college) {
    return p171.DD.filters[college.name];
  })

  // Sort the display data 
  vis.displayData.sort(function(a, b) {
    return a.val - b.val;
  })

};

EffectGraph.prototype.updateVis = function() {
  var vis = this;

  // Use the appropriate data 
  vis.wrangleData();
  var dataHasNegatives = vis.displayData.filter(function(d) {
     return d.val < 0
  }).length > 0
  var dataHasPositives  = vis.displayData.filter(function(d) {
     return d.val > 0
  }).length > 0

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
    .attr("transform", function(d) {
      var translation = "translate(0,"
      if (dataHasPositives && !dataHasNegatives) {
        translation += vis.height;
      } else {
        translation += vis.yScale(0);
      }
      translation += ")";
      return translation;
    })
    .call(vis.xAxis)

  vis.xAxisGroup
    .selectAll("text")
      .attr({
        transform: function(school) {
          var d = vis.displayData.filter(function(d){ return d.name == school})[0];
          var textPos = d.val > 0 ? 50 : -50;
          return "rotate(90) translate("+textPos+",0)";
        }
      }); 
  
  vis.yAxisGroup
    //.transition().duration(300)
    .call(vis.yAxis); 
  
  // Create bars 
  vis.barWidth = vis.xScale.rangeBand();
  var barHeight = function(d) { 
        if (dataHasPositives && !dataHasNegatives) {
          return vis.height - vis.yScale(d.val)
        } else {
          return vis.yScale(0) - vis.yScale(Math.abs(d.val)); 
        }
      },
      barYPos = function(d) { 
        if (dataHasPositives && !dataHasNegatives) {
          return vis.yScale(d.val)
        } else if (dataHasNegatives && dataHasPositives) {
          return d.val > 0 ? vis.yScale(0) - barHeight(d) : vis.yScale(0); 
        }
        
      },
      barXPos = function(d,i){ return i*vis.barWidth; };

  // Create group for bar element 
  vis.barGroups = vis.svg.selectAll(".bar-group")
    .data(vis.displayData);

  var barGroupEnter = vis.barGroups
    .enter().append("g")
      .attr("class","bar-group");

  vis.bars = barGroupEnter.append("rect")
    .attr({
      class: "bar",
    });

  vis.barGroups.select(".bar")
    .attr({
      x: barXPos,
      y: barYPos,
      width: vis.barWidth,
      height: barHeight,
      fill: function (d) { return d.shown ? "#CDDB9D" : "grey"; }
    })   


  // Add labels to bar group
  var labelsEnter = barGroupEnter.append("rect")
    .attr({
      class: "college-label",
    })
  
  vis.barGroups.select(".college-label")
      .attr({
        transform: function(d,i) { return "translate("+barXPos(d,i)+","+barYPos(d)+")"; },
        height: 120,
        width: vis.barWidth,
        y: function(d) { return d.val > 0 ? barHeight(d) : -120 },
        fill: "#759564"
      })

  var removeTabsEnter = barGroupEnter.append("rect")
    .attr({
      class: "remove-tab"
    })

  // Add tab to remove a given college
  vis.barGroups.select(".remove-tab")
    .attr({
      y: function(d) { 
        if (dataHasPositives && !dataHasNegatives) {
          return vis.height + 110;
        } else {
          return d.val>0 ? vis.yScale(0) + 110 : vis.yScale(0) - 110; 
        }
      },
      x: function(d,i) { return barXPos(d,i)+ (vis.barWidth/2)-7.5; },
      height: 4,
      width: 15,
      fill:"yellow"
    })
    .style("opacity","0")


  // Create behaviors for vis elements
  vis.barGroups
    .on("click", function(d) {
      console.log(d);
    })
    .on("mouseover", function(d) {
      var currElement = d3.select(this);
        
      currElement.select("rect")
        .style("fill","#759564")

      currElement.select(".college-label")
        .style("opacity","0.3")

      currElement.select(".remove-tab")
        .style("opacity", "0.7")
    })
    .on("mouseout", function(d) {
      var currElement = d3.select(this)
      
      currElement.select("rect")
        .style("fill","#CDDB9D")

      currElement.select(".college-label")
        .style("opacity","0")

      currElement.select(".remove-tab")
        .style("opacity", "0")
    })

  vis.barGroups.select(".remove-tab")
    .on("mouseover", function(d) {
      d3.select(this)
        .attr({
          fill:"red"
        })
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .attr({
          fill:"yellow"
        })
    })
    .on("click", function(d) { 
      vis.colleges[d.name] = false;
      vis.updateVis();
    })

  vis.barGroups.exit().remove(); 

};

EffectGraph.prototype.createElements = createElements;
EffectGraph.prototype.showFilters = showFilters;