var Scatter = function(_parentElement, _category) {
  this.parentElement = d3.select("#"+_parentElement);
  this.data = p171.data.applicants;
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

  vis.margin = {top: 10, right: 300, bottom: 60, left: 60};
  vis.width = (.9*window.innerWidth) - vis.margin.left - vis.margin.right,
  vis.height = 600 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = vis.plotElement.append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.createFilters();

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
    .html(toolTipDisplay);

/*
  vis.zoomBehavior = d3.behavior.zoom()
    .x(vis.x)
    .y(vis.y)
    .scaleExtent([1,100])
    .on("zoom", function(d) {
      vis.zoom(d);
    });

  vis.container
    .call(vis.zoomBehavior);
*/
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

  console.log(vis.displayData)

  // Add user to dataset
  if (Object.keys(p171.user).length > 1) {
    var userData = {app: p171.user}
    userData["isUser"] = true;
    vis.displayData.push(userData);
  }

  // Filter data based on user selections
  var categoryX = vis.xCategory.property('value'),
      categoryY = vis.yCategory.property('value');

  // Create axes for graph
  vis.x
    .domain([
      d3.min(vis.displayData, function(d){ return d.app[categoryX]; })*.9, 
      d3.max(vis.displayData, function(d){ return d.app[categoryX]; })
    ])

  vis.y
    .domain([
      d3.min(vis.displayData, function(d){ return d.app[categoryY]; })*.9, 
      d3.max(vis.displayData, function(d){ return d.app[categoryY]; })
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
    .transition().duration(1000)
    .attr({
      class: "points",
      cx: function(d) { return vis.x(d.app[categoryX]); },
      cy: function(d) { return vis.y(d.app[categoryY]); },
      r: function(d) { return d.isUser ? 6 : 3; },
      fill: function(d) { 
        if (d.isUser) return "brown";
        var isAccepted = false;
        for (var c in d.colleges) {
          if ((d.colleges[c].accepted == 1) && (vis.currentColleges.indexOf(c) >= 0)) isAccepted = true;
        }
        return isAccepted ? "#98fb98" : "lightsteelblue";
      }
    })
    .style({
      opacity: function(d) { 
        if (d.isUser) return 1;
        var isAccepted = false;
        for (var c in d.colleges) {
          if ((d.colleges[c].accepted == 1) && (vis.currentColleges.indexOf(c) >= 0)) isAccepted = true;
        }
        return isAccepted ? .7 : .3;
      }
    });
    

  vis.points
    .on("mouseover", function(d) {
      d3.select(this).attr("r","8")
      vis.tip.show(d)
    })
    .on("mouseout", function (d) {
      d3.select(this).attr("r",function(d) {
        return d.isUser ? 6 : 3
      })
      vis.tip.hide(d)
    })
    .call(vis.drag);;

  vis.points.exit().remove();
}

Scatter.prototype.wrangleData = filterApplicants;

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


//Scatter.prototype.showFilters = showFilters;

Scatter.prototype.createFilters = function() {
  var vis = this

  vis.svg.append('text')
    .attr({
      x: vis.margin.left + vis.width - 40,
      y: vis.margin.top - 5
    })
    .style({"font-size":18,"font-weight":"bold"})
    .text("Colleges")

  // Add filter elements for each college 
  vis.collegeFilters = vis.svg.selectAll(".college-filters")
    .data(Object.keys(p171.data.colleges))
    .enter().append('g')
      .attr({
        class: "college-filters"
      })

  vis.collegeFilters
    .append("rect")
      .attr({
        x: vis.margin.left + vis.width - 40,
        y: function(d,i) { return vis.margin.top+(i*15)},
        fill: "red",
        height: 10,
        width: 10,
        opacity: function(college) {
          return p171.DD.filters[college] ? 1 : .3
        }
      })
      .on("click", function(d) {
        d3.select(this)
          .attr({
            opacity: function(college) {
              p171.DD.filters[college] = p171.DD.filters[college] ? false : true
              vis.updateVis()
              return p171.DD.filters[college] ? 1 : .3
            }
          })
      })

  vis.collegeFilters
      .append("text")
        .attr({
          x: vis.margin.left + vis.width - 28,
          y: function(d,i) { return vis.margin.top+(i*15)+11}
        })
        .text(function(college) {return college })

  // Get factors that need to be filtered
  var factorsToFilter = Object.keys(p171.data.nomFactors);

  vis.svg.append("text")
    .attr({
      x: vis.margin.left + vis.width + 75,
      y: vis.margin.top - 5
    })
    .style({"font-size":18,"font-weight":"bold"})
    .text("Applicants")

  // Add filter elements for each applicant type
  vis.appFilters = vis.svg.selectAll(".app-filters")
    .data(factorsToFilter)
    .enter().append('g')
      .attr({
        class: "app-filters"
      })

  vis.appFilters.append("text")
      .attr({
        x: vis.margin.left + vis.width + 75,
        y: function(d,i) { return vis.margin.top+(i*50)+13}
      })
      .style({
        "text-decoration": "underline"
      })
      .text(function(d,i) {
        return p171.data.labels[d]
      })

  for (var i=0; i<2; i++) {
    vis.appFilters.append("rect")
      .attr({
        class: function(d) {
          return Object.keys(p171.DD.filters[factor])[i];
        },
        x: vis.margin.left + vis.width + 75,
        y: function(d,j) { return 20+vis.margin.top+(j*50)+(i*18)},
        fill: "red",
        height: 10,
        width: 10,
        opacity: function(factor) {
          var subFactor = Object.keys(p171.DD.filters[factor])[i];
          return p171.DD.filters[factor][subFactor] ? 1 : .3
        }
      })
      .on("click", function(d) {
        var subFactor = d3.select(this).attr("class")

        d3.select(this)
          .attr({ 
            opacity: function(d) {
              p171.DD.filters[factor][subFactor] = p171.DD.filters[factor][subFactor] ? false : true
              vis.updateVis()
              return p171.DD.filters[factor][subFactor] ? 1 : .3
            }
          })
      })

    vis.appFilters.append("text")
      .attr({
        x: vis.margin.left + vis.width + 87,
        y: function(d,j) { return 20+vis.margin.top+(j*50)+(i*16)+11}
      })
      .text(function(d) {
        return p171.data.nomFactors[d][i]
      })
  }
  
/*
  // Create a form group for each application factor 
  for (var factorIndex=0; factorIndex<factorsToFilter.length; factorIndex++) {
    var factor = factorsToFilter[factorIndex];

    vis.appFilters.append("text")
      .attr({
        class: "filter-label",
        x: vis.margin.left + vis.margin.right + 20,
        y: function(d,i) { return vis.margin.top+(i*30)+11}
      })
      .text(p171.data.labels[factor])
    
    for (var subFactorIndex=0; subFactorIndex<2; subFactorIndex++) {
      var subFactor = p171.data.nomFactors[factor][subFactorIndex];
      /*
      vis.appFilters
        .append("rect")
          .attr({
            x: vis.margin.left + vis.width - 40,
            y: function(d,i) { return vis.margin.top+(i*15)},
            fill: "red",
            height: 10,
            width: 10,
            opacity: function(college) {
              return p171.DD.filters[college] ? 1 : .3
            }
          })
          .on("click", function(d) {
            d3.select(this)
              .attr({
                opacity: function(college) {
                  p171.DD.filters[college] = p171.DD.filters[college] ? false : true
                  vis.updateVis()
                  return p171.DD.filters[college] ? 1 : .3
                }
              })
          })

      vis.appFiltres.append("text")
        .attr({
          class: "filter-label",
          x: vis.margin.left + vis.margin.right + 20,
          y: function(d,i) { return vis.margin.top+(i*30)+11}
        })
        .text(subFactor)

      
    }


  }  */
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

  // Add selectors to the filters section 
  vis.selectorsElement = vis.plotElement.append("div")
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

  vis.selectorsElement.append("b")
    .text("  Y Axis: ")

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

}

var toolTipDisplay = function(applicant) {
  var html = ""

  for (var college in applicant.colleges) {
    var acceptStatus = applicant.colleges[college].accepted == 1 ? true: false;

    html += "<b>"+college+": </b>" 
    html += '<span style="color:'
    html += acceptStatus ? "#97F450\">Accepted" : "#C13434\">Rejected"
    html += "</span></br>"
  }

  return html
}

