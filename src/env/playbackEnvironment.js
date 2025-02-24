// playbackEnvironment.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

const cNoJsonOverride = "no-json-override";

let gTempPausedForTranscripts = false;
let gTranscripts = false;

const playBoxElement = () => document.getElementById("playBox");

const playBoxRoStyle = () => window.getComputedStyle(playBoxElement());

const playBoxWidth = () => playBoxElement().getBoundingClientRect().width;

const playBoxHeight = () => playBoxElement().getBoundingClientRect().height;

const startingTop = () => 0; //playBoxHeight(); //from bottom: playBoxHeight

const chartTitleTop = () => 0;

const chartTop = () => chartTitleTop() + 46;

const avgOfArray = (arr) => {
    let s = 0;
    arr.forEach((a) => (s += a));
    return arr.length > 0 ? s / arr.length : 0;
};
const generatedTimestamp = (story) => {
    if (story && story.metadata && story.metadata.gmtGenerationTimestamp) return story.metadata.gmtGenerationTimestamp;
    return new Date().toString();
};

const metadata = (story) => {
    if (story && story.metadata) return story.metadata;
    return {};
};

const metadataName = (story) => {
    if (story && story.metadata && story.metadata.name) return story.metadata.name;
    return "";
};

const extractMetadataProperty = (story, property, defaultValue = "") => {
    if (story && story.metadata && story.metadata[property]) return story.metadata[property];
    return defaultValue;
};

const recipient = (story, prefix) => {
    if (story && story.metadata && story.metadata.recipient && story.metadata.recipient.name) return (prefix ? prefix + " " : "") + story.metadata.recipient.name;
    return "Storybot";
};

const storyAndProductName = (story) => {
    let metadataName;
    if (story && story.metadata && story.metadata.name) {
        metadataName = story.metadata.name;
        if (!metadataName.includes("cast")) metadataName += " " + "cast";
    } else {
        metadataName = "cast";
    }
    return metadataName;
};

const period = (story) => {
    if (story && story.metadata && story.metadata.period) {
        return story.metadata.period;
    }
    return "";
};

const sceneSequence = (story) => {
    if (story && story.metadata && story.metadata.sceneSequence) return story.metadata.sceneSequence;
    return [];
};

const chartSequence = (story, sceneID) => {
    if (story && story.scenes && story.scenes[sceneID]) {
        if (window.location.href.includes("localhost:5001")) {
            let localSeq = chartSequenceByPropertyName(story, sceneID, "localhostChartSequence");
            if (localSeq.length > 0) {
                return localSeq;
            } else {
                return chartSequenceByPropertyName(story, sceneID, "chartSequence");
            }
        } else {
            return chartSequenceByPropertyName(story, sceneID, "chartSequence");
        }
    } else return [];
};

const chartSequenceByPropertyName = (story, sceneID, propertyName) =>
    story && story.scenes && story.scenes[sceneID] && story.scenes[sceneID][propertyName] ? story.scenes[sceneID][propertyName] : [];

const getChartSegments = (story, chartID) => (story && story.charts && story.charts[chartID] && story.charts[chartID].segments ? story.charts[chartID].segments : []);

const getChartSegmentBreaks = (story, chartID) => (story && story.charts && story.charts[chartID] && story.charts[chartID].segments ? story.charts[chartID].segments : []);

const description = (story) => (story && story.metadata && story.metadata.description ? story.metadata.description : "Cast");

const logoURL = (story) => (story && story.metadata && story.metadata.logoURL ? story.metadata.logoURL : "");

const metadataKeyValue = (story, key, defVal) => {
    return story && story.metadata && story.metadata[key] ? story.metadata[key] : defVal;
};

const chartType = (story, chartID) => (story && story.charts && story.charts[chartID] && story.charts[chartID].type ? story.charts[chartID].type : "");
const chartMode = (story, chartID) => (story && story.charts && story.charts[chartID] && story.charts[chartID].mode ? story.charts[chartID].mode : "");

const chartHeadingTitle = (gStory, chartID, defaultTitle) => {
    if (useFeature("infoChartId")) {
        return "";
    }
    let story = gStory.getTranslatedStory();
    let title = story.charts?.[chartID]?.title || gStory.getUntranslatedStory().charts?.[chartID]?.title;
    return title || defaultTitle;
};

const liquidContext = (story) => {
    return story && story.metadata && story.metadata["liquid_context"] ? story.metadata["liquid_context"] : {};
};

const liquidContextContactAccount = () => {
    const lc = liquidContext(gStory.getTranslatedStory());
    return lc && lc.contact_account ? lc.contact_account : "";
};

const liquidContextString = (s) => {
    const lc = liquidContext(gStory.getTranslatedStory());
    return lc && lc[s] ? lc[s] : "";
};

const liquidContextRobot = () => {
    return liquidContextString("robot");
};

const liquidContextCsatIcon = () => {
    return liquidContextString("csaticon");
};

const isPrecursive = () => liquidContextCsatIcon() === "precursive";

const liquidContextRecommendationPanel = () => {
    let lc = liquidContext(gStory.getUntranslatedStory());
    return lc && lc.recommendationPanel ? lc.recommendationPanel.toLowerCase() : "off";
};

const chartTitle = (story, chartID, defaultTitle) => {
    return story && story.charts && story.charts[chartID] && story.charts[chartID].title ? textToDisplaySymbols(story.charts[chartID].title) : defaultTitle;
};

const chartStyle = (story, chartID, defaultStyle) => {
    let type = chartType(story, chartID);
    return story && story.charts && story.charts[chartID] && story.charts[chartID][type] && story.charts[chartID][type].style ? story.charts[chartID][type].style : defaultStyle;
};

const chartX = (story, chartID, x) => {
    let type = chartType(story, chartID);
    return story && story.charts && story.charts[chartID] && story.charts[chartID][type] && story.charts[chartID][type][x] ? story.charts[chartID][type][x] : "";
};

const steps = (chartID) => {
    let story = gStory.getTranslatedStory();
    let type = chartType(story, chartID);
    return story && story.charts && story.charts[chartID] && story.charts[chartID][type] && story.charts[chartID][type].steps ? story.charts[chartID][type].steps.slice() : [];
};

const stepsOfStory = (chartID, story) => {
    let type = chartType(story, chartID);
    return story && story.charts && story.charts[chartID] && story.charts[chartID][type] && story.charts[chartID][type].steps ? story.charts[chartID][type].steps.slice() : [];
};

const segments = (chartID) => {
    let story = gStory.getTranslatedStory();
    let type = chartType(story, chartID);
    return story && story.charts && story.charts[chartID] && story.charts[chartID][type] && story.charts[chartID][type].segments
        ? story.charts[chartID][type].segments.slice()
        : [];
};

const columns = (chartID) => {
    let story = gStory.getTranslatedStory();
    let type = chartType(story, chartID);
    return story && story.charts && story.charts[chartID] && story.charts[chartID][type] && story.charts[chartID][type].columns
        ? parseInt(story.charts[chartID][type].columns)
        : 10;
};

const sceneLevelBool = (chartID, boolKey = "grid") => {
    let story = gStory.getTranslatedStory();
    let type = chartType(story, chartID);
    return story && story.charts && story.charts[chartID] && story.charts[chartID][type] && story.charts[chartID][type][boolKey];
};

const sceneLevelStrVal = (chartID, key, defaultVal = "") => {
    let story = gStory.getTranslatedStory();
    let type = chartType(story, chartID);
    return story && story.charts && story.charts[chartID] && story.charts[chartID][type] && story.charts[chartID][type][key] && story.charts[chartID][type][key] !== null
        ? story.charts[chartID][type][key]
        : defaultVal;
};

const ticks = (chartID) => {
    let story = gStory.getTranslatedStory();
    let type = chartType(story, chartID);
    return story && story.charts && story.charts[chartID] && story.charts[chartID][type] && !!story.charts[chartID][type].ticks;
};

const leftStartingValue = (chartID) => {
    let story = gStory.getTranslatedStory();
    let type = chartType(story, chartID);
    return story && story.charts && story.charts[chartID] && story.charts[chartID][type] && story.charts[chartID][type].leftStartingValue
        ? story.charts[chartID][type].leftStartingValue
        : 0;
};

const segmentFloatVal = (segment, index) => {
    let r = segment && segment[index] && segment[index].value ? segment[index].value : 0;
    if (isNaN(r)) return 0.0;
    return parseFloat(r);
};

const segmentFloatCompareVal = (segment, index) => {
    let r = segment && segment[index] && segment[index].compareValue ? segment[index].compareValue : 0;
    if (isNaN(r)) return 0.0;
    return parseFloat(r);
};

const segmentValueAsArray = (segment, index) => {
    let jsonElement = segment && segment[index] && segment[index].value ? segment[index].value : [];

    if (Array.isArray(jsonElement)) {
        return jsonElement;
    } else {
        let retValues = [];
        retValues[0] = jsonElement;
        return retValues;
    }
};

//Deep Clone: http://jsben.ch/q2ez1
const clone = (items) => items.map((item) => (Array.isArray(item) ? clone(item) : item));

const segmentValueLabelArray = (segment, index) => {
    let a = segment && segment[index] && segment[index].valueLabel ? segment[index].valueLabel : [];
    return clone(a);
};

const segmentSequenceArray = (segment, index) => {
    let a = segment && segment[index] && segment[index].sequence ? segment[index].sequence : [];
    return clone(a);
};

