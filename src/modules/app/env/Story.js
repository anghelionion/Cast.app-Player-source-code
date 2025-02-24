/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

/* eslint-disable */
"use strict";

import Bars from "../slides/Bars";
import Checklist from "../slides/Checklist";
import CompareBar from "../slides/CompareBar";
import ChartFunnel from "../slides/ChartFunnel";
import Gauges from "../slides/Gauges";
import Heatmap from "../slides/Heatmap";
import Landing from "../slides/Landing";
import ChartLine from "../slides/ChartLine";
import ChartMetrics from "../slides/ChartMetrics";
import Options from "../slides/Options";
import Paths from "../slides/Paths";
import ChartPieBar from "../slides/ChartPieBar";
import ChartPoll from "../slides/ChartPoll";
import Waterfall from "../slides/Waterfall";
import ChartWidgets from "../slides/ChartWidgets";
import VideoSlide from "../slides/VideoSlide";

import model from "./model/AppModel";

export default class Story {
    constructor() {
        this._loadCastJson();
        this._jsonRetrieved = false;
        this._story = null;
        this._storyTranslated = {
            charts: {},
            metadata: {},
        };
        this._updateCount = 0;
        this._updateCountOptions = 0;
        this._useTranslated = false;
        this._language = "english";
        this._narrationsBefore = new Map();
        this._narrationsOptionsBefore = new Map();
        this._countedUpdatesAlready = false;
    }

    // TODO: if json is corrupt, cleanly error handle.
    async _loadCastJson() {
        let { token, type } = getTokenFromUrl();
        const handleNotFound = (status = null) => {
            // TODO: Instead of redirecting to the website's 404 page, the player should have its own error display
            // With the redirect, we lose the URL, so the user can't reload the page
            let newPath = type === "latest" ? "/no-content" : "/404";
            if (status != null) {
                // Save the error status into the URL
                newPath = `${newPath}?error=${status}`;
            }
            newPath = window.location.origin + newPath;
            if (newPath !== window.location.href) {
                window.location.href = newPath;
            }
        };
        if (!token || !type) {
            handleNotFound();
            return;
        }

        try {
            let jsonUrl;
            if (type === "demo") {
                jsonUrl = `${window.location.origin}/play/static/${token}.json`;
            } else {
                if (type === "latest") {
                    const permaResponse = await fetch(`${getPlayerServerRoute()}/perma-token/${token}`);
                    if (!permaResponse.ok) {
                        const errorText = await permaResponse.text();
                        const error = new Error(`Error fetching permalink for ${token}: ${permaResponse.status}, ${errorText}`);
                        error.status = permaResponse.status;
                        throw error;
                    }
                    const permaBody = await permaResponse.json();
                    token = permaBody.token;
                }
                jsonUrl = `${CDN.ttsCDNBaseURL}/video/${token}.json`;
            }
            const tokenResponse = await fetch(jsonUrl);
            if (!tokenResponse.ok) {
                const errorText = await tokenResponse.text();
                const error = new Error(`Error fetching JSON from ${jsonUrl}: ${tokenResponse.status}, ${errorText}`);
                error.status = tokenResponse.status;
                throw error;
            }
            const story = await tokenResponse.json();
            this._jsonLoaded(story);
        } catch (error) {
            console.error(error);
            handleNotFound(error.status);
        }
    }

