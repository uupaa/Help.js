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

    var result = _help(target);

    return _inNode ? (console.log( result ) || "") : result;
}

Help["lang"] = ""; // search language. "", "en", "ja"
Help["repository"] = "https://github.com/uupaa/Help.js";

_extendGetter(Function["prototype"], "help", function() {
    return Help( _reflection(this) );
});

// --- implement -------------------------------------------
function _help(target) { // @arg Function/String
                         // @arg String:
    var path = ""; // "Object.freeze"
    var fn = null; // Object.freeze

    if (typeof target === "function") {
        path = _reflection(target);
        fn = target;
    } else if (typeof target === "string") {
        path = target.trim().replace("#", ".prototype.");
        fn = path.split(".").reduce(function(parent, token) {
                if (parent && token in parent) {
                    return parent[token];
                }
                return null;
            }, global);
    } else {
        throw new TypeError("object type is not Function/String");
    }

    // pickup @help attribute.
    //
    //      function Foo_add() { @help: Foo#add
    //          ...               ~~~~~~~~~~~~~~~
    //      }
    //
    var match = /@help:\s*([^\n\*]+)\n?/.exec("\n" + (fn || "") + "\n"); // ["@help: Foo#add", "Foo#add"]

    if (match && match[1]) {
        // Function has @help attribute.
        var firstToken = match[1].split(",")[0];

        path = firstToken.replace("#", ".prototype.").trim(); // "Foo.prototype.add"
    }

    var ary = path.split(".");
    var className = ary[0]; // "Foo"
    var repositoryURL = className ? _getRepositoryName(className) : ""; // "https://github.com/uupaa/Help.js"
    var result = _quickHelp(fn, path, className, repositoryURL);

    return _inNode ? (console.log( result ) || "") : result;
}

function _quickHelp(fn,              // @arg Object/Function: Object.freeze
                    path,            // @arg String: "Object.freeze"
                    className,       // @arg String:
                    repositoryURL) { // @arg URLString:
                                     // @ret String:
    var url = [];

    if (/native code/.test(global[className] + "")) {
        url.push("MDN.search( " + path + " ):\n    " +
                 _createGoogleImFeelingLuckyURL(path, "MDN"));
    } else {
        if (repositoryURL) {
            if ( /github/i.test(repositoryURL) ) {
                url.push("Reference:\n    " +
                         _createGitHubWikiURL(repositoryURL, className, path));
            }
            url.push("Repository:\n    " + repositoryURL);
        } else {
            url.push("Google.search( " + path + " in github.com ):\n    " +
                     _createGoogleSearchURL("site:github.com " + path));
        }
    }
    url.push("Google.search( " + path + " ):\n    " +
             _createGoogleSearchURL(path));

    return "\n" + (fn || "") + "\n\n" + url.join("\n") + "\n";
}

function _getRepositoryName(className) { // @arg String: global object className
                                         // @ret String:
    var repository = (global[className] || {})["repository"] || null;

    if (repository && typeof repository === "string") {
        return repository.replace(/\/+$/, ""); // trim tail slash
    }
    return ""; // global[className] not found
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

function _reflection(fn) { // @arg Function: Object.freeze
                           // @ret String: "Object.freeze"
                           // @desc: reflection and object path detection.
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

