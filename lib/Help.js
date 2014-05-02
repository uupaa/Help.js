// @name: Help.js
// @require: none
// @cutoff: @assert @node

// Using Quick Help in Chrome DevTools command line.
//
// ... search API
//
// [1] > Class.help
// [2] > Class.staticMethod.help
// [3] > Class.prototype.method.help
// [4] > Array.isArray
//
// ... search API
//
// [1] > Help(Class)
// [2] > Help(Class.staticMethod)
// [3] > Help(Class.prototype.method)
// [4] > Help(Array.isArray)
//
// ... search keyword
//
// [1] > Help("Class")
// [2] > Help("Class.staticMethod")
// [3] > Help("Class#method")
// [4] > Help("Array.isArray")
//

// $ Help("Task#done")
// > "
// > function Task_done(err) { // @arg Error/null:
// >                           // @return this:
// >                           // @desc: err  is call Task#message(err.message).miss(),
// >                           //        null is call Task#pass().
// >                           // @help: Task#done
// >     err instanceof Error && this.message(err.message);
// >     return err ? this["miss"]()
// >                : this["pass"]();
// > }
// >
// > GitHub wiki page:
// >     https://github.com/uupaa/Task.js/wiki/Task#wiki-taskprototypedone
// > Google.search(Task.prototype.done):
// >     http://www.google.com/search?lr=lang_ja&ie=UTF-8&oe=UTF-8&q=Task.prototype.done
// > JavaScriptSpec.search(Task.prototype.done):
// >     http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_ja&ie=UTF-8&oe=UTF-8&q=MDN%20Task.prototype.done"
// >
// >

