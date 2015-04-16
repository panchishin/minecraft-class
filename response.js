//	require("./commandScript.js")("periodic.json", "", process.stdout)

var response = function(inStream,outStream,configFile,delayOverride) {

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

		var delay = delayOverride ? delayOverride : function( handler ) {
			setTimeout( function() {
				handler()
			} , 5000 )
		}

		if ( action.match(/^joined the game/) ) {
			delay( function() {
				outStream.write("title " + user + " title \"Welcome\"\n")
			} )
		}
		
		if ( action.match(/^(fell from|tried to|was )/) ) {
			delay( function() {
				outStream.write("title " + user + " title \"You foolishly died\"\n")
				outStream.write("effect " + user + " minecraft:weakness 2 1200\n")
				outStream.write("effect " + user + " minecraft:hunger 1 5\n")
				outStream.write("effect " + user + " minecraft:nausea 1 5\n")
			} )
		}
	}
)

inStream
	.pipe( require('split')() )
	.pipe( onlyInfoNoChat )
	.pipe( require('split')() )
	.pipe( welcomeAndDeath )

}

module.exports = response;



