
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
require("fs").readFile(commandFile, function(error,data) {
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

setTimeout( mainLoop , 30000 );




var onlyInfoNoChat = require('through').through(
	function write( buffer ) {
		if ( buffer.toString().match(/^\[..:..:..\] \[Server thread\/INFO\]: ([^<].*)$/) ) {
			this.queue( buffer.toString().replace(/^.*INFO.: /,"") + "\n" )
		}
	}
)

var welcomeAndDeath = require('through').through(
	function write( buffer ) {
		var input = buffer.toString()
		var user = input.replace(/ .*/,"")
		var action = input.replace(/^[^ ]* /,"")

		var queue = this.queue

		if ( action.match(/joined the game/) ) {
			delay( function() {
				queue("title " + user + " title \"Welcome\"\n")
			} )
		}
		
		if ( action.match(/(fell from|tried to|was ).*/) ) {
			delay( function() {
				queue("title " + user + " title \"You foolishly died\"\n")
				queue("effect " + user + " minecraft:weakness 2 1200\n")
				queue("effect " + user + " minecraft:hunger 1 5\n")
				queue("effect " + user + " minecraft:nausea 1 5\n")
			} )
		}
	}
)

var delay = function( handler ) {
	setTimeout( function() {
		handler()
	} , 5000 )
}

process.stdin
	.pipe( require('split')() )
	.pipe( onlyInfoNoChat )
	.pipe( require('split')() )
	.pipe( welcomeAndDeath )
	.pipe( process.stdout )




