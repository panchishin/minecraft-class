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

	if ( selector && action && !action.match(selector) ) { return }

	if ( nextExecute[name + " - " + user] > time() ) { return }

	nextExecute[name + " - " + user] = time() + delay

	for( var index in list ) {
		out.write( list[index].replace("USER_NAME",user) + "\n" )
	}
}

var commandFileCache = {};
var getFile = function(commandFile,defaultValue) {
	if ( !commandFileCache[commandFile] ) {
		commandFileCache[commandFile] = {
			content : undefined,
			time : 0,
			lastWrite : 0
		}
	}
	if ( commandFileCache[commandFile].time < time() ) {
		var content = defaultValue;
		try {
			content = JSON.parse( require("fs").readFileSync(commandFile) )
		} catch( e ) { }
			
		commandFileCache[commandFile].content = content
		commandFileCache[commandFile].time = time() + 10
	}
	return commandFileCache[commandFile].content
}

var writeFile = function(commandFile,content) {
	if ( commandFileCache[commandFile].lastWrite < time() ) {
		commandFileCache[commandFile].lastWrite = time() + 10
		require("fs").writeFile( commandFile , JSON.stringify(content) )
	}
}

var updateCommands = function(commandFile, user, out, action) {
	var nextExecute = getFile(HISTORY_FILE_NAME + commandFile, {} );
	out = ( out ? out : process.stdout )
	var commands = getFile(SCRIPT_FILE_NAME + commandFile,[])
	for( var index in commands ) {
		executeCommand(commands[index], (user?user:""), out, nextExecute, action)
	}
	writeFile(HISTORY_FILE_NAME + commandFile , nextExecute )
}


module.exports = updateCommands;


