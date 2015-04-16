var response = function(inStream,outStream,configFile,delayOverride) {

var commandScript = require("./commandScript.js")

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

		commandScript("response.json",user,process.stdout,action)
	}
)

inStream
	.pipe( require('split')() )
	.pipe( onlyInfoNoChat )
	.pipe( require('split')() )
	.pipe( welcomeAndDeath )

}

module.exports = response;



