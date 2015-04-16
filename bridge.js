var periodicLoop = function() {
	require("./commandScript.js")("periodic.json", "", process.stdout)
	setTimeout( periodicLoop , 1000 );
}

setTimeout( periodicLoop , 30 * 1000 );

require("./response.js")(process.stdin,process.stdout,"process.json", function(handler) { handler() } );



