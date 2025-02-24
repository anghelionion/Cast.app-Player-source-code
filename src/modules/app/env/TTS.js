// Tts.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

/* eslint-disable */
"use strict";

import { elevenVoices, pollyVoices } from "@cast-corp/player-server-client";

/**
 * This is the call to use to narrate.
 * It calls back calleeClassMethodNarrationDone.call(calleeThis, { type:});
 * with states.  When done is calls back with "endAllNarrations"
 *
 * Mp3 cache:
 * Pre-initialize N = 2
 * Start fetching N narrations before user presses play
 * If user hasn’t pressed play and first N are received, continue to fetch N at a time
 * Always use worker when available otherwise use main thread
 * On START PLAY Narration a narration, -> get Next N
 *  If we get N back before narration ENDS, set N + +;
 *  else if we get < N back before narration ends, set max(- - N, 1)
 *  If we don’t have next narration on play, fetch that one and wait (pre caching logic)
 * @param {*} narrations
 * @param {*} calleeThis
 * @param {*} calleeClassMethodNarrationDone
 */

const introVolume = 1.0;
let savedVolume = introVolume;
// used to restart narration
let gCurrentNarrationInfo = {};

/**
 * Get vendor and voiceId of the vendor
 */
function getVendorAndVoiceId() {
    const service = featureValue("service")?.toString().toLowerCase();
    let vendor = "polly";
    let voiceId = pollyVoices[Cast.locale.lang][NarratorGenderSetting.getCurrent()].voiceId;

    if (service?.startsWith("_eleven") && Cast.locale.lang === "english") {
        vendor = "eleven";
        const voiceName = service.split("-")[1];
        if (voiceName in elevenVoices) {
            voiceId = voiceName;
        }
    }

    return {
        vendor: vendor,
        voiceId: voiceId,
    };
}

/**
 * Get narrations
 */
function fetchNarrations(cleanNarrationObj, mp3Override, handleResult) {
    CDN.ttsCDNBaseURL = "https://cdn.cast.app"

    const data = {
        text: appendBreakIfNoHypen(cleanNarrationObj["narrationText"]),
        // text: "Many of the answers here are the same",
        language: Cast.locale.lang,
        playrate: PlayRateSetting.getBackendRate(Cast.locale.lang),
        gender: NarratorGenderSetting.getCurrent(),
        ...getVendorAndVoiceId(),
    };

    console.log(data);

    const hashData =
        getVendorAndVoiceId().vendor === "eleven"
            ? {
                  ...data,
                  ...elevenVoices[getVendorAndVoiceId().voiceId].settings,
              }
            : data;

    const audioHash = castHash(stableStringify(hashData), 0, "v2-");
    const visemeHash = castHash(stableStringify(hashData), 0, "v2-");

    const makeRequest = (hash, data) => {
        return {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, hash }),
        };
    };

    const audioPromise = fetch(`${CDN.ttsCDNBaseURL}/${audioHash}.mp3`)
        .then((res) => res.ok && res.blob())
        .catch((error) => {
            console.error(`Audio fetch error: ${error.message}`);
            return false;
        })
        .then((audioResult) => {
            if (audioResult) {
                return audioResult;
            }
            return fetchService(getSpeechRoute(), makeRequest(audioHash, data)).then((res) => res.blob());
        });

    const visemePromise = fetch(`${CDN.ttsCDNBaseURL}/${visemeHash}.json`)
        .then((res) => res.ok && res.json())
        .catch((error) => {
            console.error(`Viseme fetch error: ${error.message}`);
            return false;
        })
        .then((visemeResult) => {
            if (visemeResult) {
                return visemeResult;
            }
            return fetchService(getVisemeRoute(), makeRequest(visemeHash, data)).then((res) => res.json());
        });

    return Promise.all([audioPromise, visemePromise])
        .then(([audioResult, visemeResult]) =>
            handleResult({
                objectUrl: URL.createObjectURL(audioResult),
                castViseme: visemeResult.viseme.castViseme,
                castTime: visemeResult.viseme.castTime,
            })
        )
        .catch((error) => {
            console.error(`Fetch narrations error: ${error.message}`);
        });
}

/**
 * Fetch all Narrations and send them as a bulk to the backend
 */
