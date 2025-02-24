"use strict";

/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */
window.analytics = window.analytics || [];

!(function () {
    if (!useFeature("donottrack")) {
        var analytics = window.analytics;
        if (!analytics.initialize && analytics.invoked) {
            window.console && console.error && console.error("Segment snippet included twice.");
        } else {
            analytics.invoked = !0;
            analytics.methods = [
                "trackSubmit",
                "trackClick",
                "trackLink",
                "trackForm",
                "pageview",
                "identify",
                "reset",
                "group",
                "track",
                "ready",
                "alias",
                "debug",
                "page",
                "once",
                "off",
                "on",
                "addSourceMiddleware",
                "addIntegrationMiddleware",
                "setAnonymousId",
                "addDestinationMiddleware",
            ];
            analytics.factory = function (e) {
                return function () {
                    var t = Array.prototype.slice.call(arguments);
                    t.unshift(e);
                    analytics.push(t);
                    return analytics;
                };
            };
            for (var e = 0; e < analytics.methods.length; e++) {
                var key = analytics.methods[e];
                analytics[key] = analytics.factory(key);
            }
            analytics.load = function (key, e) {
                var t = document.createElement("script");
                t.type = "text/javascript";
                t.async = !0;
                t.src = `${process.env.SERVER_BASE_URL}/file/${key}.js`;

                var n = document.getElementsByTagName("script")[0];
                n.parentNode.insertBefore(t, n);
                analytics._loadOptions = e;
            };
            analytics._writeKey = "80uC2R2trNogWKGuMe5Hnh4BmxgWNbXH";
            analytics.SNIPPET_VERSION = "4.13.2";
            if (!window.location.host.includes("cast.app")) analytics.load("nQFLflPUgy8lWWIUO5JVTXDetioMaj8p");
            else analytics.load("80uC2R2trNogWKGuMe5Hnh4BmxgWNbXH");
            analytics.page();
        }
    }
})();

let castStartTS = Object.freeze(performance.timing.navigationStart + performance.now());
if (!!window.document.documentMode) {
    window.alert("Your browser is not supported. Please use a modern browser like Chrome, Firefox, Edge, or Safari.");
}

// Don't use this directly, use getTokenFromUrl
/** @type {{ token: string | null; type: "demo" | "latest" | "play" | null } | null} */
let tokenFromUrl = null;

const getTokenFromUrl = () => {
    if (tokenFromUrl) {
        return tokenFromUrl;
    }
    const pathSegments = window.location.pathname.split("/");
    tokenFromUrl = { token: null, type: null };
    if (pathSegments.length < 3 || pathSegments[1] !== "play") {
        return tokenFromUrl;
    }
    if (pathSegments[2] === "demo") {
        tokenFromUrl.type = "demo";
        if (pathSegments.length > 3) {
            tokenFromUrl.token = pathSegments[3];
        }
        return tokenFromUrl;
    }
    if (pathSegments[2] === "latest") {
        tokenFromUrl.type = "latest";
        if (pathSegments.length > 3) {
            tokenFromUrl.token = pathSegments[3];
        }
        return tokenFromUrl;
    }
    tokenFromUrl.type = "play";
    tokenFromUrl.token = pathSegments[2];
    return tokenFromUrl;
};

// get json by typing ?json at end of url except on demo.json
// e.g. http://cast.app/play/28jh7mfbSGq2ctZ8zoaowA?json
const tokenInfo = getTokenFromUrl();
if (tokenInfo.type === "play" && tokenInfo.token && new URLSearchParams(window.location.search).has("json")) {
    window.location.href = `${CDN.ttsCDNBaseURL}/video/${tokenInfo.token}.json`;
}

if (useFeature("hex6") && featureValue("hex6") != "") {
    document.body.style.backgroundColor = hex("#" + featureValue("hex6"));
}

Analytics.pageLoadID = newBase64uuid4("pageLoadID");

