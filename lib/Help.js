// @name: Help.js

// Using Quick Help in Chrome DevTools command line.
//
// [1] > Class.help
// [2] > Class.staticMethod.help
// [3] > Class.prototype.method.help
// [4] > instance.method.help
//
// ...or
//
// [1] > Help(Class)
// [2] > Help(Class.staticMethod)
// [3] > Help(Class.prototype.method)
// [4] > Help(instance.method)
//
(function(global) {

// --- define ----------------------------------------------
// --- variable --------------------------------------------
// --- interface -------------------------------------------
function Help(target) { // @arg Function: target object.
                        // @ret String: quick help string or undefined
                        // @help: Help
                        // @desc: quick online help.
//{@assert
    _if(typeof target !== "function", "invalid Help(target)");
//}@assert

    return global.process ? console.log( _quickHelp(target) ) || "" // Node.js
                          : _quickHelp(target);                     // Browser
}
Help.name = "Help";
Help.lang = ""; // default language. "", "en", "ja"
Help.repository = "https://github.com/uupaa/help.js";

_extendGetter(Function.prototype, "help", function() {
    return Help(this);
});
// --- implement -------------------------------------------
function _quickHelp(target) { // @arg Function:
                              // @ret String:
    // pickup @help attribute.
    //
    //      function Hoge_add() { @help: Hoge#add
    //          ...               ~~~~~~~~~~~~~~~
    //      }
    //
    var match = /@help:\s*([^\n\*]+)\n?/.exec("\n" + target + "\n"); // ["@help: Hoge#add", "Hoge#add"]
    var url = [];

    if (match && match[1]) { // Function has @help attribute.
        var firstMatch = match[1].split(",")[0];
        var longName   = firstMatch.replace("#", ".prototype.").trim(); // "Hoge.prototype.add"
        var shortName  = longName.replace(".prototype.", "#");          // "Hoge#add"
        var keywords   = longName.split("."); // ["Hoge", "prototype", "add"]
        var className  = keywords[0];
        var repository = _getRepositoryName(className);

        if (repository) {
            url.push( "GitHub:\n    " + _createGitHubWikiURL(repository, className, longName) );
        }
        url.push( "Google:\n    " + _createGoogleSearchURL(longName) );
        url.push( "MDN:\n    " + _createGoogleImFeelingLuckyURL(longName, "MDN") );
    } else {
        // pickup function name.
        //
        //      Help(target)
        //          |
        //          V
        //      "http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_ja&ie=UTF-8&oe=UTF-8&q=MDN%20Object"
        //
        url.push( "Google:\n    " + _createGoogleSearchURL(target.name || "") );
        url.push( "MDN:\n    " + _createGoogleImFeelingLuckyURL(target.name || "", "MDN") );
    }
    return "\n" + target + "\n\n" + url.join("\n");
}

function _getRepositoryName(name) { // @arg String: global object name
                                    // @ret String:
    var repository = (global[name] || {}).repository || null;

    if (repository && typeof repository === "string") {
        return repository.replace(/\/+$/, ""); // trim tail slash
    }
    return ""; // global[name] not found
}

function _createGitHubWikiURL(baseURL,      // @arg String: "http://..."
                              wikiPageName, // @arg String: "Hoge"
                              hash) {       // @arg String: "Hoge#add"
    // replace characters
    //      space    -> "-"
    //      hyphen   -> "-"
    //      underbar -> "_"
    //      alphabet -> alphabet
    //      number   -> number
    //      other    -> ""
    //      unicode  -> encodeURIComponent(unicode)
    hash = hash.replace(/[\x20-\x7e]/g, function(match) {
                return / |-/.test(match) ? "-" :
                       /\W/.test(match)  ? ""  : match;
            });

    // {baseURL}/wiki/{wikiPageName}#{hash}
    return baseURL.replace(/\/+$/, "") // remove tail slash
                + "/wiki/"
                + wikiPageName + "#"
                + encodeURIComponent(hash.toLowerCase());
}

function _createGoogleSearchURL(keyword) { // @arg String: search keyword.
                                           // @ret String: "http://..."
    var lang = Help.lang || (global.navigator || {}).language || "en";

    return "http://www.google.com/search?lr=lang_" +
                lang + "&ie=UTF-8&oe=UTF-8&q="
                     + encodeURIComponent(keyword);
}

function _createGoogleImFeelingLuckyURL(keyword,    // @arg String: search keyword.
                                        provider) { // @arg String: search providoer.
                                                    // @ret String: "http://..."
                                                    // @desc: create I'm feeling lucky url
    var lang = Help.lang || (global.navigator || {}).language || "en";

    return "http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_" +
                lang + "&ie=UTF-8&oe=UTF-8&q=" + provider + "%20"
                     + encodeURIComponent(keyword);
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
function _if(booleanValue, errorMessageString) {
    if (booleanValue) {
        throw new Error(errorMessageString);
    }
}
//}@assert

// --- export ----------------------------------------------
if (global.process) { // node.js
    module.exports = Help;
}
global.Help = Help;

})(this.self || global);