// https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
const cloneObj = (obj) => {
    let copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = cloneObj(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = cloneObj(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
};

const segmentValueColorsArray = (segment, index) => {
    let a = colorsOverridden(segment, index) ? segment[index].colorIndex : [];
    return a;
};

const colorsOverridden = (segment, index) => {
    return segment && segment[index] && segment[index].colorIndex;
};

const segmentLevelStrVal = (segment, index, key, defaultVal = "") => {
    const v = segment && segment[index] && segment[index][key] ? segment[index][key] : defaultVal;
    return v.toString();
};

const segmentLevelBool = (segment, index, key, defaultVal = false) => {
    return segment && segment[index] && segment[index][key] ? segment[index][key] === true : defaultVal;
};

const breaks = (segment, index) => {
    let b = segment && segment[index] && segment[index].breaks ? segment[index].breaks : [];
    return b;
};

const lineLowDataPoints = (segment, index) => {
    return lineDataPoints(segment, index, "lineLowData");
};

const lineHighDataPoints = (segment, index) => {
    return lineDataPoints(segment, index, "lineHighData");
};

const lineDataPoints = (segment, index, key = "lineData") => {
    let a = segment && segment[index] && segment[index][key] ? segment[index][key] : [];
    return clone(a);
};

const areaDataPoints = (segment, index, ad) => {
    let a = segment && segment[index] && segment[index][ad] ? segment[index][ad] : [];
    return clone(a);
};

const segmentKeyValue = (segment, key, defaultValue = "") => {
    return segment && segment[key] ? segment[key] : defaultValue;
};

const fixSpecialChars = (s) => {
    s = s.replace(new RegExp("& ", "g"), "and ");
    return s;
};

const sub = (str, emoji) => {
    // note bug AWS Polly in languages other than english for
    //  <sub alias =\"Mind Blown!\">🤯</sub><sub alias =\"Wow!\">😮</sub>
    // therefore need a word between <sub>
    // Bug e.g. Hindi: <sub alias =\"Mind Blown!\">🤯</sub><sub alias =\"Wow!\">😮</sub>
    // return "<sub alias=\" \">" + emoji + "</sub> " + str;
    return emoji;
};

const noSpeechNoTranslate = (x) => {
    return `<cast:nospeech><span class=notranslate>${x}</span></cast:nospeech>`;
};

//gets strings like:
//    Here is the --hello-- categorization for the 'congratulations' Apple Pay Promotion on Kiosks.
//    Total Horizontal Sales 'down' 5%
//    Total Vertical Sales --up-- 15%
//    this is --a-- and --3--
const textToDisplaySymbols = (t) => {
    // COPIED TO utils.js in brain

    t = t.replace(/(--|')left(--|')/g, noSpeechNoTranslate("◀︎"));
    t = t.replace(/(--|')right(--|')/g, noSpeechNoTranslate("▶︎"));
    t = t.replace(/(--|')up(--|')/g, noSpeechNoTranslate("▲"));
    t = t.replace(/(--|')down(--|')/g, noSpeechNoTranslate("▼"));
    t = t.replace(/(--|')dot(--|')/g, noSpeechNoTranslate("●"));
    t = t.replace(/(--|')copyright(--|')/g, noSpeechNoTranslate("©"));
    t = t.replace(/(--|')registered(--|')/g, noSpeechNoTranslate("®"));
    t = t.replace(/(--|')trademark(--|')/g, noSpeechNoTranslate("™"));
    t = t.replace(/(--|')section(--|')/g, noSpeechNoTranslate("§"));

    t = t.replace(/(--|')awesome(--|')/g, noSpeechNoTranslate("👏"));
    t = t.replace(/(--|')cheers(--|')/g, noSpeechNoTranslate("🥂"));
    t = t.replace(/(--|')congratulations(--|')/g, noSpeechNoTranslate("🥳"));
    t = t.replace(/(--|')cool(--|')/g, noSpeechNoTranslate("😎"));
    t = t.replace(/(--|')hello(--|')/g, noSpeechNoTranslate("👋"));
    t = t.replace(/(--|')mindblown(--|')/g, noSpeechNoTranslate("🤯"));
    t = t.replace(/(--|')nice(--|')/g, noSpeechNoTranslate("😊"));
    t = t.replace(/(--|')perfect(--|')/g, noSpeechNoTranslate("💯"));
    t = t.replace(/(--|')superb(--|')/g, noSpeechNoTranslate("👌"));
    t = t.replace(/(--|')thanks(--|')/g, noSpeechNoTranslate("🙏"));
    t = t.replace(/(--|')wow(--|')/g, noSpeechNoTranslate("😲"));
    t = t.replace(/(--|')fire(--|')/g, noSpeechNoTranslate("🔥"));
    t = t.replace(/(--|')mask(--|')/g, noSpeechNoTranslate("😷"));
    t = t.replace(/(--|')grim(--|')/g, noSpeechNoTranslate("😬"));
    t = t.replace(/(--|')virus(--|')/g, noSpeechNoTranslate("🦠"));
    t = t.replace(/(--|')pointDown(--|')/g, noSpeechNoTranslate("👇"));
    t = t.replace(/(--|')new(--|')/g, noSpeechNoTranslate("✨"));
    t = t.replace(/(--|')flash(--|')/g, noSpeechNoTranslate("⚡️"));
    t = t.replace(/(--|')cal(--|')/g, noSpeechNoTranslate("🗓"));
    t = t.replace(/(--|')asterisk(--|')/g, noSpeechNoTranslate("*"));

    // t = t.replace(/BETA/gi, "<span class=bxx>BETA</span>")

    //🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩
    for (let i = 0; i < 26; i++) {
        t = t.replace(new RegExp(`(--|')${String.fromCodePoint("a".codePointAt(0) + i)}(--|')`, "g"), `${String.fromCodePoint("🅐".codePointAt(0) + i)}`);
    }

    //❶..
    for (let i = 0; i < 10; i++) {
        t = t.replace(new RegExp(`(--|')${String.fromCodePoint("1".codePointAt(0) + i)}(--|')`, "g"), `${String.fromCodePoint("❶".codePointAt(0) + i)}`);
    }

    return t;
};

const getPlayerServerRoute = () => {
    return "https://cast.app/player/api";
    // return `${process.env.SERVER_BASE_URL}/player/api`;
};

const getIframeRoute = () => {
    return `${getPlayerServerRoute()}/iframe`;
};

const getSpeechRoute = () => {
    return `${getPlayerServerRoute()}/tts`;
};

const getBulkRoute = () => {
    return `${getSpeechRoute()}/bulk`;
};

const getVisemeRoute = () => {
    return `${getSpeechRoute()}/viseme`;
};

const getRaceUrl = () => {
    return process.env.SERVER_BASE_URL + "/deliver/api/track_async";
};

const getTranslateServerUrl = () => {
    return `${getPlayerServerRoute()}/translate`;
};

const getInviteUrl = () => {
    return process.env.SERVER_BASE_URL + "/deliver/api/invite";
};

const colorMap = (c) => {
    if (c === "red" || c === "green" || c === "yellow" || c === "blue") return customCssVariable("--cast-" + c);
    else return c;
};

//Utility function - converts "white"(string) to hex

function pickThemeBasedOnColor(color) {
    if (color === "transparent") return "light";
    const hexColor = hex(color); //fix for #fde -> #FFDDEE
    const r = parseInt(hexColor.substring(1, 3), 16); // hexToR
    const g = parseInt(hexColor.substring(3, 5), 16); // hexToG
    const b = parseInt(hexColor.substring(5, 7), 16); // hexToB
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "light" : "dark";
}

const lighten = (c, fraction) => {
    return pSBC(fraction, hex(c));
};

function contrastWarning(background, foreground) {
    //convert to #123456 format
    background = hex(background); //"white" -> #FFFFFF
    foreground = hex(foreground);
    return contrast(background, foreground) < 3;
}

// https://stackoverflow.com/a/9733420
function luminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// https://stackoverflow.com/a/9733420
function contrast(rgb1, rgb2) {
    var lum1 = luminance(parseInt(rgb1.slice(1, 3), 16), parseInt(rgb1.slice(3, 5), 16), parseInt(rgb1.slice(5, 7), 16));
    var lum2 = luminance(parseInt(rgb2.slice(1, 3), 16), parseInt(rgb2.slice(3, 5), 16), parseInt(rgb2.slice(5, 7), 16));
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

// hex("blue") -> #0000ff
// hex("hsla(235, 100%, 50%)") -> #0015ff
// hex("#333") -> #333333
// hex("hwb(194 0% 0%)") -> #00c3ff
//fails for "transparent" because transparent has alpha of 0 and needs hex8
const hex = (c) => {
    //transparent is a shortcut for transparent black, i.e., rgba(0,0,0,0)
    if (!c || c === "transparent") return c;
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = c;
    return ctx.fillStyle;
};

//#hex8
const hexWithOpacity = (c, o = 0.75) => {
    if (o > 1) o = 1;
    if (o < 0) o = 0;
    o *= 255;
    o = parseInt(o);
    o = o.toString(16);
    if (o.length < 2) o = "0" + o;
    return hex(c) + o;
};

function contrastDiff(color1, color2) {
    let result1 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex(color1));
    let result2 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex(color2));

    let contrast1 = (parseInt(result1[1], 16) * 299 + parseInt(result1[2], 16) * 587 + parseInt(result1[3], 16) * 114) / 1000;

    let contrast2 = (parseInt(result2[1], 16) * 299 + parseInt(result2[2], 16) * 587 + parseInt(result2[3], 16) * 114) / 1000;

    return Math.abs(contrast1 - contrast2);
}

function colorWithHigherContrast(incolor, outColor1, outColor2) {
    return contrastDiff(incolor, outColor1) >= contrastDiff(incolor, outColor2) ? outColor1 : outColor2;
}

function numberWithCommas(x) {
    return formatted(parseInt(x), 0, true);
}

function autoDecimalplaces(f) {
    if (f < 1) return 2;
    if (f < 10) return 1;
    return 0;
}

function largeNumbersWithCommaNoDecimals(x, decimalPlacesForSmallNumbers) {
    return formatted(parseFloat(x), x >= 1000 ? 0 : decimalPlacesForSmallNumbers, true);
}

function formatted(i, decimalPlaces = autoDecimalplaces(i), numberGroupingForNumbersOver10000 = true) {
    if (isNaN(decimalPlaces)) decimalPlaces = 0;
    let n = Math.round((parseFloat(i) + Number.EPSILON) * 1000000) / 1000000;
    return n.toLocaleString("en", {
        useGrouping: i < 10000 ? false : numberGroupingForNumbersOver10000, //https://english.stackexchange.com/a/138061
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    });
}

function abbreviateNumber(value) {
    let newValue = value;
    if (value >= 1000) {
        const suffixes = ["", "k", "m", "b", "t"];
        let suffixNum = Math.floor(("" + value).length / 3);
        let shortValue = "";
        for (let precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(precision));
            let dotLessShortValue = (shortValue + "").replace(/[^a-zA-Z 0-9]+/g, "");
            if (dotLessShortValue.length <= 2) {
                break;
            }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
}

const castColor = (index = 0) => {
    let gColors = gidSunColors;

    if (typeof gColors !== "undefined" && Array.isArray(gColors) && gColors.length > 2) {
        return gColors[index % gColors.length];
    }

    return varColor("--cast-color-", index);
};

const castGradientColor = (index, actualKMeansReturned = 0, theme = "anthony") => {
    return varGradientColor("--cast-gradient-" + theme + "-", index, actualKMeansReturned);
};

const nodeTextColor = (theme) => {
    let tc = customCssVariable("--cast-gradient-" + theme + "-textcolor");
    if (tc.length > 0) return tc;
    return "white";
};

const varColor = (prefix, index) => {
    let numColors = customCssVariable(prefix + "count");
    if (index !== undefined) {
        index %= parseInt(numColors);
        return customCssVariable(prefix + index);
    } else {
        return customCssVariable("--cast-color-neutral");
    }
};

const varGradientColor = (prefix, index, actualKMeansReturned = 0) => {
    let numColors = customCssVariable(prefix + "count");
    if (index !== undefined) {
        if (actualKMeansReturned !== 0) {
            index = Math.round((index * numColors) / actualKMeansReturned);
        }
        index %= parseInt(numColors);
        return customCssVariable(prefix + index);
    } else {
        return customCssVariable("--cast-color-neutral");
    }
};

const customCssVariable = (s) => {
    return getComputedStyle(document.documentElement).getPropertyValue(s).trim();
};

const readCompanyColorsForMode = (story, mode) => {
    if (mode !== "idSun" && mode !== "idMoon" && mode !== "idAccessible") mode = "idSun";
    if (story && story.metadata && story.metadata["companyColors" + mode]) return story.metadata["companyColors" + mode];
    return [];
};

const pieMaker = (ratio, c, d = 14) => {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    var circle = document.createElementNS(NS, "circle");
    circle.setAttribute("r", 16);
    circle.setAttribute("cx", 16);
    circle.setAttribute("cy", 16);
    circle.setAttribute("stroke", c);
    circle.setAttribute("fill", lighten(c, 0.4));
    circle.setAttribute("stroke-width", 32);
    circle.setAttribute("stroke-dasharray", 100 * ratio + " 100");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("style", "border-radius:50%");
    svg.setAttribute("width", d);
    svg.setAttribute("height", d);
    svg.appendChild(circle);
    return svg.outerHTML;
};

const textHighlightFilter = (h = true) => {
    //we do not use opacity as a filter because autoAlpha does opacity and visibility
    return h ? "grayscale(0) brightness(1) " : "grayscale(.9) brightness(.8)";
};

const graphicsHighlightFilter = (h = true) => {
    return h ? "grayscale(0) brightness(1)" : `grayscale(1) brightness(.8)`;
};

function dimGraphicsOpacity() {
    return playBoxRoStyle().getPropertyValue("--dimGraphicsOpacity").trim();
}
function dimTextOpacity() {
    return playBoxRoStyle().getPropertyValue("--dimTextOpacity").trim();
}

function markerTextOpacity() {
    return playBoxRoStyle().getPropertyValue("--markerTextOpacity").trim();
}
function utcToLocal(utc) {
    let da = new Date(utc.replace(/-/g, "/"));

    let moy = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][da.getMonth()];
    let dom = da.getDate();
    let dow = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][da.getDay()];

    let hh = da.getHours();
    let ampm = "A.M.";
    if (hh >= 12) ampm = "P.M.";
    if (hh > 12) hh = hh - 12;
    let mm = da.getMinutes().toString();
    if (mm.length < 2) mm = "0" + mm;

    let tz = da.toString().match(/\(([A-Za-z\s].*)\)/)[1];
    return `${dow}, ${moy} ${dom}, ${hh}:${mm} ${ampm} ${tz}` + da.toTimeString();
}

function utcToDate(utc) {
    return new Date(utc.replace(/-/g, "/"));
}

function ss(x, sX) {
    if (x == 1) return "1 " + sX;
    else if (x == 0) return "";
    else return x + " " + sX + "s";
}

function dhm(t) {
    var cd = 24 * 60 * 60 * 1000,
        ch = 60 * 60 * 1000,
        d = Math.floor(t / cd),
        h = Math.floor((t - d * cd) / ch),
        m = Math.round((t - d * cd - h * ch) / 60000),
        pad = function (n) {
            return n < 10 ? "0" + n : n;
        };
    if (m === 60) {
        h++;
        m = 0;
    }
    if (h === 24) {
        d++;
        h = 0;
    }

    let sh = ss(h, "hour");
    let sm = ss(m, "minute");
    let sd = ss(d, "day");

    if (d > 7) return "over a week ago";
    if (d > 0) return sd + " ago";
    else if (h > 0) return sh + " ago";
    else if (m > 0) return sm + " ago";
    return "just now";
}

function getIndicator(index, hilite = true) {
    return getIndicatorOfColor(castColor(index), hilite ? 1 : 0.2);
}

function getIndicatorOfColor(color, opacity = 1.0) {
    return getIndicatorOfColorMarker("●", color, opacity);
}

function getIndicatorOfColorMarker(marker, color, opacity = 1.0) {
    return `<span style="color:${color}; opacity:${opacity}">${marker}</span> `;
}

function format_phone_number(val) {
    var number = val.replace(/[^\d]/g, "");

    if (number.length == 7) {
        number = number.replace(/(\d{3})(\d{4})/, "$1-$2");
        //US & Canada Formatting
    } else if (number.length == 10) {
        if (number.startsWith("1")) {
            number = number.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
        } else {
            number = number.replace(/(\d{3})(\d{3})(\d{4})/, "+1 $1-$2-$3");
        }
    }
    //France Formatting
    else if (number.length == 11) {
        if (number.startsWith("34")) {
            //Spain Formattiing
            // Example: 34912345678 -> +34 912345678.
            number = number.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");
        } else if (number.startsWith("1")) {
            number = number.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "+$1 $2-$3-$4");
        } else {
            number = number.replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, "+$1 $2 $3 $4 $5 $6");
        }
    }
    //German Formattiing
    else if (number.length == 12) {
        // Example: 004930901820 -> +0049 30901820
        if (number.startsWith("0049")) {
            number = number.replace(/(\d{4})(\d{8})/, "+49 $2");
        }
    }
    return number;
}

const highlightTranscriptNarrationOnMouseOver = (e) => {
    // Highlight hovered chart's play/pause button.
    const transcriptChartPlayPauseButtonPath = e.children[0].children[0];
    if (transcriptChartPlayPauseButtonPath) transcriptChartPlayPauseButtonPath.style.fill = "#00a2ff";
};

const resetTranscriptNarrationOnMouseOut = (e) => {
    // Highlight hovered chart's play/pause button.
    const transcriptChartPlayPauseButtonPath = e.children[0].children[0];
    if (transcriptChartPlayPauseButtonPath) transcriptChartPlayPauseButtonPath.style.fill = "rgba(255, 255, 255, 0.5)";
};

const narrationFromNarrationObject = (n) => {
    if (typeof n === "object" || n instanceof Object) return n.value;
    return n;
};

const dynamicActionFromNarrationObject = (n) => objectNarrationObject(n, "dynamicAction");

const feedbackFromNarrationObject = (n) => objectNarrationObject(n, "feedback");

const mp3OverrideFromNarrationObject = (n) => objectNarrationObject(n, "mp3Override");

const objectNarrationObject = (n, o) => {
    if (typeof n === "object" || n instanceof Object) return n[o];
    return undefined;
};

