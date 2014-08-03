(function(global) {
"use strict";

// --- dependency modules ----------------------------------
var Reflection = global["Reflection"];
var Console    = global["Console"];

// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- class / interfaces ----------------------------------
function Help(target,      // @arg Function|String - function or function-path or search keyword.
              highlight) { // @arg String = ""     - code highlight.
                           // @desc quick online help.
//{@dev
    _if(!/string|function/.test(typeof target),     Help, "target");
    _if(!/string|undefined/.test(typeof highlight), Help, "highlight");
//}@dev

    var resolved  = Reflection["resolve"](target);
    var search    = Reflection["getSearchLink"](resolved["path"]);
    var reference = Reflection["getReferenceLink"](resolved["path"]);

    _syntaxHighlight(resolved["fn"] + "", highlight);
    Console["link"](search["url"], search["title"]);
    if (reference) {
        Console["link"](reference["url"], reference["title"]);
    }
}

//{@dev
Help["repository"] = "https://github.com/uupaa/Help.js";
//}@dev

_defineGetter();

// --- implements ------------------------------------------
function _syntaxHighlight(code,   // @arg String
                          hint) { // @arg String = ""
    if ( Console["isEnabledStyle"]() ) {
        console.log.apply(console, Reflection["syntaxHighlight"](code, hint));
    } else {
        console.log(code);
    }
}

function _defineGetter() {
    Object.defineProperty(Function["prototype"], "help", {
        get: function() { Help(this); },
        configurable: true
    });
    Object.defineProperty(String["prototype"], "help", {
        get: function() { Help(this); },
        configurable: true
    });
}

/*
function _deleteGetter() {
    delete Function.prototype.help;
    delete String.prototype.help;
}
 */

// --- validate / assertions -------------------------------
//{@dev
function _if(value, fn, hint) {
    if (value) {
        throw new Error(fn.name + " " + hint);
    }
}
//}@dev

// --- exports ---------------------------------------------
if ("process" in global) {
    module["exports"] = Help;
}
global["Help" in global ? "Help_" : "Help"] = Help; // switch module. http://git.io/Minify

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule

