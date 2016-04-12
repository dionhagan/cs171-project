
InteractiveVis = function (_parentElement, _data) {
	this.parentElement = _parentElement;
	this.data = _data;

	this.initVis();
}

InteractiveVis.prototype.initVis = function () {
	var vis = this;

	// Static stuff
	vis.margin = { top: 50, right: 20, bottom: 110, left: 80 };

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
		return (d["college"] + ": " + d["prob"]); });

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
   	.attr("stroke", "black")
   	.attr("stroke-width", "1.5px");


	// call next function
	vis.wrangleData();
}

InteractiveVis.prototype.wrangleData = function () {
	var vis = this;

	// filter out schools based on user input
	vis.filtered = [];

	vis.displayData = vis.data;

	vis.updateVis();
}

InteractiveVis.prototype.updateVis = function () {
	var vis = this;

	var colleges = d3.map(vis.displayData, function(d) { return d.college; })
	vis.x.domain(colleges.keys());

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
      	.attr("d", vis.line(vis.displayData));

    vis.circle = vis.svg.selectAll("circle")
    	.data(preds);

    vis.circle.enter().append("circle")
    	.attr("class", "dot")
		.on('mouseover', vis.tip.show)
		.on('mouseout', vis.tip.hide);

    vis.circle
    	.transition().duration(800)
    	.attr("r", 7)
    	.attr("cx", function (d) { return vis.x(d.college) })
    	.attr("cy", function (d) { return vis.y(d.prob) })

    vis.circle.exit().remove();

}