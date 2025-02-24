// racetrack.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

const loadTimeEvent = "loadTime";

const dynamicMap = (ts) => {
    let d = new Map();
    d.set("timestamp", ts);
    d.set("playMode", Cast.userInteracted ? "normal" : "auto");
    d.set("online", navigator.onLine);
    d.set("innerHeight", window.innerHeight);
    d.set("innerWidth", window.innerWidth);
    d.set("outerHeight", window.outerHeight);
    d.set("outerWidth", window.outerWidth);
    d.set("PlayBoxHeight", playBoxHeight());
    d.set("contactInformation", extractMetadataProperty(gStory.getUntranslatedStory(), "contactInformation", {}));
    d.set("castInformation", extractMetadataProperty(gStory.getUntranslatedStory(), "castInformation", {}));
    d.set("webhookDetails", extractMetadataProperty(gStory.getUntranslatedStory(), "webhookDetails", {}));
    d.set("generate_group", extractMetadataProperty(gStory.getUntranslatedStory(), "generate_group", ""));
    return d;
};

const racetrack = (eventName, eventDataObj = {}, sendNow = false) => {
    if (useFeature("donottrack")) return; //without processing;
    const prePlayAllowedEvents = ["view", loadTimeEvent];
    if (!Cast.userInteracted && prePlayAllowedEvents.includes(eventName)) return processEvent(eventDataObj, eventName);
    if (Cast.userInteracted && !prePlayAllowedEvents.includes(eventName)) return processEvent(eventDataObj, eventName);
    return; //without processing;
};

function processEvent(eventDataObj, eventName) {
    let ts = performance.timing.navigationStart + performance.now();
    let eventDataMap = new Map(Object.entries(eventDataObj));

    Analytics.playbackID && eventDataMap.set("playbackID", Analytics.playbackID);
    Analytics.pageLoadID && eventDataMap.set("pageLoadID", Analytics.pageLoadID);
    eventDataMap.set("source", "player");
    let commonDataMap = fullMap(() => dynamicMap(ts));

    // Don't send events for 1 outerHeight and outerWidth playbox as they are probably from caching
    if (commonDataMap.get("outerHeight") === 1 && commonDataMap.get("outerWidth") === 1) {
        return ts;
    }
    try {
        race_xhr({
            eventName: eventName,
            event_ts: ts,
            eventDataMap: mapToObj(eventDataMap),
            commonDataMap: mapToObj(commonDataMap),
        });
    } catch (e) {
        console.log("%cCould not racetrack:" + eventName, "color:orangered; font-size:x-large");
    }

    try {
        analytics.track(eventName, {
            event_ts: ts,
            eventDataMap: mapToObj(eventDataMap),
            commonDataMap: mapToObj(commonDataMap),
        });
    } catch (e) {
        console.log("%cCould not segmenttrack:" + eventName, "color:orangered; font-size:x-large");
    }

    return ts;
}

const identifyCast = (story) => {
    if (analytics.length < 1) return;
    try {
        const source = useFeature("source") && featureValue("source") ? featureValue("source") : "player";
        const recipientData = extractMetadataProperty(story, "recipient");
        if (source === "website") analytics.identify({ source: source });
        else {
            const recipient = extractMetadataProperty(story, "recipient", {});
            const userID = recipient.user_id || "";
            let id, recipientID, name, email, userType, castID;
            if (source === "designer") {
                id = userID;
                userType = "cast_user";
                name = recipient.name || "";
                email = extractMetadataProperty(story, "Username", "");
            } else if (source === "player") {
                userType = "cast_recipient";
                recipientID = recipientData.id;
                name = "";
                castID = extractMetadataProperty(story, "Cast ID");
                if (recipientData.contact?.name) name = recipientData.contact.name;
                else if (recipientData.contact?.first_name || recipientData.contact?.last_name) {
                    if (recipientData.contact.first_name) name += recipientData.contact.first_name;
                    if (recipientData.contact.first_name && recipientData.contact.last_name) name += " ";
                    if (recipientData.contact.last_name) name += recipientData.contact.last_name;
                }
                email = recipientData.contact?.email ? recipientData.contact.email : "";
            }
            // Build identifier object.
            const identifier = {};
            identifier.source = source;
            if (id) identifier.id = id;
            if (userID) identifier.user_id = userID;
            if (userType) identifier.user_type = userType;
            if (recipientID) identifier.recipient_id = recipientID;
            if (name) identifier.name = name;
            if (email) identifier.email = email;
            if (castID) identifier.cast_id = castID;
            // Submit analytics.
            if (email) analytics.identify(email, identifier);
            else analytics.identify(identifier);
        }
    } catch (e) {
        console.error(e);
        console.error("%cCould not send analytics to segment.com", "color:orangered; font-size:x-large");
    }
};