function togglePlayPause() {
    if (Playback.hasEnded) {
        playFromBeginning();
        return;
    }

    if (Playback.disablePlayPause || Playback.menuOpen) {
        return;
    }
    if (Playback.isPaused) {
        controlPlay();
    } else {
        controlPause();
    }
    if (Playback.pauseAfter) {
        Playback.pauseAfter = false;
        Cast.component.trayContainer.toggleTrayPlayButton(!Cast.userInteracted ? "auto" : "normal");
        utterAllNarrationsOfStep(
            Playback.pauseAfterInfo.step,
            Playback.pauseAfterInfo.stepsSupposedToFetchWhilePlaying,
            Playback.pauseAfterInfo.calleeThis,
            Playback.pauseAfterInfo.calleeClassMethodNarrationDone,
            Cast.userInteracted
        );
    }
}

// Play Pause the Howler.  Narration Done is not received when paused.  Animation done is received.
// Animation and narration done is not processed (because Narration Done is not received)
// when unpaused, naration complete is processed and Animation and narration done is processed
const controlPlay = (forcePlay = false) => {
    if (Cast.currentChart && Cast.currentChart.delayTL) {
        Cast.component.trayContainer.toggleTrayPlayButton(!Cast.userInteracted ? "auto" : "normal");
        Playback.isPaused = false;
        Cast.currentChart.delayTL.time(Cast.currentChart.delayTL.duration());
        Cast.currentChart.clearDelay();
        if (Cast.backgroundMusicGloballyEnabled && Cast.userInteracted && Cast.backgroundMusic && !Cast.backgroundMusic.playing()) Cast.backgroundMusic.play();
        return;
    }
    if (Playback.cantPauseIfNotHowling && !forcePlay) {
        // Not Howling.  This if may be redundant
        console.log("Most likely not hitting ***");
        return; //TEMP TEMP TEMP
    }
    if (forcePlay) {
        Playback.cantPauseIfNotHowling = false;
    }
    if (Playback.isPaused || Playback.pauseAfter || forcePlay) {
        Howler._unlockAudio();
        Cast.neuralTTS && Cast.neuralTTS.play();
        Cast.tlViseme && Cast.tlViseme.play();
        if (Cast.backgroundMusicGloballyEnabled && Cast.userInteracted && Cast.backgroundMusic && !Cast.backgroundMusic.playing()) Cast.backgroundMusic.play();
        Playback.isPaused = false;
        Cast.component.trayContainer.toggleTrayPlayButton(!Cast.userInteracted ? "auto" : "normal");
        if (Playback.settingsHaveChanged) {
            Playback.settingsHaveChanged = false;
            // Replay the current chart with new setting.
            if (Cast.currentChart) Cast.currentChart._stepsIdx = 0;
            skipToChart(-1, Cast.currentChart._chartIdentifier, false);
        } else if (!Playback.pauseAfter) restartAudio();
        Playback.pauseAfter = false;
    } else Playback.isPaused = true;

    const slide = Cast.currentChart;
    if (slide instanceof VideoSlide) {
        slide.updateVideoState(Playback.isPaused);
    }
};

function controlPause() {
    if (Cast.currentChart && Cast.currentChart.delayTL) {
        Cast.currentChart.delayTL.pause();
        Playback.isPaused = true;
        Cast.component.trayContainer.toggleTrayPauseButton(!Cast.userInteracted ? "auto" : "normal");
    }

    if (Playback.cantPauseIfNotHowling) {
        console.log("Ignoring pause ***");
        Cast.backgroundMusic && Cast.backgroundMusic.pause();
        // we get this when we are not howling, i.e., transitioning charts OR using an animation longer than the narration
        // we could remember receiving a pause request during animation/not-howling and use it after starting
        return;
    }
    if (!Playback.isPaused) {
        Playback.isPaused = true;
        Cast.neuralTTS && Cast.neuralTTS.pause();
        pauseFace(Cast.narratorAvatar);
        Cast.backgroundMusic && Cast.backgroundMusic.pause();
        Cast.component.trayContainer.toggleTrayPauseButton(!Cast.userInteracted ? "auto" : "normal");
    } else {
        Playback.isPaused = false;
    }

    const slide = Cast.currentChart;
    if (slide instanceof VideoSlide) {
        slide.updateVideoState(Playback.isPaused);
    }
}

function resetMp3CacheLookahead() {
    console.log("MP3Cache Reset Index Before:", gNarrationFetchCurrChartIndex, gNarrationFetchCurrStepIndex);
    gNarrationFetchCurrChartIndex = getCurrentChartIndex();
    gNarrationFetchCurrStepIndex = getCurrentStepIndex();
    console.log("MP3Cache Reset Index After:", gNarrationFetchCurrChartIndex, gNarrationFetchCurrStepIndex);
}

const getCurrentChartIndex = () => (Cast.currentChart ? Cast.megaSequence.indexOf(Cast.currentChart._chartIdentifier) : 0);

const getCurrentStepIndex = () => (Cast.currentChart ? Cast.currentChart._stepsIdx : 0);

const getCurrentNarrationIndex = () => {
    if (Cast.currentChart && Cast.currentChart._steps) {
        let currentNarrationIndex = Cast.currentChart._narrationIndex;
        for (let i = 0; i < Cast.currentChart._steps.length; i++) {
            const newCurrentNarrationIndex = currentNarrationIndex - (Cast.currentChart._steps[i].narrations ? Cast.currentChart._steps[i].narrations.length : 0);
            if (newCurrentNarrationIndex < 0) return currentNarrationIndex;
            if (newCurrentNarrationIndex === 0) return 0;
            currentNarrationIndex = newCurrentNarrationIndex;
        }
        return currentNarrationIndex;
    }
    return 0;
};

const playBoxHidden = () => {
    return window.getComputedStyle(playBoxElement()).visibility === "hidden";
};

const restartButtonHandler = () => {
    cancelSettings();
    playFromBeginning();
};
const revealShare = () => {
    cancelSettings();
    Cast.openedMenuType = "share";
    gsap.set(["#mainMenu", "#action-feedback-menu-container", "#embeddedInvite .confirmation"], { display: "none" });
    gsap.set(["#embeddedInvite"], { display: "block" });
    Cast.component.trayContainer.updateTrayContainerElement(!isDesktopMode() ? "portrait" : "landscape", !Cast.userInteracted ? "auto" : "normal", "share");
};

const openSettingMenu = () => {
    gsap.set(["#action-feedback-menu-container", "#embeddedInvite"], {
        display: "none",
    });
    gsap.set(["#mainMenu"], { display: "block" });
    Cast.component.trayContainer.updateTrayContainerElement(!isDesktopMode() ? "portrait" : "landscape", !Cast.userInteracted ? "auto" : "normal", Cast.openedMenuType);
    setSelectedLocaleName();
    updateNarratorAvatarSelection();
};

const openiFrameMenu = (config) => {
    const options = config;

    gsap.set("#configBox", { autoAlpha: 0 });
    gsap.set(["#mainMenu", "#embeddedInvite"], { display: "none" });
    gsap.set(".iFrame-popup-container", { display: "flex", autoAlpha: 1 });
    gsap.fromTo(".iFrame-popup-container", 0.4, { top: "100%", scale: 0.66 }, { top: "10px", scale: 1 });

    Cast.component.trayContainer.updateTrayContainerElement(!isDesktopMode() ? "portrait" : "landscape", !Cast.userInteracted ? "auto" : "normal", Cast.openedMenuType);

    const onIframeNewWindowAction = `onIframeNewWindow("${options.link}")`;

    const iframeContent = `
        <div class="menu-heading">
            <span class="action-logo">${getActionIcon({ actionType: options.actionType })}</span>
            <div class="menu-title">                
            </div>    
            <div class="iframe-new-window-tooltip">${Cast.locale.translatedContent["newWindowIframe"]}</div>
            <div class="close-button iframe-new-window">
               <svg  viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M4.25012 5.5C3.83591 5.5 3.50012 5.83579 3.50012 6.25V14.75C3.50012 15.1642 3.83591 15.5 4.25012 15.5H12.7501C13.1643 15.5 13.5001 15.1642 13.5001 14.75V10.75C13.5001 10.3358 13.8359 10 14.2501 10C14.6643 10 15.0001 10.3358 15.0001 10.75V14.75C15.0001 15.9926 13.9928 17 12.7501 17H4.25012C3.00748 17 2.00012 15.9926 2.00012 14.75V6.25C2.00012 5.00736 3.00748 4 4.25012 4H9.25012C9.66434 4 10.0001 4.33579 10.0001 4.75C10.0001 5.16421 9.66434 5.5 9.25012 5.5H4.25012Z" fill="#f9f5f1"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.19397 12.7532C6.47187 13.0603 6.94615 13.0841 7.25331 12.8062L16.5001 4.43999V7.25C16.5001 7.66421 16.8359 8 17.2501 8C17.6643 8 18.0001 7.66421 18.0001 7.25V2.75C18.0001 2.33579 17.6643 2 17.2501 2H12.7501C12.3359 2 12.0001 2.33579 12.0001 2.75C12.0001 3.16421 12.3359 3.5 12.7501 3.5H15.3033L6.24694 11.6938C5.93978 11.9717 5.91607 12.446 6.19397 12.7532Z" fill="#f9f5f1"/>
                </svg>
            </div>
            <div class="close-button">
                <svg onclick="closeMenu()" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.95302 4.38075C4.10613 4.22638 4.2883 4.10384 4.48901 4.02022C4.68972 3.93661 4.905 3.89355 5.12243 3.89355C5.33986 3.89355 5.55514 3.93661 5.75585 4.02022C5.95656 4.10384 6.13873 4.22638 6.29184 4.38075L13.3577 11.529L20.4236 4.44663C20.7338 4.13649 21.1544 3.96225 21.593 3.96225C21.8102 3.96225 22.0252 4.00502 22.2259 4.08814C22.4265 4.17125 22.6089 4.29306 22.7624 4.44663C22.916 4.6002 23.0378 4.78252 23.1209 4.98316C23.204 5.18381 23.2468 5.39887 23.2468 5.61605C23.2468 5.83323 23.204 6.04828 23.1209 6.24893C23.0378 6.44958 22.916 6.63189 22.7624 6.78546L15.6965 13.7855L22.7624 20.8513C23.0726 21.1615 23.2468 21.5821 23.2468 22.0208C23.2468 22.4594 23.0726 22.88 22.7624 23.1902C22.4523 23.5003 22.0316 23.6745 21.593 23.6745C21.1544 23.6745 20.7338 23.5003 20.4236 23.1902L13.3577 16.1243L6.29184 23.1902C6.13827 23.3437 5.95596 23.4656 5.75531 23.5487C5.55466 23.6318 5.33961 23.6746 5.12243 23.6746C4.90525 23.6746 4.6902 23.6318 4.48955 23.5487C4.2889 23.4656 4.10659 23.3437 3.95302 23.1902C3.79945 23.0366 3.67763 22.8543 3.59452 22.6536C3.51141 22.453 3.46863 22.2379 3.46863 22.0208C3.46863 21.8036 3.51141 21.5885 3.59452 21.3879C3.67763 21.1872 3.79945 21.0049 3.95302 20.8513L11.0354 13.7855L3.95302 6.71958C3.79864 6.56646 3.67611 6.38429 3.59249 6.18358C3.50887 5.98287 3.46582 5.76759 3.46582 5.55016C3.46582 5.33273 3.50887 5.11745 3.59249 4.91674C3.67611 4.71603 3.79864 4.53387 3.95302 4.38075V4.38075Z" fill="#f9f5f1"/></svg>
            </div>
        </div>
        <div class="iframe-container">
           <iframe src="${options.link}"/>
         </div>
    `;

    document.querySelector(".iFrame-popup-container").innerHTML = iframeContent;
    document.querySelector(".iFrame-popup-container .menu-title").textContent = decodeURIComponent(options.title);
    document.querySelector(".iframe-new-window").setAttribute("onclick", onIframeNewWindowAction);

    document.querySelector(".iFrame-popup-container .iframe-new-window").addEventListener("mouseover", (event) => {
        if (isDesktopMode()) gsap.set(".iframe-new-window-tooltip", { autoAlpha: 1 });
    });

    document.querySelector(".iFrame-popup-container .iframe-new-window").addEventListener("mouseout", (event) => {
        gsap.set(".iframe-new-window-tooltip", { autoAlpha: 0 });
    });
};

const onIframeNewWindow = (link) => {
    window.open(link, "_blank");
    closeMenu();
};

const openActionFeedback = (feedback) => {
    Cast.openedMenuType = "actionFeedback";
    if (!feedback)
        feedback = {
            title: `${Cast.locale.translatedContent["feedbackMenuTitle"]}`,
            webhook: "https://cast.app",
            payload: "some payload",
        };

    // Initiate action feedback menu container component element.
    Cast.hideRightPanelContainer(false);
    const actionFeedbackMenuContainerElement = document.getElementById("action-feedback-menu-container");
    if (actionFeedbackMenuContainerElement) actionFeedbackMenuContainerElement.append(Cast.component.rfContainer.element);

    gsap.set("#rfs-container", { autoAlpha: 1 });

    resizeCast();

    if (ActionListSetting.getCurrent() === "collapsed") {
        ActionListSetting.setCurrent("expanded");
        Cast.component.rfContainer.expandRecommendation();
    }

    gsap.set(["#mainMenu", "#embeddedInvite"], { display: "none" });
    gsap.set("#configBox", { autoAlpha: 1, display: "block" });
    gsap.set("#action-feedback-menu-container", {
        autoAlpha: 1,
        display: "flex",
    });

    if (Playback.hasEnded) Cast.hideRightPanelContainer(false);

    // Update tray container component.
    Cast.component.trayContainer.updateTrayContainerElement(!isDesktopMode() ? "portrait" : "landscape", !Cast.userInteracted ? "auto" : "normal", "actionFeedback");
};

const safeKill = (id) => {
    const g = gsap.getById(id);
    g && g.kill();
    return g;
};

const isBackgroundMusicPlaying = () => Cast.backgroundMusic && Cast.backgroundMusic.playing();

