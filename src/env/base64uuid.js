// base64uuid.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

const newBase64uuid4 = (type) => type + "-" + base64uuid4();

function base64uuid4() {
    return btoa(
        uuid4()
            .match(/\w{2}/g)
            .map(function (a) {
                return String.fromCharCode(parseInt(a, 16));
            })
            .join("")
    )
        .substr(0, 22)
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function uuid4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
}

/** usage:
 *       logBase64uuids();
 *       logBase64uuids({ "howmany": 4 });
 *       logBase64uuids({ "id": "domElementId5" });
 *       logBase64uuids({ "howmany": 5, "id": "domElementId5" });
 */
function logBase64uuids(variables) {
    var howmany = 10;
    if (variables && variables.howmany) howmany = variables.howmany;
    for (let i = 0; i < howmany; ++i)
        if (variables && variables.id) {
            document.getElementById(variables.id).innerHTML += base64uuid4() + "<br>";
        } else {
            console.log(base64uuid4());
        }
}