document.addEventListener("readystatechange", (event) => {
    // When HTML/DOM elements are ready:
    if (event.target.readyState === "interactive") {
        //does same as:  ..addEventListener("DOMContentLoaded"..
        console.log("1. HTML/DOM elements ready");
        // console.timeLog("loader");
    }

    // When window loaded ( external resources are loaded too- `css`,`src`, etc)
    if (event.target.readyState === "complete") {
        injectTrayContainer();

        console.log("2. External resources are loaded");

        // console.timeLog("loader");

        // Load the background music from the CDN
        console.log("preCDN music fetch");
        new Audio().src = CDN.backgroundMusicPath;
        console.log("postCDN Music fetch");
        // console.timeLog("loader");

        window.onresize = () => runResizeLogic();

        gAppLoaded = true;

        setTimeout(() => {
            main();
        }, 10);
    }
});

let title, subtitle;
let playOn = false;
let jsonRetrieved = false;

let gAppLoaded = false;

const main = () => {
    if (Playback.translating || typeof gsap === "undefined" || !gsap || !gStory.hasJsonLoaded() || !gAppLoaded) return setTimeout(main, 100);

    writeFontStyle();
    consoleHandler();

    Analytics.playbackID = newBase64uuid4("playbackID");

    let story = gStory.getTranslatedStory();

    const visemeValue = metadataKeyValue(story, "viseme", "on");

    if (visemeValue === "off") {
        NarratorAvatarSetting.setCurrent("blob");
    } else {
        NarratorAvatarSetting.setCurrent(extractMetadataProperty(gStory.getUntranslatedStory(), "avatar", "character"));
    }

    faceInit(visemeValue);

    ErrorHandler.setupPopAlert();

    registerAndInit();

    applyNarratorAvatar();

    gidSunColors = readCompanyColorsForMode(story, "idSun");
    gsap.set("html", {
        "--cast-color-current-dominant": castColor(0),
    });

    // Set up tray container component element.
    Cast.component.trayContainer.setUpElement();

    !isDesktopMode()
        ? Cast.component.trayContainer.updateTrayContainerElement("portrait", "auto", Cast.openedMenuType)
        : Cast.component.trayContainer.updateTrayContainerElement("landscape", "auto", Cast.openedMenuType);

    initMenu();

    updateNarratorGenderSelection();

    // Initiate right panel container component element.
    Cast.component.rfContainer.setUpElement();
    Cast.component.rightPanelContainer.setUpElement(Cast.component.rfContainer.element);

    // Initiate action feedback menu container component element.
    const actionFeedbackMenuContainerElement = document.getElementById("action-feedback-menu-container");
    if (actionFeedbackMenuContainerElement) actionFeedbackMenuContainerElement.append(Cast.component.rfContainer.element);

    // Initiate toast container component element.
    Cast.component.toastContainer.setUpElement();
    const castVideoElement = document.getElementsByClassName("castVideo")[0];
    if (castVideoElement) castVideoElement.append(Cast.component.toastContainer.element);

    Howler.autoSuspend = false;

    if (!featureValue("infoChartId")) {
        playIntro();
    }
    //background music will only be available if bgmusic is passed in queryparams
    Cast.backgroundMusicGloballyEnabled = useFeature("bgmusic");
    sign();

    setForeverKeyStrokeTrackers();
    setAutoPlayUserInteractionTrackers();

    runResizeLogic();

    Cast.setUpActions();

    if (Playback.preferredLanguage) {
        LocaleSetting.setNew(Playback.preferredLanguage);
        applyLocaleSelection();
    }

    const castEndTS = performance.timing.navigationStart + performance.now();
    const loadTime = castEndTS - castStartTS;

    racetrack(loadTimeEvent, {
        loadTimeEvent: loadTime,
        language: Cast.locale.lang,
        viseme: NarratorGenderSetting.getCurrent(),
        playRate: PlayRateSetting.getXRate(),
    });

    racetrack("view", {
        language: Cast.locale.lang,
        viseme: NarratorGenderSetting.getCurrent(),
        playRate: PlayRateSetting.getXRate(),
    });

    gsap.to("#play-button", { autoAlpha: 1 });
    gsap.set(["#play-button-container", "#locale-container"], { opacity: 0.25 });

    if (useFeature("disabledAutoPlay")) {
        gsap.set(["#play-button-container", "#locale-container"], { opacity: 1 });
        document.documentElement.style.cursor = "pointer";

        document.addEventListener(
            "click",
            () => {
                initCast();
            },
            { once: true }
        );
    } else {
        initCast();
    }
};

