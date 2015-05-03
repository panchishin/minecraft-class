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
	var responseDelay = command["response delay"]
	var delayHandler = responseDelay ?
		function( handler ) { setTimeout( function() { handler() } , responseDelay * 1000 ) } :
		function( handler ) { handler() }
	

	if ( selector && action && !action.match(selector) ) { return false }

	if ( nextExecute[name + " - " + user] > time() ) { 
		if ( user && selector.match(/^.?say /) ) {
			out.write( "tellraw " + user + " \"wait another " + ( nextExecute[name + " - " + user] - time() ) + " seconds to " + action + "\"\n" )
		}
		return false 
	}

	nextExecute[name + " - " + user] = time() + delay

	delayHandler( function() {
		for( var index in list ) {
			var output = list[index]
			if ( typeof(output) == "object" ) {
				output = output[Math.floor( Math.random() * output.length )]
			}
			if ( typeof(output) == "string" ) {
				output = [ output ]
			}
			for ( var outputIndex in output ) {
				out.write( output[outputIndex].replace(/USER_NAME/g,user) + "\n" )
			}
		}
	})
	return true;
}

var commandFileCache = {};
var getFile = function(commandFile,defaultValue) {
	if ( !commandFileCache[commandFile] ) {
		commandFileCache[commandFile] = {
			content : defaultValue,
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
//	if ( commandFileCache[commandFile].lastWrite < time() ) {
//		commandFileCache[commandFile].lastWrite = time() + 10
		require("fs").writeFile( commandFile , JSON.stringify(content) )
//	}
}

var updateCommands = function(commandFile, user, out, action) {

	var nextExecute = getFile(HISTORY_FILE_NAME + commandFile,{})
	out = ( out ? out : process.stdout )
	var commands = getFile(SCRIPT_FILE_NAME + commandFile,[])
	var updated = false
	for( var index in commands ) {
		updated = executeCommand(commands[index], (user?user:""), out, nextExecute, action) || updated
	}
	if (updated) { writeFile(HISTORY_FILE_NAME + commandFile , nextExecute ) }
}


module.exports = updateCommands;


