const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const rInput = document.getElementById("rValue");
const oInput = document.getElementById("oValue");
const stepInput = document.getElementById("speed");
const lineColor = document.getElementById("lineColor"); 
const randomColorButton = document.getElementById("randomColor");
const randomRButton = document.getElementById("randomR");
const randomOButton = document.getElementById("randomO");


const errorMessage = document.getElementById("errorMessage");


const R = 150;
let t = 0;
let animationId = null;
let isDrawing = false;
let step = 0.01;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;



function validateR() {

    let r = Number(rInput.value);

    if (isNaN(r) || r <= 0) {
        r = 1;
        rInput.value = r;
        errorMessage.textContent = "r must be greater than 0.";
        return false;
    }

    if (r >= R) {
        r = R - 1;
        rInput.value = r;
        errorMessage.textContent = "r cannot be greater than or equal to R (150).";
        return false;
    }

    errorMessage.textContent = "";
    return true;
}



function getR() {
    validateR();
    return Number(rInput.value);
}



function getO() {
    let O = Number(oInput.value);
    if (isNaN(O)) {
        O = 0;
        oInput.value = O;
    }
    return O;
}



function calculateX(t, r, O) {
    return ((R+r)*Math.cos(t)-(r+O) * Math.cos(((R+r)/r)*t));
}

function calculateY(t, r, O) {
	return ((R+r)* Math.sin(t)-(r+O) * Math.sin(((R+r)/r)*t));
}



function calculateEndTime(r) { // AI assisted to determine when drawing is done

    // Scale values to handle decimal input
    const scale = 1000;
    let a = Math.round(R * scale);
    let b = Math.round(r * scale);

    function gcd(x, y) {
        while (y !== 0) {
            let temp = y;
            y = x % y;
            x = temp;
        }
        return x;
    }

    const greatestCommonDivisor = gcd(a, b);
	
    return (2 * Math.PI * b / greatestCommonDivisor);
}



function drawSpirograph() {

    const r = getR();
    const O = getO();
    const x = calculateX(t, r, O);
    const y = calculateY(t, r, O);
	
    ctx.lineTo(centerX + x,centerY + y);
    ctx.stroke();
    t += Number(stepInput.value);
	
    const endTime = calculateEndTime(r);
    if (t >= endTime) {
        finishDrawing();
        return;
    }
    animationId = requestAnimationFrame(drawSpirograph);
}



function startDrawing() {

    if (!validateR()) {
        return;
    }

    const r = getR();
    const O = getO();
	rInput.disabled = true;
	oInput.disabled = true;
	
    ctx.clearRect(0,0,canvas.width,canvas.height);
    t = 0;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = lineColor.value;

    const firstX = calculateX(t, r, O);
    const firstY = calculateY(t, r, O);

    ctx.moveTo(centerX + firstX,centerY + firstY);
    isDrawing = true;


    startButton.classList.add("below-canvas");
    startButton.textContent = "Stop Drawing";
    animationId = requestAnimationFrame(drawSpirograph);
}






function finishDrawing() {
    cancelAnimationFrame(animationId);
    animationId = null;
    isDrawing = false;
	rInput.disabled = false;
	oInput.disabled = false;
    startButton.textContent = "Redraw";
    startButton.classList.remove("below-canvas");
}

function stopDrawing() {
	finishDrawing();
    ctx.clearRect(0,0,canvas.width,canvas.height);
	startButton.textContent = "Start Drawing";

}



startButton.addEventListener("click", function () {
    if (isDrawing) {
        stopDrawing();
    } else {
        startDrawing();
    }
});



randomRButton.addEventListener("click", function () {
		if(isDrawing){
			return;
		}
    const randomR = Math.floor(Math.random() * (R - 1)) + 1;
    rInput.value = randomR;
    errorMessage.textContent = "";
});



randomOButton.addEventListener("click", function () {
		if(isDrawing){
			return;
		}
    const randomO = Math.floor(Math.random() * 100) + 1;
    oInput.value = randomO;
});


rInput.addEventListener("input", function () {
    validateR();
});

randomColorButton.addEventListener( "click", function () { 
const randomColor = Math.floor( Math.random() * 16777216 ) .toString(16) .padStart(6, "0"); 
lineColor.value = "#" + randomColor; 
ctx.strokeStyle = lineColor.value;

});
lineColor.addEventListener( "input", function () { 
ctx.strokeStyle = lineColor.value;
});