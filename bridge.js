var periodicLoop = function() {
	require("./commandScript.js")("periodic.json", "", process.stdout)
	setTimeout( periodicLoop , 1000 );
}

setTimeout( periodicLoop , 30 * 1000 );

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

		var delay = function( handler ) {
			setTimeout( function() {
				handler()
			} , 5000 )
		}

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

process.stdin
	.pipe( require('split')() )
	.pipe( onlyInfoNoChat )
	.pipe( require('split')() )
	.pipe( welcomeAndDeath )
	.pipe( process.stdout )