function prefetchAllNarrations(narrations) {
    if (!narrations || narrations.length === 0) {
        calleeClassMethodNarrationDone.call(calleeThis, "No-Narrations");
        calleeClassMethodNarrationDone.call(calleeThis, "endAllNarrations");
        return;
    }

    let cleanNarrations = narrations.map((narration) => cleanAndHashNarrationForTTS(narration));
    fetchAllNarrations(cleanNarrations);
}

function fetchAllNarrations(cleanNarrationObjs) {
    const data = cleanNarrationObjs.map((cleanNarrationObj) => ({
        text: appendBreakIfNoHypen(cleanNarrationObj["narrationText"]),
        language: Cast.locale.lang,
        playrate: PlayRateSetting.getBackendRate(Cast.locale.lang),
        gender: NarratorGenderSetting.getCurrent(),
        ...getVendorAndVoiceId(),
    }));

    // create the bulk request with the original data
    const request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
            data.map((datum) => {
                const hashData =
                    getVendorAndVoiceId().vendor === "eleven"
                        ? {
                              ...datum,
                              ...elevenVoices[getVendorAndVoiceId().voiceId].settings,
                          }
                        : datum;
                return { ...datum, hash: castHash(stableStringify(hashData), 0, "v2-") };
            })
        ),
    };

    fetch(getBulkRoute(), request)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
        })
        .catch((error) => {
            console.error(`Fetch failed: ${error.message}`);
        });
}

/**
 * Get narrations on main thread using xhr
 * @param {*} narrations
 */
function _downloadNarrationUsingMainThread(step) {
    // console.log('MP3Cache main thread downloading narrations', narrations)
    if (!step.narrations || !step.narrations.length) {
        return;
    }

    fetchNarrations(cleanAndHashNarrationForTTS(step.narrations), step.mp3Override[0], (result) => {
        // console.log('MP3Cache main thread downloaded narrations', narrations)
    });
}

/**
 * Get speaker index, hash, and narration text for narrations obj
 * @param {*} narrations
 */
function cleanAndHashNarrationForTTS(narrations) {
    let narrationText = narrations;
    if (Array.isArray(narrations)) {
        if (narrations.length === 0) {
            return {
                hashNarrationText: castHashNarration(
                    "",
                    PlayRateSetting.getBackendRate(Cast.locale.lang),
                    SampleRateSetting.getCurrent(),
                    Cast.locale.lang,
                    NarratorGenderSetting.getCurrent(),
                    getVendorAndVoiceId().vendor
                ),
                narrationText: "",
            };
        } else {
            narrationText = narrationFromNarrationObject(narrations[0]);
        }
    }

    if (typeof narrationText === "object" && narrationText !== null) {
        narrationText = narrationFromNarrationObject(narrationText);
    }

    let quotes = narrationText.match(/(--|').*?(--|')/g);

    while (quotes && quotes[0]) {
        narrationText = narrationText.replace(quotes[0], textToDisplaySymbols(quotes[0]));
        quotes.shift();
    }
    return {
        hashNarrationText: castHashNarration(
            narrationText,
            PlayRateSetting.getBackendRate(Cast.locale.lang),
            SampleRateSetting.getCurrent(),
            Cast.locale.lang,
            NarratorGenderSetting.getCurrent(),
            getVendorAndVoiceId().vendor
        ),
        narrationText: narrationText,
    };
}

function _backgroundMusicFadeToLow() {
    Cast.backgroundMusic && Cast.backgroundMusic.fade(savedVolume, 0.15, 1000);
}

/**
 * Play narration of current step.
 *
 * @param result
 * @param narrationText Narration Text of Current Step
 * @param calleeThis
 * @param calleeClassMethodNarrationDone
 * @param step Current Step
 * @param stepsSupposedToFetchWhilePlaying Next Step to Fetch While Current Step Is Playing
 *
 */