const initCast = () => {
    startCast({ playOn: true });
    startCast({ translationDone: true });
};

const startCast = (event) => {
    setWhiteLabelLogo();
    if ("translationDone" in event) {
        if (Playback.translationDone === event["translationDone"]) return;
        Playback.translationDone = event["translationDone"];
    }
    if ("playOn" in event) playOn = event["playOn"];
    if ("jsonRetrieved" in event) jsonRetrieved = event["jsonRetrieved"];
    if (Playback.translationDone && playOn && jsonRetrieved) {
        Cast.tlViseme && Cast.tlViseme.play();
        doSequence();
        if (featureValue("infoChartId")) {
            onlyDisplayChart();
        }
    }
    // Increase the boxshadow of the player if it is called from the Static Player
    if (featureValue("thumbnail")) {
        document.getElementsByClassName("perspectiveContainer")[0].style.boxShadow = "#999591 0px 0px 35px";
    }
};

let gStory = new Story(startCast);

const registerAndInit = () => {
    gsap.registerPlugin(CSSPlugin);
    gsap.registerPlugin(MorphSVGPlugin);
    CSSPlugin.defaultTransformPerspective = 500;
    MorphSVGPlugin.defaultType = "linear"; //"rotational";
};

const onlyDisplayChart = () => {
    Cast.initiateNormalPlay();
    document.getElementById("idVisemeRealtime").style.display = "none";
    document.getElementById("idNarrationBox").style.display = "none";
    document.getElementById("tray-container").style.display = "none";
    document.getElementById("auto-play-menu").style.display = "none";
    document.getElementById("toast-container").style.display = "none";
};

const customerLogoFullPath = () => {
    let logoURLFromJson = logoURL(gStory.getTranslatedStory());
    if (logoURLFromJson) return CDN.logoPathWithSlash + logoURLFromJson;
    return "";
};

const setWhiteLabelLogo = () => {
    let logoURLFromJson = customerLogoFullPath();
    if (logoURLFromJson === "") return;

    document.getElementById("customer-logo").style.display = "block";
    document.getElementById("logo-divider").style.display = "block";

    const customerLogoElement = document.getElementById("customer-logo");
    if (customerLogoElement) {
        customerLogoElement.src = logoURLFromJson;
        customerLogoElement.addEventListener("error", () => {
            if (gsap) {
                gsap.set(["#customer-logo", "#logo-divider"], {
                    display: "none",
                });
            } else {
                document.getElementById("customer-logo").style.display = "none";
                document.getElementById("logo-divider").style.display = "none";
            }
        });
    }
};

const doSequence = () => {
    let sequence = [];
    Analytics.startPlayTime = performance.timing.navigationStart + performance.now();
    let sceneOverride = featureValue("scene");
    if (sceneOverride && sceneOverride.length) sequence.push(sceneOverride);
    else {
        for (let sceneID of sceneSequence(gStory.getUntranslatedStory())) {
            for (let chartID of chartSequence(gStory.getUntranslatedStory(), sceneID)) {
                sequence.push(chartID);
            }
        }
    }
    if (extractMetadataProperty(gStory.getUntranslatedStory(), "actionList", null)) {
        let last = sequence[sequence.length - 1];
        let lastChartObject = gStory.getUntranslatedStory().charts[last];
        if (last && lastChartObject && lastChartObject["poll"]) lastChartObject["poll"].steps = [{ narrations: [] }];
    }

    // Add default action's subsequence of charts at the end of original mega sequence if it is not there already.
    if (sequence[sequence.length - 1].startsWith("options")) {
        const optionsSegments = gStory.getUntranslatedStory().charts[sequence[sequence.length - 1]].options.segments;
        let newSubsequence = [];
        for (let i = 0; i < optionsSegments.length; i++) {
            const sequence = optionsSegments[i].sequence;
            if (sequence && sequence.length > 0) {
                newSubsequence = sequence.concat();
                break;
            }
        }
        if (newSubsequence.length) sequence = sequence.slice(0, sequence.length - 1).concat(newSubsequence);
    }
    // Sanitize the sequence by removing the chart with no steps.
    sequence = sequence.filter((chartID) => stepsOfStory(chartID, gStory.getUntranslatedStory()).length > 0);

    Cast.originalMegaSequence = Cast.megaSequence = sequence;

    Object.freeze(Cast.originalMegaSequence);
    Cast.interjectAutoFeedbackForScene(sequence.length - 1, true);

    Cast.component.trayContainer.initTotalTime(sequence);
    model.chartSequence.data = getStoryPlaylist();
    model.chartSequence.notify();
    if (featureValue("service")) {
        getAllNarrations();
    }
    doNextChart();
};

