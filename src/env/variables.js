// variables.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

/**
 *
 * Model Classes
 *
 */

class Playback {
    static isPaused = false;
    static wasPaused = false;
    static pauseAfter = false;
    static pauseAfterInfo = {};
    static cantPauseIfNotHowling = true;
    static disableSkip = true;
    static disablePlayPause = false;
    static translationDone = false;
    static tempPausedForMenu = false;
    static translating = false;
    static menuOpen = false;
    static menuOnAutoPlay;
    static settingsHaveChanged = false;
    static isNormalPlay = false;
    static isAutoPlay = false;
    static hasEnded = false; // To be used later.
    static delayStepNarration = 0.3;
    static delayStepNarrationShort = 0.1;
    static delaySlideNarration = 1.1;
    static preferredLanguage = null;
    static tempStepIndex = null;
    static tempNarrationIndex = null;

    static _defaultOptionTimeoutTL = null; // To be used later.
    static _isOnDefaultOptionTimeout = false;
    static get isOnDefaultOptionTimeout() {
        return this._isOnDefaultOptionTimeout;
    }

    static set isOnDefaultOptionTimeout(value) {
        this._isOnDefaultOptionTimeout = value;
        if (Cast.userInteracted) {
            if (this._defaultOptionTimeoutTL) {
                this._defaultOptionTimeoutTL.kill();
                this._defaultOptionTimeoutTL = null;
            }

            const tl = gsap.timeline();

            if (value) {
                tl.to(["#rewind-button", "#skip-button", "#tray-play-button", "#tray-pause-button"], { alpha: 0.5 });
            } else {
                tl.to(["#rewind-button", "#skip-button", "#tray-play-button", "#tray-pause-button"], { alpha: 1 });
            }
            this._defaultOptionTimeoutTL = tl;
        }
    }

    /** @type {((reload: boolean) => void) | null} */
    static closeMenuOnAutoPlay;
}

class Analytics {
    /** @type {string} */
    static playbackID;
    /** @type {string} */
    static pageLoadID;
    /** @type {number} */
    static startPlayTime;
}

class Platform {
    static is_Mac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    static is_iPhone = navigator.platform == "iPhone";
    static is_iPod = navigator.platform == "iPod";
    static is_iPad = navigator.platform == "iPad";
    static is_iOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);
    static is_Windows = navigator.platform == "Win32";
    static is_Android = navigator.userAgent.toLowerCase().indexOf("android") > -1;
    static is_Chrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}

class CDN {
    static baseURL = `https://storage.googleapis.com/${process.env.ASSETS_BUCKET}`;
    static bgPathWithSlash = `${CDN.baseURL}/images/landing/`;
    static backgroundMusicPath = `${CDN.baseURL}/audio/background_v4.mp3`;
    static logoPathWithSlash = `${CDN.baseURL}/images/logos/`;
    static mp3OverridePathWithSlash = `${CDN.baseURL}/audio/overrides/`;
    static externalLinkSVG = `${CDN.baseURL}/images/app/external-link.svg`;
    static ttsCDNBaseURL = process.env.CDN_BASE_URL;

    static prefixBgPath = (i) => {
        if (i.startsWith("https://")) return i;
        return CDN.bgPathWithSlash + i;
    };
}

// _____________________________________________________________________________________________________________________

/**
 *
 * [Shein: TBS] Models To Be Sorted Into Classes
 *
 */

// <key: string: value: string> of pair of the narration hash and the blob mp3
const gMp3Cache = {};

const tts_type = "13";

// gsutil -m -h 'cache-control: public, max-age=30672000'  cp -a public-read -r player/audio/background_v4.mp3 gs://cast-corp/audio/
// ensure NO gzip in metadata -Z  -z - to resolve
// https://cloud.google.com/storage/docs/gsutil/commands/cp

let gNarrationFetchLookahead = 1;
let gNarrationFetchCurrChartIndex = 0;
let gNarrationFetchCurrStepIndex = 1;

let gidSunColors = [];

const fetchService = castFetch();

let playPage = false;

// _____________________________________________________________________________________________________________________

/**
 *
 * View Classes
 *
 */

class Root {
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
    static getAudioContext = () => new (window.AudioContext || window.webkitAudioContext)();

    static getBodyElement = () => document.documentElement;
}

// _____________________________________________________________________________________________________________________

