var HISTORY_FILE_NAME = "scripts/history/"
var SCRIPT_FILE_NAME = "scripts/"

var executeCommand = function(command,user,out,nextExecute) {
	var time = function(){
	    return Math.floor( new Date().getTime() / 1000 ) 
	}
	var name = command["name"]
	var delay = +command["delay in seconds"]
	var list = command["command list"]

	if ( nextExecute[name + " - " + user] > time() ) {
		return;
	}

	nextExecute[name + " - " + user] = time() + delay

	for( var index in list ) {
		out.write( list[index].replace("USER_NAME",user) + "\n" )
	}
}

var updateCommands = function(commandFile, user, out) {
	var nextExecute = {};
	try {
		nextExecute = JSON.parse( require("fs").readFileSync( HISTORY_FILE_NAME + commandFile ) )
	} catch (e) { }
	out = ( out ? out : process.stdout )
	var commands = JSON.parse( require("fs").readFileSync(SCRIPT_FILE_NAME + commandFile) )
	for( var index in commands ) {
		executeCommand(commands[index], (user?user:""), out, nextExecute)
	}
	require("fs").writeFile( HISTORY_FILE_NAME + commandFile , JSON.stringify(nextExecute) )
}


module.exports = updateCommands;


