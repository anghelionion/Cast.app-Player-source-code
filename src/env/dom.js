// dom.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

// function styleElem(e, l) {
//   let s = e + " {"
//   for (let k in l)
//     s += k + ":" + l[k] + "; "
//   return s + "} ";
// }
const offset = 0; //between bar and barBackground per side

function writeGoogleFonts(fontHint, fontHintChartTitle) {
    var head = document.documentElement;
    if (fontHint.length > 0) writeLink(fontHint.replaceAll(" ", "+"), head);

    if (fontHintChartTitle.length > 0 && fontHintChartTitle !== fontHint) writeLink(fontHintChartTitle.replaceAll(" ", "+"), head);
}

let fontQuote = (f) => {
    if (f.indexOf(" ") >= 0) return `'${f}'`;
    return f;
};

function writeLink(gFontID, head) {
    var link = document.createElement("link");
    link.id = gFontID;
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "https://fonts.googleapis.com/css?family=" + gFontID;
    link.media = "all";
    head.appendChild(link);
    return link;
}

function fontFamily(f, cls) {
    const defaultFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif;";

    return f && f.length > 0 ? `${cls} {font-family:${fontQuote(f)}, ${defaultFont} }` : `${cls} {font-family:${defaultFont} }`;
}

function writeFontStyle() {
    var style = document.getElementById(Cast.styleID);
    if (style) return style;

    style = document.createElement("style");
    style.type = "text/css";
    style.id = Cast.styleID;

    let f = "";
    const fontHint = extractFontHint("fontHint");
    const fontHintChartTitle = extractFontHint("fontHintChartTitle");
    writeGoogleFonts(fontHint, fontHintChartTitle);
    const f1 = fontFamily(fontHint, "*");
    const f2 = fontFamily(fontHintChartTitle, ".chartTitle");
    style.innerText = f1 + "   " + f2;
    // style.innerText = `* {font-family:${defaultFont} }`;

    document.head.appendChild(style);
    // console.log(style);
    return style;

    function extractFontHint(fh) {
        let fint = extractMetadataProperty(gStory.getUntranslatedStory(), fh);
        if (fint.toLowerCase() === "default") fint = "";
        return fint;
    }
}

const sign = () => (document.documentElement.id = Cast.htmlSignature);

const createNarrationBox = (id, c) => {
    const divElem = document.getElementById(id) || elementOfTypeAndClass("div");
    addClasses(divElem, c);
    if (id) divElem.id = id;

    divElem.classList.remove("blobWithNarrationBox", "avatarWithNarrationBox");
    if (NarratorAvatarSetting.getCurrent() === "blob") {
        divElem.classList.add("blobWithNarrationBox");
    } else {
        divElem.classList.add("avatarWithNarrationBox");
    }
    return divElem;
};

function chartContainer(id, c, callback_context = null, callback = null, buttonIndex = null) {
    let divElem = elementOfTypeAndClass("div");
    addClasses(divElem, c);
    if (id) divElem.id = id;

    if (callback) {
        divElem.addEventListener(
            "click",
            function () {
                // FIXME is id needed? SEARCH ACCEPTID
                // callback.call(callback_context, id, buttonData.buttonLabel, buttonData.acceptText, buttonData.button_url, buttonData.link_type, buttonData.postData, buttonData.buttonIndex, buttonData.confirmText, buttonData.successText);
                callback.call(callback_context, buttonIndex);
            },
            false
        );
    }
    return attachToPlayBox(divElem);
    // return document.body.appendChild(divElem);
}

function playBoxImgElement(id, c, callback_context = null, callback = null) {
    let divElem = elementOfTypeAndClass("img");
    addClasses(divElem, c);
    if (id) divElem.id = id;
    if (callback) {
        divElem.addEventListener(
            "click",
            function () {
                callback.call(callback_context);
            },
            false
        );
    }
    return attachToPlayBox(divElem);
    // return document.body.appendChild(divElem);
}

const attachToPlayBox = (/** @type {HTMLElement} */ element) => playBoxElement()?.appendChild(element);

const classInDom = (/** @type {string} */ c) => document.getElementsByClassName(c).length > 0;

const addClasses = (/** @type {HTMLElement} */ divElement, /** @type {string} */ classNames) => {
    if (divElement && classNames && classNames.length) classNames.split(" ").forEach((/** @type {string} */ className) => divElement.classList.add(className));
};

const removeClasses = (/** @type {HTMLElement} */ divElement, /** @type {string} */ classNames) => {
    if (divElement && classNames) classNames.split(" ").forEach((/** @type {string} */ className) => divElement.classList.remove(className));
};

const addElement = (elementType, id, classNames) => {
    const element = elementOfTypeAndClass(elementType, classNames);
    if (id) element.id = id;
    return element;
};

const elementOfTypeAndClass = (/** @type {string} */ elementType, /** @type {string} */ classNames) => {
    const element = document.createElement(elementType);
    addClasses(element, classNames);
    return element;
};

const resetMargin = () => {
    const elements = document.getElementsByClassName("responsiveHeight");
    for (let i = 0; i < elements.length; i++) elements[i].style.marginTop = 0;
};
