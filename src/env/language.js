// language.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

class Locale {
    constructor(lang) {
        this.lang = lang;

        this.settingsContent = {
            settingMenuTitle: "Settings",
            settingPlaybackSpeed: "Playback Speed",
            settingLanguage: "Language",
            settingAvatar: "Avatar",
            settingCharacter: "Character",
            settingRobot: "Robot",
            settingBlob: "Blob",
            settingNone: "None",
            settingNarrator: "Narrator",
            settingMale: "Male",
            settingFemale: "Female",
            settingSubtitles: "Subtitles",
            settingOn: "On",
            settingOff: "Off",
            settingTranscript: "Transcripts and Recommendations",
            settingShare: "Share",
            settingReplay: "Replay",
            "subtitle-status-info": "Subtitles will be hidden when recommendation panel transcriptions are enabled in desktop mode.",
            suppressSubtitles: "Hide subtitles",
            settingYes: "Yes",
            settingNo: "No",
        };

        this.shareContent = {
            shareMenuTitle: "Share With",
            inviteNameLabel: "Name",
            inviteSMSLabel: "Phone",
            inviteEmailLabel: "Or Email",
            inviteNamePlaceholder: "Name",
            inviteSMSPlaceholder: "SMS Phone Number",
            inviteEmailPlaceholder: "Email Address",
            inviteSubmit: "Share Cast!",
            inviteSubheading: "Send to:",
            sharingShareProgressMessageText: "Sharing...",
            failedShareProgressMessageText: "Cast is not sent.",
            succeededShareProgressMessageText: "Cast is sent.",
            failedShareProgressStatusText: "Error!",
            succeededShareProgressStatusText: "Success!",
            failedShareConfirmationMessageText: "Something went wrong. Please try again.",
            succeededShareConfirmationMessageText: "Thank you for sharing.",
        };

        this.translatedContent = this.buildContent();
    }

    isNotToBeTranslated = (locale) => ["english", "australian", "british", "english female", "british female"].includes(locale.toLowerCase());

    isValidLocale = (locale) =>
        [
            "english",
            "australian",
            "british",
            "english female",
            "british female",
            "french",
            "spanish",
            "italian",
            "german",
            "dutch",
            "danish",
            "japanese",
            "hindi",
            "chinese",
        ].includes(locale.toLowerCase());

