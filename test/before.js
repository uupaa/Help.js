// @name: Foo.js

(function(global) {

// --- variable --------------------------------------------
// --- define ----------------------------------------------
// --- interface -------------------------------------------
function Foo(value) {
    this._value = value;
}

Foo["name"] = "Foo";
Foo["prototype"]["value"]     = Foo_value;
Foo["prototype"]["isNumber"]  = Foo_isNumber;
Foo["prototype"]["isInteger"] = Foo_isInteger;

// --- implement -------------------------------------------
function Foo_value() {
    return this._value;
}

function Foo_isNumber() {
    return typeof this._value === "number";
}

function Foo_isInteger() {
    return typeof this._value === "number" &&
           Math.ceil(this._value) === this._value;
}

// --- export ----------------------------------------------
if (global["process"]) { // node.js
    module["exports"] = Foo;
}
if (global["Foo"]) {
    global["Foo_"] = Foo; // already exsists
} else {
    global["Foo"]  = Foo;
}

})((this || 0).self || global);

