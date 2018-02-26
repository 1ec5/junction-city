const svgNS = "http://www.w3.org/2000/svg";

const green = "#006B54";

let shields;

function simulate(options) {
	let simulation = document.getElementById("simulation");
	simulation.childNodes.forEach(function (child) {
		if (child.nodeName !== "defs") {
			simulation.removeChild(child);
		}
	});
	
	let exitTab = document.createElementNS(svgNS, "svg");
	exitTab.setAttribute("x", 0);
	exitTab.setAttribute("y", 0);
	exitTab.setAttribute("overflow", "visible");
	simulation.appendChild(exitTab);
	
	let backing = document.createElementNS(svgNS, "rect");
	backing.setAttribute("x", 0);
	backing.setAttribute("y", 0);
	backing.setAttribute("rx", 6);
	backing.setAttribute("ry", 6);
	backing.setAttribute("width", "100%");
	backing.setAttribute("height", "100%");
	backing.setAttribute("fill", green);
	backing.setAttribute("stroke", "white");
	backing.setAttribute("stroke-width", 2.5);
	exitTab.appendChild(backing);
	
	let exitLegend = document.createElementNS(svgNS, "text");
	exitLegend.setAttribute("x", 11);
	exitLegend.setAttribute("y", 7.5 + 15);
	exitLegend.setAttribute("font-family", "'Roadgeek 2014 Series E', 'Roadgeek 2005 Series E', 'Clearview'");
	exitLegend.setAttribute("fill", "white");
	exitTab.appendChild(exitLegend);
	
	let exitNumberValue = document.getElementById("exit").value;
	
	let exit = document.createElementNS(svgNS, "tspan");
	if (exitNumberValue.includes("-")) {
		exit.textContent = "Exits".toUpperCase();
	} else {
		exit.textContent = "Exit".toUpperCase();
	}
	exit.setAttribute("font-size", "10pt");
	exitLegend.appendChild(exit);
	
	let exitNumber = document.createElementNS(svgNS, "tspan");
	exitNumber.textContent = exitNumberValue;
	exitNumber.setAttribute("font-size", "15pt");
	exitNumber.setAttribute("dx", 15);
	exitLegend.appendChild(exitNumber);
	
	let exitTabBBox = exitLegend.getBBox();
	if (exitNumberValue.length) {
		exitTab.setAttribute("width", exitTabBBox.width + 11 * 2);
		exitTab.setAttribute("height", exitTabBBox.y + exitTabBBox.height + 7.5);
	} else {
		exitTab.setAttribute("width", 0);
		exitTab.setAttribute("height", 0);
	}
	exitTabBBox = exitTab.getBBox();
	
	let sign = document.createElementNS(svgNS, "svg");
	sign.setAttribute("x", 0);
	sign.setAttribute("y", 0);
	simulation.append(sign);
	
	sign.appendChild(backing.cloneNode());
	
	let shield = document.createElementNS(svgNS, "image");
	let y = 15.5;
	shield.setAttribute("x", "50%");
	shield.setAttribute("y", y);
	
	if (options.shieldImage) {
		shield.setAttribute("href", options.shieldImage.src);
		let shieldWidth = options.shieldImage.naturalWidth / options.shieldImage.naturalHeight * 48;
		shield.setAttribute("width", shieldWidth);
		shield.setAttribute("height", 48);
		let shieldTransform = sign.createSVGTransform();
		shieldTransform.setTranslate(-shieldWidth / 2, 0);
		shield.transform.baseVal.appendItem(shieldTransform);
	}
	
	sign.appendChild(shield);
	// TODO: Eliminate the 15px fudge factor.
	let shieldBBox = shield.getBBox();
	y = shieldBBox.y + shieldBBox.height + 15 + 15;
	
	let legends = document.createElementNS(svgNS, "text");
	legends.setAttribute("x", "50%");
	legends.setAttribute("y", y);
	legends.setAttribute("font-family", "'Roadgeek 2014 Series EM', 'Roadgeek 2005 Series EM', 'Clearview'");
	legends.setAttribute("font-size", "20pt");
	legends.setAttribute("fill", "white");
	sign.appendChild(legends);
	
	let destinations = document.getElementById("destination").value.split("\n");
	destinations.forEach(function (destination, idx) {
		let legend = document.createElementNS(svgNS, "tspan");
		legend.textContent = destination;
		legend.setAttribute("x", "50%");
		if (idx) {
			legend.setAttribute("dy", "1em");
		} else {
			legend.setAttribute("y", y);
		}
		legend.setAttribute("text-anchor", "middle");
		legends.appendChild(legend);
	});
	let legendsBBox = legends.getBBox();
	
	let arrow = document.createElementNS(svgNS, "use");
	arrow.setAttribute("href", "#arrowPath");
	arrow.setAttribute("x", "50%");
	arrow.setAttribute("y", legendsBBox.y + legendsBBox.height + 9);
	arrow.setAttribute("width", 28);
	arrow.setAttribute("height", 28);
	let arrowTransform = sign.createSVGTransform();
	arrowTransform.setTranslate(-28 / 2, 0);
	arrow.transform.baseVal.appendItem(arrowTransform);
	sign.appendChild(arrow);
	
	//console.log(legends.getComputedTextLength());
	
	sign.setAttribute("y", exitTabBBox.y + exitTabBBox.height);
	let arrowBBox = arrow.getBBox();
	sign.setAttribute("width", legendsBBox.width + 22 * 2);
	sign.setAttribute("height", legendsBBox.y + legendsBBox.height + 15 + arrowBBox.height + 9);
	sign.setAttribute("overflow", "visible");
	let signBBox = sign.getBBox();
	
	exitTab.setAttribute("x", signBBox.x + signBBox.width - exitTabBBox.width);
	exitTabBBox = exitTab.getBBox();
	
	let shadowPadding = 4;
	simulation.setAttribute("width", signBBox.width + shadowPadding);
	simulation.setAttribute("height", signBBox.y + signBBox.height + shadowPadding);
	simulation.setAttribute("viewBox", `${-shadowPadding} ${-shadowPadding} ${signBBox.width + shadowPadding * 2} ${exitTabBBox.y + exitTabBBox.height + signBBox.height + shadowPadding * 2}`);
	simulation.setAttribute("filter", "url(#signShadow)");
}

addEventListener("load", function () {
	let shieldsRequest = new XMLHttpRequest();
	shieldsRequest.responseType = "json";
	shieldsRequest.addEventListener("load", function () {
		shields = shieldsRequest.response;
		
		let simulateButton = document.getElementById("simulate");
		simulateButton.disabled = false;
		simulateButton.addEventListener("click", function () {
			let refs = document.getElementById("ref").value.split("\n");
			let shieldImage;
			if (refs[0].length) {
				let ref = refs[0].match(/^(\w+)[ -](\w+)/) || [];
				let shieldFileName = shields[ref[1]].replace('{ref}', ref[2]);
				if (shieldFileName.length) {
					shieldImage = new Image(48, 48);
					shieldImage.src = "https://commons.wikimedia.org/wiki/Special:Redirect/file/" + shieldFileName;
					shieldImage.addEventListener("load", function () {
						simulate({
							shieldImage: shieldImage,
						});
					});
				}
			}
			if (!shieldImage) {
				simulate({});
			}
		});
	});
	shieldsRequest.open("GET", "shields.json");
	shieldsRequest.send();
});
