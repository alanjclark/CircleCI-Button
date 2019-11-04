var http = require('http');
var fs = require("fs");

http.createServer(function (req, res) {
    fs.readFile("button.html", function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
//        res.write(data);
        res.write('<div style="text-align: center;">');
        res.write('<h2>CircleCI Button Test</h2>');
        res.write('<button type="button" onClick="getElementById(\'click\').innerHTML = \'You clicked the button!\'">Clicky Button</button>');
        res.write('<p id="click"></p>');
        res.end();
    })
}).listen(8002);
