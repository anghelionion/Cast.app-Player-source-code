/* eslint-disable */
"use strict";

const createActionModel = (action, action2AddAsString) => {
    const iFrameAwareTarget = Cast.isInIFrame() ? "_blank" : "_self";
    const eventType = action.eventType || "click";

    let svgOrImg;
    let actionTitle = action.title || "Recommendation";
    let actionContent = action.content || "";
    let onClickAction = null;
    let callToActionText;
    let openurl = encodeURI(action.url || action.weburl || "https://cast.app");
    let actionItemIcon = SVG.recommendationsDefaultHandActionIcon();
    let actionIframe = action.iframe || false;

    actionTitle = action.title;
    actionContent = action.content || openurl;
    callToActionText = action.ctaLabel || Cast.locale.translatedContent["clickRecommandationDefault"];

    switch (action.actionType) {
        case "blog":
            actionItemIcon = SVG.recommendationsBlogButtonActionIcon();
            break;
        case "web":
            actionItemIcon = SVG.recommendationsWebButtonActionIcon();
            break;
        case "product":
            actionItemIcon = SVG.recommendationsProductButtonActionIcon();
            break;
        case "webinar":
            actionItemIcon = SVG.recommendationsWebinarButtonActionIcon();
            break;
        case "community":
            actionItemIcon = SVG.recommendationsCommunityButtonActionIcon();
            break;
        case "typeform":
            actionItemIcon = SVG.recommendationsTypeformActionIcon();
            break;
        case "surveymonkey":
            actionItemIcon = SVG.recommendationsSurveyMonkeyButtonActionIcon();
            break;
        case "wufoo":
            actionItemIcon = SVG.recommendationsWufooActionIcon();
            break;
        case "renewal":
            actionItemIcon = SVG.recommendationsRenewalButtonActionIcon();
            break;
        case "googleforms":
            actionItemIcon = SVG.recommendationsGoogleFormsButtonActionIcon();
            break;
        case "chilipiper":
            actionItemIcon = SVG.recommendationsChiliPiperButtonActionIcon();
            break;
        case "calendly":
            actionItemIcon = SVG.recommendationsCalendlyActionIcon();
            break;
        case "upsell":
            actionItemIcon = SVG.recommendationsUpsellActionIcon();
            break;
        case "youtube":
            actionItemIcon = SVG.recommendationsYoutubeActionIcon();
            break;
        case "goodtime":
            actionItemIcon = SVG.recommendationsGoodtimeButtonActionIcon();
            break;
        case "replay":
            actionItemIcon = SVG.restart("#ff0000");
            actionTitle = "Replay this Cast from beginning";
            onClickAction = `playFromBeginning();`;
            callToActionText = Cast.locale.translatedContent["callToReplayActionText"];
            actionContent = "";
            break;
        case "deeplink":
            actionItemIcon = SVG.deeplink("#ff0000");
            openurl = action.url || "https://cast.app";
            callToActionText = action.ctaLabel || Cast.locale.translatedContent["callToDeeplinkActionText"];
            break;
        case "phone":
            actionItemIcon = SVG.phoneIcon("#ff0000");
            openurl = openurl; // openurl = "tel:" + openurl;
            callToActionText = action.ctaLabel || Cast.locale.translatedContent["callToPhoneActionText"];
            onClickAction = `window.open("${openurl}", "${iFrameAwareTarget}") && callWebhook2("${eventType}", ${action2AddAsString});`;
            break;
        case "mail": //designer generates mail not mailto
        case "mailto":
            actionItemIcon = SVG.mailtoIcon("#ff0000");
            openurl = openurl; // openurl = "mailto:" + openurl;
            callToActionText = action.ctaLabel || Cast.locale.translatedContent["callToMailtoActionText"];
            onClickAction = `window.open("${openurl}", "_blank") && callWebhook2("${eventType}", ${action2AddAsString});`;
            break;
        case "cast.app":
            actionItemIcon = SVG.castLogoSymbolSolidColor("#ff0000");
        default:
            actionTitle = "cast.app";
            actionContent = "Learn how to create your own presentation and share insights and recommendations with your customers at cast.app";
            callToActionText = Cast.locale.translatedContent["callToCastAppActionText"];
            break;
    }

    svgOrImg = getActionIcon(action);
    if (!onClickAction) {
        //following is needed to fix goodtime uris that have &
        openurl = openurl.replaceAll("&amp;", "&");
        openurl = appendsGoodtimeUrlPartnerId(openurl);
        if (actionIframe) {
            const config = JSON.stringify({
                title: actionTitle.replaceAll("'", "%27"),
                link: openurl,
                actionType: action.actionType,
            });
            onClickAction = `checkIframeUrl("${openurl}", ${config}, ${eventType}, ${action2AddAsString});`;
        } else {
            onClickAction = `window.open("${openurl}", "_blank") && callWebhook2("${eventType}", ${action2AddAsString});`;
        }
    }

    return {
        svgOrImg,
        actionTitle,
        actionContent,
        onClickAction,
        callToActionText,
        actionItemIcon,
        weburl: action.weburl,
    };
};