    // How to use this:
    // Usage 1: In JS Variable: Cast.locale.translatedContent['inviteHeadingSelf']
    // Usage 1: Update HTML ID: put HTMLID in innerHtmlIdToKeyMap
    buildContent() {
        const castContent = {
            subtext: gStory.getSubtext(),
            idFullCastName: storyAndProductName(gStory.getUntranslatedStory()),

            actionMenuTitle: "Recommendations",
            callToReplayActionText: "Replay this Cast",
            callToWebActionText: "Go to Website",
            callToDeeplinkActionText: "Go to App",
            callToPhoneActionText: "Make a Phone Call",
            callToMailtoActionText: "Send an Email",
            callToCastAppActionText: "Go to cast.app website",
            feedbackMenuTitle: "Thank you for your feedback!",
            feedbackTextAreaPlaceholder: "Feel free to provide additional comments",
            callToFeedbackText: "Provide additional feedback...",
            responseToPositiveFeedback: "Thank you for your feedback!",
            responseToNegativeFeedback: "Apologies for the inconvenience, thank you for your feedback!",
            feedbackSubmitButtonText: "Submit",
            cancel: "Cancel",
            actionListToggleText: "Show More",
            playback: "watch",
            interact: "read",
            firstHalfTranscriptTitleSingular: "Slide",
            firstHalfTranscriptTitle: "Slides",
            secondHalfTranscriptTitle: "Transcripts",
            zeroText: "Zero",
            cast_corporation: "Cast Corporation",
            themeAuto: "Automatic theme",
            themeDark: "Dark  theme",
            themeLight: "Light  theme",
            themeAccessible: "Accessible theme",
            themeCustom: "Custom theme",
            wrongBrowser: "Please use another browser, such as Safari, Chrome, or Edge.",
            helloText: "Hello",
            idLangTheme: "Language and Theme",
            transcriptTitle: "Welcome",
            viewSlidesText: "View slides",
            promptToSelectAnOptionText: "Please select an option.",
            promptToContinueWithDefaultOptionText: "Continuing with default option.",

            chartFriendlyName_ComparativeFunnel: "Comparative Funnel",
            chartFriendlyName_CompareBars: "Compare Bars",
            chartFriendlyName_Actions: "Actions",
            chartFriendlyName_AreaLine: "Area & Line",
            chartFriendlyName_Editorial: "Editorial",
            chartFriendlyName_SingleMetric: "Single Metric",
            chartFriendlyName_Waterfall: "Waterfall",
            chartFriendlyName_Categorizations: "Categorizations",
            chartFriendlyName_StackedBar: "Stacked Bar",
            chartFriendlyName_Pipeline: "Pipeline",
            chartFriendlyName_Process: "Process",
            chartFriendlyName_PunchCard: "Punch Card",
            chartFriendlyName_Heatmap: "Heatmap",
            chartFriendlyName_Navigation: "Navigation",
            chartFriendlyName_Gauges: "Gauges",
            chartFriendlyName_Metrics: "Metrics",
            chartFriendlyName_Bars: "Bars",
            chartFriendlyName_Checklist: "checklist",
            chartFriendlyName_Slide: "Slide",

            moreButton: "More",
            moreText: "more",
            lessButton: "Less",
            visit: "Visit",
            clickRecommandationDefault: "Click here",
            play: "Play",
            pause: "Pause",
            previousSlide: "Previous Slide",
            nextSlide: "Next Slide",
            hideAvatar: "Show Blob",
            showAvatar: "Show Avatar",
            newWindowIframe: "Open in a new tab or window",
            noRecommendations: "No Recommendations",
            recommendationSingular: "recommendation",
            recommendationPlural: "recommendations",
            andAdvice: "and advice including",
            otherRecommendations: "Recommendations summary",
            scrollPausedTooltip: "Autoscrolling paused on hover",
            show: "Show",
            hide: "Hide",
            selectPlaybackSpeed: "Select playback speed",
            hideTranscripts: "Hide Transcripts",
            showTranscripts: "Show Transcripts",
            thumbUpButtonTooltip: "Positive Feedback and comment",
            thumbDownButtonTooltip: "Negative Feedback and comment",
            feedbackTrayTitle: "Feedback?",
            askMeAnythingText: "Ask Me Anything",
            transcriptButton: "Transcript",
        };
        this.innerHtmlIdToKeyMap = {
            subtext: "subtext",
            idFullCastName: "idFullCastName",
            cast_corporation: "cast_corporation",
            themeAuto: "themeAuto",
            themeDark: "themeDark",
            themeLight: "themeLight",
            themeAccessible: "themeAccessible",
            themeCustom: "themeCustom",
            wrongBrowser: "wrongBrowser",
            helloText: "helloText",
            idLangTheme: "idLangTheme",
            errorMessageTemplate: "errorMessageTemplate",
            successMessageTemplate: "successMessageTemplate",
            transcriptTitle: "transcriptTitle",
            viewSlidesText: "View slides",
        };

        return { ...castContent, ...this.settingsContent, ...this.shareContent };
    }

    updateInnerHtmls() {
        Object.keys(this.innerHtmlIdToKeyMap).map((e, i) => {
            let elementExists = document.getElementById(e);
            if (elementExists) {
                elementExists.innerHTML = this.translatedContent[e];
            }
        });
    }

