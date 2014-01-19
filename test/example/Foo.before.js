// Foo.before.js

(function(global) {

// --- define ----------------------------------------------
// --- variable --------------------------------------------
// --- interface -------------------------------------------
function Foo(name) {
    this._name = name;
}

Foo.name = "Foo";
Foo.prototype.name  = Foo_name;  // Foo#name():String
Foo.prototype.isFoo = Foo_isFoo; // Foo#isFoo():Boolean
// --- implement -------------------------------------------
function Foo_name() {
    return this._name;
}
function Foo_isFoo() {
    return true;
}
// --- export ----------------------------------------------
if (global.process) { // node.js
    module.exports = Humam;
}
global.Foo = Foo;

})(this.self || global);

