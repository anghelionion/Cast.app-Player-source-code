// xhr.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

function sendInviteData(data) {
    let payload = JSON.stringify(data);

    return fetchService(getInviteUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: payload,
    });
}

function b64toBlob(base64, type = "audio/mpeg") {
    return fetch(`data:${type};base64,${base64}`).then((res) => res.blob());
}

function createNarrationHash(narrationText) {
    return {
        hashNarrationText: castHashNarration(
            narrationText,
            PlayRateSetting.getBackendRate(Cast.locale.lang),
            SampleRateSetting.getCurrent(),
            Cast.locale.lang,
            NarratorGenderSetting.getCurrent()
        ),
        narrationText: narrationText,
    };
}

function cleanQuotes(narrationText) {
    let quotes = narrationText.match(/(--|').*?(--|')/g);
    if (quotes) {
        quotes.forEach((quote) => {
            narrationText = narrationText.replace(quote, textToDisplaySymbols(quote));
        });
    }

    return narrationText;
}

function handleNarrationObject(narrationObject) {
    return narrationFromNarrationObject(narrationObject);
}

function cleanAndHashNarrationForTTS(narrations) {
    let narrationText = narrations;
    if (Array.isArray(narrations)) {
        if (narrations.length === 0) {
            return createNarrationHash("");
        }
        narrationText = handleNarrationObject(narrations[0]);
    }
    if (typeof narrationText === "object" && narrationText !== null) {
        narrationText = handleNarrationObject(narrationText);
    }
    narrationText = cleanQuotes(narrationText);
    return createNarrationHash(narrationText);
}

// function narrationTextAndSpeakerIndex(narration) {
//   let speakerIndex = 2;
//   let narrationText = narration;
//   return { narrationText, speakerIndex };
//   // let speakerIndex = parseInt(narration.match(/^\d+:/));
//   // if(isNaN(speakerIndex)){
//   //   speakerIndex = 2
//   // }
//   // let narrationText = narration.replace(/^\d+:/, "");
//   // return { narrationText, speakerIndex };
// }

function errorEventHandler(e) {
    //ErrorHandler.popAlert("Network Issue", "There was a network issue playing Cast Presentation after several retries. Please check your network or contact support@cast.app.");
}

function eventHandler(e) {
    if (this.readyState == 4 && this.status == 200 && e.type == "loadend") {
        // console.log(this.readyState + " " + "Request completed: " + this.status + " " + this.statusText +" \n");
        // console.log("Loaded successfully, e.type:" + e.type + " " + loaded(e) + "\n");
        jsonLoaded(JSON.parse(this.responseText));
    } else if (this.readyState == 3 && this.status == 200 && e.type == "progress") {
        // console.log(this.readyState + " " + e.type + " " + loaded(e) + "\n");
    } else if (this.readyState == 2 && e.type == "readystatechange") {
        // console.log(this.readyState + " " + "Headers Received.\n");
    } else if (this.readyState == 1 && (e.type == "loadstart" || e.type == "readystatechange")) {
        // console.log(this.readyState + " e.type:" + e.type + "\n");
    } else if (this.readyState == 0 && e.type == "readystatechange") {
        // console.log(this.readyState + " " + "opened " + "\n");
    } else if (this.readyState == 4 && e.type == "timeout") {
        // console.log("e.type: " + e.type + ", readystate: " + this.readyState + " " + loaded(e) + "\n");
    } else if (this.readyState == 4 && e.type == "abort") {
        // console.log("e.type: " + e.type + ", readystate: " + this.readyState + " " + loaded(e) + "\n");
    } else if (this.readyState == 4 && e.type == "load") {
        // console.log("e.type: " + e.type + ", readystate: " + this.readyState + " " + loaded(e) + "\n");
    } else {
        // console.log("default: e.type: " + e.type + ", this.status: " + this.status + ", this.readyState: " + this.readyState);
        return;
    }
    //     onreadystatechange
    //     readyState === 4
    //            ⇓
    // onload / onerror / onabort
    //            ⇓
    //        onloadend
    function loaded(e) {
        if (e.lengthComputable) return `received ${e.loaded} of ${e.total} bytes`;
        else return `received ${e.loaded} bytes`; // no Content-Length }
    }
}
