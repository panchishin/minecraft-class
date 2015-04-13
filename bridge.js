var fs = require("fs");

var write = function(data) {
	process.stdout.write(data + "\n")
}

var executeCommand = function(command) {
	write("The command is " + JSON.stringify(command) )
}

var updateCommands = function(commandFile) {
fs.readFile(commandFile, function(error,data) {
	var commands = JSON.parse(data)
	for( var index in commands ) {
		executeCommand(commands[index])
	}
})
}

updateCommands("minecraftcommands.json")

