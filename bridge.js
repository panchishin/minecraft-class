var fs = require("fs");

var write = function(data) {
	process.stdout.write(data + "\n")
}


var nextExecute = {}

var time = function(){
    return Math.floor( new Date().getTime() / 1000 ) 
}

var executeCommand = function(command) {
	var name = command["name"]
	var delay = +command["delay in seconds"]
	var list = command["command list"]

	if ( nextExecute[name] > time() ) {
		return;
	}

	nextExecute[name] = time() + delay

	for( var index in list ) {
		write( list[index] )
	}
}

var updateCommands = function(commandFile) {
fs.readFile(commandFile, function(error,data) {
	var commands = JSON.parse(data)
	for( var index in commands ) {
		executeCommand(commands[index])
	}
})
}

var mainLoop = function() {
	updateCommands("minecraftcommands.json")
	setTimeout( mainLoop , 1000 );
}

mainLoop();