const mapToObj = (m) => {
    return Array.from(m).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});
};

const fullMapForConsoleDir = () => fullMap(performance.timing.navigationStart + performance.now());

const race_xhr = (payload) => {
    fetchService(getRaceUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    }).catch((err) => {
        console.log("%crace_xhr error: " + err, "color:orangered; font-size:x-large");
    });
};

const envMap = () => {
    const d = new Map();
    d.set("qp-token", getTokenFromUrl().token);
    return d;
};

const queryParams = () => {
    let d = new Map();
    for (const [key, value] of new URLSearchParams(window.location.search)) {
        d.set("qp-" + key, value);
    }
    return d;
};

const plugins = () => {
    const d = new Map();
    for (let i = 0; i < navigator.plugins.length; i++) d.set("plugin-fn" + i + "-" + navigator.plugins[i].filename, navigator.plugins[i].name);
    return d;
};

const basicMap = () => {
    const d = new Map();
    d.set("language", navigator.language);
    d.set("platform", navigator.platform);
    d.set("vendor", navigator.vendor);
    d.set("touch", navigator.maxTouchPoints);
    d.set("userAgent", navigator.userAgent);
    d.set("hostname", location.hostname);
    d.set("app", "player");
    return d;
};

const osMap = () => {
    const d = new Map();
    let os = "Unknown OS";
    if (navigator.appVersion.indexOf("Win") != -1) os = "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) os = "macOS";
    if (navigator.appVersion.indexOf("X11") != -1) os = "UNIX";
    if (navigator.appVersion.indexOf("Linux") != -1) os = "Linux";
    if (navigator.userAgent.toLowerCase().indexOf("android") > -1) os = "Android";
    if (/(iPhone|iPod|iPad)/i.test(navigator.platform)) os = "iOS";
    d.set("os", os);
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        d.set("is_mobile", true);
    } else {
        d.set("is_mobile", false);
    }
    return d;
};

const hackMap = () => {
    let nVer = navigator.appVersion;
    let nAgt = navigator.userAgent;
    let browser = navigator.appName;
    let ver = "" + parseFloat(nVer);
    let majorVersion = parseInt(nVer, 10);
    let nameOffset, verOffset, ix;

    // In Opera, the true version is after "Opera" or after "Version"
    if ((verOffset = nAgt.indexOf("Opera")) != -1) {
        browser = "Opera";
        ver = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf("Version")) != -1) ver = nAgt.substring(verOffset + 8);
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
        browser = "Microsoft Internet Explorer";
        ver = nAgt.substring(verOffset + 5);
    }
    // In Chrome, the true version is after "Chrome"
    else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
        browser = "Chrome";
        ver = nAgt.substring(verOffset + 7);
    }
    // In Safari, the true version is after "Safari" or after "Version"
    else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
        browser = "Safari";
        ver = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf("Version")) != -1) ver = nAgt.substring(verOffset + 8);
    }
    // In Firefox, the true version is after "Firefox"
    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
        browser = "Firefox";
        ver = nAgt.substring(verOffset + 8);
    }
    // In most other browsers, "name/version" is at the end of userAgent
    else if ((nameOffset = nAgt.lastIndexOf(" ") + 1) < (verOffset = nAgt.lastIndexOf("/"))) {
        browser = nAgt.substring(nameOffset, verOffset);
        ver = nAgt.substring(verOffset + 1);
        if (browser.toLowerCase() == browser.toUpperCase()) {
            browser = navigator.appName;
        }
    }
    if ((ix = ver.indexOf(";")) != -1) ver = ver.substring(0, ix);
    if ((ix = ver.indexOf(" ")) != -1) ver = ver.substring(0, ix);

    majorVersion = parseInt("" + ver, 10);
    if (isNaN(majorVersion)) {
        ver = "" + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }

    const d = new Map();
    d.set("browserName", browser);
    d.set("browserVersion", ver);
    d.set("browserMajorVersion", majorVersion);
    return d;
};

const fullMap = (dynamicMap) => {
    // ES6 syntax gives issues on Edge
    // return new Map([...dynamicMap(ts), ...cachedBasicMap, ...cachedHackMap, ...cachedOsMap, ...cachedQueryParams, ...cachedPlugins]);
    const cachedBasicMap = basicMap();
    const cachedHackMap = hackMap();
    const cachedOsMap = osMap();
    const cachedQueryParams = queryParams();
    const cachedPlugins = plugins();
    const cachedEnvMap = envMap();
    return mapMerge(dynamicMap(), cachedBasicMap, cachedHackMap, cachedOsMap, cachedQueryParams, cachedPlugins, cachedEnvMap);
};
