var SCRIPT_FILE_NAME = "scripts/"
var HISTORY_FILE_NAME = "scripts/history/"
var time = function(){
	return Math.floor( new Date().getTime() / 1000 ) 
}

var executeCommand = function(command,user,out,nextExecute,action) {
	var name = command["name"]
	var delay = +command["delay in seconds"]
	var list = command["command list"]
	var selector = command["selector"]

	if ( selector && action && !action.match(selector) ) {
		return;
	}

	if ( nextExecute[name + " - " + user] > time() ) {
		return;
	}

	nextExecute[name + " - " + user] = time() + delay

	for( var index in list ) {
		out.write( list[index].replace("USER_NAME",user) + "\n" )
	}
}

var commandFileCache = {};
var getCommands = function(commandFile) {	
	if ( !commandFileCache[commandFile]  ||  commandFileCache[commandFile].time < time() ) {
		commandFileCache[commandFile] = { 
			command : JSON.parse( require("fs").readFileSync(commandFile) ),
			time : time() + 10
		}
	}
	return commandFileCache[commandFile].command
}

var updateCommands = function(commandFile, user, out, action) {
	var nextExecute = {};
	try {
		nextExecute = JSON.parse( require("fs").readFileSync( HISTORY_FILE_NAME + commandFile ) )
	} catch (e) { }
	out = ( out ? out : process.stdout )
	var commands = getCommands(SCRIPT_FILE_NAME + commandFile)
	for( var index in commands ) {
		executeCommand(commands[index], (user?user:""), out, nextExecute, action)
	}
	require("fs").writeFile( HISTORY_FILE_NAME + commandFile , JSON.stringify(nextExecute) )
}


module.exports = updateCommands;


