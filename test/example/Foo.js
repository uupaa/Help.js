// Foo.js

(function(global) {

// --- define ----------------------------------------------
// --- variable --------------------------------------------
// --- interface -------------------------------------------
function Foo(name) { // @arg String: Foo name.
                     // @help: Foo
    this._name = name;
}

Foo.name = "Foo";
Foo.repository = "https://github.com/uupaa/Help.js";
Foo.prototype.name  = Foo_name;  // Foo#name():String
Foo.prototype.isFoo = Foo_isFoo; // Foo#isFoo():Boolean
// --- implement -------------------------------------------
function Foo_name() { // @ret String: Foo name.
                      // @help: Foo#name
    return this._name;
}
function Foo_isFoo() { // @ret Boolean: true is Foo
                       // @help: Foo#isFoo
    return true;
}
// --- export ----------------------------------------------
if (global.process) { // node.js
    module.exports = Foo;
}
global.Foo = Foo;

})(this.self || global);

