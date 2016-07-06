$(function() {
    unitsPerPixel = 0.5;
    HashMap = function() {
        this._dict = [];
    }
    HashMap.prototype._get = function(key) {
        for (var i = 0, couplet; couplet = this._dict[i]; i++) {
            if (couplet[0] === key) {
                return couplet;
            }
        }
    }
    HashMap.prototype.put = function(key, value) {
        var couplet = this._get(key);
        if (couplet) {
            couplet[1] = value;
        } else {
            this._dict.push([key, value]);
        }
        return this; // for chaining
    }
    HashMap.prototype.get = function(key) {
        var couplet = this._get(key);
        if (couplet) {
            return couplet[1];
        }
    }
    map = new HashMap();
      
    $.getJSON("geoData.json", function(json) {
        var tempMap = json;//JSON.parse(json);
        for (var i = 0; i < tempMap._dict.length; ++i) {
            map.put(tempMap._dict[i][0], [tempMap._dict[i][1][0], tempMap._dict[i][1][1]]);
        }
        //console.log(json); // this will show the info it in firebug console
    });

    /*
    if (localStorage.getItem("geoData") != undefined) {
        var tempMap = JSON.parse(localStorage.getItem("geoData"));
        for (var i = 0; i < tempMap._dict.length; ++i) {
            map.put(tempMap._dict[i][0], [tempMap._dict[i][1][0], tempMap._dict[i][1][1]]);
        }
    }
    */

    var doit;
    $(window).resize(function() {
        clearTimeout(doit);
        doit = setTimeout(resizedw, 10);
    });

    function resizedw() {
        d3.select("svg").remove();
        init("NPOPCHG201" + ($('select[name="dropDown"]')[0].selectedIndex - 1));
    }

    initDropdown();
    var slide = document.getElementById('slide');
    slide.oninput = change;

    function change() {
        unitsPerPixel = 1 / this.value;
        if (($('select[name="dropDown"]')[0].selectedIndex) != 0) {
            d3.select("svg").remove();
            init("NPOPCHG201" + ($('select[name="dropDown"]')[0].selectedIndex - 1));
        }
    };
    init("NPOPCHG2010"); 
    document.getElementById("dropDown").selectedIndex = 1;
});