const checkIframeUrl = (openurl, config, eventType, action2AddAsString) => {
    callWebhook2(eventType, action2AddAsString);
    return fetch(getIframeRoute(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: openurl }),
        timeout: 2500,
    })
        .then((res) => (res.ok ? res.json() : { isAllowed: false }))
        .then((data) => {
            if (data.isAllowed) {
                openMenu("iFrame", config);
            } else {
                setTimeout(() => {
                    window.open(openurl, "_blank");
                });
            }
        })
        .catch((err) => {
            window.open(openurl, "_blank");
            console.error(err);
        });
};

const openMenu = (menuType = "setting", obj = null, tempPausedForMenu = true) => {
    racetrack("openMenu");

    Cast.openedMenuType = menuType;

    gsap.set("#configBox", {
        autoAlpha: customCssVariable("--cast-box-opacity"),
    });
    gsap.set("#popup-container", { display: "none" });
    gsap.set("#left-menu-control-container", { zIndex: 99 });

    //remember paused or not
    Playback.wasPaused = Playback.isPaused;

    if (!Playback.isPaused) {
        controlPause();
        if (tempPausedForMenu) {
            Playback.tempPausedForMenu = tempPausedForMenu;
        }
    }

    if (Cast.openedMenuType === "actionFeedback") {
        if (Playback.pauseAfter) {
            Playback.hasEnded = true;
            Playback.isPaused = true;
            Cast.component.trayContainer.updateTrayContainerElement(!isDesktopMode() ? "portrait" : "landscape", !Cast.userInteracted ? "auto" : "normal");
        }
        gsap.set("#configBox", {
            autoAlpha: 0,
        });

        const openFeedbackMenu = () => {
            if (!isDesktopMode()) {
                openActionFeedback(obj);
            } else {
                gsap.set("#configBox", { autoAlpha: 0 });
                Cast.component.rfContainer.expandRecommendation();
            }
        };

        if (!Cast.userInteracted) {
            const tl = gsap.timeline();
            tl.to({}, 0.15, {
                onComplete: () => {
                    openFeedbackMenu();
                },
            });

            Cast.currentChart.delayTL = tl;
        } else {
            openFeedbackMenu();
        }
    } else if (Cast.openedMenuType === "setting") openSettingMenu();
    else if (Cast.openedMenuType === "iFrame") openiFrameMenu(obj);

    if (["none", "actionFeedback"].indexOf(Cast.openedMenuType) > -1) {
        gsap.set("#configBox", { boxShadow: "none" });
    } else {
        gsap.set("#configBox", { boxShadow: "0 0 4px 4px #ffffff22" });
    }

    Playback.menuOpen = true;
    Playback.isPaused = true;
    if (!Cast.userInteracted) {
        Playback.closeMenuOnAutoPlay = (reload = true) => {
            const calledInNormalMode = false;
            if (obj && obj.injected && !Cast.userInteracted && reload) {
                playFromBeginning();
                closeMenu(calledInNormalMode, false);
            } else closeMenu(calledInNormalMode);
        };
        Playback.menuOnAutoPlay = setTimeout(Playback.closeMenuOnAutoPlay, 3000);
    }
};

const closeMenu = (calledInNormalMode = Cast.userInteracted, playAfter = false) => {
    gsap.set("#configBox", { autoAlpha: 0 });
    gsap.set("#popup-container", { display: "none" });
    gsap.set("#left-menu-control-container", { zIndex: 1 });

    if (Cast.openedMenuType === "iFrame") {
        const tl = gsap.timeline();
        tl.to(".iFrame-popup-container", 0.4, { top: "100%", scale: 0.66 });
        tl.set(".iFrame-popup-container", { autoAlpha: 0, innerHTML: "" });
    }

    Playback.menuOpen = false;
    Cast.openedMenuType = "none";

    resizeCast();

    const changedFromAutoplayToNormalMode = calledInNormalMode !== Cast.userInteracted;
    if (changedFromAutoplayToNormalMode) {
        Playback.tempPausedForMenu = false;
        Cast.component.trayContainer.toggleTrayPlayButton(!Cast.userInteracted ? "auto" : "normal");
        Playback.pauseAfter = false;
        return;
    }
    if (Playback.tempPausedForMenu) {
        Playback.tempPausedForMenu = false;
    }
    if (Playback.pauseAfter) {
        Playback.hasEnded = true;
        Cast.component.trayContainer.updateProgressBar(100);
        Cast.component.trayContainer.toggleTrayPauseButton();
        Cast.expandActionList();
        Cast.component.rfContainer.resetFeedbackMenuTitle();
        Cast.disablePlayPause();
        Cast.disableSkip();
    } else if (playAfter) {
        controlPlay(true);
    } else {
        if (!Playback.wasPaused) {
            controlPlay(true);
        }
    }

    Cast.component.trayContainer.updateTrayContainerElement(!isDesktopMode() ? "portrait" : "landscape", !Cast.userInteracted ? "auto" : "normal");
};

