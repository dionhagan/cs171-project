var InteractiveVis = function(_parentElement) {
  this.parentElement = _parentElement;

  this.initVis();
}

InteractiveVis.prototype.initVis = function(callback) {
  var vis = this;

  vis.counter = 1;

  // Static stuff
  vis.margin = {
    top: 50,
    right: 20,
    bottom: 120,
    left: 80
  };

  vis.width = 1000 - vis.margin.left - vis.margin.right;
  vis.height = 400 - vis.margin.top - vis.margin.bottom;

  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")

  // Scales
  vis.x = d3.scale.ordinal()
    .rangeRoundBands([0, vis.width]);

  vis.y = d3.scale.linear()
    .domain([0, 1])
    .range([vis.height, 0]);

  // Axes
  vis.xAxis = d3.svg.axis()
    .scale(vis.x)
    .orient("bottom")
    .ticks(25);

  vis.yAxis = d3.svg.axis()
    .scale(vis.y)
    .orient("left")
    .ticks(10)
    .tickFormat(function(d) {
      return d * 100 + "%";
    });

  vis.xGroup = vis.svg.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0," + vis.height + ")")


  vis.yGroup = vis.svg.append("g")
    .attr("class", "y-axis axis")
    .call(vis.yAxis);

  //tooltips

  vis.tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
    console.log(d["college"]);
    return ("<strong>" + d["college"] + ": </strong> " +
      "<strong style='color:crimson;'>" + d3.format("2.2%")(d["prob"]) + "</strong>")
  });
  //return (d["college"] + ": " + d3.format("2.2%")(d["prob"])); });

  vis.svg.append("text")
    .text("Chance of Acceptance")
    .attr("x", -vis.height / 2)
    .attr("y", -60)
    .attr("dy", ".35em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle");

  vis.svg.call(vis.tip);

  // declare graph components
  vis.line = d3.svg.line()
    .interpolate("linear");

  vis.chart = vis.svg.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", "1.5px");


  // attach event listeners to sliders
  vis.gpa_slider = d3.select("#gpa")
    .on("change", function() {
      predict();
    });

  vis.sat_slider = d3.select("#sat")
    .on("change", function() {
      predict();
    });

  vis.act_slider = d3.select("#act")
    .on("change", function() {
      predict();
    });

  vis.num_ap_slider = d3.select("#num_ap")
    .on("change", function() {
      predict();
    });

  vis.ave_ap_slider = d3.select("#ave_ap")
    .on("change", function() {
      predict();
    });

  vis.num_sat_slider = d3.select("#num_sat")
    .on("change", function() {
      predict();
    });

  // attach event listeners to dropdowns

  vis.gender_menu = d3.select("#gender")
    .on("change", function() {
      predict();
    });

  vis.race_menu = d3.select("#race")
    .on("change", function() {
      predict();
    });

  vis.hs_menu = d3.select("#hs")
    .on("change", function() {
      predict();
    });

  // Get list of all selected schools
  d3.select("#school-select")
    .on("change", function() {
      vis.updateAllSchools();
      vis.wrangleData();
    });

  var sortOrder = document.getElementsByName('sortOrder');
  for (var i = 0; i < sortOrder.length; i++) {
    if (sortOrder[i].checked) {
      p171.sortOrder = sortOrder[i].value;
      localStorage.setItem("sortOrder", p171.sortOrder);
    }
    sortOrder[i].addEventListener('click', function(e) {
      vis.updateSortOrder(e);
    }, false);
  }

  d3.select("#save")
    .on("click", function() {
      vis.saveScenario();
    });

  d3.select("#clear")
    .on("click", function() {
      d3.selectAll(".saved-rect").remove();
      vis.counter = 1;
    });

  // first time through
  vis.updateAllSchools();
  vis.wrangleData();
}

InteractiveVis.prototype.updateSortOrder = function(e) {
  p171.sortOrder = e.currentTarget.value;
  localStorage.setItem("sortOrder", p171.sortOrder);
}

InteractiveVis.prototype.updateAllSchools = function() {
  var vis = this;
  var choice = document.getElementById('school-choice').value;
  var ivy, region = 0, allSchools = false;

  switch (choice) {
    case 'ivy':
      ivy = true;
      break;
    case 'nonivy':
      ivy = false;
      break;
    case "1": case "2": case "3": case "4":
      region = parseInt(choice);
      break;
    default:
      allSchools = true;
      break;
  }

  vis.allSchools = [];
  for (var c in p171.data.colleges) {
    if (c == 'All') continue;
    if (allSchools) {
      vis.allSchools.push(p171.data.colleges[c].name);
    } else if (region != 0 && p171.data.colleges[c].region == region) {
      vis.allSchools.push(p171.data.colleges[c].name);
    } else if (p171.data.colleges[c].ivy == ivy) {
      vis.allSchools.push(p171.data.colleges[c].name);
    }
  }

  localStorage.setItem("colleges", JSON.stringify(vis.allSchools));
}