const getAllNarrations = () => {
    const chartDefaultSequence = [...Cast.originalMegaSequence];
    const allChartKeys = Object.keys(gStory.getUntranslatedStory().charts);
    const difference = allChartKeys.filter((element) => !chartDefaultSequence.includes(element));
    const uniqueKeysToUse = [...new Set([...chartDefaultSequence, ...difference])];

    let allNarrations = [];
    uniqueKeysToUse.forEach((id) => {
        let data = steps(id);
        data.forEach((item) => {
            if (item.narrations) {
                item.narrations.forEach((narration) => {
                    if (typeof narration === "string") {
                        allNarrations.push(narration);
                    } else if (narration.value) {
                        allNarrations.push(narration.value);
                    }
                });
            }
        });
    });
    prefetchAllNarrations(allNarrations);
};

const getStoryPlaylist = () => {
    const chartsPath = [];
    const findNextPath = (charts, optionsSelected = {}) => {
        let hasOptionsChart = false;
        let clearedPath = null;
        for (let chartID of charts) {
            chartsPath.push(chartID);

            if (chartType(gStory.getUntranslatedStory(), chartID) === "options") {
                hasOptionsChart = true;
                const s = segments(chartID);
                let defaultIndexPath = 0;

                if (optionsSelected[chartID] !== undefined) defaultIndexPath = optionsSelected[chartID];
                else {
                    for (let index = 0; index < s.length; index++) {
                        const nextPath = segmentSequenceArray(s, index);
                        if (nextPath.length) {
                            if (s[index].primary) {
                                defaultIndexPath = index;
                                break;
                            }
                        }
                    }
                }

                const nextPath = segmentSequenceArray(s, defaultIndexPath);
                clearedPath = nextPath
                    .join(",")
                    .replaceAll(chartID, "")
                    .split(",")
                    .filter((value) => value !== "" && gStory._story.charts[value]);
                break;
            }
        }

        if (clearedPath) return findNextPath(clearedPath);
    };

    const sceneID = sceneSequence(gStory.getUntranslatedStory())[0];
    findNextPath(chartSequence(gStory.getUntranslatedStory(), sceneID), Cast.selectedOptionsIndexes);
    return chartsPath;
};

const goToSpecificNarration = (chartID, stepIndex, narrationIndex) => {
    stepIndex = parseInt(stepIndex);
    narrationIndex = parseInt(narrationIndex);

    if (stepIndex !== 0) {
        Playback.tempStepIndex = stepIndex;
    }

    if (narrationIndex !== 0) {
        Playback.tempNarrationIndex = narrationIndex;
    }
    skipToChart(1, chartID, false);
    if (Playback.isPaused) {
        controlPlay();
    }
};

const skipForward = () => {
    if (playBoxHidden() || Playback.menuOpen || Playback.disableSkip || Playback.isOnDefaultOptionTimeout || !Cast.userInteracted) return;

    if (Cast.currentChart._chartIdentifier.startsWith("options")) {
        const sequence = segmentSequenceArray(Cast.currentChart._segments, 0);
        if (sequence) {
            // If there are new subsequences from selecting an option, append them.
            // There are two versions of data from json, one where the new subsequence repeat the current option chart, and the one where it is not.
            // So, add the current option chart to new chart sequence and check for duplication if any.
            const oldChartSubsequence = Cast.megaSequence.slice(0, getCurrentChartIndex() + 1);
            Cast.newMegaSequence = Cast.megaSequence
                .slice(0, getCurrentChartIndex() + (sequence.length && oldChartSubsequence[oldChartSubsequence.length - 1] === sequence[0] ? 0 : 1))
                .concat(sequence.length ? sequence : ["autofeedback"]);

            // Sanitize the sequence by removing the chart with no steps.
            Cast.newMegaSequence = Cast.newMegaSequence.filter((chartID) => stepsOfStory(chartID, gStory.getUntranslatedStory()).length > 0);
        }
    }

    skipToChart(1);
};