/**
 *
 * Controller Classes
 *
 */

class Cast {
    static backgroundMusicGloballyEnabled;
    static backgroundMusic;
    static currentChart;
    static locale;
    static narratorAvatar = "";
    static neuralTTS;
    static tlViseme;
    static tlVisemeData;
    static userInteracted = false;
    static openedMenuType = "none";

    static megaSequence = [];
    static originalMegaSequence = [];
    static newMegaSequence = [];
    static selectedOptionsIndexes = {};

    static desktopBottomBarContent = null;
    static mobileBottomBarContent = null;

    static component = {
        root: Root,
        trayContainer: new TrayContainerComponent(),
        rfContainer: new RecommendationsAndFeedbackComponent(),
        rightPanelContainer: new RightPanelComponent(),
        toastContainer: new ToastComponent(),
    };

    // [Shein: TBS] When this is in Typescript, set below to readonly.
    static htmlSignature = "sign-24g4doQ5RDa6DECRDIPixg";
    static styleID = "style-o6E9mV9yRPKfTnq9EbDiWQ"; //Style of dom document that shows all the animations

    static enablePlayPause = () => {
        Playback.disablePlayPause = false;
    };

    static disablePlayPause = () => {
        Playback.disablePlayPause = true;
    };

    static enableSkip = () => {
        if (Cast.openedMenuType === "none") {
            Playback.disableSkip = false;
            Cast.component.trayContainer.enableSkipButton();
        }
    };

    static disableSkip = () => {
        Playback.disableSkip = true;
        Cast.component.trayContainer.disableSkipButton();
    };

    static transitionFromAutoPlayMenuToNormalPlayMenu = () => {
        hideSplashElement();
        hideAutoPlayMenuElement();
        !isDesktopMode()
            ? Cast.component.trayContainer.updateTrayContainerElement("portrait", "normal", Cast.openedMenuType)
            : Cast.component.trayContainer.updateTrayContainerElement("landscape", "normal", Cast.openedMenuType);
        runResizeLogic();
    };

    static loadTranslation = (untranslatedTextContent, textContent, callback) => {
        if (this.locale.isNotToBeTranslated(Cast.locale.lang)) callback(untranslatedTextContent);
        else
            this.locale.translateTextXHR([textContent], Cast.locale.lang, (translatedContent) => {
                callback(translatedContent[0]);
            });
    };

    static initiateNormalPlay = (event) => {
        if (Playback.isOnDefaultOptionTimeout) return;
        if (!Cast.userInteracted) {
            // Set first user interaction flag to true.
            Cast.userInteracted = true;
            Playback.cantPauseIfNotHowling = false;

            racetrack("play", {
                language: Cast.locale.lang,
                viseme: NarratorGenderSetting.getCurrent(),
                playRate: PlayRateSetting.getXRate(),
            });

            // Clear async menu timeout in case the user click during the timeout.
            clearMenuTimeOutInAutoPlay();

            // Unset auto play user interaction trackers.
            unsetAutoPlayUserInteractionTrackers();

            // Set normal play user interaction trackers.
            setNormalPlayUserInteractionTrackers();

            // Transition from auto play menu to normal play menu.
            this.transitionFromAutoPlayMenuToNormalPlayMenu();

            // Handle user click on custom locale.
            setLocaleInAutoPlay(event);

            if (Playback.preferredLanguage) {
                racetrack("translate", { lang: Cast.locale.lang });
                Playback.preferredLanguage = null;
            }

            // Play background music.
            if (Cast.backgroundMusicGloballyEnabled && Cast.userInteracted && Cast.backgroundMusic && !Cast.backgroundMusic.playing()) Cast.backgroundMusic.play();
        } else {
            // Run unmute hack.
            unmute(Cast.component.root.getAudioContext());
        }

        // Play cast from beginning.
        playFromBeginning(false);
    };

