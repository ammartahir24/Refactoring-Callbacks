"use strict";

var http = require("http"), director = require("director");

var React = require("react");

var ReactDOMServer = require("react-dom/server");

require("node-jsx").install({
    extension: ".jsx"
});

var StaticPageCreator = require("./server-side");

var createIndex = require("./index-docs");

var cleanName = require("./clean-name");

function startServer(e, t) {
    var r = e.file.readJSON(t), a = createIndex(r), s = a.pages, n = {
        data: r,
        index: a
    };
    function i(e, t) {
        t = t || cleanName(e) + ".html";
        n.selector = e;
        var r = React.createElement(StaticPageCreator.create(), n);
        var a = ReactDOMServer.renderToStaticMarkup(r);
        if (s[e]) {
            var i = s[e].main.name;
        } else {
            var i = e || t;
        }
        a = "<head><title>" + i + "</title>" + " <link type='text/css' rel='stylesheet' href='http://craftyjs.com/craftyjs-site.css'/>" + " <link type='text/css' rel='stylesheet' href='http://craftyjs.com/github.css'/>" + " <link type='text/css' rel='stylesheet' href='dev.css' />" + "</head>" + "<body><div id='main'><div id='content' class='container'>" + a + "</div></div></body>";
        return a;
    }
    var c = new director.http.Router();
    var d = http.createServer(function(e, t) {
        c.dispatch(e, t, function(e) {
            if (e) {
                this.res.writeHead(200, {
                    "Content-Type": "text/html"
                });
                this.res.end(i("index"));
            }
        });
    });
    c.path(/(.*)dev\.css/, function() {
        this.get(function() {
            this.res.writeHead(200, {
                "Content-Type": "text/css"
            });
            this.res.end(".returns-qualifier, .param-qualifier {color: #36597d}");
        });
    });
    c.path(/(.+)\.html/, function() {
        this.get(function(e) {
            this.res.writeHead(200, {
                "Content-Type": "text/html"
            });
            this.res.end(i(e));
        });
    });
    console.log("Starting api server");
    d.listen(8080);
}

var module_exports = startServer;
