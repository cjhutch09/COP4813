let chart;


const plotButton = document.getElementById("plotButton");


plotButton.addEventListener("click", plotEquation);


function plotEquation() {

    const A = parseFloat(document.getElementById("a").value);
    const B = parseFloat(document.getElementById("b").value);
    const C = parseFloat(document.getElementById("c").value);
    const D = parseFloat(document.getElementById("d").value);
    const xmin = parseFloat(document.getElementById("xmin").value);
    const xmax = parseFloat(document.getElementById("xmax").value);
	
	if(parseFloat(document.getElementById("steps").value) < document.getElementById("steps").min){
		document.getElementById("steps").value = document.getElementById("steps").min;
	}else if(parseFloat(document.getElementById("steps").value) > document.getElementById("steps").max){
		document.getElementById("steps").value = document.getElementById("steps").max;
	}
    const step = parseFloat(document.getElementById("steps").value);
	const pointSize = parseFloat(document.getElementById("ptsz").value);



    if (chart) {
        chart.destroy();
    }

    if (xmin >= xmax) {

        document.getElementById("result").textContent =
            "Error: X Minimum must be smaller than X Maximum.";

        return;
    }


    const xValues = [];
    const yValues = [];



    for (let x = xmin; x <= xmax; x += step) {


        const y =
            A * Math.sin(B * x) +
            C * Math.cos(D * x);

        xValues.push(x.toFixed(1));
        yValues.push(y);
		if(x + step > xmax && x != xmax){
			x = xmax-step; // force max value to be plotted
		}
    }


    const canvas = document
        .getElementById("myChart")
        .getContext("2d");


    chart = new Chart(canvas, {
        type: "line",
        data: {
            labels: xValues,
            datasets: [
                {
                    label: "y = A sin(Bx) + C cos(Dx)",
                    data: yValues,
                    borderWidth: 2,
                    pointRadius: pointSize,
                    fill: false
                }
            ]
        },

        options: {
            responsive: true,
            scales: {
                x: {
					type: 'linear',
                    title: {
                        display: true,
                        text: "X"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Y"
                    }
                }
            },

        }
    });


    document.getElementById("result").textContent =
        "Graph generated using: " +
        "y = " +  A + " sin(" + B + "x) + " + C + " cos(" + D + "x)";
}


plotEquation();