    static showRightPanelContainer = () => {
        const useScaling = true;
        // Inject right panel container element.
        const innerVideoElement = document.querySelector("#innervideo");
        const rightPanelContainerElement = document.querySelector("#right-panel-container");
        rightPanelContainerElement?.remove();
        Cast.component.rightPanelContainer.resetElement(Cast.component.rfContainer.element);

        document.querySelector(".side-panel-content-box").appendChild(Cast.component.rightPanelContainer.element);
        gsap.set("#side-panel", { display: "block" });

        innerVideoElement.querySelector(".right-panel-shadow")?.remove();
        const shadowPanel = document.createElement("div");
        shadowPanel.classList.add("right-panel-shadow");
        innerVideoElement.querySelector(".inner-video-row").appendChild(shadowPanel);

        innerVideoElement.querySelector(".desktop-bottom-bar-shadow")?.remove();
        const desktopBottomBarShadow = document.createElement("div");
        desktopBottomBarShadow.classList.add("desktop-bottom-bar-shadow");
        innerVideoElement.appendChild(desktopBottomBarShadow);

        if (Cast.desktopBottomBarContent) Cast.desktopBottomBarContent.destroy();

        document.querySelector(".desktop-bottom-bar-content")?.remove();
        const desktopBottomBarContent = new DesktopBottomBar();
        const desktopBottomBar = document.querySelector(".desktop-bottom-bar");
        desktopBottomBar.innerHTML = "";
        desktopBottomBar.appendChild(desktopBottomBarContent.element);
        Cast.desktopBottomBarContent = desktopBottomBarContent;

        if (useScaling) {
            gsap.set(["#side-panel", ".desktop-bottom-bar"], { display: "none" });
            shadowPanel.appendChild(Cast.component.rightPanelContainer.element);
            desktopBottomBarShadow.appendChild(desktopBottomBarContent.element);
        }

        Cast.component.rightPanelContainer.setState();
        // Resize cast.
        resizeCast();
    };

    static hideRightPanelContainer = () => {
        console.log("hideRightPanelContainer");
        if (Cast.desktopBottomBarContent) Cast.desktopBottomBarContent.destroy();
        if (Cast.mobileBottomBarContent) Cast.mobileBottomBarContent.destroy();
        document.querySelector(".desktop-bottom-bar-content")?.remove();

        // Remove right panel container element.
        document.getElementById("right-panel-container")?.remove();
        document.querySelector(".right-panel-shadow")?.remove();
        gsap.set("#side-panel", { display: "none" });

        const innerVideoElement = document.querySelector("#innervideo");
        innerVideoElement.querySelector(".desktop-bottom-bar-shadow")?.remove();
        const desktopBottomBarShadow = document.createElement("div");
        desktopBottomBarShadow.classList.add("desktop-bottom-bar-shadow");
        innerVideoElement.appendChild(desktopBottomBarShadow);

        const mobileBottomBar = new MobileBottomBar();
        Cast.mobileBottomBarContent = mobileBottomBar;
        if (desktopBottomBarShadow) {
            desktopBottomBarShadow.innerHTML = "";
            desktopBottomBarShadow.appendChild(mobileBottomBar.element);
        }

        // Resize cast.
        resizeCast();
    };

    static castAddStaticActions = () => {
        //debugger
        const defaultStaticActionList = [
            {
                actionType: "cast.app",
            },
            {
                actionType: "replay",
            },
        ];

        let staticActions = extractMetadataProperty(gStory.getUntranslatedStory(), "actionList", defaultStaticActionList);
        if (!staticActions.length) staticActions = defaultStaticActionList;

        const dynamicActionsElements = [];
        const charts = gStory._story.charts;
        if (charts) {
            for (const chartId in charts) {
                const chartSteps = steps(chartId);
                for (let stepIndex = 0; stepIndex < chartSteps.length; stepIndex++) {
                    const step = chartSteps[stepIndex];
                    const dynamicActions =
                        step.dynamicAction && step.dynamicAction.length
                            ? clone(step.dynamicAction)
                            : step.narrations
                            ? step.narrations.map((narration) => narration.dynamicAction)
                            : [];
                    // Add dynamic actions to toast action list.
                    for (let narrationIndex = 0; narrationIndex < dynamicActions.length; narrationIndex++) {
                        const o = dynamicActions[narrationIndex];
                        if (o) {
                            o.dynamic = {
                                chartId,
                                stepIndex,
                                narrationIndex,
                            };

                            dynamicActionsElements.push(o);

                            //rfContainer.addAction(dynamicActions[narrationIndex], toastActionListElement, true, chartId, stepIndex, narrationIndex);
                            //rfContainer.addAction(dynamicActions[narrationIndex], staticActionList, true, chartId, stepIndex, narrationIndex);
                        }
                    }
                }
            }
        }

        const getActionIdentifier = (data) => {
            const dataCopy = JSON.parse(JSON.stringify(data));
            delete dataCopy.webhook;
            delete dataCopy.icon_url;
            delete dataCopy.dynamic;

            const actionIdentifier = castHash(JSON.stringify(dataCopy), 0, "");
            return actionIdentifier;
        };

        const filterForDuplicates = (actions) => {
            const found = {};

            const filtered = [];
            for (let i = 0; i < actions.length; i++) {
                const actionElement = actions[i];
                const actionIdentifier = getActionIdentifier(actionElement);

                if (!found[actionIdentifier]) {
                    actionElement.actionIdentifier = actionIdentifier;
                    filtered.push(actionElement);
                    found[actionIdentifier] = true;
                } else {
                    //some dynamic actions can be static as well(always present)
                    filtered.forEach((element) => {
                        if (element.actionIdentifier === actionIdentifier) {
                            if (!element.dynamic) element.forceDynamic = {};
                        }
                    });
                }
            }
            return filtered;
        };

        const data = filterForDuplicates(staticActions.concat(dynamicActionsElements));
        data.sort((a, b) => a.order - b.order);

        model.dynamicAndStaticRecommendations.data = data.reverse();
        model.dynamicAndStaticRecommendations.notify();

        model.dynamicRecommendations.data = dynamicActionsElements;
        model.dynamicRecommendations.notify();

        // Cast.component.rfContainer.addStaticActions(model.dynamicAndStaticRecommendations.data);
        // Cast.component.rfContainer.removeActionDuplicates();
    };

