let buttonSpot = document.getElementById("assignments");
let assignList = [
"Assignment1","Assignment2","Assignment3","Assignment4","Assignment5"];

for(let i = 0; i < assignList.length; i++){
	      let add = "<li><a href='../"+assignList[i]+"/index.html'>" +assignList[i]+ "</a></li>";
		  buttonSpot.insertAdjacentHTML('beforeend', add);
}