function _playNarration(result, narrationText, calleeThis, calleeClassMethodNarrationDone, step, stepsSupposedToFetchWhilePlaying, innerGUserInteracted) {
    const dynamicAction = step.dynamicAction;
    const feedback = [step?.narrations[0]?.feedback];
    const narrations = step.narrations;
    const objectUrl = result.objectUrl;
    pauseNtts();
    if (!Playback.isPaused && !Playback.pauseAfter) {
        if (!Cast.neuralTTS) {
            let firstNarrationPlayTime = performance.timing.navigationStart + performance.now();
            let loadTime = firstNarrationPlayTime - Analytics.startPlayTime;
            console.log("load time of first narration", loadTime);
            _backgroundMusicFadeToLow();
        }

        if (Cast.tlViseme) {
            Cast.tlViseme.kill();
            Cast.tlViseme = null;
        }

        const neuralTTSSetup = () => {
            const onAfterAutoPlayEachStep = () => {
                if (Cast.userInteracted) return;
                Playback.cantPauseIfNotHowling = true;
                if (!Playback.isPaused && !Cast.userInteracted) {
                    calleeClassMethodNarrationDone.call(calleeThis, "aNarrationDone");
                    //This is where we test the drilldown objects directly to see if slide pause is needed
                    //needed for feedback
                    //not needed for dynamicActions
                    // NOTE: transaltions is currently changing undefined to null @daljeet
                    Playback.pauseAfter = !(feedback[0] === null || feedback[0] === undefined);
                    if (Playback.pauseAfter && !Cast.userInteracted) {
                        if (isLastChart() && !(feedback[0] && feedback[0].injected)) playFromBeginning();
                        Cast.component.trayContainer.toggleTrayPauseButton(!Cast.userInteracted ? "auto" : "normal");
                        Playback.pauseAfterInfo = {
                            step: {
                                narrations: narrations,
                                dynamicAction: dynamicAction,
                                feedback: feedback,
                            },
                            stepsSupposedToFetchWhilePlaying: [],
                            calleeThis: calleeThis,
                            calleeClassMethodNarrationDone: calleeClassMethodNarrationDone,
                        };
                        if (feedback[0]) {
                            Playback.tempPausedForMenu = true;
                            // so that tts stays paused after action panel shows up.
                            if (feedback[0]?.injected) Playback.tempPausedForMenu = false;
                            openMenu("actionFeedback", feedback[0], Playback.tempPausedForMenu);
                        }
                    }
                    narrations.shift();
                    dynamicAction.shift();
                    feedback.shift();
                    if (!Playback.pauseAfter && !Cast.userInteracted) {
                        utterAllNarrationsOfStep(step, [], calleeThis, calleeClassMethodNarrationDone, innerGUserInteracted);
                    }
                } else {
                    narrations.unshift();
                    dynamicAction.unshift();
                    feedback.unshift();
                }
                Playback.isAutoPlay = false;
            };
            const onBeforeNormalPlayEachStep = () => {
                if (Playback.isNormalPlay) return;
                Playback.isNormalPlay = true;
                Playback.cantPauseIfNotHowling = false;
                Cast.updateActions();
            };
            const onAfterNormalPlayEachStep = () => {
                Playback.cantPauseIfNotHowling = true;
                if (!Playback.isPaused) {
                    calleeClassMethodNarrationDone.call(calleeThis, "aNarrationDone");
                    //This is where we test the drilldown objects directly to see if slide pause is needed
                    //needed for feedback
                    //not needed for dynamicActions
                    // NOTE: transaltions is currently changing undefined to null @daljeet
                    Playback.pauseAfter = !(feedback[0] === null || feedback[0] === undefined);
                    if (Playback.pauseAfter) {
                        Cast.component.trayContainer.toggleTrayPauseButton(!Cast.userInteracted ? "auto" : "normal");
                        Playback.pauseAfterInfo = {
                            step: {
                                narrations: narrations,
                                dynamicAction: dynamicAction,
                                feedback: feedback,
                            },
                            stepsSupposedToFetchWhilePlaying: [],
                            calleeThis: calleeThis,
                            calleeClassMethodNarrationDone: calleeClassMethodNarrationDone,
                        };
                        if (feedback[0]) {
                            Playback.tempPausedForMenu = true;
                            // so that tts stays paused after action panel shows up.
                            if (feedback[0]?.injected) {
                                Playback.tempPausedForMenu = false;
                                Cast.backgroundMusic && Cast.backgroundMusic.pause();
                            }
                            openMenu("actionFeedback", feedback[0], Playback.tempPausedForMenu);
                        }
                    }

                    let addShortDelay = !delayLogic(narrations);

                    narrations.shift();
                    dynamicAction.shift();
                    feedback.shift();
                    if (!Playback.pauseAfter) {
                        if (narrations && narrations.length > 0) {
                            let duration = Playback.delayStepNarration / PlayRateSetting.getNumberRate();
                            if (addShortDelay) duration = Playback.delayStepNarrationShort / PlayRateSetting.getNumberRate();

                            // if (narrations[0]) console.log("ZZZ", narrations[0], duration, "tts");

                            const tl = gsap.timeline();
                            tl.to({}, duration, {});
                            tl.call(() => {
                                Cast.currentChart.clearDelay();
                                utterAllNarrationsOfStep(step, [], calleeThis, calleeClassMethodNarrationDone, innerGUserInteracted);
                            });

                            Cast.currentChart.delayTL = tl;
                        } else {
                            utterAllNarrationsOfStep(step, [], calleeThis, calleeClassMethodNarrationDone, innerGUserInteracted);
                        }
                    }
                } else {
                    narrations.unshift();
                    dynamicAction.unshift();
                    feedback.unshift();
                }
                Playback.isNormalPlay = false;
            };

            if (Cast.neuralTTS) {
                Cast.neuralTTS.unload();
            }
            Cast.neuralTTS = new Howl({
                src: [objectUrl],
                format: ["mp3"],
                rate: Cast.userInteracted ? 1.0 : 2.0,
                volume: Cast.userInteracted ? 1.0 : 0.0,
                mute: !Cast.userInteracted,
                preload: !Cast.userInteracted ? "metadata" : true,
                onload: () => {
                    if (!Cast.userInteracted || Howler.ctx.state !== "running" || !Cast.neuralTTS) {
                        if (Playback.isAutoPlay) return;
                        Playback.isAutoPlay = true;
                        Cast.component.trayContainer.toggleTrayPlayButton(!Cast.userInteracted ? "auto" : "normal");
                        Cast.updateActions();
                        setTimeout(onAfterAutoPlayEachStep, Cast.neuralTTS && Cast.neuralTTS._duration ? Cast.neuralTTS._duration * 500 : 500);
                    } else Cast.neuralTTS.once("play", onBeforeNormalPlayEachStep).once("end", onAfterNormalPlayEachStep).play();
                },
            });
        };

        neuralTTSSetup();

        Cast.tlVisemeData = result;
        Cast.tlViseme = doViseme(Cast.tlVisemeData);

        updateSubtitles(narrationText);
        Cast.component.rfContainer.updateCurrentNarration();
        model.updateCurrentNarration.notify();
        Cast.component.trayContainer.hideNarrationAudioLoadingSpinner();
    }
}

