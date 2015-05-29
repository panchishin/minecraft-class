var net = require("net")
var portNumber = process.argv[2]

var file = require("./file.js")
var auction = require("./auction.js")
var AUCTON_FILE_NAME = "scripts/history/auction.json"
auction.inventory = file.read(AUCTON_FILE_NAME,auction).inventory
auction.basePrice = file.read(AUCTON_FILE_NAME,auction).basePrice

var http = require('http')

var server = http.createServer( function ( request, response ) {
  response.writeHead(200, {'Content-Type': 'text/json'});
  response.end( JSON.stringify(	auction.list(".") ) )
})

/*
var server = net.createServer( function( socket ) {
  socket.end( JSON.stringify(	auction.list(".") ) )
})
*/

server.listen( portNumber )
