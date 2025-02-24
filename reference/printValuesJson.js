"use strict";

// Define recursive function to print nested values
function printValues(obj) {
    console.log("-----------------");
    for (var k in obj) {
        switch (typeof obj[k]) {
            case "number":
            case "string":
                console.log(k + " = " + obj[k] + "<br>");
                break;
            case "object":
                console.log(k + " - object <br>");
                printValues(obj[k]);
                break;
            case "array":
                console.log(k + " Array <br>");
                break;
            case "function":
                console.log(k + " function <br>");
                break;
            case "symbol":
                console.log(k + " symbol <br>");
                break;
            case "undefined":
                console.log(k + " - undefined <br>");
                break;
        }
    }
}