    _jsonLoaded(story) {
        this._story = story.story;

        this.cacheImages(this.getUntranslatedStory());
        for (let sceneID of sceneSequence(this.getUntranslatedStory())) {
            //TODO: REMOVE BELOW
            //Fix for nagigation loop back
            //Remove everything after options/navigation slide
            const mainSequence = chartSequence(this._story, sceneID); //safe version
            //If condition fixes crash for demo.json: "Uncaught TypeError: Cannot set properties of undefined (setting 'chartSequence')"
            if (mainSequence && Array.isArray(mainSequence) && mainSequence.length > 0) {
                this._story.scenes[sceneID].chartSequence = mainSequence.slice(0, this._getFirstOptionCharIndex(mainSequence));
            }
            //TODO: REMOVE ABOVE

            for (let chartID of chartSequence(this.getUntranslatedStory(), sceneID)) {
                this.replaceChart(chartID);
            }
        }

        const narratorGender = metadataKeyValue(this.getUntranslatedStory(), "gender", "male");
        NarratorGenderSetting.setCurrent(narratorGender);

        RightPanelSetting.setCurrent(liquidContextRecommendationPanel() === "on" ? "on" : "off");
        if (featureValue("infoChartId")) RightPanelSetting.setCurrent("off");
        Cast.component.rightPanelContainer.state = RightPanelSetting.getCurrent() === "on" ? "expanded" : "collapsed";

        const preferredLanguage = this._story.metadata?.recipient?.contact?.contact_language || "english";
        if (Cast.locale.isValidLocale(preferredLanguage)) Playback.preferredLanguage = preferredLanguage.toLowerCase();

        // cache initial narration
        if (this._storyTranslated && this._storyTranslated["metadata"]) {
            this._storyTranslated["metadata"]["name"] = metadataName(this.getUntranslatedStory());
        }
        //this.cacheFirstAudio(this.getUntranslatedStory());

        this._jsonRetrieved = true;
        this.countUpdates();
        startCast({
            jsonRetrieved: true,
        });
        identifyCast(this._story);

        //gStory properly setup
        document.title = getWindowTitle(this._story);

        console.log("3. User Personalization Json loaded");
    }

    downloadCharts() {
        const charts = gStory._story.charts;
        if (!charts) return;

        let untranslatedCharts = Object.keys(gStory._story.charts).length;
        for (const chartID in charts) {
            if (this.retrieveChart(this.getTranslatedStory(), chartID) == null) {
                this.translateChart(chartID, () => {
                    untranslatedCharts--;
                    if (untranslatedCharts < 1) {
                        // Cast.component.rfContainer.updateTranscript();
                        model.chartSequence.data = getStoryPlaylist();
                        model.chartSequence.notify();
                        if (featureValue("service")) {
                            getAllNarrations();
                        }
                    }
                });
            } else {
                untranslatedCharts--;
            }
        }

        if (untranslatedCharts < 1) {
            // Cast.component.rfContainer.updateTranscript();
            model.chartSequence.data = getStoryPlaylist();
            model.chartSequence.notify();
            if (featureValue("service")) {
                getAllNarrations();
            }
        }
    }

    translate(language) {
        if (!Cast.locale.isNotToBeTranslated(language)) this._useTranslated = true;
        this._language = language;
    }

