"use strict";

// Class for form data
function FormData(userInput) {
  var defaultValues = {
    sat: 1200,
    act: 18,
    gpa: 2.0,
    apnum: 2,
    apave: 4,
    sat2ave: 700,
    hs: 0,
    gender: -1,
    race: -2,
    college: 'Harvard'
  }

  for (var inputName in userInput) {
    var value = userInput[inputName];
    var defaultValue = defaultValues[inputName];
    if (inputName == 'college') {
      this['college'] = value in p171.data.colleges ? value : defaultValue;
    } else {
      this[inputName] = !isNaN(value) ? +value : defaultValue;
    }
  }
  return this;
}

// From http://stackoverflow.com/questions/8674618/adding-options-to-select-with-javascript
// Populate drop downs with a set of values
function populateSelect(target, min, max, inc){
  if (!target){
    return false;
  }
  else {
    var min = min || 0,
        max = max || min + 100,
        inc = inc || 1;

    var select = document.getElementById(target);
    if (select === null) return;

    for (var i = min; i<=max; i += inc){
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        select.appendChild(opt);
    }
  }
}

$(document).ready(function() {
  populateSelect('sat',600,2400,10);
  populateSelect('act',1,36);
  populateSelect('apnum',0,10);
  populateSelect('sat2ave',0,10);
});

// Be responsive
window.addEventListener("resize", function(){
  d3.select("body").selectAll("svg").remove();
  updatePredictionViz();
}, false);

document.getElementById("btn-predict").onclick = function() {
  // get form data
  var userInput = {};
  var form = $('div.fieldset ul li select')
  
  for (var i=0; i<form.length; i++) {
    var input = form[i];
    userInput[input.id] = input.value;
    setCookie(input.id, input.value, 1);
  }

  // call the prediction
  p171.predictions = predict(formData);
  console.log(p171.predictions);
  updatePredictionViz();
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
