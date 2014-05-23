(function(global) {
"use strict";

// --- dependency module -----------------------------------
var Reflection = global["Reflection"] || require("uupaa.reflection.js");
var Console    = global["Console"]    || require("uupaa.console.js");

// --- local variable --------------------------------------
var _inNode = "process" in global;

// --- define ----------------------------------------------
// --- interface -------------------------------------------
function Help(target,      // @arg Function|String # function or function-path or search keyword.
              highlight) { // @arg String = ""     # code highlight.
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

Help["repository"] = "https://github.com/uupaa/Help.js";

_defineGetter();

// --- implement -------------------------------------------
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

//{@dev
function _if(value, fn, hint) {
    if (value) {
        throw new Error(fn.name + " " + hint);
    }
}
//}@dev

// --- export ----------------------------------------------
if (_inNode) {
    module["exports"] = Help; // node.js
}
if (global["Help"]) {
    global["Help_"] = Help; // secondary
} else {
    global["Help"]  = Help; // primary
}

})((this || 0).self || global); // WebModule idiom

