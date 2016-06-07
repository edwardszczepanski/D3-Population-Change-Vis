$(function() {
	unitsPerPixel = 0.5;
	HashMap = function(){
		this._dict = [];
	}
	HashMap.prototype._get = function(key){
		for(var i=0, couplet; couplet = this._dict[i]; i++){
			if(couplet[0] === key){
				return couplet;
			}
		}
	}
	HashMap.prototype.put = function(key, value){
		var couplet = this._get(key);
		if(couplet){
			couplet[1] = value;
		} else{
			this._dict.push([key, value]);
		}
		return this; // for chaining
	}
	HashMap.prototype.get = function(key){
		var couplet = this._get(key);
		if(couplet){
			return couplet[1];
		}
	}
	map = new HashMap();

	if (localStorage.getItem("geoData") != undefined) {
		var tempMap = JSON.parse(localStorage.getItem("geoData"));
		for (var i = 0; i < tempMap._dict.length; ++i) {
			map.put(tempMap._dict[i][0], [tempMap._dict[i][1][0], tempMap._dict[i][1][1]]);
		}
	}

	initDropdown();
	var slide = document.getElementById('slide');
	slide.oninput = change;
	function change () {
		unitsPerPixel = 1 / this.value;
		if (($('select[name="dropDown"]')[0].selectedIndex) != 0) {
			d3.select("svg").remove();
			init("NPOPCHG201" + ($('select[name="dropDown"]')[0].selectedIndex - 1));
		}
	};
});

var init = function (inputParameter) {
	var locationInput = "NAME";
	var sizeInput = inputParameter;

	var innerWidth  = $(window).width();
	var innerHeight = $(window).height() - 100;

	console.log("Inner Width: " + innerWidth + " Inner Height: " + innerHeight);

	var margin = { left: 50, top: 50};

	document.getElementById("circleSize").innerHTML = (Math.round((1 / unitsPerPixel) * 100) / 100 + " Pixels Represents a Change in 1 Person");

	var svg = d3.select("body").append("svg")
	.attr("width",  innerWidth)
	.attr("height", innerHeight);

	var g = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	function render(data){

		var xScale = d3.scale.linear().domain([-124.85, -66.80]).range([0, innerWidth - margin.left]);
		var yScale = d3.scale.linear().domain([24.40, 49.38]).range([innerHeight - margin.top, 0]);

		var unitsMax = d3.max(data, function (d){
			return Math.abs(d[inputParameter]);
		});
		var rScale = d3.scale.sqrt().domain([0, unitsMax]).range([0,Math.sqrt(unitsMax / (unitsPerPixel * Math.PI))]);

		var circles = g.selectAll("circle").data(data);
		circles.enter().append("circle");
		circles
		.attr("cx", function (d){
			if (map.get(d[locationInput]) != null) {
				if (isNaN(+map.get(d[locationInput])[0])){
					console.log("X-Coordinate Value in map is not a number!");
					return -100;
				} else {
					//return +map.get(d[locationInput])[0];
					return +xScale(+map.get(d[locationInput])[0]);
				}
			} else {
				console.log("Checking " + d["NAME"]);
				var localCheck = getCoordinates(d[locationInput]);
				if (localCheck != undefined) {
					if (localCheck[2] == "OK") {
						map.put(d[locationInput], [+localCheck[0], +localCheck[1]]);
						localStorage.setItem("geoData", JSON.stringify(map));
						return +xScale(+map.get(d[locationInput])[0]);
					}
				}
			}
		})
		.attr("cy", function (d){
			if (map.get(d[locationInput]) != null) {
				if (isNaN(+map.get(d[locationInput])[1])){
					console.log("Size Value in map is not a number!");
					return -100;
				} else {
					//return +map.get(d[locationInput])[1];
					return +yScale(+map.get(d[locationInput])[1]);
				}
			} else {
				console.log("Something went very wrong");
			}
		})
		.attr("r",  function (d){
			if (isNaN(+rScale(d[sizeInput]))){
				return 0;
			} else {
				return rScale(Math.abs(d[sizeInput]));
			}
		})
		.attr("id", function (d){ return d["NAME"] + ", " + d["NPOPCHG2010"]; })
		.attr("fill", function (d) {
			if (d[inputParameter] > 0) {
				return "blue";
			} else {
				return "red";
			}
		})
		.attr("stroke", "none");
		circles.exit().remove();
	}

	function type(d){
		d.trans_face_val_amt = +d.trans_face_val_amt;
		return d;
	}

	function getCoordinates(input) {
		if (input == null || input == "" || input == undefined) {
			return;
		}
		var strUrl = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBHPWGDrjRFk59k_FYuiujNmJo4APmKxqk&address=" + input, strReturn;

		jQuery.ajax({
			url: strUrl,
			success: function(html) {
				strReturn = html;
			},
			async:false
		});

		if (strReturn == undefined) {
			console.log("str undefined");
		} else if (strReturn.results[0] == undefined) {
			console.log("results undefined");
		} else if (strReturn.results[0].geometry == undefined) {
			console.log("geometry undefined");
		}

		if (strReturn.results[0] == undefined || strReturn == undefined || strReturn.results[0].geometry == undefined) {
			return [-100, -100, "Not Okay"];
		}

		return [strReturn.results[0].geometry.location.lng, strReturn.results[0].geometry.location.lat, strReturn.status];
	}
	d3.csv("medium.csv", type, render);
}

function initDropdown () {
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
	init("NPOPCHG201" + (this.selectedIndex -1));
}