    /*
    static castAddDynamicActions = () => {
        //return;
        const charts = gStory._story.charts;
        const toastActionListElement = this.component.toastContainer.toastActionListElement;
        const rfContainer = this.component.rfContainer;
        const staticActionList = rfContainer.element.querySelector(".static-action-list-body");

        if (charts) {
            for (const chartId in charts) {
                const chartSteps = steps(chartId);
                for (let stepIndex = 0; stepIndex < chartSteps.length; stepIndex++) {
                    const step = chartSteps[stepIndex];
                    const dynamicActions =
                        step.dynamicAction && step.dynamicAction.length
                            ? clone(step.dynamicAction)
                            : step.narrations
                            ? step.narrations.map((narration) => narration.dynamicAction)
                            : [];
                    // Add dynamic actions to toast action list.
                    for (let narrationIndex = 0; narrationIndex < dynamicActions.length; narrationIndex++) {
                        if (dynamicActions[narrationIndex]) {
                            //rfContainer.addAction(dynamicActions[narrationIndex], toastActionListElement, true, chartId, stepIndex, narrationIndex);
                            //rfContainer.addAction(dynamicActions[narrationIndex], staticActionList, true, chartId, stepIndex, narrationIndex);
                        }
                    }
                }
            }
        }
    };
//*/

    static setUpActions = () => {
        this.castAddStaticActions();
    };

    static updateActions = () => {
        const dynamicActionCounter = countDynamicActions(model.dynamicRecommendations.data);
        if (dynamicActionCounter !== model.onUpdateActions.data) {
            console.log("dynamicActionCounter", dynamicActionCounter);
            model.onUpdateActions.data = dynamicActionCounter;
            model.onUpdateActions.notify();
        }
        this.component.toastContainer.updateActions();
    };

    static expandActionList = () => {
        ActionListSetting.setCurrent("expanded");
        this.component.rfContainer.expandRecommendation();
    };

    static collapseActionList = () => {
        ActionListSetting.setCurrent("collapsed");
        this.component.rfContainer.collapseRecommendation();
    };

    static expandFeedbackMenu = () => {
        //FeedbackMenuContainerSetting.setCurrent("expanded");
        //this.component.rfContainer.expandFeedbackMenu();
    };

    static collapseFeedbackMenu = () => {
        //FeedbackMenuContainerSetting.setCurrent("collapsed");
        //this.component.rfContainer.collapseFeedbackMenu();
    };