InteractiveVis.prototype.wrangleData = function() {
  var vis = this;

  vis.displayData = p171.predictions;
  vis.updateVis();
}

InteractiveVis.prototype.updateVis = function() {
  var vis = this;

  vis.newData = [];
  // subset data by user selection
  for (var i = 0; i < vis.allSchools.length; i++) {
    for (var j = 0; j < vis.displayData.length; j++) {
      if (vis.displayData[j].college == vis.allSchools[i]) {
        vis.newData.push(vis.displayData[j]);
      }
    }
  }

  if (p171.sortOrder == "name") {
    // sort increasing
    vis.newData.sort(function(a, b) {
      // Ref: http://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
      var nameA = a.college.toLowerCase(),
        nameB = b.college.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  } else {
    // we are sorting by probability - sort decreasing
    vis.newData.sort(function(a, b) {
      return b.prob - a.prob;
    });
  }

  vis.x.domain(vis.newData.map(function(d) {
    return d.college;
  }));

  vis.xGroup.call(vis.xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  vis.line
    .x(function(d) {
      return vis.x(d.college);
    })
    .y(function(d) {
      return vis.y(d.prob);
    });

  vis.chart
    .transition()
    .duration(800)
    .attr("d", vis.line(vis.newData));

  vis.circle = vis.svg.selectAll("circle")
    .data(vis.newData);

  vis.circle.enter().append("circle")
    .attr("class", "dot")
    .attr("fill", "crimson")
    .attr("transform", "translate(20,5)")
    .attr("r", 1)
    .on('mouseover', vis.tip.show)
    .on('mouseout', vis.tip.hide);

  vis.circle
    .transition().duration(800)
    .attr("r", 4)
    .attr("opacity", .8)
    .attr("cx", function(d) {
      return vis.x(d.college)
    })
    .attr("cy", function(d) {
      return vis.y(d.prob)
    });

  vis.circle.exit().remove();
}

function showValue(elementID, newValue) {
  document.getElementById(elementID).innerHTML = newValue;
}

InteractiveVis.prototype.saveScenario = function() {
  var vis = this;

  var savedColor = ["blue", "green", "orange", "purple"];

  var selected_gpa = d3.select("#gpa").property("value");
  var selected_sat = d3.select("#sat").property("value");
  var selected_act = d3.select("#act").property("value");
  var selected_sat_subj = d3.select("#num_sat").property("value");
  var selected_apnum = d3.select("#num_ap").property("value");
  var selected_apave = d3.select("#ave_ap").property("value");

  vis.tip2 = d3.tip().attr('class', 'd3-tip').html(function(d) {
    console.log(d["college"]);
    return ("<div class='jumbotron'><strong>" + d["college"] + ": </strong> " +
      "<strong style='color:crimson;'>" + d3.format("2.2%")(d["prob"]) + "</strong>" + "<p class='tip-text'>" + "GPA: " + selected_gpa + "</p>" + "<p class='tip-text'>" + "SAT: " + selected_sat + "</p>" + "<p class='tip-text'>" + "ACT: " + selected_act + "</p>" + "<p class='tip-text'>" + "AP Exams: " + selected_apnum + "</p>" + "<p class='tip-text'>" + "Ave AP: " + selected_apave + "</p>" + "<p class='tip-text'>" + "SAT Subj Tests: " + selected_sat_subj + "</p></div>"
    )
  });

  vis.svg.call(vis.tip2);

  if (vis.counter == 5) {
    d3.selectAll(".saved-rect").remove();
    vis.counter = 1;
  }

  vis.savedRect = vis.svg.selectAll("rect" + vis.counter)
    .data(vis.newData);

  vis.savedRect.enter().append("rect")
    .attr("class", "saved-rect")
    .attr("fill", savedColor[(vis.counter - 1) % 4])
    .attr("transform", "translate(15,0)")
    .attr("width", 10)
    .attr("height", 10)
    .on('mouseover', vis.tip2.show)
    .on('mouseout', vis.tip2.hide);

  vis.savedRect
    .attr("opacity", .8)
    .attr("x", function(d) {
      return vis.x(d.college)
    })
    .attr("y", function(d) {
      return vis.y(d.prob)
    });

  vis.counter = vis.counter + 1;

}