    translateChartXHR(chart, lang, callback) {
        if (Cast.locale.isNotToBeTranslated(lang)) {
            callback(chart);
            return;
        }

        let narrationFeedbackObject = null;
        const valuesToTranslate = [];
        const valuesPath = [];
        const keysToLookFor = [
            "title",
            "prefix",
            "left",
            "footer",
            "center",
            "right",
            "subtitle",
            "subfooter",
            "footnote",
            "narrations",
            "acceptText",
            "successText",
            "confirmText",
            "link_title",
            "valueLabel",
            "compareValueLabel",
            "top",
            "bottom",
        ];
        const chartToTranslate = cloneObj(chart);

        function setToValue(object, value, path) {
            let i;
            const valuePath = path.split(".");
            for (i = 0; i < valuePath.length - 1; i++) {
                object = object[valuePath[i]];
            }
            object[valuePath[i]] = value;
        }

        const translateChart = (chart, path = []) => {
            Object.keys(chart).forEach((key) => {
                const chartValue = chart[key];
                if (typeof chartValue === "object" && chartValue !== null) {
                    if (Array.isArray(chartValue.segments)) {
                        chartValue.segments.forEach((segment, index) => translateChart(segment, [key, "segments", index]));
                    }
                    if (Array.isArray(chartValue.steps)) {
                        chartValue.steps.forEach((step, index) => {
                            if (Array.isArray(step.narrations)) {
                                step.narrations.forEach((narration, idx) => {
                                    valuesToTranslate.push(narrationFromNarrationObject(narration));
                                    valuesPath.push([key, "steps", index, "narrations", idx].join("."));
                                    //console.log([key, "steps", index, "narrations", idx].join("."));
                                    //Remember feedback object to propagate in narration
                                    if (typeof narration === "object" || narration instanceof Object) {
                                        if (narration.feedback) {
                                            valuesToTranslate.push(narration.feedback.title);
                                            valuesPath.push("feedback");
                                            narrationFeedbackObject = JSON.stringify(narration.feedback);
                                        }
                                    }
                                });
                            }

                            if (Array.isArray(step.dynamicAction)) {
                                step.dynamicAction.forEach((action, idx) => {
                                    if (action) {
                                        if (action.title) {
                                            valuesToTranslate.push(action.title);
                                            valuesPath.push([key, "steps", index, "dynamicAction", idx, "title"].join("."));
                                        }

                                        if (action.content) {
                                            valuesToTranslate.push(action.content);
                                            valuesPath.push([key, "steps", index, "dynamicAction", idx, "content"].join("."));
                                        }

                                        if (action.ctaLabel) {
                                            valuesToTranslate.push(action.ctaLabel);
                                            valuesPath.push([key, "steps", index, "dynamicAction", idx, "ctaLabel"].join("."));
                                        }
                                    }
                                });
                            }

                            if (key === "line" && step.highlightData) {
                                Object.keys(step.highlightData).forEach((keyData) => {
                                    if (Array.isArray(step.highlightData[keyData])) {
                                        step.highlightData[keyData].forEach((o, oIndex) => {
                                            Object.keys(o).forEach((k) => {
                                                if (o[k] && o[k] !== "") {
                                                    valuesToTranslate.push(o[k]);
                                                    valuesPath.push([key, "steps", index, "highlightData", keyData, oIndex, k].join("."));
                                                }
                                            });
                                        });
                                    } else {
                                        Object.keys(step.highlightData[keyData]).forEach((o) => {
                                            if (step.highlightData[keyData][o] && step.highlightData[keyData][o] !== "") {
                                                valuesToTranslate.push(step.highlightData[keyData][o]);
                                                valuesPath.push([key, "steps", index, "highlightData", keyData, o].join("."));
                                            }
                                        });
                                    }
                                });
                            }

                            translateChart(step, [key, "steps", index]);
                        });
                    }
                } else if (keysToLookFor.includes(key) && chartValue) {
                    valuesToTranslate.push(chartValue);
                    valuesPath.push([...path, key].join("."));
                }
            });
        };

        translateChart(chartToTranslate);
        if (valuesToTranslate.length === 0) {
            callback(chart);
            return;
        }

        return fetchService(getTranslateServerUrl(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: valuesToTranslate,
                language: lang,
            }),
        })
            .then((response) => response.json())
            .then((translatedValue) => {
                for (let i = 0; i < translatedValue.length; i++) {
                    setToValue(chartToTranslate, translatedValue[i], valuesPath[i]);
                    //Propagate feedback object in narration
                    if (valuesPath[i] === "feedback") {
                        Object.keys(chartToTranslate).forEach((key) => {
                            const chartValue = chartToTranslate[key];
                            if (typeof chartValue === "object" && chartValue !== null) {
                                if (Array.isArray(chartValue.steps)) {
                                    let lastNarration =
                                        chartValue.steps[chartValue.steps.length - 1].narrations[chartValue.steps[chartValue.steps.length - 1].narrations.length - 1];
                                    lastNarration = {
                                        value: lastNarration,
                                        feedback: JSON.parse(narrationFeedbackObject),
                                    };
                                    lastNarration.feedback.title = translatedValue[i + 1];
                                    chartValue.steps[chartValue.steps.length - 1].narrations[chartValue.steps[chartValue.steps.length - 1].narrations.length - 1] = lastNarration;
                                }
                            }
                        });
                    }
                }

                callback(chartToTranslate);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    countUpdates() {
        if (this._countedUpdatesAlready) return this._updateCount;
        let count = 0;

        for (let sceneID of sceneSequence(this.getUntranslatedStory())) {
            for (let chartID of chartSequence(this.getUntranslatedStory(), sceneID)) {
                this._narrationsBefore.set(chartID, count);
                for (let step of stepsOfStory(chartID, this.getUntranslatedStory())) {
                    if ("narrations" in step) count += step.narrations.length;
                }
            }
        }

        this._updateCount = parseInt(count);
        this._countedUpdatesAlready = true;
        return this._updateCount;
    }

    countUpdatesOfCharts(charts) {
        const story = this.getUntranslatedStory();
        let count = 0;
        for (let chartID of charts) {
            this._narrationsOptionsBefore.set(chartID, count);
            for (let step of stepsOfStory(chartID, story)) {
                if ("narrations" in step) count += step.narrations.length;
            }
        }
        this._updateCountOptions = count;
    }

    getNarrationsBeforeChartAsPercent(chartID, currentChartNarrationIndex = 0) {
        if (chartID) {
            if (this._narrationsBefore.has(chartID)) {
                return (parseFloat(this._narrationsBefore.get(chartID) + currentChartNarrationIndex) * 100) / this._updateCount;
            }
            //We are playing options chart sequence
            if (this._narrationsOptionsBefore.has(chartID)) {
                return (parseFloat(this._narrationsOptionsBefore.get(chartID) + currentChartNarrationIndex) * 100) / this._updateCountOptions;
            }
        }
        return 0;
    }

    replaceChart(chartID) {
        let typeOfChart = this.getUntranslatedStory().charts[chartID]["type"];
        if (this.getUntranslatedStory().charts[chartID][typeOfChart] == undefined) {
            return;
        }
        if ("steps" in this.getUntranslatedStory().charts[chartID][typeOfChart]) {
            this.getUntranslatedStory().charts[chartID][typeOfChart].steps.forEach((step, step_idx) => {
                if ("narrations" in step) {
                    let feedbackArray = [];
                    let mp3Override = [];
                    let dynamicActionArray = [];
                    step.narrations.forEach((narration, narration_idx) => {
                        this.getUntranslatedStory().charts[chartID][typeOfChart].steps[step_idx]["narrations"][narration_idx] = textToDisplaySymbols(
                            narrationFromNarrationObject(narration)
                        );
                        dynamicActionArray.push(dynamicActionFromNarrationObject(narration));
                        feedbackArray.push(feedbackFromNarrationObject(narration));
                        mp3Override.push(mp3OverrideFromNarrationObject(narration));
                    });
                    this.getUntranslatedStory().charts[chartID][typeOfChart].steps[step_idx]["dynamicAction"] = dynamicActionArray;
                    this.getUntranslatedStory().charts[chartID][typeOfChart].steps[step_idx]["feedback"] = feedbackArray;
                    this.getUntranslatedStory().charts[chartID][typeOfChart].steps[step_idx]["mp3Override"] = mp3Override;
                }
            });
        }
        if ("segments" in this.getUntranslatedStory().charts[chartID][typeOfChart]) {
            this.getUntranslatedStory().charts[chartID][typeOfChart].segments.forEach((segment, segment_idx) => {
                if ("footer" in segment) {
                    let footer = segment["footer"];
                    this.getUntranslatedStory().charts[chartID][typeOfChart].segments[segment_idx]["footer"] = textToDisplaySymbols(footer);
                }
            });
        }
    }

    translateChart(chartID, cb) {
        this.translateChartXHR(this.getUntranslatedStory().charts[chartID], this._language, (translatedChart) => {
            if (this.retrieveChart(this.getTranslatedStory(), chartID) == null) {
                this.getTranslatedStory().charts[chartID] = translatedChart;
                if (!this.downloadAllChart) {
                    this.downloadAllChart = true;
                    this.downloadCharts();
                }
            }
            cb();
        });
    }

    retrieveChart(story, chartID) {
        return story && story.charts && story.charts[chartID] ? story.charts[chartID] : null;
    }

    getChart(chartID, source, cb) {
        // console.log(`ChartID to process: ${chartID}`);
        if (this.retrieveChart(this.getTranslatedStory(), chartID) == null) {
            this.translateChart(chartID, () => {
                this.initializeChart(chartID, this.getTranslatedStory(), cb, source);
            });
        } else {
            // console.log('no need to translate chart');
            this.initializeChart(chartID, this.getTranslatedStory(), cb, source);
        }
    }

    initializeChart(chartID, story, cb, source = null) {
        switch (chartType(story, chartID).toLowerCase()) {
            case "gauges":
                cb(new Gauges(story, chartID, source));
                break;
            case "landing":
                //Editorial OR SINGLE PANE METRIC
                cb(new Landing(story, chartID, source));
                break;
            case "metrics":
                //MULTI PANE METRICS
                cb(new ChartMetrics(story, chartID, source));
                break;
            case "dashboard":
                cb(new ChartWidgets(story, chartID, source));
                break;
            case "funnel":
                cb(new ChartFunnel(story, chartID, source));
                break;
            case "checklist":
                cb(new Checklist(story, chartID, source));
                break;
            case "piebar":
                cb(new ChartPieBar(story, chartID, source));
                break;
            case "waterfall":
                cb(new Waterfall(story, chartID, source));
                break;
            case "line":
                cb(new ChartLine(story, chartID, source));
                break;
            case "bars":
                cb(new Bars(story, chartID, source));
                break;
            case "comparebar":
                cb(new CompareBar(story, chartID, source));
                break;
            case "heatmap":
                cb(new Heatmap(story, chartID, source));
                break;
            case "options":
                cb(new Options(story, chartID, source));
                break;
            case "poll":
                cb(new ChartPoll(story, chartID, source));
                break;
            case "paths":
                cb(new Paths(story, chartID, source));
                break;
            case "video":
                cb(new VideoSlide(story, chartID, source));
                break;
            default:
                // FIXME TODO write a method to get control back here later.
                break;
        }
    }

    static friendlyName(story, chartID) {
        let type = chartType(story, chartID).toLowerCase();
        switch (type) {
            case "funnel":
                return Cast.locale.translatedContent["chartFriendlyName_ComparativeFunnel"];
            case "comparebar":
                return Cast.locale.translatedContent["chartFriendlyName_CompareBars"];
            case "poll":
                return Cast.locale.translatedContent["chartFriendlyName_Actions"];
            case "line":
                return Cast.locale.translatedContent["chartFriendlyName_AreaLine"];
            case "landing":
                if (sceneLevelStrVal(chartID, "mode", "") === "editorial") return Cast.locale.translatedContent["chartFriendlyName_Editorial"];
                return Cast.locale.translatedContent["chartFriendlyName_SingleMetric"];
            case "waterfall":
                return Cast.locale.translatedContent["chartFriendlyName_Waterfall"];
            case "piebar":
                return Cast.locale.translatedContent["chartFriendlyName_Categorizations"];
            case "paths": {
                let style = chartStyle(gStory.getUntranslatedStory(), chartID, "process");
                if (style === "stackedbar") return Cast.locale.translatedContent["chartFriendlyName_StackedBar"];
                if (style === "pipeline") return Cast.locale.translatedContent["chartFriendlyName_Pipeline"];
                return Cast.locale.translatedContent["chartFriendlyName_Process"];
            }
            case "heatmap": {
                let style = chartStyle(gStory.getUntranslatedStory(), chartID, "heatmap");
                if (style === "punchcardFixed") return Cast.locale.translatedContent["chartFriendlyName_PunchCard"];
                return Cast.locale.translatedContent["chartFriendlyName_Heatmap"];
            }
            case "options":
                return Cast.locale.translatedContent["chartFriendlyName_Navigation"];
            case "gauges":
            case "metrics":
            case "bars":
            case "checklist":
                return Cast.locale.translatedContent["chartFriendlyName_" + capitalize(type)];
            default:
                return Cast.locale.translatedContent["chartFriendlyName_Slide"];
        }
    }

    getUntranslatedStory() {
        return this._story;
    }

    getTranslatedStory() {
        if (this._useTranslated === true) {
            return this._storyTranslated;
        } else {
            return this.getUntranslatedStory();
        }
    }

    getSubtext() {
        let periodOrGenerated = period(this.getUntranslatedStory());

        if (periodOrGenerated) {
            periodOrGenerated = "For: " + periodOrGenerated;
        } else {
            periodOrGenerated = "Generated " + dhm(new Date() - utcToDate(generatedTimestamp(this.getUntranslatedStory())));
        }

        return /*"Play time " +*/ gStory.playbackTime() /*+ " | " + periodOrGenerated*/;
    }

    getWordCount() {
        let wordCount = 0;
        for (let sceneID of sceneSequence(this.getUntranslatedStory())) {
            for (let chartID of chartSequence(this.getUntranslatedStory(), sceneID)) {
                for (let step of stepsOfStory(chartID, this.getUntranslatedStory())) {
                    if ("narrations" in step) {
                        step.narrations.forEach(function (item, index) {
                            wordCount += narrationFromNarrationObject(item).split(" ").length;
                        });
                    }
                }
            }
        }
        return wordCount;
    }

    secondsToString(seconds, fractions = false) {
        // let numyears = Math.floor(seconds / 31536000);
        // let numdays = Math.floor((seconds % 31536000) / 86400);
        // let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
        let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
        let numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
        // " years " +  numdays + " days " + numhours + " hours " +
        // returnMin = numminutes + " minute" + ((numminutes == 1) ? " " : "s ") ;
        //+ numseconds + " second" + ((numseconds == 1) ? "" : "s ");

        if (!fractions || numseconds <= 7) return numminutes + " minute" + plural(numminutes);
        if (numseconds > 7 && numseconds <= 23) return numminutes + "¼ minutes";
        if (numseconds > 23 && numseconds <= 38) return numminutes + "½ minutes";
        if (numseconds > 38 && numseconds <= 53) return numminutes + "¾ minutes";
        if (numseconds > 53) return numminutes + 1 + " minute" + plural(numminutes + 1);
    }

    playbackTime() {
        const wordSec = 0.38; // NEED TO TUNE FOR every VOICE
        return this.secondsToString(parseInt(this.getWordCount() * wordSec));
    }

    _getFirstOptionCharIndex(sequence) {
        for (let i = 0; i < sequence.length; i++) {
            if (sequence[i].startsWith("options")) {
                return i + 1;
            }
        }

        return sequence.length;
    }

    // https://perishablepress.com/3-ways-preload-images-css-javascript-ajax/ JavaScript Method #2 or other
    // https://engineering.fb.com/android/the-technology-behind-preview-photos/
    cacheImages(story) {
        setTimeout(this.loadTheImages(story), 1000);
    }

    loadTheImages(story) {
        return function () {
            let images = new Set();
            for (let sceneID of sceneSequence(story)) {
                for (let chartID of chartSequence(story, sceneID)) {
                    const chart = story.charts[chartID][chartType(story, chartID)];
                    if (chart) {
                        cacheImg(chart.inlineImg, images);
                        cacheImg(chart.bgImgDesktop, images);
                        cacheImg(chart.bgImgMobile, images);
                        cacheImg(chart.bgImg, images);
                    }
                }
            }

            images.forEach((image) => {
                if (image) {
                    new Image().src = image;
                }
            });
            // console.timeEnd("loader");
        };

        function cacheImg(img, images) {
            if (img) images.add(CDN.prefixBgPath(img));
        }
    }

    hasJsonLoaded() {
        return this._jsonRetrieved;
    }

    clearTranslatedStoryCharts() {
        this._storyTranslated.charts = {};
    }
}
