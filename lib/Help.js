// @name: Help.js

(function(global) {

// --- define ----------------------------------------------
// --- variable --------------------------------------------
// --- interface -------------------------------------------
function Help(object) { // @arg Function/String: target object or string
                        // @ret String: quick help
                        // @help: Help
                        // @desc: quick online help.
    if (typeof object === "function") {
        return _quickHelp(object);
    }
    if (typeof object === "string") {
        var targetObject = global;
        var longName = object.trim().replace("#", ".prototype.");

        longName.split(".").forEach(function(name) {
            targetObject = targetObject[name];
        });
        return _quickHelp(targetObject, longName);
    }
    throw new TypeError("object type is not Function/String");
}
Help.name = "Help";
Help.lang = ""; // default language. "", "en", "ja"
Help.repository = "https://github.com/uupaa/help.js";

// --- implement -------------------------------------------
function _quickHelp(object,     // @arg this:
                    fullName) { // @arg String(= ""):
                                // @ret String:
                                // @help: Function#help
                                // @desc: show help url
    // pickup @help attribute.
    //
    //      function Hoge_add() { @help: Hoge#add
    //          ...               ~~~~~~~~~~~~~~~
    //      }
    //
    var match = /@help:\s*([^\n\*]+)\n?/.exec("\n" + object + "\n"); // ["@help: Hoge#add", "Hoge#add"]
    var url = [];

    if (match && match[1]) { // @help is not empty
        var firstMatch = match[1].split(",")[0];
        var longName   = firstMatch.replace("#", ".prototype.").trim(); // "Hoge.prototype.add"
        var shortName  = longName.replace(".prototype.", "#");          // "Hoge#add"
        var keywords   = longName.split("."); // ["Hoge", "prototype", "add"]
        var className  = keywords[0];
        var repository = _getRepositoryName(className);

        if (repository) {
            url.push( "GitHub: " + _createGitHubWikiURL(repository, className, longName) );
        }
        url.push( "Google: " + _createGoogleSearchURL(longName) );
        url.push( "MDN:    " + _createGoogleImFeelingLuckyURL(longName, "MDN") );
    } else {
        // pickup function name.
        //
        //      Help(Object)
        //          |
        //          V
        //      "http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_ja&ie=UTF-8&oe=UTF-8&q=MDN%20Object"
        //
        fullName = fullName || object.name || "";
        url.push( "Google: " + _createGoogleSearchURL(fullName) );
        url.push( "MDN:    " + _createGoogleImFeelingLuckyURL(fullName, "MDN") );
    }
    return "\n" + object + "\n\n" + url.join("\n");
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
    var lang = Help.lang || navigator.language || "en";

    return "http://www.google.com/search?lr=lang_" +
                lang + "&ie=UTF-8&oe=UTF-8&q="
                     + encodeURIComponent(keyword);
}

function _createGoogleImFeelingLuckyURL(keyword,    // @arg String: search keyword.
                                        provider) { // @arg String: search providoer.
                                                    // @ret String: "http://..."
                                                    // @desc: create I'm feeling lucky url
    var lang = Help.lang || navigator.language || "en";

    return "http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_" +
                lang + "&ie=UTF-8&oe=UTF-8&q=" + provider + "%20"
                     + encodeURIComponent(keyword);
}

// --- export ----------------------------------------------
if (global.process) { // node.js
    module.exports = Help;
}
global.Help = Help;

})(this.self || global);