const skipBackward = () => {
    if (playBoxHidden() || Playback.menuOpen || Playback.isOnDefaultOptionTimeout) return;
    if (Playback.pauseAfter) {
        Cast.enablePlayPause();
        Playback.hasEnded = false;
    }

    skipToChart(-1);
    Cast.component.trayContainer.hideReplayIcon();
};

const playFromBeginning = (animateRewind = true) => {
    // Apply new settings there are any.
    if (hasNewSettings()) applySettings();

    // If the default action timeout is on, ignore rewind.
    if (Playback.isOnDefaultOptionTimeout) return;

    gCurrentNarrationInfo = {};

    // Add static actions, and reset dynmaic actions from auto play.
    Cast.updateActions();

    //Cast.megaSequence needs to be reset for this to work, since options modifies the sequence.
    Cast.megaSequence = Cast.originalMegaSequence;
    Cast.newMegaSequence = [];

    if (Playback.hasEnded) {
        Playback.hasEnded = false;
        Cast.component.trayContainer.hideReplayIcon();
        Playback.cantPauseIfNotHowling = false;
        Cast.enablePlayPause();
        Playback.settingsHaveChanged = false;
    }

    // Handle racing issue on rewind when the menu is open.
    if (Playback.menuOpen) {
        Playback.tempPausedForMenu = false;
        Playback.pauseAfter = false;
        Playback.cantPauseIfNotHowling = false;
        Playback.menuOpen = false;
        Cast.component.trayContainer.toggleTrayPlayButton(!Cast.userInteracted ? "auto" : "normal");
        closeMenu(true, false);
        if (Cast.backgroundMusicGloballyEnabled && Cast.userInteracted && Cast.backgroundMusic && !Cast.backgroundMusic.playing()) Cast.backgroundMusic.play();
    }

    if (Cast.userInteracted && Playback.isPaused) {
        togglePlayPause();
    }

    // Skip to beginning and start playing.
    if (Cast.currentChart) Cast.currentChart._stepsIdx = 0;
    skipToChart(-1, Cast.megaSequence[0], animateRewind);
};

const skipToChart = (forwardDirection = 1, chartID = null, animate = true) => {
    racetrack("chart.skip", { forward: forwardDirection });
    if (forwardDirection === 1 && chartID === null && isLastChart()) return;

    Playback.disableSkip = true;
    if (Cast.currentChart) {
        pauseNtts();

        if (Playback.pauseAfter && isLastChart()) controlPlay(true);

        if (Cast.currentChart._sunsetCalled) {
            Cast.currentChart.transition(chartID, gsap.timeline(), forwardDirection);
        } else {
            Cast.currentChart.sunset(forwardDirection, false, chartID);
        }
        if (animate) {
            if (forwardDirection == 1) Cast.component.trayContainer.animateSkipButton();
            else if (forwardDirection == -1) Cast.component.trayContainer.animateRewindButton();
        }
    }
};

