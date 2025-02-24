// errorHandler.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

class ErrorHandler {
    static _isVisible = false;

    static popAlert(hdr, msg) {
        if (hdr === undefined || hdr === "") hdr = "Problem";
        if (msg === undefined || msg === "") msg = "Alert";

        hdr = ErrorHandler._shorten(hdr, 20);
        msg = ErrorHandler._shorten(msg, 200);

        document.getElementById("popAlertHeaderId").innerHTML = hdr;
        document.getElementById("popAlertMsgId").innerHTML = msg;
        document.getElementById("splash").style.display = "block";
        document.getElementById("myModal").style.display = "block";

        ErrorHandler._isVisible = true;
    }

    static _shorten(m, c) {
        if (m.length >= c) {
            return m.substring(0, c / 2) + " ... " + m.substring(m.length - c / 2);
        }
        return m;
    }

    static closePopAlert() {
        if (ErrorHandler._isVisible) {
            document.getElementById("myModal").style.display = "none";
            document.getElementById("splash").style.display = "none";
            ErrorHandler._isVisible = false;
        }
    }

    static setupPopAlert() {
        document.getElementsByClassName("close")[0].onclick = () => {
            ErrorHandler.closePopAlert();
        };
        window.onclick = (event) => {
            if (event.target == document.getElementById("myModal")) {
                ErrorHandler.closePopAlert();
            }
        };
    }
}
