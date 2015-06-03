
var file = require("./file.js")

console.log( file.read("./scripts/periodic.json") ? "periodic : pass" : "periodic : FAIL" )
console.log( file.read("./scripts/response.json") ? "response : pass" : "response : FAIL" )