(function(global) {
"use strict";

// --- variable --------------------------------------------
var _inNode = "process" in global;

// --- define ----------------------------------------------
// --- interface -------------------------------------------
function Help(target) { // @arg Function/String: target object or search keyword.
                        // @ret String: quick help string or undefined
                        // @help: Help
                        // @desc: quick online help.
//{@assert
    _if(!/string|function/.test(typeof target), "Help(target)");
//}@assert

    var fn   = null;
    var path = "";

    if (typeof target === "function") {
        fn   = target;
        path = Help_reflection(target);
    } else if (typeof target === "string") {
        fn   = _convertPathToFunction(target);
        path = _extractSharp(target);
    } else {
        throw new TypeError("Help(target), target is not Function or String");
    }

    var urls = _toArray( _collect( fn, path ) );
    var result = "\n" + ((fn || "") + "\n\n" + urls.join("\n")).trim() + "\n";

    if (_inNode) {
        console.log( result );
        return "";
    }
    return result;
}

Help["repository"] = "https://github.com/uupaa/Help.js";

Help["lang"]                 = ""; // search language. "", "en", "ja"
Help["reflection"]           = Help_reflection;           // Help.reflection(fn:Function):String
Help["getHelpAttribute"]     = Help_getHelpAttribute;     // Help.getHelpAttribute(fn:Function, unmatch:String):String
Help["getModuleRepository"]  = Help_getModuleRepository;  // Help.getModuleRepository(path:String):String
Help["collectOnlineHelpURL"] = Help_collectOnlineHelpURL; // Help.collectOnlineHelpURL(fn:Function, path:String = ""):Object

_extendGetter(Function["prototype"], "help", function() {
    return Help( Help_reflection(this) );
});

// --- implement -------------------------------------------
function _extractSharp(path) { // @arg String: "Array#forEach"
                               // @ret String: "Array.prototype.forEach"
    return path.trim().replace("#", ".prototype.")
}

function _toArray(object) { // @arg Object:
                            // @ret Array:
                            // @desc: convert Object to Array
    return Object.keys(object).reduce(function(buffer, key) {
                    if (object[key]) {
                        buffer.push( object[key] );
                    }
                    return buffer;
                }, []);
}

function _collect(fn,     // @arg Function:
                  path) { // @arg String:
                          // @arg Object: { reference, repository, search }
                          // @desc: collect online help url.
    return Help_collectOnlineHelpURL( fn, Help_getHelpAttribute(fn, path) );
}

function _convertPathToFunction(target) { // @arg String: "Object.freeze"
                                          // @ret Function: Object.freeze
    return _extractSharp(target).split(".").reduce(function(parent, token) {
                if (parent && token in parent) {
                    return parent[token];
                }
                return null;
            }, global);
}

function Help_getHelpAttribute(fn,        // @arg Function:
                               unmatch) { // @arg String(= ""): default path.
                                          // @ret String:
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
    return unmatch || "";
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

function Help_collectOnlineHelpURL(fn,     // @arg Object/Function: Object.freeze
                                   path) { // @arg String(= ""): "Object.freeze"
                                           // @ret Object: online help urls. { reference, repository, search }
                                           //      return.reference - String: WebModule github/wiki reference url.
                                           //      return.repository - String: WebModule github repository url.
                                           //      return.search - String: Google search url.
                                           // @help: Help.collectOnlineHelpURL
    path = path || Help_reflection(fn);

    var className  = path.split(".")[0] || "";       // "Array.prototype.forEach" -> ["Array", "prototype", "forEach"] -> "Array"
    var repository = Help_getModuleRepository(path); // "https://github.com/uupaa/Help.js"
    var urls = {
            "reference":    "",
            "repository":   "",
            "search":       ""
        };

    if (/native code/.test(global[className] + "")) {
        urls["reference"] = "MDN.search( " + path + " ):\n    " +
                            _createGoogleImFeelingLuckyURL(path, "MDN");
    } else {
        if (repository) {
            if ( /github/i.test(repository) ) {
                urls["reference"] = "Reference:\n    " +
                                    _createGitHubWikiURL(repository, className, path);
            }
            urls["repository"] = "Repository:\n    " + repository;
        }
    }
    urls["search"] = "Google.search( " + path + " ):\n    " +
                     _createGoogleSearchURL(path);
    return urls;
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
    var lang = Help.lang || (global.navigator || {}).language || "en";

    return "http://www.google.com/search?lr=lang_" +
                lang + "&ie=UTF-8&oe=UTF-8&q=" +
                encodeURIComponent(keyword);
}

function _createGoogleImFeelingLuckyURL(keyword,    // @arg String: search keyword.
                                        provider) { // @arg String: search providoer.
                                                    // @ret String: "http://..."
                                                    // @desc: create I'm feeling lucky url
    var lang = Help.lang || (global.navigator || {}).language || "en";

    return "http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_" +
                lang + "&ie=UTF-8&oe=UTF-8&q=" + provider + "%20" +
                encodeURIComponent(keyword);
}

function Help_reflection(fn) { // @arg Function: Object.freeze
                               // @ret String: "Object.freeze"
                               // @desc: reflection and object path detection.
                               // @help: Help.reflection
    var path = "";
    var keys = Object.getOwnPropertyNames || Object.keys;
    var ary  = keys(global).sort();

    ary.unshift("Object", "Array", "String", "Number");

    try {
        ary.some(function(className) {
            if (1) {
                if (typeof global[className] === "function") {
                    if (fn === global[className]) {
                        path = className;
                        return true;
                    }

                    var result = keys(global[className]).some(function(staticMember) {
                                    try {
                                        if (fn === global[className][staticMember]) {
                                            path = className + "." + staticMember;
                                            return true;
                                        }
                                    } catch (o_o) { }
                                    return false;
                                });
                    if (result) {
                        return true;
                    }

                    if ("prototype" in global[className]) {
                        return keys(global[className]["prototype"]).some(function(method) {
                                    try {
                                        if (fn === global[className]["prototype"][method]) {
                                            path = className + ".prototype." + method;
                                            return true;
                                        }
                                    } catch (o_o) { }
                                    return false;
                                });
                    }
                }
            }
            return false;
        });
    } catch (o_o) { }
    path = path || fn.name || "";

    return path;
}

function _extendGetter(targetObject, // @arg Object/Function: Object or Prototype.
                       propertyName, // @arg String: property name.
                       callback) {   // @arg Function: callback
    if ( !(propertyName in targetObject) ) {
        if (Object.defineProperty) { // [ES5]
            Object.defineProperty(targetObject, propertyName, { get: callback });
        } else if (targetObject.__defineGetter__) {
            targetObject.__defineGetter__(propertyName, callback);
        }
    }
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