    static processFeedback = (
        /** @type {string} */
        rating,
        /** @type {string} */
        feedbackText,
        /** @type {string} */
        feedbackData,
        location = "right-panel"
    ) => {
        // Process feedback.
        if (feedbackData) {
            const feedback = JSON.parse(feedbackData);
            if (feedback.webhook && feedback.webhook.length) {
                callWebhook(feedback.webhook, feedback.payload);
                const type = rating === "Positive" ? "FEEDBACK_POSITIVE" : rating === "Negative" ? "FEEDBACK_NEGATIVE" : "FEEDBACK";
                racetrack("feedback", {
                    eventInformation: {
                        type: "feedback.survey",
                        event_type: "feedback",
                    },
                    eventData: {
                        object: {
                            type,
                            feedbackText,
                            rating,
                        },
                        source: "feedback",
                    },
                });
            } else console.error("Webhook is invalid in feedback data.");
        } else console.error("Feedback data is invalid.");

        // If it is right panel, show confirmation. (Going to port the feedback in action feedback menu to work similar.)
        //if (location === "right-panel") Cast.component.rfContainer.confirmFeedback(rating);
        if (location !== "silent-feedback") {
            model.onConfirmFeedback.data = rating;
            model.onConfirmFeedback.notify();
        }
    };

    static interjectAutoFeedbackForScene = (chartIndex, beginning) => {
        if (typeof chartIndex !== "number" || !Cast.megaSequence || !Cast.megaSequence.length) return;

        const autoFeedbackNarration = {
            value: "Here are some personalized recommendations for you.  Feedback to improve your experience is appreciated!",
            feedback: {
                title: "Share how we can improve your experience",
                webhook: "https://cast.app",
                injected: true,
            },
        };

        // uncommenting this breaks @daljeet
        let s = extractMetadataProperty(gStory.getUntranslatedStory(), "autoFeedbackNarration", null);
        if (null !== s) {
            autoFeedbackNarration.value = s;
            autoFeedbackNarration.feedback.injected = true;
        }

        s = extractMetadataProperty(gStory.getUntranslatedStory(), "autoFeedbackTitle", null);
        if (null !== s) {
            autoFeedbackNarration.feedback.title = s;
            autoFeedbackNarration.feedback.injected = true;
        }

        // If the current chart is not beginning but the last chart, and starts with options, this is new cast.
        // For new cast, we duplicate the last chart and inject narrartion without animations so that it looks like the chart continues.
        // This shall be replaced with skipping to a specific narration once that functionality is implemented.
        if (!beginning && Cast.megaSequence[chartIndex].startsWith("options")) {
            const clonedOptionsChart = cloneObj(gStory.getUntranslatedStory().charts[Cast.megaSequence[Cast.megaSequence.length - 1]]);
            clonedOptionsChart.inlineImg = null;
            clonedOptionsChart.inlineImgHeight = null;
            clonedOptionsChart.options.inlineImg = null;
            clonedOptionsChart.options.inlineImgHeight = null;
            clonedOptionsChart.options.segments = [];
            clonedOptionsChart.options.steps = [clonedOptionsChart.options.steps[clonedOptionsChart.options.steps.length - 1]];
            clonedOptionsChart.options.steps[0].narrations = [autoFeedbackNarration];
            Cast.megaSequence = Cast.megaSequence.concat(["autofeedback"]);
            gStory.getUntranslatedStory().charts["autofeedback"] = clonedOptionsChart;
            return ["autofeedback"];
        } else if (!Cast.megaSequence[chartIndex].startsWith("options")) {
            // Otherwise, the current cast is an old cast.
            // For old casts, we are replacing the old feedback narrations with the new injected feedback narration.
            let stepArray = stepsOfStory(Cast.megaSequence[chartIndex], gStory.getUntranslatedStory());
            let step = stepArray[stepArray.length - 1];
            if (step.narrations === undefined || (actionListPresent(gStory.getUntranslatedStory()) && Cast.megaSequence[chartIndex].startsWith("poll"))) step.narrations = [];
            step.narrations.push(autoFeedbackNarration);
        }
    };

    static isInIFrame = () => window.location !== window.parent.location;

    static getFavicon(url) {
        // https://dev.to/derlin/get-favicons-from-any-website-using-a-hidden-google-api-3p1e
        // const src = `https://s2.googleusercontent.com/s2/favicons?sz=32&domain=${(new URL(url)).host}`;
        const src = `https://icon.horse/icon/${new URL(url).host}`;

        return `<img src="${src}" onerror="this.onerror=null;this.src='${CDN.externalLinkSVG}"> </img>`;
    }
}

// _____________________________________________________________________________________________________________________