const getActionIcon = (action) => {
    let svgOrImg = null;

    switch (action.actionType) {
        case "blog":
            if (action.weburl === undefined || action.weburl === null || action.weburl === "") svgOrImg = SVG.recommendationsBlogButtonActionIcon();
            else svgOrImg = Cast.getFavicon(action.weburl);
            break;
        case "web":
            if (action.weburl === undefined || action.weburl === null || action.weburl === "") svgOrImg = SVG.recommendationsWebButtonActionIcon();
            else svgOrImg = Cast.getFavicon(action.weburl);
            break;
        case "product":
            if (action.weburl === undefined || action.weburl === null || action.weburl === "") svgOrImg = SVG.recommendationsProductButtonActionIcon();
            else svgOrImg = Cast.getFavicon(action.weburl);
            break;
        case "webinar":
            svgOrImg = SVG.recommendationsWebinarButtonActionIcon();
            break;
        case "community":
            if (action.weburl === undefined || action.weburl === null || action.weburl === "") svgOrImg = SVG.recommendationsWebButtonActionIcon();
            else svgOrImg = Cast.getFavicon(action.weburl);
            break;
        case "typeform":
            svgOrImg = SVG.recommendationsTypeformButtonActionIcon();
            break;
        case "surveymonkey":
            svgOrImg = SVG.recommendationsSurveyMonkeyButtonActionIcon();
            break;
        case "wufoo":
            svgOrImg = SVG.recommendationsWufooButtonActionIcon();
            break;
        case "renewal":
            svgOrImg = SVG.recommendationsRenewalButtonActionIcon();
            break;
        case "googleforms":
            svgOrImg = SVG.recommendationsGoogleFormsButtonActionIcon();
            break;
        case "chilipiper":
            svgOrImg = SVG.recommendationsChiliPiperButtonActionIcon();
            break;
        case "calendly":
            svgOrImg = SVG.recommendationsCalendlyButtonActionIcon();
            break;
        case "upsell":
            svgOrImg = SVG.recommendationsUpsellButtonActionIcon();
            break;
        case "youtube":
            svgOrImg = SVG.recommendationsYoutubeButtonActionIcon();
            break;
        case "goodtime":
            svgOrImg = SVG.recommendationsGoodtimeButtonActionIcon();
            break;
        case "replay":
            svgOrImg = SVG.restart("#00a2ff");
            break;

        case "deeplink":
            const iconUrl = action.icon_url;
            if (iconUrl === undefined || iconUrl === null || iconUrl === "") svgOrImg = SVG.deeplink("purple");
            else svgOrImg = Cast.getFavicon(iconUrl);
            break;

        case "phone":
            svgOrImg = SVG.phoneIcon("orange");
            break;

        case "mail": //designer generates mail not mailto
        case "mailto":
            svgOrImg = SVG.mailtoIcon("#00a2ff");
            break;

        case "cast.app":
        default:
            svgOrImg = SVG.castLogoSymbol();
            break;
    }

    return svgOrImg;
};

