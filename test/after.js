// @name: Foo.js

(function(global) {

// --- variable --------------------------------------------
// --- define ----------------------------------------------
// --- interface -------------------------------------------
function Foo(value) { // @arg Number: the value.
                      // @help: Foo
    this._value = value;
}

Foo["name"] = "Foo";
Foo["repository"] = "https://github.com/uupaa/Foo.js";
Foo["prototype"]["value"]     = Foo_value;     // Foo#value():Number
Foo["prototype"]["isNumber"]  = Foo_isNumber;  // Foo#isNumber():Boolean
Foo["prototype"]["isInteger"] = Foo_isInteger; // Foo#isInteger():Boolean

// --- implement -------------------------------------------
function Foo_value() { // @ret Number: get value.
    return this._value;
}

function Foo_isNumber() { // @ret Boolean: valie is Number
    return typeof this._value === "number";
}

function Foo_isInteger() { // @ret Boolean: valie is Integer
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

