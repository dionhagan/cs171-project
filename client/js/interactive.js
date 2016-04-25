
var InteractiveVis = function (_parentElement) {
  this.parentElement = _parentElement;

  this.initVis();
}

InteractiveVis.prototype.initVis = function (callback) {
  var vis = this;

  // Static stuff
  vis.margin = { top: 50, right: 20, bottom: 120, left: 80 };

  vis.width = 650 - vis.margin.left - vis.margin.right;
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
    .tickFormat(function (d) {
      return d*100 + "%";
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
    return ("<strong style='background: lightgrey'>" + d["college"] + ": </strong> " +
    "<strong style='color:crimson; background: lightgrey'>" + d3.format("2.2%")(d["prob"]) + "</strong>")
  });
    //return (d["college"] + ": " + d3.format("2.2%")(d["prob"])); });

  vis.svg.append("text")
    .text("Chance of Acceptance")
    .attr("x", -vis.height/2)
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
       .on("change", function () {
         predict();
       });

     vis.sat_slider = d3.select("#sat")
       .on("change", function () {
         predict();
       });

  vis.act_slider = d3.select("#act")
       .on("change", function () {
         predict();
       });

     vis.num_ap_slider = d3.select("#num_ap")
       .on("change", function () {
         predict();
       });

     vis.ave_ap_slider = d3.select("#ave_ap")
       .on("change", function () {
         predict();
       });

     vis.num_sat_slider = d3.select("#num_sat")
       .on("change", function () {
         predict();
       });

     // attach event listeners to dropdowns
     vis.college_menu = d3.select("#college")
       .on("change", function () {
         predict();
       });

     vis.gender_menu = d3.select("#gender")
       .on("change", function () {
         predict();
       });

     vis.race_menu = d3.select("#race")
       .on("change", function () {
         predict();
       });

     vis.hs_menu = d3.select("#hs")
       .on("change", function () {
         predict();
       });



  // call next function
  vis.wrangleData();
}

InteractiveVis.prototype.updateAllSchools = function() {
  var vis = this;
  vis.allSchools = [];
  $('input:checkbox[name="colleges"]:checked').each(function()
  {
    vis.allSchools.push($(this).val());
  });

  localStorage.setItem("colleges", JSON.stringify(vis.allSchools));
}

InteractiveVis.prototype.wrangleData = function () {
  var vis = this;

  // filter out schools based on user input
  vis.filtered = [];

  vis.displayData = p171.predictions;

  // Get list of all selected schools
  d3.select("#school-select")
    .on("change", function(){
      vis.updateAllSchools();
      vis.updateVis()
      p171.innovation3d.wrangleData();
    })

  // first time through
  vis.updateAllSchools();
  vis.updateVis();
}

InteractiveVis.prototype.updateVis = function () {
  var vis = this;

  var colleges = d3.map(vis.newData, function(d) { return d.college; })

  console.log(vis.allSchools);
  console.log(vis.newData);

  vis.newData = [];

  if(vis.allSchools == undefined)
  {
    xdomain = colleges.keys();

  }
  else
  {
    xdomain = vis.allSchools;
    for(var i=0; i<vis.allSchools.length; i++){
      for (var j=0; j < vis.displayData.length; j++){
        if (vis.displayData[j].college == vis.allSchools[i]){
          vis.newData.push(vis.displayData[j]);
        }
      }
    }
  }

  vis.x.domain(xdomain);

  vis.xGroup.call(vis.xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

  vis.line
    .x(function(d) { return vis.x(d.college); })
    .y(function(d) { return vis.y(d.prob); });

  vis.chart
    .transition()
      .duration(800)
        .attr("d", vis.line(vis.newData));

    vis.circle = vis.svg.selectAll("circle")
      .data(vis.newData);

    vis.circle.enter().append("circle")
      .attr("class", "dot")
      .attr("fill", "crimson")
      .attr("r", 1)
    .on('mouseover', vis.tip.show)
    .on('mouseout', vis.tip.hide);

    vis.circle
      .transition().duration(800)
      .attr("r", 4)
      .attr("opacity", .8)
      .attr("cx", function (d) { return vis.x(d.college) })
      .attr("cy", function (d) { return vis.y(d.prob) })

    vis.circle.exit().remove();
}

function showValue(elementID, newValue) {
    document.getElementById(elementID).innerHTML=newValue;
}