const initMenu = () => {
    let configElem = document.getElementById("configBox");
    if (configElem) {
        configElem.innerHTML = `
             <div id=idConfigBoxChild>
                <div id="embeddedInvite"></div>
                <div id=action-feedback-menu-container></div>
                <div id=mainMenu class=menuContents>
                        <div class="menu-heading">
                            <div id="setting-menu-title" class="menu-title">
                                <span id="setting-menu-title-icon">${SVG.settingMenuToggleButtonIcon()}</span>
                                <span class="setting-title">${Cast.locale.translatedContent["settingMenuTitle"]}</span>
                            </div>
                            <div class="close-button">
                                <svg onclick="applySettingsAndCloseMenu()" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.95302 4.38075C4.10613 4.22638 4.2883 4.10384 4.48901 4.02022C4.68972 3.93661 4.905 3.89355 5.12243 3.89355C5.33986 3.89355 5.55514 3.93661 5.75585 4.02022C5.95656 4.10384 6.13873 4.22638 6.29184 4.38075L13.3577 11.529L20.4236 4.44663C20.7338 4.13649 21.1544 3.96225 21.593 3.96225C21.8102 3.96225 22.0252 4.00502 22.2259 4.08814C22.4265 4.17125 22.6089 4.29306 22.7624 4.44663C22.916 4.6002 23.0378 4.78252 23.1209 4.98316C23.204 5.18381 23.2468 5.39887 23.2468 5.61605C23.2468 5.83323 23.204 6.04828 23.1209 6.24893C23.0378 6.44958 22.916 6.63189 22.7624 6.78546L15.6965 13.7855L22.7624 20.8513C23.0726 21.1615 23.2468 21.5821 23.2468 22.0208C23.2468 22.4594 23.0726 22.88 22.7624 23.1902C22.4523 23.5003 22.0316 23.6745 21.593 23.6745C21.1544 23.6745 20.7338 23.5003 20.4236 23.1902L13.3577 16.1243L6.29184 23.1902C6.13827 23.3437 5.95596 23.4656 5.75531 23.5487C5.55466 23.6318 5.33961 23.6746 5.12243 23.6746C4.90525 23.6746 4.6902 23.6318 4.48955 23.5487C4.2889 23.4656 4.10659 23.3437 3.95302 23.1902C3.79945 23.0366 3.67763 22.8543 3.59452 22.6536C3.51141 22.453 3.46863 22.2379 3.46863 22.0208C3.46863 21.8036 3.51141 21.5885 3.59452 21.3879C3.67763 21.1872 3.79945 21.0049 3.95302 20.8513L11.0354 13.7855L3.95302 6.71958C3.79864 6.56646 3.67611 6.38429 3.59249 6.18358C3.50887 5.98287 3.46582 5.76759 3.46582 5.55016C3.46582 5.33273 3.50887 5.11745 3.59249 4.91674C3.67611 4.71603 3.79864 4.53387 3.95302 4.38075V4.38075Z" fill="#f9f5f1"/></svg>
                            </div>
                        </div>
                    <div class="configType popup-menu-section-title" id="idPlayRate">Playback Speed</div>
                    <div class="selectTab playback-speed-options-settings">
                        <span id=idPlayRateSlow onclick="updatePlayRateSelection('slow')">0.5<sub class="multiplier-x">✕</sub></span>
                        <span id=idPlayRateMedium onclick="updatePlayRateSelection('medium')">1<sub class="multiplier-x">✕</sub></span>
                        <span id=idPlayRateFast onclick="updatePlayRateSelection('fast')">1.5<sub class="multiplier-x">✕</sub></span>
                        <span id=idPlayRateXFast onclick="updatePlayRateSelection('x-fast')">2<sub class="multiplier-x">✕</sub></span>
                    </div>
                    <div class="configType popup-menu-section-title language-title-settings"><span class="setting-language">Language: </span> <span class="hovered-locale-name"></span></div>
                    <div class="selectTab languageSelect language-options-settings">
                        <p class="locale" data-locale="english" data-name="US English" onclick="updateLocaleSelection('english')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><g fill="#d80027"><path d="m244.87 256h267.13c0-23.106-3.08-45.49-8.819-66.783h-258.311z"/><path d="m244.87 122.435h229.556c-15.671-25.572-35.708-48.175-59.07-66.783h-170.486z"/><path d="m256 512c60.249 0 115.626-20.824 159.356-55.652h-318.712c43.73 34.828 99.107 55.652 159.356 55.652z"/><path d="m37.574 389.565h436.852c12.581-20.529 22.338-42.969 28.755-66.783h-494.362c6.417 23.814 16.174 46.254 28.755 66.783z"/></g><path d="m118.584 39.978h23.329l-21.7 15.765 8.289 25.509-21.699-15.765-21.699 15.765 7.16-22.037c-19.106 15.915-35.852 34.561-49.652 55.337h7.475l-13.813 10.035c-2.152 3.59-4.216 7.237-6.194 10.938l6.596 20.301-12.306-8.941c-3.059 6.481-5.857 13.108-8.372 19.873l7.267 22.368h26.822l-21.7 15.765 8.289 25.509-21.699-15.765-12.998 9.444c-1.301 10.458-1.979 21.11-1.979 31.921h256c0-141.384 0-158.052 0-256-50.572 0-97.715 14.67-137.416 39.978zm9.918 190.422-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822l-21.7 15.765zm-8.289-100.083 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822zm100.115 100.083-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822l-21.7 15.765zm-8.289-100.083 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822zm0-74.574 8.289 25.509-21.699-15.765-21.699 15.765 8.289-25.509-21.7-15.765h26.822l8.288-25.509 8.288 25.509h26.822z" fill="#0052b4"/></svg>
                        </p>
                        <p class="locale" data-locale="british" data-name="UK English" onclick="updateLocaleSelection('british')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><g fill="#0052b4"><path d="m52.92 100.142c-20.109 26.163-35.272 56.318-44.101 89.077h133.178z"/><path d="m503.181 189.219c-8.829-32.758-23.993-62.913-44.101-89.076l-89.075 89.076z"/><path d="m8.819 322.784c8.83 32.758 23.993 62.913 44.101 89.075l89.074-89.075z"/><path d="m411.858 52.921c-26.163-20.109-56.317-35.272-89.076-44.102v133.177z"/><path d="m100.142 459.079c26.163 20.109 56.318 35.272 89.076 44.102v-133.176z"/><path d="m189.217 8.819c-32.758 8.83-62.913 23.993-89.075 44.101l89.075 89.075z"/><path d="m322.783 503.181c32.758-8.83 62.913-23.993 89.075-44.101l-89.075-89.075z"/><path d="m370.005 322.784 89.075 89.076c20.108-26.162 35.272-56.318 44.101-89.076z"/></g><g fill="#d80027"><path d="m509.833 222.609h-220.44-.001v-220.442c-10.931-1.423-22.075-2.167-33.392-2.167-11.319 0-22.461.744-33.391 2.167v220.44.001h-220.442c-1.423 10.931-2.167 22.075-2.167 33.392 0 11.319.744 22.461 2.167 33.391h220.44.001v220.442c10.931 1.423 22.073 2.167 33.392 2.167 11.317 0 22.461-.743 33.391-2.167v-220.44-.001h220.442c1.423-10.931 2.167-22.073 2.167-33.392 0-11.317-.744-22.461-2.167-33.391z"/><path d="m322.783 322.784 114.236 114.236c5.254-5.252 10.266-10.743 15.048-16.435l-97.802-97.802h-31.482z"/><path d="m189.217 322.784h-.002l-114.235 114.235c5.252 5.254 10.743 10.266 16.435 15.048l97.802-97.804z"/><path d="m189.217 189.219v-.002l-114.236-114.237c-5.254 5.252-10.266 10.743-15.048 16.435l97.803 97.803h31.481z"/><path d="m322.783 189.219 114.237-114.238c-5.252-5.254-10.743-10.266-16.435-15.047l-97.802 97.803z"/></g></svg>
                        </p>
                        <p class="locale" data-locale="australian" data-name="Australian" onclick="updateLocaleSelection('australian')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m512 256c0 141.384-114.616 256-256 256s-256-114.616-256-256c0 .06 256-255.971 256-256 141.384 0 256 114.616 256 256z" fill="#0052b4"/><g fill="#f0f0f0"><path d="m256 0c-.014 0-.029.001-.043.001z"/><path d="m255.315 256h.685c0-.232 0-.454 0-.685-.228.229-.456.457-.685.685z"/><path d="m256 133.566c0-45.045 0-74.562 0-133.565h-.043c-141.365.023-255.957 114.628-255.957 255.999h133.565v-75.212l75.212 75.212h46.539c.229-.228.457-.456.685-.685 0-17.247 0-32.636 0-46.536l-75.213-75.213z"/></g><g fill="#d80027"><path d="m129.515 33.391c-40.039 22.799-73.325 56.085-96.124 96.124v126.485h66.783v-155.825-.001h155.826c0-21.063 0-41.129 0-66.783z"/><path d="m256 224.519-90.953-90.952h-31.481c0-.001 0 0 0 0l122.433 122.433h.001s0-21.705 0-31.481z"/></g><g fill="#f0f0f0"><path d="m154.395 300.522 14.05 29.378 31.727-7.333-14.208 29.302 25.514 20.233-31.767 7.16.089 32.564-25.405-20.373-25.404 20.373.089-32.564-31.768-7.16 25.515-20.233-14.21-29.302 31.729 7.333z"/><path d="m383.284 356.174 7.025 14.689 15.864-3.667-7.105 14.651 12.758 10.117-15.884 3.58.044 16.282-12.702-10.187-12.702 10.187.044-16.282-15.883-3.58 12.757-10.117-7.104-14.651 15.863 3.667z"/><path d="m317.933 200.348 7.024 14.69 15.864-3.668-7.104 14.651 12.757 10.117-15.883 3.58.043 16.282-12.701-10.187-12.702 10.187.043-16.282-15.883-3.58 12.757-10.117-7.104-14.651 15.864 3.668z"/><path d="m383.284 111.304 7.025 14.69 15.864-3.667-7.104 14.651 12.756 10.116-15.883 3.581.044 16.282-12.702-10.187-12.702 10.187.044-16.282-15.883-3.581 12.756-10.116-7.103-14.651 15.863 3.667z"/><path d="m440.368 178.087 7.024 14.69 15.864-3.668-7.104 14.651 12.757 10.117-15.884 3.581.044 16.281-12.701-10.186-12.702 10.186.043-16.281-15.883-3.581 12.757-10.117-7.104-14.651 15.863 3.668z"/><path d="m399.55 256 5.525 17.006h17.882l-14.467 10.511 5.527 17.005-14.467-10.51-14.466 10.51 5.525-17.005-14.466-10.511h17.881z"/></g></svg>
                        </p>
                        <p class="locale" data-locale="french" data-name="Française" onclick="updateLocaleSelection('french')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><path d="m512 256c0-110.071-69.472-203.906-166.957-240.077v480.155c97.485-36.172 166.957-130.007 166.957-240.078z" fill="#d80027"/><path d="m0 256c0 110.071 69.473 203.906 166.957 240.077v-480.154c-97.484 36.171-166.957 130.006-166.957 240.077z" fill="#0052b4"/></svg>
                        </p>
                        <p class="locale" data-locale="spanish" data-name="Española" onclick="updateLocaleSelection('spanish')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m0 256c0 31.314 5.633 61.31 15.923 89.043l240.077 22.261 240.077-22.261c10.29-27.733 15.923-57.729 15.923-89.043s-5.633-61.31-15.923-89.043l-240.077-22.261-240.077 22.261c-10.29 27.733-15.923 57.729-15.923 89.043z" fill="#ffda44"/><g fill="#d80027"><path d="m496.077 166.957c-36.171-97.484-130.006-166.957-240.077-166.957s-203.906 69.473-240.077 166.957z"/><path d="m15.923 345.043c36.171 97.484 130.006 166.957 240.077 166.957s203.906-69.473 240.077-166.957z"/></g></svg>
                        </p>
                        <p class="locale" data-locale="italian" data-name="Italiano" onclick="updateLocaleSelection('italian')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><path d="m512 256c0-110.071-69.472-203.906-166.957-240.077v480.155c97.485-36.172 166.957-130.007 166.957-240.078z" fill="#d80027"/><path d="m0 256c0 110.071 69.472 203.906 166.957 240.077v-480.154c-97.485 36.171-166.957 130.006-166.957 240.077z" fill="#6da544"/></svg>
                        </p>
                        <p class="locale" data-locale="german" data-name="Deutsche" onclick="updateLocaleSelection('german')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m15.923 345.043c36.171 97.484 130.006 166.957 240.077 166.957s203.906-69.473 240.077-166.957l-240.077-22.26z" fill="#ffda44"/><path d="m256 0c-110.071 0-203.906 69.472-240.077 166.957l240.077 22.26 240.077-22.261c-36.171-97.484-130.006-166.956-240.077-166.956z"/><path d="m15.923 166.957c-10.29 27.733-15.923 57.729-15.923 89.043s5.633 61.31 15.923 89.043h480.155c10.29-27.733 15.922-57.729 15.922-89.043s-5.632-61.31-15.923-89.043z" fill="#d80027"/></svg>
                        </p>
                        <p class="locale" data-locale="dutch" data-name="Nederlandse" onclick="updateLocaleSelection('dutch')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><path d="m256 0c-110.071 0-203.906 69.472-240.077 166.957h480.155c-36.172-97.485-130.007-166.957-240.078-166.957z" fill="#a2001d"/><path d="m256 512c110.071 0 203.906-69.472 240.077-166.957h-480.154c36.171 97.485 130.006 166.957 240.077 166.957z" fill="#0052b4"/></svg>
                        </p>
                        <p class="locale" data-locale="danish" data-name="Dansk" onclick="updateLocaleSelection('danish')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><g fill="#d80027"><path d="m200.349 222.609h309.484c-16.363-125.607-123.766-222.609-253.833-222.609-19.115 0-37.732 2.113-55.652 6.085v216.524z"/><path d="m133.565 222.608v-191.481c-70.293 38.354-120.615 108.705-131.398 191.482h131.398z"/><path d="m133.564 289.391h-131.397c10.783 82.777 61.105 153.128 131.398 191.481z"/><path d="m200.348 289.392v216.523c17.92 3.972 36.537 6.085 55.652 6.085 130.067 0 237.47-97.002 253.833-222.609h-309.485z"/></g></svg>
                        </p>
                        <p class="locale" data-locale="japanese" data-name="日本語" onclick="updateLocaleSelection('japanese')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><circle cx="256" cy="256" fill="#d80027" r="111.304"/></svg>
                        </p>
                        <p class="locale" data-locale="hindi" data-name="हिंदी" onclick="updateLocaleSelection('hindi')">
                            <svg class="locale-flag" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" fill="#f0f0f0" r="256"/><path d="m256 0c-101.494 0-189.19 59.065-230.598 144.696h461.195c-41.407-85.631-129.104-144.696-230.597-144.696z" fill="#ff9811"/><path d="m256 512c101.493 0 189.19-59.065 230.598-144.696h-461.196c41.408 85.631 129.104 144.696 230.598 144.696z" fill="#6da544"/><circle cx="256" cy="256" fill="#0052b4" r="89.043"/><circle cx="256" cy="256" fill="#f0f0f0" r="55.652"/><path d="m256 187.326 17.169 38.938 42.304-4.601-25.136 34.337 25.136 34.337-42.304-4.601-17.169 38.938-17.169-38.938-42.304 4.6 25.136-34.336-25.136-34.337 42.304 4.601z" fill="#0052b4"/></svg>
                        </p>
                        <p class="locale" data-locale="chinese" data-name="中文" onclick="updateLocaleSelection('chinese')">
                            <svg class="locale-flag" enable-background="new -49 141 512 512" viewBox="-49 141 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="207" cy="397" fill="#d80027" r="256"/><g fill="#ffda44"><path d="m91.1 296.8 22.1 68h71.5l-57.8 42.1 22.1 68-57.9-42-57.9 42 22.2-68-57.9-42.1h71.5z"/><path d="m254.5 537.5-16.9-20.8-25 9.7 14.5-22.5-16.9-20.9 25.9 6.9 14.6-22.5 1.4 26.8 26 6.9-25.1 9.6z"/><path d="m288.1 476.5 8-25.6-21.9-15.5 26.8-.4 7.9-25.6 8.7 25.4 26.8-.3-21.5 16 8.6 25.4-21.9-15.5z"/><path d="m333.4 328.9-11.8 24.1 19.2 18.7-26.5-3.8-11.8 24-4.6-26.4-26.6-3.8 23.8-12.5-4.6-26.5 19.2 18.7z"/><path d="m255.2 255.9-2 26.7 24.9 10.1-26.1 6.4-1.9 26.8-14.1-22.8-26.1 6.4 17.3-20.5-14.2-22.7 24.9 10.1z"/></g></svg>
                        </p>
                        <!-- <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div> -->
                    </div>
                    <div class="configType popup-menu-section-title settings-avatar">Avatar</div>
                     <div class="selectTab avatarSelect">
                         <span id="idCharacter" class="caption" onclick="updateNarratorAvatarSelection('character')">
                             Character
                         </span>    
                          <span id="idRobot" class="caption" onclick="updateNarratorAvatarSelection('robot')">
                             Robot
                         </span>                        
                         <span id="idCustomAvatar" class="caption" onclick="updateNarratorAvatarSelection(this.getAttribute('data-visualAvatarName'))">
                         </span>
                          <span id="idBlob" class="caption" onclick="updateNarratorAvatarSelection('blob')">
                             None
                         </span>
                     </div>
                    <div class="configType popup-menu-section-title setting-narrator">Narrator</div>
                    <div class="selectTab genderSelect">
                        <span id=idMX onclick="updateNarratorGenderSelection('male');">Male</span>
                        <span id=idWX onclick="updateNarratorGenderSelection('female')">Female</span>
                    </div>

                    <div class="configType popup-menu-section-title subtitle-suppress-title">Hide subtitles</div>
                    <div class="selectTab subtitleSuppress">
                        <span id="idSSYes" onclick="SubtitleSetting.setUiSuppress('yes');updateSubtitleSupress()">Yes</span>
                        <span id="idSSNo" onclick="SubtitleSetting.setUiSuppress('no');updateSubtitleSupress()">No</span>
                    </div>
                   
                    <hr class="popup-menu-solid-divider">
                    <div class=buttonlist>                       
                        <div class=button onclick="revealShare();">
                            ${SVG.shareMenuTitleIcon()} <span class="caption setting-share">Share</span>
                        </div>
                        <div id="restart-button" class="button" onclick="restartButtonHandler()">
                            <svg fill="none" viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    clip-rule="evenodd"
                                    d="M77 40H84H85H167H175C207.585 40 234 66.4152 234 99C234 103.255 233.55 107.405 232.694 111.404L213.188 106.956C213.72 104.387 214 101.726 214 99C214 77.4609 196.539 60 175 60H167H85H84H77C55.4609 60 38 77.4609 38 99C38 120.539 55.4609 138 77 138H85V158H77C44.4152 158 18 131.585 18 99C18 66.4152 44.4152 40 77 40ZM85.0199 197.764V147.58L84.9999 99.3578C85.0014 96.898 85.7976 94.5046 87.2699 92.5346C91.4698 86.8619 100.03 85.2912 106.389 89.0329L189.227 138.276C190.762 139.168 192.099 140.363 193.157 141.788C197.357 147.43 195.597 155.054 189.227 158.796L106.409 207.999C104.124 209.319 101.529 210.01 98.8896 210C91.2698 210.04 85.0199 204.557 85.0199 197.764Z"
                                    fill-rule="evenodd"
                                    fill="#f9f5f1"
                                />
                            </svg>
                            <span class="caption setting-replay">Replay</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        setupCustomAndBlobButtons();
        updatePlayRateSelection();
        setDefaultHoveredLocaleName("normal");
        buildEmbeddedInviteForm("embeddedInvite");
        setupActionsListScrollTrackers();

        updateSubtitleSupress();
    }
};

const updateSubtitleSupress = () => {
    if (SubtitleSetting.getUiSuppress() === "yes") updateSettingSelection("#idSSYes");
    else updateSettingSelection("#idSSNo");
};

const setupCustomAndBlobButtons = () => {
    //get avatar from json with default as "character"
    let narratorAvatar = extractMetadataProperty(gStory.getUntranslatedStory(), "avatar", "character");

    let eCustomButton = document.getElementById("idCustomAvatar");
    //Show Custom button in Visual avatar
    switch (narratorAvatar) {
        case "robot":
            eCustomButton.style.display = "none";
            addClasses(document.getElementById("idRobot"), "selected");
            break;
        case "blob":
            eCustomButton.style.display = "none";
            addClasses(document.getElementById("idBlob"), "selected");
            eCustomButton.setAttribute("data-visualAvatarName", narratorAvatar);
            break;
        case "character":
        default:
            eCustomButton.style.display = "none";
            addClasses(document.getElementById("idCharacter"), "selected");
            break;
    }
    updateNarratorAvatarSelection();
};

const setupActionsListScrollTrackers = () => {
    const idActionsListElement = document.getElementById("action-menu-actions");
    const isScrollableIdActionsListElement = () => idActionsListElement && idActionsListElement.scrollHeight > idActionsListElement.clientHeight;
    if (idActionsListElement) {
        idActionsListElement.onscroll = (e) => {
            if (e) {
                const scrollFromTop = idActionsListElement.scrollTop;
                const scrollFromBottom = idActionsListElement.scrollHeight - idActionsListElement.offsetHeight - idActionsListElement.scrollTop;

                // Check the top of actions list.
                if (scrollFromTop > 7)
                    gsap.set("#action-menu-actions-list-top-blur", {
                        display: "block",
                        height: Math.min(scrollFromTop, 30),
                    });
                else
                    gsap.set("#action-menu-actions-list-top-blur", {
                        display: "none",
                        height: 0,
                    });
                // Check the bottom of actions list.
                if (isScrollableIdActionsListElement() && scrollFromBottom > 7)
                    gsap.set("#action-menu-actions-list-bottom-blur", {
                        display: "block",
                        height: Math.min(scrollFromBottom, 30),
                        y: 397 - Math.min(scrollFromBottom, 30),
                    });
                else
                    gsap.set("#action-menu-actions-list-bottom-blur", {
                        display: "none",
                        height: 0,
                        y: 397,
                    });
            }
        };
    }
};

function buildEmbeddedInviteForm(idEmbedded = "", style = "regular") {
    const inviteElementContent = `
        <form>
            <div class="menu-heading">
                <div id="share-menu-title" class="menu-title">
                    <span id="share-menu-title-icon">${SVG.shareMenuTitleIcon()}</span>
                    <span class="share-menu-title-span">${Cast.locale.translatedContent["shareMenuTitle"]}</span>
                </div>
                <div class="close-button">
                    <svg onclick="closeMenu()" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.95302 4.38075C4.10613 4.22638 4.2883 4.10384 4.48901 4.02022C4.68972 3.93661 4.905 3.89355 5.12243 3.89355C5.33986 3.89355 5.55514 3.93661 5.75585 4.02022C5.95656 4.10384 6.13873 4.22638 6.29184 4.38075L13.3577 11.529L20.4236 4.44663C20.7338 4.13649 21.1544 3.96225 21.593 3.96225C21.8102 3.96225 22.0252 4.00502 22.2259 4.08814C22.4265 4.17125 22.6089 4.29306 22.7624 4.44663C22.916 4.6002 23.0378 4.78252 23.1209 4.98316C23.204 5.18381 23.2468 5.39887 23.2468 5.61605C23.2468 5.83323 23.204 6.04828 23.1209 6.24893C23.0378 6.44958 22.916 6.63189 22.7624 6.78546L15.6965 13.7855L22.7624 20.8513C23.0726 21.1615 23.2468 21.5821 23.2468 22.0208C23.2468 22.4594 23.0726 22.88 22.7624 23.1902C22.4523 23.5003 22.0316 23.6745 21.593 23.6745C21.1544 23.6745 20.7338 23.5003 20.4236 23.1902L13.3577 16.1243L6.29184 23.1902C6.13827 23.3437 5.95596 23.4656 5.75531 23.5487C5.55466 23.6318 5.33961 23.6746 5.12243 23.6746C4.90525 23.6746 4.6902 23.6318 4.48955 23.5487C4.2889 23.4656 4.10659 23.3437 3.95302 23.1902C3.79945 23.0366 3.67763 22.8543 3.59452 22.6536C3.51141 22.453 3.46863 22.2379 3.46863 22.0208C3.46863 21.8036 3.51141 21.5885 3.59452 21.3879C3.67763 21.1872 3.79945 21.0049 3.95302 20.8513L11.0354 13.7855L3.95302 6.71958C3.79864 6.56646 3.67611 6.38429 3.59249 6.18358C3.50887 5.98287 3.46582 5.76759 3.46582 5.55016C3.46582 5.33273 3.50887 5.11745 3.59249 4.91674C3.67611 4.71603 3.79864 4.53387 3.95302 4.38075V4.38075Z" fill="#f9f5f1"/></svg>
                </div>
            </div>
            <fieldset>
                <div class="configType popup-menu-subtitle name-subtitle">${Cast.locale.translatedContent["inviteNameLabel"]}</div>
                <input class="invitee-name" name='inviteFirstName' type="text" placeholder="${
                    Cast.locale.translatedContent["inviteNamePlaceholder"]
                }" title="Invitee's Name" required autocomplete="off" type="text" />
                
                <div class="configType popup-menu-subtitle sms-subtitle">${Cast.locale.translatedContent["inviteSMSLabel"]}</div>
                <input class="invitee-phone-email invitee-phone-input" name='inviteSMSNumber' placeholder="${
                    Cast.locale.translatedContent["inviteSMSPlaceholder"]
                }" title="Ten Digits U.S. Phone Number" required autocomplete="off" type="tel" />
                
                <div class="configType popup-menu-subtitle email-subtitle">${Cast.locale.translatedContent["inviteEmailLabel"]}</div>
                <input class="invitee-phone-email invitee-email-input" name='inviteEmail' placeholder="${
                    Cast.locale.translatedContent["inviteEmailPlaceholder"]
                }" title="Email Address" required autocomplete="off" type="email"/>
                
                <div name="label"></div>
                <input class="submitShare" type="submit" value="${Cast.locale.translatedContent["inviteSubmit"]}">
            </fieldset>
            <div id="share-confirmation-container">
                <div id="share-success-icon">${SVG.successConfirmationCheckIcon()}</div>
                <div id="share-confirmation">
                    <p id="share-progress-message">${Cast.locale.translatedContent["sharingStatusText"]}</p>
                    <p id="share-progress-status"></p>
                    <p id="share-confirmation-message"></p>
                </div>
            </div>
        </form>
    `;

    const inviteElement = document.getElementById(idEmbedded);
    if (inviteElement) {
        // Inject invite form.
        inviteElement.innerHTML = inviteElementContent;

        const inviteFormElement = inviteElement.children[0];
        const inviteeNameInputElement = inviteFormElement.elements["inviteFirstName"];
        const inviteePhoneInputElement = inviteFormElement.elements["inviteSMSNumber"];
        const inviteeEmailInputElement = inviteFormElement.elements["inviteEmail"];
        const shareProgressMessageElement = document.getElementById("share-progress-message");
        const shareProgressStatusElement = document.getElementById("share-progress-status");
        const shareConfirmationMessageElement = document.getElementById("share-confirmation-message");

        //Initial state of share button disabled
        validateShareInputs(inviteeNameInputElement, inviteeEmailInputElement, inviteePhoneInputElement, inviteFormElement);

        //Disable submit button if name input contains whitepsaces
        inviteeNameInputElement.addEventListener("keyup", () => {
            validateShareInputs(inviteeNameInputElement, inviteeEmailInputElement, inviteePhoneInputElement, inviteFormElement);
        });

        inviteePhoneInputElement.addEventListener("keyup", () => {
            validateShareInputs(inviteeNameInputElement, inviteeEmailInputElement, inviteePhoneInputElement, inviteFormElement);
        });
        inviteeEmailInputElement.addEventListener("keyup", () => {
            validateShareInputs(inviteeNameInputElement, inviteeEmailInputElement, inviteePhoneInputElement, inviteFormElement);
        });

        // Add event listener to invitee phone input.
        inviteePhoneInputElement.addEventListener("input", () => {
            if (inviteePhoneInputElement.value.length) inviteeEmailInputElement.required = false;
            else inviteeEmailInputElement.required = true;

            inviteePhoneInputElement.value = format_phone_number(inviteePhoneInputElement.value);
        });

        // Add event listener to invitee email input.
        inviteeEmailInputElement.addEventListener("input", () => {
            if (inviteeEmailInputElement.value.length) inviteePhoneInputElement.required = false;
            else inviteePhoneInputElement.required = true;
        });

        // Add event listener to submit invitee information.
        inviteFormElement.addEventListener("submit", (event) => {
            event.preventDefault();

            gsap.set(`#${idEmbedded} fieldset`, { display: "none" });
            gsap.set(`#${idEmbedded} #share-confirmation-container`, {
                display: "flex",
            });

            // Show share process status.
            if (shareProgressMessageElement) shareProgressMessageElement.innerText = Cast.locale.translatedContent["sharingShareProgressMessageText"];
            if (shareProgressStatusElement) shareProgressStatusElement.innerText = "";
            if (shareConfirmationMessageElement) shareConfirmationMessageElement.innerText = "";

            // Share the cast.
            const inviteeName = inviteeNameInputElement.value;
            const inviteePhone = inviteePhoneInputElement.value;
            const inviteeEmail = inviteeEmailInputElement.value;
            const inviteeData = {
                firstName: inviteeName,
                token: getTokenFromUrl().token,
            };
            if (inviteePhone) inviteeData["smsNumber"] = inviteePhone;
            if (inviteeEmail) inviteeData["email"] = inviteeEmail;
            sendInviteData(inviteeData)
                .then((response) => {
                    if (response.status === 200) {
                        gsap.set("#share-success-icon", { display: "flex" });
                        if (shareProgressMessageElement) shareProgressMessageElement.innerText = Cast.locale.translatedContent["succeededShareProgressMessageText"];
                        if (shareProgressStatusElement) shareProgressStatusElement.innerText = Cast.locale.translatedContent["succeededShareProgressStatusText"];
                        if (shareConfirmationMessageElement) shareConfirmationMessageElement.innerText = Cast.locale.translatedContent["succeededShareConfirmationMessageText"];
                        inviteFormElement.reset();
                    } else {
                        gsap.set("#share-confirmation-container svg", {
                            display: "none",
                        });
                        if (shareProgressMessageElement) shareProgressMessageElement.innerText = Cast.locale.translatedContent["failedShareProgressMessageText"];
                        if (shareProgressStatusElement) shareProgressStatusElement.innerText = "Error!";
                        if (shareConfirmationMessageElement)
                            shareConfirmationMessageElement.innerText = Cast.locale.translatedContent["failedShareConfirmationMessageText"] + " [Error: 1]";
                    }
                })
                .catch((err) => {
                    console.error(err);
                    gsap.set("#share-confirmation-container svg", {
                        display: "none",
                    });
                    if (shareProgressMessageElement) shareProgressMessageElement.innerText = Cast.locale.translatedContent["failedShareProgressMessageText"];
                    if (shareProgressStatusElement) shareProgressStatusElement.innerText = "Error!";
                    if (shareConfirmationMessageElement)
                        shareConfirmationMessageElement.innerText = Cast.locale.translatedContent["failedShareConfirmationMessageText"] + " [Error: 2]";
                })
                .then(() => {
                    setTimeout(() => {
                        validateShareInputs(inviteeNameInputElement, inviteeEmailInputElement, inviteePhoneInputElement, inviteFormElement);

                        gsap.set("#share-confirmation-container", {
                            display: "none",
                        });
                        gsap.set(`#${idEmbedded} fieldset`, {
                            display: "block",
                        });
                    }, 3000);
                });
        });
    }

    function validateShareInputs(inviteeNameInputElement, inviteeEmailInputElement, inviteePhoneInputElement, inviteFormElement) {
        const nameValue = inviteeNameInputElement.value.trim();
        const emailValue = inviteeEmailInputElement.value.trim();
        const phoneValue = inviteePhoneInputElement.value.trim();

        const submitButton = inviteFormElement.querySelector(".submitShare");
        // console.log(nameValue.length, emailValue.length, phoneValue.length);

        const validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailValue);

        if (nameValue.length && ((emailValue.length && validEmail) || phoneValue.length)) {
            submitButton.classList.remove("submitShareDisableHover");
            gsap.set(submitButton, { alpha: 1, disabled: false });
        } else {
            submitButton.classList.add("submitShareDisableHover");
            gsap.set(submitButton, { alpha: 0.5, disabled: true });
        }
    }
}

