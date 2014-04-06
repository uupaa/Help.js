new Test().add([
        testHelp_value,
        testHelp_isNumber,
        testHelp_isInteger,
    ]).run(function(err, test) {
        if (1) {
            err || test.worker(function(err, test) {
                if (!err && typeof Help_ !== "undefined") {
                    var name = Test.swap(Help, Help_);

                    new Test(test).run(function(err, test) {
                        Test.undo(name);
                    });
                }
            });
        }
    });

function testHelp_value(next) {

    var result = new Help(123.4).value();

    if (result === 123.4) {
        console.log("testHelp_value ok");
        next && next.pass();
    } else {
        console.error("testHelp_value ng");
        next && next.miss();
    }
}

function testHelp_isNumber(next) {

    var result = [
            new Help(123.4).isNumber(),  // true
            new Help(123.0).isNumber()   // true
        ];

    if (!/false/.test(result.join())) {
        console.log("testHelp_isNumber ok");
        next && next.pass();
    } else {
        console.error("testHelp_isNumber ng");
        next && next.miss();
    }
}

function testHelp_isInteger(next) {

    var result = [
           !new Help(123.4).isInteger(), // !false -> true
            new Help(123.0).isInteger()  // true
        ];

    if (!/false/.test(result.join())) {
        console.log("testHelp_isInteger ok");
        next && next.pass();
    } else {
        console.error("testHelp_isInteger ng");
        next && next.miss();
    }
}

