var SCRIPT_FILE_NAME = "scripts/"
var HISTORY_FILE_NAME = "scripts/history/"

var time = function(){
	return Math.floor( new Date().getTime() / 1000 ) 
}

var tellTime = function( seconds ) {
	if ( seconds <= 1 ) { return "a second" }
	if ( seconds < 60 ) { return seconds + " seconds" }
	var minutes = Math.round( seconds / 60 )
	if ( minutes == 1 ) { return "a minute" }
	if ( minutes < 60 ) { return minutes + " minutes" }
	return "a long time"
}


var encodeNumber = function( num ) { if (num == "-" ) { num = 10 } if (num == " ") { num = 11 }  num = 1.0 * num; if (num > 11 || num < 0) { return "" } return String.fromCharCode( 97 + num ) }
var decodeChar = function( char ) { var num = char.charCodeAt(0) - 97; if (num == 10 ) { return "-" } if ( num == 11 ) { return " " } if ( num < 0 || num > 11 ) { return "" }  return num; }

var encodeNumbers = function( numbers ) {  var output = "" ; for( var i = 0 ; i < numbers.length ; i++ ) { output += encodeNumber(numbers[i]) } return (output) }
var decodeChars = function( chars ) {  var output = "" ; for( var i = 0 ; i < chars.length ; i++ ) { output += decodeChar(chars[i]) } return (output) }


var executeCommand = function(command,user,out,nextExecute,action) {
	var name = command["name"]
	var delay = +command["delay in seconds"]
	var list = command["command list"]
	var selector = command["selector"]
	var coordinates = action ? encodeNumbers( action.replace(/^.* to /,"").replace(/,/g,"").replace(/\]/,"").replace(/\.[0-9]*/g,"") ) : ""
	var argument = action ? decodeChars( action.replace(/^say [^ ]+ /,"") ) : ""
	var responseDelay = command["response delay"]
	var delayHandler = responseDelay ?
		function( handler ) { setTimeout( function() { handler() } , responseDelay * 1000 ) } :
		function( handler ) { handler() }
	

	if ( selector && action && !action.match(selector) ) { return false }

	if ( nextExecute[name + " - " + user] > time() ) { 
		if ( user && selector.match(/^.?say /) ) {
			out.write( "tellraw " + user + " \"wait " + tellTime( ( nextExecute[name + " - " + user] - time() ) ) + " to " + action + " again.\"\n" )
		}
		return false 
	}

	nextExecute[name + " - " + user] = time() + delay

	action = action ? action.replace(/^say /,"") : ""

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
				out.write( output[outputIndex].replace(/USER_NAME/g,user).replace(/ACTION/g,action).replace(/ARGUMENT/g,argument).replace(/COORDINATES/g,coordinates) + "\n" )
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
	require("fs").writeFile( commandFile , JSON.stringify(content) )
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