function actionPlayChart(chartID) {
    if (!chartID || !Cast.userInteracted) return;

    if (Playback.isPaused) {
        controlPlay();
    }

    if (Cast.currentChart) {
        let forwardDirection = 1;
        skipToChart(forwardDirection, chartID);
    }
}

const capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
};

function changeCastMarksToMarks(s) {
    //this is to change cast:mark to mark for css display
    s = s.replace(/<cast:mark>/g, "<mark>");
    s = s.replace(/<\/cast:mark>/g, "</mark>");

    s = s.replace(/<cast:nospeechfootnote>/g, "<mark class=nospeechfootnote>");
    s = s.replace(/<\/cast:nospeechfootnote>/g, "</mark>");

    return s;
}

//This is to REMOVE END hypen
const removeEndHypenForNarrationBox = (s) => (s ? s.replace(/\ *\-\ *$/g, "") : "");

const addNarrationBoxDivs = (narrationTexts) => {
    let narrationBoxDivs = "";
    narrationBoxDivs += `<span class="narration-box-arrow-blob" style="border-top-color: var(--cast-subtitle-background-color);"></span>
                        <span class="narration-box-arrow-avatar" style="border-right-color: var(--cast-subtitle-background-color);"></span>`;

    const narrationTextClass = (n) => (n === narrationTexts.length - 1 ? "current" : "");
    for (let i = 1; i < narrationTexts.length; i++) {
        if (narrationTexts[i])
            narrationBoxDivs += `
                <div class="${narrationTextClass(i)} narrationBoxDiv">${narrationTexts[i]}</div>
            `;
    }

    return narrationBoxDivs;
};

const appendBreakIfNoHypen = (s) => {
    return s;
};

function setupNarrationBox() {
    const nB = createNarrationBox("idNarrationBox", "narrationBox");
    playBoxElement().appendChild(nB);

    const theme = getThemeName();
    let color = hexWithOpacity("#393531", 0.9); //enables blur
    let textColor = "white";
    if (theme !== "dark") {
        color = hexWithOpacity("white", 0.9); //enables blur
        textColor = "#393531";
    }
    document.documentElement.style.setProperty("--cast-subtitle-background-color", color);
    document.documentElement.style.setProperty("--cast-subtitle-text-color", textColor);
    document.documentElement.style.setProperty("--cast-subtitle-fore-color", hexWithOpacity(textColor, 0.6));

    gsap.set(nB, { autoAlpha: 0, text: "" });
    return nB;
}

function addNarrationTween(tl, nB) {
    tl.set(nB, { autoAlpha: SubtitleSetting.getCurrent() === "on" ? 1 : 0 });
}

const callee = () => {
    // gets the text between whitespace for second part of stacktrace
    return new Error().stack.match(/at (\S+)/g)[1].slice(3);
};

function autoseconds(seconds) {
    let numyears = Math.floor(seconds / 31536000);
    let numdays = Math.floor((seconds % 31536000) / 86400);
    let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    // var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
    let numseconds = seconds % 60;

    // return numyears + " years " + numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";

    if (numdays > 0) {
        return numdays + "d" + numhours + "h";
    } else if (numhours > 0) {
        return numhours + "h" + numminutes + "m";
    } else if (numminutes > 0) {
        return numminutes + "m" + numseconds + "s";
    } else if (numseconds >= 0) {
        return numseconds + "s";
    }
}

const plural = (x) => (x === 1 ? "" : "s");

const singularPlural = (suffix, num, decimalPlaces = 0, seperatorString = "||") => {
    if (!suffix || suffix === "") return suffix;
    if (!suffix.includes(seperatorString)) return suffix;
    if (decimalPlaces !== 0) return suffix.split(seperatorString)[1];

    const space = suffix[0] === " " ? " " : "";

    if (num == 1)
        // not ===
        return space + suffix.split(seperatorString)[0];
    else return space + suffix.split(seperatorString)[1];
};

const useFeature = (feature) => {
    return new URLSearchParams(window.location.search).has(feature);
};

const featureValue = (key) => {
    return new URLSearchParams(window.location.search).get(key);
};

