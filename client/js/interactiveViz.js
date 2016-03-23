
//create svg for chart

var width = 710;
var height = 300;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", 710)
    .attr("height", height)
    .style("display", "block");

// add the image to be moved as percentage changes
svg.append("image")
    .attr("xlink:href","http://classroomclipart.com/images/gallery/Animations/Education_School/student-holding-pen-paper-pad-animation.gif")
    .attr("x", 250)
    .attr("y", 120)
    .attr("width", 100)
    .attr("height", 170)
    .style("fill", "blue");

//functions to change chart when user moves the sliders

d3.select("#gpa").on("input", function() {
    selected_gpa = +this.value;
    update_gpa(selected_gpa);
});

function update_gpa(gpa) {
    d3.select("#gpa-value").text(gpa);
    svg.selectAll("image")
        .attr("x", gpa*80 - 50);
};
update_gpa(2.0);

predict(2);

d3.select("#sat").on("input", function() {
    update_sat(+this.value);
});

function update_sat(sat) {
    d3.select("#sat-value").text(sat);
    svg.selectAll("image")
        .attr("x", sat/5);
};
update_sat(1200);


d3.select("#act").on("input", function() {
    update_act(+this.value);
});

function update_act(act) {
    d3.select("#act-value").text(act);
    svg.selectAll("image")
        .attr("x", act*10);
};
update_act(18);


d3.select("#num_ap").on("input", function() {
    update_num_ap(+this.value);
});

function update_num_ap(num_ap) {
    d3.select("#num-ap-value").text(num_ap);
    svg.selectAll("image")
        .attr("x", num_ap*60 - 50);
};
update_num_ap(5);


d3.select("#ave_ap").on("input", function() {
    update_ave_ap(+this.value);
});

function update_ave_ap(ave_ap) {
    d3.select("#ave-ap-value").text(ave_ap);
    svg.selectAll("image")
        .attr("x", ave_ap*80 - 50);
};
update_ave_ap(2.5);


d3.select("#num_sat").on("input", function() {
    update_num_sat(+this.value);
});

function update_num_sat(num_sat) {
    d3.select("#num-sat-value").text(num_sat);
    svg.selectAll("image")
        .attr("x", num_sat*60 - 50);
};
update_num_sat(5);


// add scenario to chart - on click of the submit button

var selected;

d3.select("#user_info").on("submit", updateVisualization);

svg.append("circle")
    .attr("cx", -50)
    .attr("cy", 200)
    .attr("r", 20)
    .style("fill", "white");

var sel_gpa;

function updateVisualization(){
    sel_gpa = document.getElementById('gpa').value;
    sel_sat = document.getElementById('sat').value;

    svg.selectAll("circle")
        .attr("cx", sel_gpa*80)
        .style("fill", "blue");

    console.log(sel_gpa);
    console.log(sel_sat);
};

// add x-axis

var xScale = d3.scale.linear()
    .domain([0, 100])
    .range([0, 670]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(10)
    .tickFormat(function(d) { return d + "%"; });

svg
    .append("text")
    .attr("x", 285)
    .attr("y", 295)
    .text("Chance of Acceptance");

svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(20, 250)")
    .style("font-size", "12px")
    .call(xAxis);