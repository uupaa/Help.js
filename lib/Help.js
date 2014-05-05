// @name: Help.js
// @require: none
// @cutoff: @assert @node
// @desc: Provide online-help command for DevTools.
//
// DevToolsConsole> Function#help
// DevToolsConsole> String#help
// DevToolsConsole> Help(search-keyword", highlight)
// DevToolsConsole> Help("search-keyword", highlight)

// Example.
//
// DevToolsConsole> Help("Task#done")
//
//      function Task_done(err) { // @arg Error/null:
//                                // @return this:
//                                // @desc:  err is call Task#message(err.message).miss()
//                                //        !err is call Task#pass()
//                                // @help: Task#done
//          var miss = err instanceof Error;
//
//          if (miss) {
//              this["message"](err["message"]);
//          }
//          return miss ? this["miss"]()
//                      : this["pass"]();
//      }
//
//      Google Search:
//          http://www.google.com/search?lr=lang_ja&ie=UTF-8&oe=UTF-8&q=Task.prototype.done
//
//      WebModule Reference:
//          https://github.com/uupaa/Task.js/wiki/Task#wiki-taskprototypedone
//

(function(global) {
"use strict";

// --- variable --------------------------------------------
var _inNode = "process" in global;
//var _inWorker = "WorkerLocation" in global;
var _inBrowser = "self" in global;

// --- define ----------------------------------------------
// --- interface -------------------------------------------
function Help(target,      // @arg Function/String: function or function-path or search keyword.
              highlight) { // @arg String(= ""): code highlight.
                           // @help: Help
                           // @desc: quick online help.
//{@assert
    _if(!/string|function/.test(typeof target), "Help(target)");
    _if(!/string|undefined/.test(typeof highlight), "Help(,highlight)");
//}@assert

    var fn   = null; // function.
    var path = "";   // function-path.

    // --- resolve function-path ---
    if (typeof target === "function") {
        fn   = target;
        path = Help_getFunctionPath(target);
    } else if (typeof target === "string") {
        fn   = _convertFunctionPathToFunction( _extractSharp(target) );
        path = _extractSharp(target);
    }

    // --- dump body and online help url ---
    var stylish   = _isConsoleStyleReady();
    var search    = _getSearchURL(fn, path);
    var reference = _getReferenceURL(fn, _extractSharp(Help_getHelpAttribute(fn) || path));

    console.log.apply(console, stylish ? _stylishBody(fn, highlight) : [fn + ""]);
    console.log.apply(console, stylish ? _stylishHelp(search)        : search);
    if (reference) {
        console.log.apply(console, stylish ? _stylishHelp(reference) : reference);
    }
}

function _stylishHelp(url) { // @arg Array: [header, url]
    if (!/%/.test(url)) {
        var style = ["border-bottom:2px solid #9ff", ""];
        var help = "\u25b6 " + url[0] + "%c" + url[1] + "%c";
        return [help].concat(style);
    }
    return url;
}

Help["repository"] = "https://github.com/uupaa/Help.js";

Help["lang"]                = ""; // search language. "", "en", "ja"
Help["getFunctionPath"]     = Help_getFunctionPath;     // Help.getFunctionPath(fn:Function):String
Help["getHelpAttribute"]    = Help_getHelpAttribute;    // Help.getHelpAttribute(fn:Function):String
Help["getModuleRepository"] = Help_getModuleRepository; // Help.getModuleRepository(path:String):String

_defineGetter();

// --- implement -------------------------------------------
function _stylishBody(fn, highlight) {
    var source = fn + "";
    var style = [];
    var colorKeyword = [ // temporary implements...
            highlight,
            "\/\/[^\n]+",
            "\/[^\n\/]+\/",
            "\"[^\n\"]*\"",
            "function",
            " var ",
            " return ",
            " if ",
            " else ",
            "typeof ",
            " instanceof ",
            " in ",
            "null",
            "undefined"
        ];

    if (!highlight) {
        colorKeyword.shift();
    }

    var rex = new RegExp("(" + colorKeyword.join("|") + ")", "g");
    var body = source.replace(/%c/g, "% c").
                    replace(rex, function(_, match) {
                        if (match === highlight) {
                            style.push("background:#ff9;font-weight:bold", "");
                            return "%c" + highlight + "%c";
                        } else if (/^\/\/[^\n]+$/.test(match)) {
                            style.push("color:#3c0", "");
                            return "%c" + match + "%c";
                        } else if (/^(\/[^\n\/]+\/|\"[^\n\"]*\")$/.test(match)) {
                            style.push("color:#f6c", "");
                            return "%c" + match + "%c";
                        } else if (/^(function| var | return | if | else |typeof )$/.test(match)) {
                            style.push("color:#03f", "");
                            return "%c" + match + "%c";
                        } else if (/^( instanceof | in |null|undefined)$/.test(match)) {
                            style.push("color:#03f", "");
                            return "%c" + match + "%c";
                        }
                        return match;
                    });
    return [body].concat(style);
}

function _extractSharp(path) { // @arg String: "Array#forEach"
                               // @ret String: "Array.prototype.forEach"
    return path.trim().replace("#", ".prototype.")
}

function _convertFunctionPathToFunction(target) { // @arg String: function path. "Object.freeze"
                                                  // @ret Function/null: Object.freeze
    return target.split(".").reduce(function(parent, token) {
                if (parent && token in parent) {
                    return parent[token];
                }
                return null;
            }, global);
}

function Help_getHelpAttribute(fn) { // @arg Function: Foo.prototype.add
                                     // @ret String: "Foo.prototype.add"
                                     // @help: Help.getHelpAttribute
    // get @help attribute.
    //
    //      function Foo_add() { @help: Foo#add
    //          ...                     ~~~~~~~
    //      }
    var match = /@help:\s*([^\n\*]+)\n?/.exec("\n" + fn + "\n"); // ["@help: Foo#add", "Foo#add"]

    if (match && match[1]) {
        return _extractSharp(match[1].split(",")[0]); // "Foo.prototype.add"
    }
    return "";
}

function Help_getModuleRepository(path) { // @arg String: path. "Array.prototype.forEach"
                                          // @ret String:
                                          // @desc: get WebModule repository url.
    var className = path.split(".")[0] || ""; // "Array.prototype.forEach" -> ["Array", "prototype", "forEach"] -> "Array"

    if (className in global) {
        var repository = global[className]["repository"] || "";

        if (repository) {
            return repository.replace(/\/+$/, ""); // trim tail slash
        }
    }
    return ""; // global[className] not found
}

function _getSearchURL(fn,     // @arg Object/Function: Object.freeze
                       path) { // @arg String: "Object.freeze"
                               // @ret URLStringArray: Google.search url.
    //
    //  Google Search( Array.isArray ):
    //      http://www.google.com/search?lr=lang_ja&ie=UTF-8&oe=UTF-8&q=Array.isArray
    //
    //return "Google Search( " + path + " ):\n    " + _createGoogleSearchURL(path);
    return ["Google Search( " + path + " ):\n    ",
            _createGoogleSearchURL(path)];
}

function _getReferenceURL(fn,     // @arg Object/Function: Object.freeze
                          path) { // @arg String: "Object.freeze"
                                  // @ret URLStringArray: JavaScript/WebModule reference url.
    var className  = path.split(".")[0] || "";       // "Array.prototype.forEach" -> ["Array", "prototype", "forEach"] -> "Array"
    var repository = Help_getModuleRepository(path); // "https://github.com/uupaa/Help.js"

    //
    //  JavaScript API( Array.isArray ) Reference:
    //      http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_ja&ie=UTF-8&oe=UTF-8&q=MDN%20Array.isArray
    //
    //  WebModule Reference:
    //      https://github.com/uupaa/PageVisibilityEvent.js/wiki/PageVisibilityEvent#
    //
    if (/native code/.test(global[className] + "")) {
        return ["JavaScript Reference( " + path + " ):\n    ",
                _createGoogleImFeelingLuckyURL(path, "MDN")];
    } else if (repository && /github/i.test(repository)) {
        return ["WebModule Reference:\n    ",
                _createGitHubWikiURL(repository, className, path)];
    }
    return null;
}

function _createGitHubWikiURL(baseURL,      // @arg String: "http://..."
                              wikiPageName, // @arg String: "Foo"
                              hash) {       // @arg String: "Foo#add"
    // replace characters
    //      space    -> "-"
    //      hyphen   -> "-"
    //      underbar -> "_"
    //      alphabet -> alphabet
    //      number   -> number
    //      other    -> ""
    //      unicode  -> encodeURIComponent(unicode)
    hash = hash.replace(/[\x20-\x7e]/g, function(match) {
                var result = / |-/.test(match) ? "-"
                           : /\W/.test(match)  ? ""
                           : match;

                return result;
            });

    // {baseURL}/wiki/{wikiPageName} or
    // {baseURL}/wiki/{wikiPageName}#{hash}
    var result = [];

    result.push( baseURL.replace(/\/+$/, ""), // remove tail slash
                 "/wiki/",
                 wikiPageName + "#" );

    if (wikiPageName !== hash) {
        result.push( "wiki-", encodeURIComponent(hash.toLowerCase()) );
    }
    return result.join("");
}

function _createGoogleSearchURL(keyword) { // @arg String: search keyword.
                                           // @ret String: "http://..."
    return "http://www.google.com/search?lr=lang_" +
                _getLanguage() + "&ie=UTF-8&oe=UTF-8&q=" +
                encodeURIComponent(keyword);
}

function _createGoogleImFeelingLuckyURL(keyword,    // @arg String: search keyword.
                                        provider) { // @arg String: search providoer.
                                                    // @ret String: "http://..."
                                                    // @desc: create I'm feeling lucky url
    return "http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_" +
                _getLanguage() + "&ie=UTF-8&oe=UTF-8&q=" + provider + "%20" +
                encodeURIComponent(keyword);
}

function _getLanguage() { // @ret String: "en", "ja" ...
    if (Help["lang"]) {
        return Help["lang"];
    }
    if (global["navigator"]) {
        return global["navigator"]["language"];
    }
    return "en";
}

function _isConsoleStyleReady() {
    if (global["navigator"]) {
        if ( /Chrome/.test( global["navigator"]["userAgent"] || "" ) ) {
            return true;
        }
    }
    return false;
}

function Help_getFunctionPath(fn) { // @arg Function: object. eg: Object.freeze
                                    // @ret String: object path. eg: "Object.freeze"
                                    // @desc: reflection and object path detection.
                                    // @help: Help.getFunctionPath
                                    // @desc: path reflection
    if (typeof fn !== "function") {
        return "";
    }

    _deleteGetter()

    var path = "";
    var ignore = ["webkitStorageInfo", "Infinity", "NaN",
                  "arguments", "caller", "callee",
                  "buffer", "byteOffset", "byteLength", "length"];
    var ObjectKeys = Object.getOwnPropertyNames || Object.keys;
    var globalClasses = ObjectKeys(global).sort();

    // inject generic classes.
    globalClasses.unshift("Object", "Array", "String", "Number", "Function");
    globalClasses.some(function _findClass(className) {
        try {
            if (ignore.indexOf(className) >= 0) {
                return false;
            }
            if ( !/object|function/.test(typeof global[className]) ) {
                return false;
            }

            if (global[className] === fn) {
                path = className;
                return true;
            }

            try {
                ObjectKeys(global[className]).some(function(key) {
                    if (ignore.indexOf(key) >= 0) {
                        return false;
                    }
                    if (fn === global[className][key]) {
                        path = className + "." + key;
                    }
                    return path;
                });
            } catch (o_o) { }

            if (path) {
                return true;
            }

            try {
                if ("prototype" in global[className] ) {
                    ObjectKeys(global[className]["prototype"]).some(function(key) {
                        if (ignore.indexOf(key) >= 0) {
                            return false;
                        }
                        if (fn === global[className]["prototype"][key]) {
                            path = className + ".prototype." + key;
                        }
                        return path;
                    });
                }
            } catch (o_o) { }
        } catch (o_o) { }

        return path;
    });

    _defineGetter();

    if (_inNode) {
        path = path.replace(/^GLOBAL\./, "");
    }
    return path;
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

function _deleteGetter() {
    delete Function.prototype.help;
    delete String.prototype.help;
}

//{@assert
function _if(value, msg) {
    if (value) {
        throw new Error(msg);
    }
}
//}@assert

// --- export ----------------------------------------------
//{@node
if (_inNode) {
    module["exports"] = Help;
}
//}@node
if (global["Help"]) {
    global["Help_"] = Help; // already exsists
} else {
    global["Help"]  = Help;
}

})((this || 0).self || global);

