
var time = function(){
	return Math.floor( new Date().getTime() / 1000 ) 
}

var auctionAction = {}

var commandFileCache = {}

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
	commandFileCache[commandFile].content = content
	commandFileCache[commandFile].time = time() + 10
	require("fs").writeFile( commandFile , JSON.stringify(content) )
}

module.exports = { write : writeFile , read : getFile }