const appendsGoodtimeUrlPartnerId = (url) => {
    try {
        const link = new URL(url ?? "");
        if (!url || link.searchParams.has("partnerId") || !link.hostname.endsWith("goodtime.io")) {
            return url;
        }
        link.searchParams.append("partnerId", process.env.GOODTIME_PARTNER_ID);
        return link.href;
    } catch (error) {
        return url;
    }
};

const _setRecommendationAndToastBackgroundColor = (actionElement, isToastActionList, c, o) => {
    // gsap.set(actionElement, { css: { backgroundColor: isToastActionList ? c : hexWithOpacity(c, o) } });
    gsap.set(actionElement, { css: { backgroundColor: isToastActionList ? c : hexWithOpacity(c, 1) } });
    if (isToastActionList) gsap.set(actionElement.querySelector(".toast-action-list-arrow"), { css: { borderTopColor: c } });
};

const createDynamicAction = (data, isDynamic, chartId, stepIndex, narrationIndex) => {
    if (!data) return;

    const actionChartId = isDynamic ? (chartId ? chartId : Cast.currentChart._chartIdentifier) : "";
    const actionStepIndex = isDynamic ? (stepIndex !== null ? stepIndex : getCurrentStepIndex().toString()) : "-1";
    const actionNarrationIndex = isDynamic ? (narrationIndex !== null ? narrationIndex : getCurrentNarrationIndex().toString()) : "-1";
    const action2AddAsString = JSON.stringify({
        ...data,
        ...{
            actionChartId,
            actionStepIndex,
            actionNarrationIndex,
        },
    });

    const dataCopy = JSON.parse(JSON.stringify(data));
    delete dataCopy.webhook;
    delete dataCopy.icon_url;

    const actionModel = createActionModel(data, action2AddAsString);

    const isToastActionList = false;
    const actionElementID = null;

    const actionElement = addElement("div", actionElementID, `${isDynamic ? "dynamic " : ""}action`);

    actionElement.innerHTML = `
                        <div class="action-item-icon">
                            ${actionModel.actionItemIcon}
                        </div>
                        <div class="action-heading">
                            
                            <span class="action-title-text">${actionModel.actionTitle}</span>
                           <span class="action-title-dynamic-bell-icon">${SVG.bell("white")}</span>
                        </div>
                        <div class="action-title-content">${actionModel.actionContent}</div>
                        <div class="show-more-action-content"></div>
                        <div class="action-body">
                          <div class="action-button">
                              <span class="action-logo">${actionModel.svgOrImg}</span>
                              <span class="call-to-action">${actionModel.callToActionText}</span>                        
                          </div>
                        </div>
                    `;
    actionElement.querySelector(".action-button").setAttribute("onclick", "Cast.userInteracted && " + actionModel.onClickAction);

    //Force web action with URL to display on one line
    if (data.actionType === "web" && actionModel.actionContent === actionModel.weburl) {
        actionElement.querySelector(".action-title-content").classList.add("action-title-content-force-one-line");
    }

    gsap.set(actionElement.querySelector(".action-item-icon svg"), {
        attr: { "fill-opacity": 0.3 },
        width: 80,
        height: 80,
    });
    gsap.set(actionElement.querySelectorAll(".action-item-icon svg path"), { attr: { fill: "white" } });

    const customColor = data.background_color;

    switch (data.actionType) {
        case "phone":
        case "deeplink":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#494541", 0.7);
            break;
        case "mail":
        case "mailto":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#00a2ff", 0.7);
            break;
        case "web":
            actionElement.setAttribute("weburl", actionModel.weburl ? actionModel.weburl : "cast.app");
        //fallthru
        case "product":
        case "blog":
        case "community":
        case "webinar":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#F59E0B", 0.7);
            break;
        case "renewal":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#10B981", 0.8);
            break;
        case "youtube":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#BD3330", 0.6);
            break;
        case "upsell":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#98913A", 0.95);
            break;
        case "typeform":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#0445AF", 0.95);
            break;
        case "surveymonkey":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#00BF6F", 0.95);
            break;
        case "wufoo":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#9992EB", 0.95);
            break;
        case "calendly":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#3C8CFF", 0.8);
            break;
        case "chilipiper":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#FF5722", 0.8);
            break;
        case "googleforms":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#7248B9", 0.7);
            break;
        case "goodtime":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#6400E0", 0.8);
            break;
    }

    gsap.set(actionElement, { autoAlpha: 1 });
    return actionElement;
};
const checkActionContentForLines = (element) => {
    //Check every action content if it exceeds 4 lines
    const staticActionsElements = element.querySelectorAll(".action-title-content");
    for (var i = 0; i < staticActionsElements.length; i++) {
        const el = staticActionsElements[i];
        const parentEl = el.parentElement;
        const showMoreButtonEl = parentEl.querySelector(".show-more-action-content");

        //Fix, sometimes scrollHeight returns a value of 1 or 2, but doesn't have an extra line
        if (el.scrollHeight - el.clientHeight > 3) {
            //add the more button
            if (showMoreButtonEl.children.length < 1) {
                const aEl = document.createElement("a");
                aEl.setAttribute("href", "#");
                aEl.textContent = Cast.locale.translatedContent["moreButton"];
                aEl.addEventListener("click", function () {
                    const el = this.parentElement.parentElement.querySelector(".action-title-content");
                    if (el.classList.contains("expandClamp")) {
                        el.classList.remove("expandClamp");
                        this.textContent = Cast.locale.translatedContent["moreButton"];
                    } else {
                        el.classList.add("expandClamp");
                        this.textContent = Cast.locale.translatedContent["lessButton"];
                    }
                });
                showMoreButtonEl.append(aEl);
            } else {
                //Update locale for button
                if (el.classList.contains("expandClamp")) {
                    showMoreButtonEl.children[0].textContent = Cast.locale.translatedContent["lessButton"];
                } else {
                    showMoreButtonEl.children[0].textContent = Cast.locale.translatedContent["moreButton"];
                }
            }
        } else {
            //Only if the element is not expanded, remove the button
            if (!el.classList.contains("expandClamp")) showMoreButtonEl.innerHTML = "";
        }
    }
};