const doNextChart = () => {
    if (Cast.newMegaSequence && Cast.newMegaSequence.length > 0) {
        const optionsCharts = Cast.newMegaSequence.slice(getCurrentChartIndex() + 1);

        if (optionsCharts.length) {
            if (optionsCharts[optionsCharts.length - 1].startsWith("options")) optionsCharts.pop();
            Cast.component.trayContainer.addTime(optionsCharts);

            gStory.countUpdatesOfCharts(optionsCharts);
        }

        Cast.megaSequence = Cast.newMegaSequence;
        model.chartSequence.data = getStoryPlaylist();
        model.chartSequence.notify();
        Cast.newMegaSequence = [];
        Cast.interjectAutoFeedbackForScene(Cast.megaSequence.length - 1, false);
        //TODO --- delete initSubtitlesScrubberInvite(Cast.megaSequence);
    }

    let chartIndex = -1;
    if (Cast.currentChart) {
        chartIndex = getCurrentChartIndex();
    }
    if (chartIndex < 0) {
        chartIndex =
            getCurrentChartIndex() === -1 && Cast.currentChart._chartIdentifier.startsWith("options") && Cast.megaSequence[Cast.megaSequence.length - 1] === "autofeedback"
                ? Cast.megaSequence.length - 1
                : 0;
    } else if (chartIndex < Cast.megaSequence.length - 1) {
        chartIndex += 1;
    }
    const chartID = Cast.megaSequence[chartIndex];
    return doChart(chartID);
};

const doChart = (chartID, source = null) => {
    if (featureValue("infoChartId")) {
        chartID = featureValue("infoChartId");
    }
    Cast.component.trayContainer.checkTotalTime(chartID);
    return gStory.getChart(chartID, source, (chart) => {
        // If the current chart is not the last chart, clear autofeedback chart if it exists.
        // And then, put back the default subsequence of charts.
        if (!isLastChart() && Cast.megaSequence[Cast.megaSequence.length - 1] === "autofeedback") {
            Cast.megaSequence.splice(Cast.megaSequence.length - 1, 1);
            Cast.megaSequence.push.apply(Cast.megaSequence, Cast.originalMegaSequence.slice(Cast.megaSequence.length));
        }
        updateSubtitles();
        chart.do();

        if (gNarratorVisibility === "editorial") {
            if (Cast.currentChart._mode === "editorial") {
                if (NarratorAvatarSetting.getCurrent() === "blob") {
                    NarratorAvatarSetting.setNew(NarratorAvatarSetting.lastSelectedAvatar);
                    NarratorAvatarSetting.applyNew();
                    applyNarratorAvatar();
                }
            } else {
                if (NarratorAvatarSetting.getCurrent() !== "blob") {
                    NarratorAvatarSetting.setNew("blob");
                    NarratorAvatarSetting.applyNew();
                    applyNarratorAvatar();
                }
            }
        }

        Cast.component.trayContainer.updateTrayColorTheme();

        if (Playback.menuOpen) closeMenu();
    });
};

const getThemeName = () => {
    if (Cast.currentChart && Cast.currentChart._imageTextColor) {
        const color = Cast.currentChart._imageTextColor;
        const hexColor = hex(color);
        return pickThemeBasedOnColor(hexColor);
    } else {
        return "dark";
    }
};

const doPreviousChart = () => {
    let chartIndex = -1;
    if (Cast.currentChart) chartIndex = getCurrentChartIndex();
    else chartIndex = 0;
    if (chartIndex >= 1 && Cast.currentChart._narrationIndex == 0) chartIndex -= 1;
    const chartID = Cast.megaSequence[chartIndex];
    return doChart(chartID);
};

const setDefaultHoveredLocaleName = (mode) => {
    const parentElementSelector = mode === "auto" ? "#auto-play-menu" : "#mainMenu";
    const hoveredLocaleNameElement = document.querySelectorAll(`${parentElementSelector} .hovered-locale-name`)[0];
    if (hoveredLocaleNameElement) {
        const dataName = document.querySelectorAll(`${parentElementSelector} .locale[data-locale=${Cast.locale.lang}]`)[0].getAttribute("data-name");
        if (dataName) hoveredLocaleNameElement.innerHTML = dataName;
    }
};

const setSelectedLocaleName = () => {
    const hoveredLocaleNameElement = document.querySelector("#mainMenu .hovered-locale-name");
    if (hoveredLocaleNameElement) {
        const dataName = document.querySelector(".languageSelect .selected").getAttribute("data-name");
        if (dataName) hoveredLocaleNameElement.innerHTML = dataName;
    }
};