var init = function(inputParameter) {
    var columnArray = ["NAME", "CENSUS2010POP", "POPESTIMATE2010", "POPESTIMATE2011", "POPESTIMATE2012", "POPESTIMATE2013", "POPESTIMATE2014", "POPESTIMATE2015", "NPOPCHG2010", "NPOPCHG2011", "NPOPCHG2012", "NPOPCHG2013", "NPOPCHG2014", "NPOPCHG2015", "BIRTHS2010", "BIRTHS2011", "BIRTHS2012", "BIRTHS2013", "BIRTHS2014", "BIRTHS2015", "DEATHS2010", "DEATHS2011", "DEATHS2012", "DEATHS2013", "DEATHS2014", "DEATHS2015", "NATURALINC2010", "NATURALINC2011", "NATURALINC2012", "NATURALINC2013", "NATURALINC2014", "NATURALINC2015", "INTERNATIONALMIG2010", "INTERNATIONALMIG2011", "INTERNATIONALMIG2012", "INTERNATIONALMIG2013", "INTERNATIONALMIG2014", "INTERNATIONALMIG2015", "DOMESTICMIG2010", "DOMESTICMIG2011", "DOMESTICMIG2012", "DOMESTICMIG2013", "DOMESTICMIG2014", "DOMESTICMIG2015"];

    var locationInput = "NAME";
    var sizeInput = inputParameter;

    var margin = {
        sides: 50,
        top: 52,
        bottom: 60
    };

    var outerWidth = $(window).width();
    var outerHeight = $(window).height() - margin.top - margin.bottom;

    document.getElementById("circleSize").innerHTML = "Loading: Please Wait"; 

    var svg = d3.select("body").append("svg")
        .attr("width", innerWidth)
        .attr("height", innerHeight);

    function render(data) {

        var innerWidth = outerWidth - margin.sides * 2;
        var innerHeight = outerHeight - margin.top - margin.bottom;

        // Coordinates Bounds of the US
        var minX = -124.85;
        var maxX = -66.80;
        var minY = 24.40;
        var maxY = 49.38;

        var ratioUSA = (maxX - minX) / (maxY - minY);
        var screenRatio = (innerWidth / innerHeight);
        // If screenRatio is less than ratioUSA than it is too narrow. Use the width as basis
        // if screenRatio is greater than ratioUSA than it is too long Use the height as basis

        if (screenRatio < ratioUSA) {
            innerHeight = innerWidth * (1 / ratioUSA);
        } else {
            innerWidth = innerHeight * ratioUSA;
        }

        var xScale = d3.scale.linear().domain([minX, maxX]).range([0, innerWidth]);
        var yScale = d3.scale.linear().domain([minY, maxY]).range([innerHeight, 0]);

        var unitsMax = d3.max(data, function(d) {
            return Math.abs(d[inputParameter]);
        });
        var rScale = d3.scale.sqrt().domain([0, unitsMax]).range([0, Math.sqrt(unitsMax / (unitsPerPixel * Math.PI))]);

        var circles = svg.selectAll("circle").data(data);
        circles.enter().append("circle");
        circles
            .attr("cx", function(d) {
                if (map.get(d[locationInput]) != null) {
                    if (isNaN(+map.get(d[locationInput])[0])) {
                        //console.log("X-Coordinate Value in map is not a number!");
                        return 10000;
                    } else {
                        return +xScale(+map.get(d[locationInput])[0]) + margin.sides;
                    }
                } else {
                    //console.log("Getting Coordinates for " + d["NAME"]);

                    // NO LONGER USING LOCAL STORAGE OR QUERYING GOOGLE MAPS IN REAL TIME
                    /*
                    var localCheck = getCoordinates(d[locationInput]);
                    if (localCheck != undefined) {
                        if (localCheck[2] == "OK") {
                            map.put(d[locationInput], [+localCheck[0], +localCheck[1]]);
                            localStorage.setItem("geoData", JSON.stringify(map));
                            return +xScale(+map.get(d[locationInput])[0]) + margin.sides;
                        }
                    }
                    */

                    //console.log("Local Check is undefined and map is null");
                    return 1000;
                }
            })
            .attr("cy", function(d) {
                if (map.get(d[locationInput]) != null) {
                    if (isNaN(+map.get(d[locationInput])[1])) {
                        //console.log("Size Value in map is not a number!");
                        return 10000;
                    } else {
                        return +yScale(+map.get(d[locationInput])[1]) + margin.top;
                    }
                } else {
                    //console.log("No value in map when searching for y value");
                    return 10000;
                }
            })
            .attr("r", function(d) {
                if (isNaN(+rScale(d[sizeInput]))) {
                    return 0;
                } else {
                    return rScale(Math.abs(d[sizeInput]));
                }
            })
            .attr("id", function(d) {
                return d["NAME"];
            })
            .attr("fill", function(d) {
                if (d[inputParameter] > 0) {
                    return "blue";
                } else {
                    return "red";
                }
            })
            .attr("stroke", "none")
            .on('click', function(d, i) {
                var holderString = "";
                for (var counter = 0; counter < columnArray.length; ++counter) {
                    holderString = holderString + columnArray[counter] + ": " + d[columnArray[counter]] + "   ";
                }
                //alert(d["NAME"] + ", 2015 Population: " + d["POPESTIMATE2015"]);
                alert(holderString);
                d3.select(d["NAME"]).remove();
            });
        circles.exit().remove();
        document.getElementById("circleSize").innerHTML = (Math.round((1 / unitsPerPixel) * 100) / 100 + " Pixels Represent Population Change of 1 Person");
    }

    function type(d) {
        d.trans_face_val_amt = +d.trans_face_val_amt;
        return d;
    }

    function getCoordinates(input) {
        if (input == null || input == "" || input == undefined) {
            return;
        }
        var strUrl = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBHPWGDrjRFk59k_FYuiujNmJo4APmKxqk&address=" + input,
            strReturn;

        jQuery.ajax({
            url: strUrl,
            success: function(html) {
                strReturn = html;
            },
            async: false
        });

        if (strReturn == undefined) {
            //console.log("str undefined");
        } else if (strReturn.results[0] == undefined) {
            //console.log("results undefined");
        } else if (strReturn.results[0].geometry == undefined) {
            //console.log("geometry undefined");
        }

        if (strReturn.results[0] == undefined || strReturn == undefined || strReturn.results[0].geometry == undefined) {
            return [-100, -100, "Not Okay"];
        }

        return [strReturn.results[0].geometry.location.lng, strReturn.results[0].geometry.location.lat, strReturn.status];
    }
    d3.csv("large.csv", type, render);
}

function initDropdown() {
    var drowDown = $("#dropDown");
    dropDown.onchange = selectorChange;

    for (var i = 0; i < 6; ++i) {
        var classItem = document.createElement("option");
        classItem.innerHTML = "NPOPCHG201" + i;
        dropDown.appendChild(classItem);
    }
}

function selectorChange() {
    d3.select("svg").remove();
    init("NPOPCHG201" + (this.selectedIndex - 1));
}