const createActionElement = (data, isToastActionList = false) => {
    if (!data) return;

    const isDynamic = "dynamic" in data;
    const forceDynamic = "forceDynamic" in data;

    const actionChartId = isDynamic ? data.dynamic.chartId : "";
    const actionStepIndex = isDynamic ? data.dynamic.stepIndex : "-1";
    const actionNarrationIndex = isDynamic ? data.dynamic.narrationIndex : "-1";

    const action2AddAsString = JSON.stringify({
        ...data,
        ...{
            actionChartId,
            actionStepIndex,
            actionNarrationIndex,
        },
    });

    const actionIdentifier = data.actionIdentifier;

    const actionModel = createActionModel(data, action2AddAsString);

    const actionElement = addElement("div", null, `${isDynamic ? "dynamic " : ""}action`);
    if (forceDynamic) actionElement.classList.add("forceDynamic");
    actionElement.setAttribute("actionType", data.actionType ? data.actionType : "cast.app");
    actionElement.setAttribute("chartId", actionChartId);
    actionElement.setAttribute("stepIndex", actionStepIndex);
    actionElement.setAttribute("narrationIndex", actionNarrationIndex);
    actionElement.setAttribute("actionIdentifier", actionIdentifier);

    if (isToastActionList) {
        actionElement.innerHTML = `
                          <div class="action-button">
                              <span class="action-logo">${actionModel.svgOrImg}</span>
                              <span class="call-to-action">${actionModel.actionTitle}</span>   
                                                   
                          </div>
                          <span class="toast-action-list-arrow"></span>
                          `;
        actionElement.setAttribute("onclick", "Cast.userInteracted && " + actionModel.onClickAction);
    } else {
        actionElement.innerHTML = `
                        <div class="action-item-icon">
                            ${actionModel.actionItemIcon}
                        </div>
                        <div class="action-heading">
                            <span class="action-title-icon">${SVG.bell("#595551")}</span>
                            <span class="action-title-text">${actionModel.actionTitle}</span>
                           <span class="action-title-dynamic-bell-icon">${SVG.bell("white")}</span>
                        </div>
                        <div class="action-title-content">${actionModel.actionContent}</div>
                        <div class="show-more-action-content"></div>
                        <div class="action-body">
                          <div class="action-button">
                              <span class="action-logo">${actionModel.svgOrImg}</span>
                              <span class="call-to-action">${actionModel.callToActionText}</span>                        
                          </div>
                        </div>
                    `;
        actionElement.querySelector(".action-button").setAttribute("onclick", "Cast.userInteracted && " + actionModel.onClickAction);

        //Force web action with URL to display on one line
        if (data.actionType === "web" && actionModel.actionContent === actionModel.weburl) {
            actionElement.querySelector(".action-title-content").classList.add("action-title-content-force-one-line");
        }

        gsap.set(actionElement.querySelector(".action-item-icon svg"), {
            attr: { "fill-opacity": 0.3 },
            width: 80,
            height: 80,
        });
        gsap.set(actionElement.querySelectorAll(".action-item-icon svg path"), { attr: { fill: "white" } });

        if (!isDynamic && !forceDynamic) {
            gsap.set(actionElement.querySelector(".action-title-dynamic-bell-icon"), { display: "none" });
        }
    }

    const customColor = data.background_color;

    switch (data.actionType) {
        case "phone":
        case "deeplink":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#494541", 0.7);
            break;
        case "mail":
        case "mailto":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#00a2ff", 0.7);
            break;
        case "web":
            actionElement.setAttribute("weburl", actionModel.weburl ? actionModel.weburl : "cast.app");
        //fallthru
        case "product":
        case "blog":
        case "community":
        case "webinar":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#F59E0B", 0.7);
            break;
        case "renewal":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#10B981", 0.8);
            break;
        case "youtube":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#BD3330", 0.6);
            break;
        case "upsell":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#98913A", 0.95);
            break;
        case "typeform":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#0445AF", 0.95);
            break;
        case "surveymonkey":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#00BF6F", 0.95);
            break;
        case "wufoo":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#9992EB", 0.95);
            break;
        case "calendly":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#3C8CFF", 0.8);
            break;
        case "chilipiper":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#FF5722", 0.8);
            break;
        case "googleforms":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#7248B9", 0.7);
            break;
        case "goodtime":
            _setRecommendationAndToastBackgroundColor(actionElement, isToastActionList, customColor || "#6400E0", 0.8);
            break;
    }

    return actionElement;
};

const countDynamicActions = (dynamicActions) => {
    if (!(dynamicActions && dynamicActions.length)) return 0;

    const currentChartIndex = getCurrentChartIndex();
    const currentStepIndex = getCurrentStepIndex();
    const currentNarrationIndex = getCurrentNarrationIndex();
    let count = 0;

    //Check count of dynamic actions

    for (let i = 0; i < dynamicActions.length; i++) {
        const o = dynamicActions[i];
        const chartId = o.dynamic.chartId;
        const stepIndex = parseInt(o.dynamic.stepIndex);
        const narrationIndex = parseInt(o.dynamic.narrationIndex);

        if (
            Cast.megaSequence.includes(chartId) &&
            (Cast.megaSequence.indexOf(chartId) < currentChartIndex ||
                (Cast.megaSequence.indexOf(chartId) === currentChartIndex &&
                    (stepIndex < currentStepIndex || (stepIndex === currentStepIndex && narrationIndex <= currentNarrationIndex))))
        ) {
            count++;
        }
    }

    return count;
};

export { createDynamicAction, checkActionContentForLines, createActionElement, countDynamicActions, getActionIcon };
