"use strict";

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
