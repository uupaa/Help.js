(function(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- class / interfaces ----------------------------------
function Foo(value) { // @arg Number - the value.
    this._value = value;
}

//{@dev
Foo["repository"] = "https://github.com/uupaa/Foo.js";
//}@dev

Foo["prototype"]["value"]     = Foo_value;     // Foo#value():Number
Foo["prototype"]["isNumber"]  = Foo_isNumber;  // Foo#isNumber():Boolean
Foo["prototype"]["isInteger"] = Foo_isInteger; // Foo#isInteger():Boolean

// --- implements ------------------------------------------
function Foo_value() { // @ret Number - get value.
    return this._value;
}

function Foo_isNumber() { // @ret Boolean - valie is Number
    return typeof this._value === "number";
}

function Foo_isInteger() { // @ret Boolean - valie is Integer
    return typeof this._value === "number" &&
           Math.ceil(this._value) === this._value;
}

// --- validate / assertions -------------------------------
// --- exports ---------------------------------------------
if ("process" in global) {
    module["exports"] = Foo;
}
global["Foo" in global ? "Foo_" : "Foo"] = Foo;

})((this || 0).self || global);

