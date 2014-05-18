(function(global) {
"use strict";

// --- dependency module -----------------------------------
var Reflection = global["Reflection"] || require("uupaa.reflection.js");
var Console    = global["Console"]    || require("uupaa.console.js");

// --- local variable --------------------------------------
var _inNode = "process" in global;

// --- define ----------------------------------------------
// --- interface -------------------------------------------
function Help(target,      // @arg Function|String: function or function-path or search keyword.
              highlight) { // @arg String(= ""): code highlight.
                           // @help: Help
                           // @desc: quick online help.
//{@dev
    _if(!/string|function/.test(typeof target),     Help, "target");
    _if(!/string|undefined/.test(typeof highlight), Help, "highlight");
//}@dev

    var resolved  = Reflection["resolve"](target);
    var search    = Help_getSearchLink(resolved["fn"], resolved["path"]);
    var reference = Help_getReferenceLink(resolved["fn"], resolved["path"]);

    Console["source"](resolved["fn"] + "", highlight);
    Console["link"](search["url"], search["title"]);
    if (reference) {
        Console["link"](reference["url"], reference["title"]);
    }
}

Help["repository"] = "https://github.com/uupaa/Help.js";

Help["lang"] = ""; // search language. "", "en", "ja"

Help["getSearchLink"]    = Help_getSearchLink;      // Help.getSearchLink(fn:Function, path:String):Object
Help["getReferenceLink"] = Help_getReferenceLink;   // Help.getReferenceLink(fn:Function, path:String):Object

Reflection.addIgnoreKeyword(["Function.prototype.help", "String.prototype.help"]);

_defineGetter();

// --- implement -------------------------------------------
function Help_getSearchLink(fn,     // @arg Object|Function: Object.freeze
                            path) { // @arg String: "Object.freeze"
                                    // @ret Object: { title:String, url:URLString }
                                    // @desc: get Google search link.
    //
    //  Google Search( Array.isArray ):
    //      http://www.google.com/search?lr=lang_ja&ie=UTF-8&oe=UTF-8&q=Array.isArray
    //
    return {
        "title": "Google Search( " + path + " ):",
        "url":   _createGoogleSearchURL(path)
    };
}

function Help_getReferenceLink(fn,     // @arg Object|Function: Object.freeze
                               path) { // @arg String: "Object.freeze"
                                       // @ret Object: { title:String, url:URLString }
                                       // @desc: get JavaScript/WebModule reference link.
    var className  = path.split(".")[0] || "";       // "Array.prototype.forEach" -> ["Array", "prototype", "forEach"] -> "Array"
    var repository = Reflection.getModuleRepository(className); // "https://github.com/uupaa/Help.js"

    //
    //  JavaScript API( Array.isArray ) Reference:
    //      http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_ja&ie=UTF-8&oe=UTF-8&q=MDN%20Array.isArray
    //
    //  WebModule Reference:
    //      https://github.com/uupaa/PageVisibilityEvent.js/wiki/PageVisibilityEvent#
    //
    if (/native code/.test(global[className] + "")) {
        return {
            "title": "JavaScript Reference( " + path + " ):",
            "url":   _createGoogleImFeelingLuckyURL(path, "MDN")
        };
    } else if (repository && /github/i.test(repository)) {
        return {
            "title": "WebModule Reference:",
            "url":   _createGitHubWikiURL(repository, className, path)
        };
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