//this expects a variable number of arguments of maps
function mapMerge() {
    let mapToReturn = new Map();
    Array.from(arguments).forEach((mapToMerge) => {
        if (mapToMerge instanceof Map) for (let [k, v] of mapToMerge.entries()) mapToReturn.set(k, v);
    });
    return mapToReturn;
}

function castHashNarration(narration, backEndPlayRate, sampleRate, lang, gender) {
    // console.log(backEndPlayRate, " backEndPlayRate", lang, " lang"); //needed for tuning
    return castHash(narration + backEndPlayRate + sampleRate + lang + gender + tts_type);
}

//emoji safe hash
function castHash(str, seed = 0, prefix = "h") {
    // modified version of https://stackoverflow.com/a/52171480/1705353
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, uch; i < str.length; i++) {
        uch = str.codePointAt(i); //was charCodeAt, we have emojis
        h1 = Math.imul(h1 ^ uch, 2654435761);
        h2 = Math.imul(h2 ^ uch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return prefix + (4294967296 * (2097151 & h2) + (h1 >>> 0));
}



const consoleHandler = () => {
    //snippets from https://stackoverflow.com/questions/1215392/how-to-quickly-and-conveniently-disable-all-console-log-statements-in-my-code
    if (process.env.NODE_ENV === "production" && !useFeature("console")) {
        // except error
        [
            "assert",
            "clear",
            "count",
            "debug",
            "dir",
            "dirxml",
            "exception",
            "group",
            "groupCollapsed",
            "groupEnd",
            "info",
            "log",
            "markTimeline",
            "profile",
            "profileEnd",
            "table",
            "time",
            "timeEnd",
            "timeStamp",
            "trace",
            "warn",
        ].forEach((method) => {
            console[method] = () => {};
        });
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
    window.onerror = function (msg, url, lineNo, columnNo, error) {
        if (typeof columnNo === "undefined") columnNo = "0";
        if (typeof error === "undefined") error = "unknown";
        racetrack("console.error", {
            msg: msg,
            url: url,
            lineno: lineNo,
            columnNo: columnNo,
            error: JSON.stringify(error),
        });
        return false; //fire default with false return
    };
};
const availableDimensions = () => {
    const availableWidth = document.body.offsetWidth;
    const availableHeight = document.body.offsetHeight;
    return { availableWidth, availableHeight };
};

const isDesktopMode = () => {
    const { availableWidth, availableHeight } = availableDimensions();
    return availableWidth > availableHeight;
};

const resizeCast = () => {
    const root = document.documentElement;
    const autoPlayMenuElement = document.getElementById("auto-play-menu");
    if (isDesktopMode()) {
        /* desktop */
        root.style.setProperty("--cast-aspect-ratio", ".75");
        root.style.setProperty("--videoWidth", "1080px");
        root.style.setProperty("--halfWidth", "540px"); //--videoWidth / 2
        root.style.setProperty("--toast-container-width", "216px");
        root.style.setProperty("--toast-action-arrow-margin-left", "56px");
        root.style.setProperty("--x-gap", "40px");
        root.style.setProperty("--config-x-gap", Cast.openedMenuType === "actionFeedback" ? "240px" : "280px");
        root.style.setProperty("--title-font-size", "30px");
        root.style.setProperty("--title-margin-top", "0px");
        root.classList.remove("isMobile");
        root.classList.add("isDesktop");

        gsap.set("#idVisemeRealtime", { width: 0 });
        if (autoPlayMenuElement) gsap.set(autoPlayMenuElement, { width: "34%", inset: "26% 33%" });
        if (Cast.openedMenuType === "actionFeedback" && !Cast.currentChart._steps[getCurrentStepIndex()]?.narrations[getCurrentNarrationIndex()]?.feedback?.injected) {
            closeMenu(true, false);
            controlPause();
        }
        !Cast.userInteracted
            ? Cast.component.trayContainer.updateTrayContainerElement("landscape", "auto", Cast.openedMenuType)
            : Cast.component.trayContainer.updateTrayContainerElement("landscape", "normal", Cast.openedMenuType);
    } else {
        /* mobile */
        root.style.setProperty("--cast-aspect-ratio", "1.9");
        root.style.setProperty("--videoWidth", "440px");
        root.style.setProperty("--halfWidth", "220px");
        root.style.setProperty("--toast-container-width", "166px");
        root.style.setProperty("--toast-action-arrow-margin-left", "4px");
        root.style.setProperty("--x-gap", "8px");
        root.style.setProperty("--config-x-gap", "0px");
        root.style.setProperty("--title-font-size", "20px");
        root.style.setProperty("--title-margin-top", "10px"); //This compensates for smaller font size
        root.classList.add("isMobile");
        root.classList.remove("isDesktop");

        gsap.set("#idVisemeRealtime", { width: "0px" });
        if (autoPlayMenuElement) gsap.set(autoPlayMenuElement, { width: "85%", inset: "26% 7.5%" });
        !Cast.userInteracted
            ? Cast.component.trayContainer.updateTrayContainerElement("portrait", "auto", Cast.openedMenuType)
            : Cast.component.trayContainer.updateTrayContainerElement("portrait", "normal", Cast.openedMenuType);
    }
    if (Playback.hasEnded) {
        Cast.disablePlayPause();
        Cast.disableSkip();
    }
    BaseChart.setBackgroundImageForMode();

    const updateSidePanelWidth = () => {
        if (isDesktopMode()) {
            const bottomShadowRect = document.querySelector(".desktop-bottom-bar-shadow")?.getBoundingClientRect();
            if (bottomShadowRect) {
                gsap.set(".desktop-bottom-bar", { left: bottomShadowRect.left, width: bottomShadowRect.width });
            }

            const rightPanelShadowRect = document.querySelector(".right-panel-shadow")?.getBoundingClientRect();
            if (rightPanelShadowRect) {
                const left = rightPanelShadowRect?.left;
                const top = rightPanelShadowRect?.top;
                const height = rightPanelShadowRect?.height;
                const width = rightPanelShadowRect?.width;

                gsap.set("#side-panel", { left, top, height, width });
                gsap.set(".desktop-bottom-bar", { top: top + height });
                // gsap.set(".desktop-bottom-bar-content .dbb__right", { width });
                gsap.set(".desktop-bottom-bar-content .dbb__right", { width: "402px" });
            }
        }
    };

    const elementInnerVideo = document.querySelector("#innervideo");
    const currentWidth = elementInnerVideo.offsetWidth;
    const currentHeight = elementInnerVideo.offsetHeight;
    const { availableWidth, availableHeight } = availableDimensions();
    const s = Math.min(availableWidth / currentWidth, availableHeight / currentHeight);
    const tx = (availableWidth - s * currentWidth) / 2;
    const ty = (availableHeight - s * currentHeight) / 2;

    gsap.set(elementInnerVideo, {
        scale: s,
        left: tx,
        top: featureValue("infoChartId") ? 0 : ty,
        autoAlpha: 1,
    });

    updateSidePanelWidth();

    updateTranscriptsVisibility();

    model.onPlayerResize.notify();
};

const updateTranscriptsVisibility = () => {
    if (isDesktopMode()) {
        if (SubtitleSetting.uiSuppress === "yes") {
            SubtitleSetting.setCurrent("off");
        } else if (TranscriptMenuDetails.getCurrent() === "on") {
            SubtitleSetting.setCurrent("off");
        } else {
            SubtitleSetting.setCurrent("on");
        }
    } else {
        SubtitleSetting.setCurrent(SubtitleSetting.uiSuppress === "yes" ? "off" : "on");
    }
};

const runResizeLogic = () => {
    if (useFeature("thumbnail") || useFeature("infoChartId")) {
        Cast.hideRightPanelContainer();
        if (useFeature("infoChartId")) {
            gsap.set(".desktop-bottom-bar-shadow", { display: "none" });
        }
    } else if (isDesktopMode()) {
        Cast.showRightPanelContainer();
    } else {
        Cast.hideRightPanelContainer();
    }
    // resizeCast() is going to be called when the right panel container is toggled above.
    // Running it again here is redundant.
};

function callWeburl(url) {
    window.open(url, "_blank");
}

function callWebhook(destination, postData) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
        }
    };
    xhttp.open("POST", destination, true);
    if (postData != null) {
        xhttp.send(JSON.stringify(postData));
    } else {
        xhttp.send();
    }
}

function callWebhook2(eventType, action2AddAsString, url = "", source = "actions") {
    racetrack("click.action", {
        eventInformation: {
            type: "click.action",
            event_type: eventType,
        },
        eventData: {
            object: {
                type: "action",
                action: action2AddAsString,
                url: url,
            },
            source: source,
        },
    });
}

const isLastChart = (index = getCurrentChartIndex()) => index === Cast.megaSequence.length - 1;

const actionListPresent = (story) => null !== extractMetadataProperty(story, "actionList", null);

const enableDisableSettingOption = (/** @type {string | HTMLElement} */ id, /** @type { string } */ state) => {
    const e = typeof id === "object" ? id : document.getElementById(id);
    if (e) state === "disable" ? addClasses(e, "disabled") : removeClasses(e, "disabled");
};

const updateSettingSelection = (/** @type {string} */ optionSelectionSelector) => {
    const optionSelectionElement = document.querySelector(optionSelectionSelector);
    if (optionSelectionElement) {
        const parentElement = optionSelectionElement.parentElement;
        if (parentElement) {
            const siblingElements = Array.from(parentElement.children);
            siblingElements.forEach((childElement) => removeClasses(childElement, "selected"));
            addClasses(optionSelectionElement, "selected");
        }
    }
};

const updatePlayRateSelection = (rate = PlayRateSetting.getCurrent()) => {
    PlayRateSetting.setNew(rate);
    switch (PlayRateSetting.getNew()) {
        case "slow":
            updateSettingSelection("#idPlayRateSlow");
            break;
        case "fast":
            updateSettingSelection("#idPlayRateFast");
            break;
        case "x-fast":
            updateSettingSelection("#idPlayRateXFast");
            break;
        default:
            updateSettingSelection("#idPlayRateMedium");
            break;
    }
    Playback.settingsHaveChanged = hasNewSettings();
};

const applyPlayRateSelection = () => {
    if (PlayRateSetting.hasNew()) {
        PlayRateSetting.applyNew();
        Cast.component.rfContainer.updateSelectedPlaybackSpeed();
    }
};

const cancelPlayRateSelection = () => {
    if (PlayRateSetting.hasNew()) {
        updatePlayRateSelection();
        PlayRateSetting.cancelNew();
    }
};

const setLocaleInAutoPlay = (e) => {
    const clickedElement = e ? e.target : e;
    let clickedLocale = Playback.preferredLanguage || "english";
    if (clickedElement) {
        if (clickedElement.classList.contains("locale")) clickedLocale = clickedElement.dataset.locale;
        else {
            const clickedParentElement = clickedElement.closest(".locale");
            if (clickedParentElement) clickedLocale = clickedParentElement.dataset.locale;
        }
    }
    updateLocaleSelection(clickedLocale);
    applyLocaleSelection();
};

const applyLocale = () => {
    Cast.locale.lang = LocaleSetting.getCurrent();
    Cast.locale.translateMainPage(LocaleSetting.getCurrent());
    gStory.translate(LocaleSetting.getCurrent());
};

const updateLocaleSelection = (locale = LocaleSetting.getCurrent()) => {
    LocaleSetting.setNew(locale);
    updateSettingSelection(`#mainMenu .locale[data-locale=${LocaleSetting.getNew()}`);
    if (["chinese", "hindi"].includes(LocaleSetting.getNew())) {
        enableDisableSettingOption("idMX", "disable");
        updateNarratorGenderSelection("female");
    } else enableDisableSettingOption("idMX", "enable");
    Playback.settingsHaveChanged = hasNewSettings();

    //Update settings panel
    const dynamicFields = {};
    const el = document.querySelector("#mainMenu");
    const customAvatarText = el.querySelector("#idCustomAvatar").textContent.trim();
    if (customAvatarText != "") {
        dynamicFields["idCustomAvatar"] = extractMetadataProperty(gStory.getUntranslatedStory(), "avatar", null);
    }

    Cast.locale.translateSettingsContent(locale, dynamicFields, () => {
        el.querySelector(".setting-title").textContent = Cast.locale.translatedContent["settingMenuTitle"];
        el.querySelector("#idPlayRate").textContent = Cast.locale.translatedContent["settingPlaybackSpeed"];
        el.querySelector(".setting-language").textContent = Cast.locale.translatedContent["settingLanguage"] + ": ";
        el.querySelector(".settings-avatar").textContent = Cast.locale.translatedContent["settingAvatar"];
        el.querySelector("#idCharacter").textContent = Cast.locale.translatedContent["settingCharacter"];
        el.querySelector("#idRobot").textContent = Cast.locale.translatedContent["settingRobot"];
        el.querySelector("#idBlob").textContent = Cast.locale.translatedContent["settingNone"];
        //This is dynamic
        if (dynamicFields["idCustomAvatar"]) {
            el.querySelector("#idCustomAvatar").textContent = Cast.locale.translatedContent["idCustomAvatar"];
        }

        el.querySelector(".setting-narrator").textContent = Cast.locale.translatedContent["settingNarrator"];
        el.querySelector("#idMX").textContent = Cast.locale.translatedContent["settingMale"];
        el.querySelector("#idWX").textContent = Cast.locale.translatedContent["settingFemale"];

        el.querySelector(".subtitle-suppress-title").textContent = Cast.locale.translatedContent["suppressSubtitles"];
        el.querySelector("#idSSYes").textContent = Cast.locale.translatedContent["settingYes"];
        el.querySelector("#idSSNo").textContent = Cast.locale.translatedContent["settingNo"];

        el.querySelector(".setting-share").textContent = Cast.locale.translatedContent["settingShare"];
        el.querySelector(".setting-replay").textContent = Cast.locale.translatedContent["settingReplay"];

        //
        const sharePanel = document.querySelector("#embeddedInvite");
        sharePanel.querySelector(".share-menu-title-span").textContent = Cast.locale.translatedContent["shareMenuTitle"];
        sharePanel.querySelector(".name-subtitle").textContent = Cast.locale.translatedContent["inviteNameLabel"];
        sharePanel.querySelector(".invitee-name").placeholder = Cast.locale.translatedContent["inviteNameLabel"];
        sharePanel.querySelector(".sms-subtitle").textContent = Cast.locale.translatedContent["inviteSMSLabel"];
        sharePanel.querySelector(".invitee-phone-input").placeholder = Cast.locale.translatedContent["inviteSMSPlaceholder"];
        sharePanel.querySelector(".email-subtitle").textContent = Cast.locale.translatedContent["inviteEmailLabel"];
        sharePanel.querySelector(".invitee-email-input").placeholder = Cast.locale.translatedContent["inviteEmailPlaceholder"];
        sharePanel.querySelector(".submitShare").value = Cast.locale.translatedContent["inviteSubmit"];
    });
};

