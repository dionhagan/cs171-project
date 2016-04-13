
var preds;

var lineChart;

loadData();

function loadData() {

    preds = predict();

    console.log(preds);

    createVis();
}

function createVis() {
    lineChart = new InteractiveVis('chart-area', preds);
}

function showValue(elementID, newValue)
{
    document.getElementById(elementID).innerHTML=newValue;

}


//// add the image to be moved as percentage changes
//svg.append("image")
//    .attr("xlink:href","http://classroomclipart.com/images/gallery/Animations/Education_School/student-holding-pen-paper-pad-animation.gif")
//    .attr("x", 250)
//    .attr("y", 120)
//    .attr("width", 100)
//    .attr("height", 170)
//    .style("fill", "blue");

// //functions to change chart when user moves the sliders

// d3.select("#gpa").on("input", function() {
//     selected_gpa = +this.value;
//     update_gpa(selected_gpa);
// });

// function update_gpa(gpa) {
//     d3.select("#gpa-value").text(gpa);
//     svg.selectAll("image")
//         .attr("x", gpa*80 - 50);
// };
// update_gpa(2.0);