const setLocaleFlagHoverTracker = (mode) => {
    const parentElementSelector = mode === "auto" ? "#auto-play-menu" : "#mainMenu";
    const localeElements = document.querySelectorAll(`${parentElementSelector} .locale`);
    const hoveredLocaleNameElement = document.querySelectorAll(`${parentElementSelector} .hovered-locale-name`)[0];
    if (localeElements) {
        for (let i = 0; i < localeElements.length; i++) {
            localeElements[i].addEventListener("mouseover", () => {
                if (hoveredLocaleNameElement) {
                    const dataName = localeElements[i].getAttribute("data-name");
                    if (dataName) hoveredLocaleNameElement.innerHTML = dataName;
                }
            });
            localeElements[i].addEventListener("mouseout", () => {
                if (mode === "auto") {
                    setDefaultHoveredLocaleName(mode);
                } else {
                    setSelectedLocaleName();
                }
            });
        }
    }
};

const setForeverKeyStrokeTrackers = () => {
    document.onkeyup = (e) => {
        // Check if player is ready to trigger normal play key stroke trackers.
        if (
            !gsap ||
            !Cast.backgroundMusic ||
            !Cast.neuralTTS ||
            Playback.menuOpen ||
            Playback.tempPausedForMenu ||
            (document.activeElement &&
                (document.activeElement.classList.contains("invitee-name") ||
                    document.activeElement.classList.contains("invitee-phone-email") ||
                    document.activeElement.id === "feedback-textarea"))
        )
            return;

        // Full screen is enabled, or not.
        const fullScreenEnabled = document.fullscreenEnabled || document.msFullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;

        // Full screen elment already exists, or not.
        const fullScreenElement =
            document.fullscreenElement ||
            document.msFullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.webkitCurrentFullScreenElement;

        // Request full screen.
        const requestFullScreen = () => {
            if (document.documentElement.requestFullscreen) return document.documentElement.requestFullscreen();
            if (document.documentElement.msRequestFullscreen) return document.documentElement.msRequestFullscreen();
            if (document.documentElement.mozRequestFullScreen) return document.documentElement.mozRequestFullScreen();
            if (document.documentElement.webkitRequestFullscreen) return document.documentElement.webkitRequestFullscreen();
            if (document.documentElement.webkitRequestFullScreen) return document.documentElement.webkitRequestFullScreen();
        };

        // Exit full screen.
        const exitFullScreen = () => {
            if (document.exitFullscreen) return document.exitFullscreen();
            if (document.msExitFullscreen) return document.msExitFullscreen();
            if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
            if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
            if (document.webkitCancelFullScreen) return document.webkitCancelFullScreen();
        };

        // Set f or F key strokes tracker for toggling fullscreen.
        if ((e.key && (e.key === "f" || e.key === "F")) || (e.keyCode && e.keyCode === 70))
            return fullScreenEnabled ? (!fullScreenElement ? requestFullScreen() : exitFullScreen()) : null;

        // Set escape or f11 key strokes tracker for exiting fullscreen.
        if ((e.key && (e.key === "Escape" || e.key === "F11")) || (e.keyCode && (e.keyCode === 27 || e.keyCode === 122)))
            return fullScreenEnabled && fullScreenElement ? exitFullScreen() : null;
    };
};

const setAutoPlayKeyStrokeTrackers = () => {
    document.body.onkeyup = (e) => {
        if (!gsap || !Cast.backgroundMusic || !Cast.neuralTTS || Playback.isOnDefaultOptionTimeout || (document.activeElement && document.activeElement.id === "feedback-textarea"))
            return;
        if ((e.key && (e.key === "Enter" || e.key === " ")) || (e.keyCode && (e.keyCode === 13 || e.keyCode === 32))) Cast.initiateNormalPlay();
    };
};

const unsetAutoPlayKeyStrokeTrackers = () => (document.body.onkeyup = null);

const setAutoPlayScreenClickTracker = () => {
    document.body.setAttribute("data-testid", "play-button");
    gsap.set(["#play-button-container", "#locale-container"], { opacity: 1 });
    document.documentElement.style.cursor = "pointer";
    document.addEventListener("click", Cast.initiateNormalPlay);
};

const unsetAutoPlayScreenClickTracker = () => {
    document.documentElement.style.cursor = "default";
    document.removeEventListener("click", Cast.initiateNormalPlay, false);
};