const applyLocaleSelection = () => {
    if (LocaleSetting.hasNew()) {
        LocaleSetting.applyNew();
        applyLocale();
    }
};

const cancelLocaleSelection = () => {
    if (LocaleSetting.hasNew()) {
        updateLocaleSelection();
        LocaleSetting.cancelNew();
    }
};

const applyNarratorAvatar = () => {
    const idVisemeRealtimeElement = document.getElementById("idVisemeRealtime");
    if (!idVisemeRealtimeElement) return console.error(`idVisemeRealtimeElement ${idVisemeRealtimeElement} is invalid.`);

    switch (NarratorAvatarSetting.getCurrent()) {
        case "robot":
            const lcr = liquidContextRobot();
            if (lcr.toLowerCase().includes("oliver")) {
                idVisemeRealtimeElement.innerHTML = `<div>${oliverSVG(lcr)}</div>`;
                Cast.narratorAvatar = "#oliver";
            } else {
                idVisemeRealtimeElement.innerHTML = `<div>${robotSVG}</div>`;
                Cast.narratorAvatar = "#robotX";
            }
            break;
        case "wave":
        case "blob":
            const theme = getThemeName();
            idVisemeRealtimeElement.innerHTML = "";
            /*  idVisemeRealtimeElement.innerHTML = `
                <div class="blobAvatarContainer">${blobSVG(theme)}</div>
            `;*/
            Cast.narratorAvatar = "#blobX";
            break;
        default:
            switch (NarratorGenderSetting.hasNew() ? NarratorGenderSetting.getNew() : NarratorGenderSetting.getCurrent()) {
                case "#MX":
                case "male":
                case "idMX":
                    idVisemeRealtimeElement.innerHTML = `<div>${manSVG}</div>`;
                    Cast.narratorAvatar = "#MX";
                    break;
                default:
                case "idWX":
                case "#WX":
                case "#FX": //please use WX
                case "female":
                    idVisemeRealtimeElement.innerHTML = `<div>${womanSVG}</div>`;
                    Cast.narratorAvatar = "#WX";
                    break;
            }
            break;
    }

    reconstructViseme();
    model.onNarratorAvatarChange.data = NarratorAvatarSetting.getCurrent();
    model.onNarratorAvatarChange.notify();

    //Handle narration box position
    const narrationBox = document.querySelector("#idNarrationBox");
    if (narrationBox) {
        narrationBox.classList.remove("blobWithNarrationBox", "avatarWithNarrationBox");
        if (NarratorAvatarSetting.getCurrent() === "blob") {
            narrationBox.classList.add("blobWithNarrationBox");
        } else {
            narrationBox.classList.add("avatarWithNarrationBox");
        }
    }
};

const updateNarratorAvatarSelection = (narratorAvatar = NarratorAvatarSetting.getCurrent()) => {
    // console.log("updateNarratorAvatarSelection", narratorAvatar);
    NarratorAvatarSetting.setNew(narratorAvatar);

    if (NarratorAvatarSetting.new === "blob") updateSettingSelection("#idBlob");
    else if (NarratorAvatarSetting.new === "character") updateSettingSelection("#idCharacter");
    else if (NarratorAvatarSetting.new === "robot") updateSettingSelection("#idRobot");
    else updateSettingSelection("#idCustomAvatar");

    Playback.settingsHaveChanged = hasNewSettings();
};

const applyNarratorAvatarSelection = () => {
    if (NarratorAvatarSetting.hasNew()) {
        NarratorAvatarSetting.applyNew();
        applyNarratorAvatar();
    }
};

const cancelNarratorAvatarSelection = () => {
    if (NarratorAvatarSetting.hasNew()) {
        updateNarratorAvatarSelection();
        NarratorAvatarSetting.cancelNew();
    }
};

const applyNarratorGender = () => {
    applyNarratorAvatar();
};

const updateNarratorGenderSelection = (narratorGender = NarratorGenderSetting.getCurrent()) => {
    if (narratorGender !== "male" || !["chinese", "hindi"].includes(LocaleSetting.hasNew() ? LocaleSetting.getNew() : LocaleSetting.getCurrent())) {
        NarratorGenderSetting.setNew(narratorGender);
        updateSettingSelection(NarratorGenderSetting.getNew() === "male" ? "#idMX" : "#idWX");
        Playback.settingsHaveChanged = hasNewSettings();
    }
};

const applyNarratorGenderSelection = () => {
    if (NarratorGenderSetting.hasNew()) {
        NarratorGenderSetting.applyNew();
        applyNarratorGender();
    }
};

const cancelNarratorGenderSelection = () => {
    if (NarratorGenderSetting.hasNew()) {
        updateNarratorGenderSelection();
        NarratorGenderSetting.cancelNew();
    }
};

const applySubtitleVisibility = () =>
    gsap.set("#idNarrationBox", {
        autoAlpha: SubtitleSetting.getCurrent() === "on" ? 1 : 0,
    });

const applySubtitleVisibilityToggle = () => {
    if (SubtitleSetting.hasNew()) {
        SubtitleSetting.applyNew();
        applySubtitleVisibility();
    }
};

const hasNewSettings = () => PlayRateSetting.hasNew() || LocaleSetting.hasNew() || NarratorAvatarSetting.hasNew() || NarratorGenderSetting.hasNew() || SubtitleSetting.hasNew();

const applySettings = () => {
    applyPlayRateSelection();
    applyNarratorGenderSelection();
    applyLocaleSelection();
    applyNarratorAvatarSelection();
    applySubtitleVisibilityToggle();
};

const cancelSettings = () => {
    cancelPlayRateSelection();
    cancelLocaleSelection();
    cancelNarratorAvatarSelection();
    cancelNarratorGenderSelection();
};

const applySettingsAndCloseMenu = () => {
    if (!hasNewSettings()) return cancelSettingsAndCloseMenu();

    applySettings();
    closeMenu(Cast.userInteracted, true);
};

const cancelSettingsAndCloseMenu = () => {
    cancelSettings();
    closeMenu(Cast.userInteracted, true);
};

const updateChartSubtitles = (text) => {
    if (!text) text = gCurrentNarrationInfo["currentNarrationText"];
    if (!text) return;

    const idNarrationBoxElement = document.getElementById("idNarrationBox");
    if (!idNarrationBoxElement) return;

    text = removeEndHypenForNarrationBox(text);
    text = moveFootnoteToEndOfNarration(text);
    text = changeCastMarksToMarks(text);

    const previousText = gCurrentNarrationInfo["previousNarrationText"] ? gCurrentNarrationInfo["previousNarrationText"] : "";
    gCurrentNarrationInfo["previousNarrationText"] = text;

    const textVal = addNarrationBoxDivs([previousText === text ? "" : previousText, text]);
    gsap.fromTo("#idNarrationBox", { text: textVal }, { autoAlpha: SubtitleSetting.getCurrent() ? 1 : 0 });
};

const updateSubtitles = (text) => {
    const nb = document.getElementById("idNarrationBox");
    const showSubtitles = SubtitleSetting.getCurrent() === "on";

    updateChartSubtitles(text, showSubtitles);
    if (showSubtitles) {
        if (nb) gsap.to("#idNarrationBox", { scale: 1, autoAlpha: 1 });
        updateChartSubtitles(text, showSubtitles);
    } else if (nb) gsap.to("#idNarrationBox", { scale: 0, autoAlpha: 0 });
};

const expandTranscriptMenuDetails = () => {
    const expandedTranscriptMenuTitlePartElement = document.querySelector("#transcript-menu-title .collapsed.transcript-menu-title-part");
    if (expandedTranscriptMenuTitlePartElement) Component.replaceClassNames(expandedTranscriptMenuTitlePartElement, ["collapsed"], ["expanded"]);
    gsap.set(".transcript-step-narration", { display: "block" });
    gsap.set("#expand-transcript-menu-details-button", { display: "flex" });
    gsap.set(["#collapse-transcript-menu-details-button"], { display: "none" });
    TranscriptMenuDetails.setCurrent("expanded");

    gsap.set(".panel-footer-transcripts-button-icon", { innerHTML: SVG.transcriptsToggleIcon() });

    if (!document.documentElement.classList.contains("isMobile")) SubtitleSetting.setCurrent("off");
};

const collapseTranscriptMenuDetails = () => {
    const expandedTranscriptMenuTitlePartElement = document.querySelector("#transcript-menu-title .expanded.transcript-menu-title-part");
    if (expandedTranscriptMenuTitlePartElement) Component.replaceClassNames(expandedTranscriptMenuTitlePartElement, ["expanded"], ["collapsed"]);
    gsap.set("#collapse-transcript-menu-details-button", { display: "flex" });
    gsap.set(["#expand-transcript-menu-details-button", ".transcript-step-narration"], { display: "none" });
    TranscriptMenuDetails.setCurrent("collapsed");

    gsap.set(".panel-footer-transcripts-button-icon", { innerHTML: SVG.transcriptsToggleIcon("white") });

    if (!document.documentElement.classList.contains("isMobile")) SubtitleSetting.setCurrent("on");
};
const injectTrayContainer = () => {
    const autoPlayMenuElement = document.getElementById("auto-play-menu");
    if (autoPlayMenuElement && autoPlayMenuElement.parentNode) autoPlayMenuElement.parentNode.insertBefore(Cast.component.trayContainer.element, autoPlayMenuElement.nextSibling);
};

function moveFootnoteToEndOfNarration(narration) {
    let footnotes = narration.match(/<cast:nospeechfootnote>.*?<\/cast:nospeechfootnote>/g);

    if (footnotes)
        for (let i = 0; i < footnotes.length; i++) {
            narration = narration.replace(/<cast:nospeechfootnote>.*?<\/cast:nospeechfootnote>/, "<span class='superscript'>" + (i + 1) + "</span>");

            narration +=
                "<cast:nospeechfootnote>" +
                (i + 1) +
                ": " +
                footnotes[i].replace("<cast:nospeechfootnote>", "").replace("</cast:nospeechfootnote>", "") +
                "</cast:nospeechfootnote>";
        }

    return narration;
}

const getWindowTitle = (story) => {
    const projectName = extractMetadataProperty(gStory.getUntranslatedStory(), "fullReportName", "Cast");
    const recipientData = extractMetadataProperty(gStory.getUntranslatedStory(), "recipient");
    return formatWindowTitle(recipientData?.first_name, projectName);
};

//TEST: formatWindowTitle("Julis", "CanadaCast")
//TEST: formatWindowTitle("Julis", "CanadaCAST")
//TEST: formatWindowTitle("Julis", "Canada")
//TEST: formatWindowTitle("Julis", "cast")
//TEST: formatWindowTitle("John", "Canada")
//TEST: formatWindowTitle("John", "CanadaCast")
//TEST: formatWindowTitle("John", "cast")
//TEST: formatWindowTitle(true, false)
//TEST: formatWindowTitle("20", "20")
const formatWindowTitle = (propercaseUsername, propercaseProjectName) => {
    if (propercaseProjectName && propercaseProjectName === "cast") propercaseProjectName = "Cast";

    let suffix = "";
    if (!propercaseProjectName || propercaseProjectName === "") suffix = "Cast presentation";
    if (propercaseProjectName && propercaseProjectName.toString().toLowerCase().endsWith("cast")) suffix = "presentation";
    else suffix = "Cast presentation";

    if (!propercaseUsername) propercaseUsername = "";

    let nameApostropheS = "";
    if (propercaseUsername !== "") nameApostropheS = propercaseUsername + "'" + (propercaseUsername.toString().endsWith("s") ? "" : "s");

    return (nameApostropheS + " " + propercaseProjectName + " " + suffix).replaceAll("  ", " ");
};

const blend = (fraction, c1, c2, l) => {
    return pSBC(fraction, hex(c1), hex(c2), l);
};

//We don't use them
/**
 *
 * @param {*} c COLOR in any format e.g. #2ED86E, or rgb(46, 216, 110), rgba(46, 216, 110, XX) NOTE opacity as part of color XX is ignored
 * @param {*} o Opacity e.g. 0.75
 */
function toRBGA(c, o) {
    if (!o) o = 1;

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex(c));
    return result ? "rgba(" + parseInt(result[1], 16) + ", " + parseInt(result[2], 16) + ", " + parseInt(result[3], 16) + ", " + o + ")" : null;
}

function rgbArray(c) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex(c));

    return [(parseInt(result[1], 16) * 299, parseInt(result[2], 16) * 587, parseInt(result[3], 16) * 114)];
}

// https://en.wikipedia.org/wiki/YIQ
function yiq(c) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex(c));

    return (parseInt(result[1], 16) * 299 + parseInt(result[2], 16) * 587 + parseInt(result[3], 16) * 114) / 1000 >= 75;
}

function highlightMarkerWidth() {
    return "6px";
}

function highlightMarkerLeft() {
    return "-14px";
}

function highlightMarkerBorderRadius() {
    return "3px";
}

function checkInfographics(highlights) {
    if (featureValue("infoChartId")) {
        highlights = [];
        gsap.defaults({
            duration: 0.01,
        });
    }
    return highlights;
}
