// @name: Help.js

(function(global) {

// --- define ----------------------------------------------
// extend Function#help
if (Object.defineProperty) {
    Object.defineProperty(Function.prototype, "help", {
        value: Function_help
    });
} else {
    Function.prototype.help = Function_help;
}

// --- variable --------------------------------------------
// --- interface -------------------------------------------
function Help(that) { // @arg Function:
                      // @ret String:
                      // @help: Help
                      // @desc: quick online help.
    return that.help();
}
Help.name = "Help";
Help.repository = "https://github.com/uupaa/help.js";

// --- implement -------------------------------------------
function Function_help(that) { // @arg this:
                               // @ret String:
                               // @help: Function#help
                               // @desc: show help url
    that = that || this;

    // pickup @help attribute.
    //
    //      function Hoge_add() { @help: Hoge#add
    //          ...               ~~~~~~~~~~~~~~~
    //      }
    //
    var match = /@help:\s*([^\n\*]+)\n?/.exec("\n" + that + "\n"); // ["@help: Hoge#add", "Hoge#add"]
    var url = "";

    if (match && match[1]) { // @help is not empty
        var longName   = match[1].replace("#", ".prototype.").trim(); // "Hoge.prototype.add"
        var shortName  = longName.replace(".prototype.", "#");       // "Hoge#add"
        var keywords   = longName.split("."); // ["Hoge", "prototype", "add"]
        var className  = keywords[0];
        var repository = _getRepositoryName(className);

        if (repository) {
            url = _createGitHubWikiURL(repository, className, shortName);
        } else {
            url = _createGoogleImFeelingLuckyURL(longName);
        }
        return url + "\n\n" + that + "\n\n" + url;
    }
    // pickup function name.
    //
    //      Help(Object)
    //          |
    //          V
    //      "http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_ja&ie=UTF-8&oe=UTF-8&q=MDN%20Object"
    //
    var functionName = that.name || "";

    return _createGoogleImFeelingLuckyURL(functionName);
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

function _createGoogleImFeelingLuckyURL(keyword) { // @arg String: search keyword.
                                                   // @ret String: "http://
                                                   // @desc: create I'm feeling lucky url
    var lang = navigator.language || "en";

    return "http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_" +
                lang + "&ie=UTF-8&oe=UTF-8&q=MDN%20"
                     + encodeURIComponent(keyword);
}

// --- export ----------------------------------------------
if (global.process) { // node.js
    module.exports = Help;
}
global.Help = Help;

})(this.self || global);