const setAutoPlayUserInteractionTrackers = () => {
    if (!gsap || !Cast.backgroundMusic || !Cast.neuralTTS) return setTimeout(setAutoPlayUserInteractionTrackers, 100);
    setAutoPlayKeyStrokeTrackers();
    setAutoPlayScreenClickTracker();
    setLocaleFlagHoverTracker("auto");
};

const unsetAutoPlayUserInteractionTrackers = () => {
    unsetAutoPlayKeyStrokeTrackers();
    unsetAutoPlayScreenClickTracker();
};

const setNormalPlayKeyStrokeTrackers = () => {
    document.body.onkeyup = (e) => {
        // Check if player is ready to trigger normal play key stroke trackers.
        if (
            !gsap ||
            !Cast.backgroundMusic ||
            !Cast.neuralTTS ||
            Playback.tempPausedForMenu ||
            Playback.menuOpen ||
            Playback.isOnDefaultOptionTimeout ||
            (document.activeElement &&
                (document.activeElement.classList.contains("invitee-name") ||
                    document.activeElement.classList.contains("invitee-phone-email") ||
                    document.activeElement.id === "feedback-textarea"))
        ) {
            return;
        }

        // Set enter and space bar key strokes tracker for toggling play and pause.
        if ((e.key && (e.key === "Enter" || e.key === " ")) || (e.keyCode && (e.keyCode === 13 || e.keyCode === 32))) return togglePlayPause();

        // Set left arrow key stroke tracker for rewinding the cast backward.
        if ((e.key && e.key === "ArrowLeft") || (e.keyCode && e.keyCode === 37)) return skipBackward();

        // Set right arrow key stroke tracker for skipping the cast forward.
        if ((e.key && e.key === "ArrowRight") || (e.keyCode && e.keyCode === 39)) return skipForward();

        // Set down arrow key stroke tracker for bringing global Howler volume down.
        if (((e.key && e.key === "ArrowDown") || (e.keyCode && e.keyCode === 40)) && Howler) return Howler.volume(Math.max(0, Howler._volume - 0.1));

        // Set up arrow key stroke tracker for bringing global Howler volume up.
        if (((e.key && e.key === "ArrowUp") || (e.keyCode && e.keyCode === 38)) && Howler) return Howler.volume(Math.min(1, Howler._volume + 0.1));

        // Set up m key stroke trcker for toggling global Howler volume mute.
        if (((e.key && (e.key === "m" || e.key === "M")) || (e.keyCode && e.keyCode === 77)) && Howler) return Howler.mute(!Howler._muted);

        // Set up r key stroke trcker for restarting the cast from beginning.
        if ((e.key && (e.key === "r" || e.key === "R")) || (e.keyCode && e.keyCode === 82)) return initiateNormalPlay();
    };
};

const setNormalPlayScreenClickTracker = () => {
    // WIP
    // Goal: Call togglePlayPause() upon screen click.
    // Researching the best way to implement this functionality.
    // There are a few hurdles to solve to implement this correctly.
    // - How do you differentiate so that togglePlayPause() only run when the user clicks on the space that has no other onclick event listeners?
    // - One naive way to solve this is to check if the element that is clicked and its parents are not part of a pre-defined exclusion list of elements.
};

const setNormalPlayUserInteractionTrackers = () => {
    setNormalPlayKeyStrokeTrackers();
    setNormalPlayScreenClickTracker();
    setLocaleFlagHoverTracker("normal");
};

const hideSplashElement = () => {
    const splashElement = document.getElementById("splash");
    if (splashElement) splashElement.style.display = "none";
};

const hideAutoPlayMenuElement = () => {
    const autoPlayMenuElement = document.getElementById("auto-play-menu");
    if (autoPlayMenuElement) gsap.set(autoPlayMenuElement, { autoAlpha: 0 });
};

const clearMenuTimeOutInAutoPlay = () => {
    if (Playback.tempPausedForMenu || Playback.menuOpen) {
        clearTimeout(Playback.menuOnAutoPlay);
        Playback.closeMenuOnAutoPlay && Playback.closeMenuOnAutoPlay(false);
    }
};
