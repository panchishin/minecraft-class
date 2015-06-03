var SCRIPT_FILE_NAME = "scripts/"
var HISTORY_FILE_NAME = "scripts/history/"
var AUCTON_FILE_NAME = "scripts/history/auction.json"

var file = require("./file.js")
var auction = require("./auction.js")

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

var auctionAction = {}


var executeCommand = function(command,user,out,nextExecute,action) {
	action = action ? action : ""
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
	var param1 = action.replace(/[^ ]* /,"")

	if ( action.match(/score of TradeSuccess for player/) ) {

		var base = action.replace(/.*score of TradeSuccess for player /,"")
		user = base.replace(/ .*/,"")
		var transaction = base.replace(/^[^ ]* to /,"")
		if ( auctionAction[user] ) {
			if ( transaction == 1 ) {
				auction.buy( auctionAction[user] )
			} else {
				auction.sell( auctionAction[user] )
			}
		}
		file.write(AUCTON_FILE_NAME,auction)
		delete auctionAction[user]
	}

	var price = 0;
	if ( action.match(/^sell /) ) {
		price = auction.buyPrice(param1)
		if ( price <= 0 ) {
			param1 = "error"
			out.write( "tellraw " + user + " \"It's worthless right now.\\nTry again after someone buys some.\"\n" )
		} else {
			auctionAction[user] = param1
		}
	}
	if ( action.match(/^buy /) ) {
		price = auction.sellPrice(param1)
		if ( auction.inventory[param1].count <= 0 ) {
			price = 2147483647
			out.write( "tellraw " + user + " \"All out of stock.\\nTry again after someone sells some to the store.\"\n" )
		}
		auctionAction[user] = param1
	}
	if ( action.match(/^price/) ) {
		var list = auction.list( param1 != action ? param1 : "" )
		for ( var index in list ) {
			out.write( "tellraw " + user + " \"" + list[index] + "\"\n")
		}
	}
	if ( action.match(/^high/) ) {
		var list = auction.list( param1 != action ? param1 : "." ).sort( function( a , b ) {
			var nb = b.replace(/^[^0-9]+([0-9]+).*/g,"$1")
			var na = a.replace(/^[^0-9]+([0-9]+).*/g,"$1")
			return (na - nb)
		})
		for ( var index in list ) {
			out.write( "tellraw " + user + " \"" + list[index] + "\"\n")
		}
	}
	if ( action.match(/^low/) ) {
		var list = auction.list( param1 != action ? param1 : "." ).sort( function( a , b ) {
			var nb = b.replace(/^[^0-9]+([0-9]+).*/g,"$1")
			var na = a.replace(/^[^0-9]+([0-9]+).*/g,"$1")
			return (nb - na)
		})
		for ( var index in list ) {
			out.write( "tellraw " + user + " \"" + list[index] + "\"\n")
		}
	}

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
				out.write( output[outputIndex].replace(/PRICE/g,price).replace(/USER_NAME/g,user).replace(/ACTION/g,action).replace(/PARAM1/g,param1).replace(/ARGUMENT/g,argument).replace(/COORDINATES/g,coordinates) + "\n" )
			}
		}
	})

	return true;
}

var updateCommands = function(commandFile, user, out, action) {

	var nextExecute = file.read(HISTORY_FILE_NAME + commandFile,{})
	out = ( out ? out : process.stdout )
	var commands = file.read(SCRIPT_FILE_NAME + commandFile,[])
	var updated = false
	for( var index in commands ) {
		updated = executeCommand(commands[index], (user?user:""), out, nextExecute, action) || updated
	}
	if (updated) { file.write(HISTORY_FILE_NAME + commandFile , nextExecute ) }
}

auction.inventory = file.read(AUCTON_FILE_NAME,auction).inventory
auction.basePrice = file.read(AUCTON_FILE_NAME,auction).basePrice

module.exports = updateCommands;


