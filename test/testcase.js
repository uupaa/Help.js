var ModuleTestHelp = (function(global) {

var _inNode    = "process"        in global;
var _inWorker  = "WorkerLocation" in global;
var _inBrowser = "document"       in global;

return new Test("Reflection", {
        disable:    false,
        browser:    true,
        worker:     false,
        node:       false,
        button:     false,
        both:       false,
    }).add([
//ok    testReflection_invalidType,
    ]).run().clone();

/* ok
function testReflection_invalidType(next) {

    try {
        Reflection.resolve(/a/); // -> throw Error
        next && next.miss();
    } catch (o_o) {
        next && next.pass();
    }
}
 */


})((this || 0).self || global);