function delayLogic(narrations) {
    if (narrations) {
        const firstNarration = narrationFromNarrationObject(narrations[0]);
        if (firstNarration && firstNarration.length > 0) {
            const lastCharCode = firstNarration.charCodeAt(firstNarration.length - 1);
            // period, exclaimation mark, question mark
            if (!([46, 33, 63].indexOf(lastCharCode) > -1 || lastCharCode > 127)) {
                return false;
            }
        }
    }
    return true;
}

function utterAllNarrationsOfStep(step, stepsSupposedToFetchWhilePlaying, calleeThis, calleeClassMethodNarrationDone, innerGUserInteracted) {
    let narrations = step && step.narrations;
    if (!narrations || !narrations.length) {
        calleeClassMethodNarrationDone.call(calleeThis, "No-Narrations");
        calleeClassMethodNarrationDone.call(calleeThis, "endAllNarrations");
        return;
    }
    Cast.component.trayContainer.showNarrationAudioLoadingSpinner();
    let innerNarrations = clone(narrations);
    let innerNarrationDynamicActions = (innerNarrations && innerNarrations.map((n) => n.dynamicAction)) || [];
    let innerNarrationFeedback = (innerNarrations && innerNarrations.map((n) => n.feedback)) || [];
    let innerDynamicAction = step && step.dynamicAction && step.dynamicAction.length > 0 ? clone(step.dynamicAction) : innerNarrationDynamicActions;
    let innerFeedback = step && step.feedback && step.feedback.length > 0 ? clone(step.feedback) : innerNarrationFeedback;
    let innerMp3Override = step && step.mp3Override && step.mp3Override.length > 0 ? clone(step.mp3Override) : [];
    const cleanNarrationObj = cleanAndHashNarrationForTTS(innerNarrations);

    if (getCurrentChartIndex() === 0 && getCurrentStepIndex() === 0 && getCurrentNarrationIndex() === 0) gCurrentNarrationInfo = {};

    gCurrentNarrationInfo["cleanNarrationObj"] = cleanNarrationObj;
    gCurrentNarrationInfo["narrationText"] = cleanNarrationObj["narrationText"];
    gCurrentNarrationInfo["calleeThis"] = calleeThis;
    gCurrentNarrationInfo["calleeClassMethodNarrationDone"] = calleeClassMethodNarrationDone;
    gCurrentNarrationInfo["innerNarrations"] = innerNarrations;
    gCurrentNarrationInfo["innerMp3Override"] = innerMp3Override;
    gCurrentNarrationInfo["innerDynamicAction"] = innerDynamicAction;
    gCurrentNarrationInfo["innerFeedback"] = innerFeedback;
    gCurrentNarrationInfo["stepsSupposedToFetchWhilePlaying"] = stepsSupposedToFetchWhilePlaying;

    // Disabling caching to solve ReadTimeoutError: Read timeout on endpoint URL: "https://polly.us-west-2.amazonaws.com/v1/speech"
    if (cleanNarrationObj["hashNarrationText"] in gMp3Cache) {
        _playNarration(
            gMp3Cache[cleanNarrationObj["hashNarrationText"]],
            cleanNarrationObj["narrationText"],
            calleeThis,
            calleeClassMethodNarrationDone,
            {
                narrations: innerNarrations,
                dynamicAction: innerDynamicAction,
                feedback: innerFeedback,
            },
            stepsSupposedToFetchWhilePlaying,
            innerGUserInteracted
        );
    } else {
        fetchNarrations(cleanNarrationObj, innerMp3Override[0], (result) => {
            if (Cast.userInteracted !== innerGUserInteracted) return;

            _playNarration(
                result,
                cleanNarrationObj["narrationText"],
                calleeThis,
                calleeClassMethodNarrationDone,
                {
                    narrations: innerNarrations,
                    dynamicAction: innerDynamicAction,
                    feedback: innerFeedback,
                    mp3Override: innerMp3Override,
                },
                stepsSupposedToFetchWhilePlaying,
                innerGUserInteracted
            );
        });
    }
}