    translateTextXHR(textArr, lang, callback) {
        const wrapperXHR = (attempt) => {
            const xhr = new XMLHttpRequest();
            xhr.onerror = (e) => {
                retry(attempt);
            };
            xhr.open("POST", getTranslateServerUrl(), true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.responseType = "text";
            xhr.onload = function (evt) {
                const translatedText = JSON.parse(this.responseText);
                callback(translatedText);
                ErrorHandler.closePopAlert();
            };
            const payload = JSON.stringify({
                text: textArr,
                language: lang,
            });
            xhr.send(payload);

            return xhr;
        };

        const retry = (attempt) => {
            if (attempt > 6) {
                errorEventHandler();
            }
            const delay = getNetworkRetryInterval(attempt);
            setTimeout(() => {
                wrapperXHR(++attempt);
            }, delay);
        };

        return wrapperXHR(0, { textArr, lang, callback });
    }

    translateTextArr(text_arr, lang, cb) {
        this.translateTextXHR(text_arr, lang, (data) => {
            let keys = Object.keys(this.buildContent());
            data.map((e, i) => {
                this.translatedContent[keys[i]] = e;
            });
            this._updateComponentsLocale();
        });
    }

    translateSettingsContent(locale, dynamicFields, callback) {
        const translateObject = { ...dynamicFields, ...this.settingsContent, ...this.shareContent };

        if (this.isNotToBeTranslated(locale)) {
            this.translatedContent = this.buildContent();
            callback();
            return;
        }

        this.translateTextXHR(Object.values(translateObject), locale, (data) => {
            const keys = Object.keys(translateObject);
            data.map((e, i) => {
                this.translatedContent[keys[i]] = e;
            });

            callback();
        });
    }

    translateMainPage(newLocale) {
        // If the newLocale is invalid, print the error message in the console.
        if (!newLocale) return console.error(`newLocale $${newLocale} is invalid.`);

        // Unset Playback.translationDone flag and set Playback.translating flag.
        Playback.translationDone = false;
        Playback.translating = true;

        // Track the event.
        racetrack("translate", { lang: newLocale });

        // Set the new locale.
        this.lang = newLocale;

        // Clear old translation in case it exists.
        gStory.clearTranslatedStoryCharts();

        // Reset gStory.downloadAllChart flag.
        gStory.downloadAllChart = false;

        // Set gStory._useTranslated flag.
        if (!this.isNotToBeTranslated(newLocale)) this._useTranslated = true;

        // Get translated text array.
        // console.log("Main page", Object.values(this.buildContent()));
        if (this.isNotToBeTranslated(newLocale)) {
            this.translatedContent = this.buildContent();
            this._updateComponentsLocale();
            return;
        }

        this.translateTextArr(Object.values(this.buildContent()), newLocale);
    }

    _updateComponentsLocale() {
        this.updateInnerHtmls();
        //Cast.component.rfContainer.updateLocale();
        Cast.component.toastContainer.updateLocale();
        Cast.component.trayContainer.updateLocale();

        model.translationRecommentationPanel.data.translatedContent = null;
        model.onTranslationChange.data = Cast.locale.lang;
        model.onTranslationChange.notify();
        Playback.translating = false;
    }

    zeroInLanguage(/** @type {String}*/ language, /** @type {String}*/ metricVal) {
        switch (language) {
            case "french":
                metricVal = "Zéro!";
                break;
            case "spanish":
                metricVal = "¡Cero!";
                break;
            case "italian":
                metricVal = "Zero!";
                break;
            case "japanese":
                metricVal = "ゼロ！";
                break;
            case "hindi":
                metricVal = "शून्य!";
                break;
            case "chinese":
                metricVal = "零！";
                break;
            case "german":
                metricVal = "Null!";
                break;
            case "dutch":
                metricVal = "Nul!";
                break;
            case "danish":
                metricVal = "Nul!";
                break;
        }
        return metricVal;
    }

    zeroConvert(metricVal, lang, decimalPlaces = 3) {
        const boolZeroMetricVal = 0 === parseInt(metricVal * Math.pow(10, decimalPlaces));
        if (boolZeroMetricVal && this.isNotToBeTranslated(Cast.locale.lang)) metricVal = "Zero!";
        if (boolZeroMetricVal) metricVal = this.zeroInLanguage(lang, metricVal);
        return metricVal;
    }
}

Cast.locale = new Locale("english");
setDefaultHoveredLocaleName("auto");