function playIntro() {
    Cast.backgroundMusic = new Howl({
        src: [CDN.backgroundMusicPath],
        autoplay: false,
        loop: true,
        volume: (savedVolume = introVolume),
    });
    Cast.backgroundMusic.onload = function (evt) {
        URL.revokeObjectURL(objectUrl);
    };
}

function backgroundMusicFadeToStop() {
    Cast.backgroundMusic &&
        Cast.backgroundMusic.once("fade", () => {
            Cast.backgroundMusic && Cast.backgroundMusic.stop();
            Cast.backgroundMusic = null;
        });
    Cast.backgroundMusic && Cast.backgroundMusic.fade(0.15, 0, 1500);
}

const doFeedbackPlusDynamicActions = () => {
    const actionMenuActionsElement = document.getElementById("action-menu-actions");
    const isScrollableIdActionsListElement = () => actionMenuActionsElement && actionMenuActionsElement.scrollHeight > actionMenuActionsElement.clientHeight;
    if (isScrollableIdActionsListElement()) gsap.set("#action-menu-actions-list-bottom-blur", { display: "block" });

    Playback.tempPausedForMenu = !Playback.isPaused;
    openMenu("actionFeedback");
};

const restartAudio = () => {
    // if howling
    if (!Playback.cantPauseIfNotHowling && gCurrentNarrationInfo["cleanNarrationObj"]) {
        Cast.neuralTTS && Cast.neuralTTS.pause();
        fetchNarrations(gCurrentNarrationInfo["cleanNarrationObj"], gCurrentNarrationInfo["innerMp3Override"][0], (result) => {
            _playNarration(
                result,
                gCurrentNarrationInfo["narrationText"],
                gCurrentNarrationInfo["calleeThis"],
                gCurrentNarrationInfo["calleeClassMethodNarrationDone"],
                {
                    narrations: gCurrentNarrationInfo["innerNarrations"],
                    dynamicAction: gCurrentNarrationInfo["innerDynamicAction"],
                    feedback: gCurrentNarrationInfo["innerFeedback"],
                },
                gCurrentNarrationInfo["stepsSupposedToFetchWhilePlaying"],
                Cast.userInteracted
            );
        });
    }
};

const pauseNtts = () => {
    if (Cast.neuralTTS) {
        Cast.neuralTTS.off();
        Cast.neuralTTS.pause();
    }
};

export { pauseNtts, gCurrentNarrationInfo, prefetchAllNarrations, playIntro, utterAllNarrationsOfStep, restartAudio, delayLogic, doFeedbackPlusDynamicActions };
