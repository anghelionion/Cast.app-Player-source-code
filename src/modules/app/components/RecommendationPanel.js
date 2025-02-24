/* eslint-disable */
"use strict";

import model from "../env/model/AppModel";
import { createActionElement, checkActionContentForLines } from "./utils/RecommendationUtils";
import "./RecommendationPanel.css";

export default class RecommendationPanel {
    _isMouseOverScrollList = false;

    constructor(props) {
        this.props = props;
        this.element = document.createElement("div");
        this.element.id = "action-menu-container";
        this.collapsedVisibleElementsNumber = 5;
        this.collapsedStakedElementsNumber = 3;
        this.isCollapsed = true;
        this.currentRecommendationCount = 0;

        this.render();
        this.renderActions();
        model.dynamicAndStaticRecommendations.subscribe(this.renderActions);
        model.onTranslationChange.subscribe(this.updateLocale);
        model.onUpdateActions.subscribe(this.updateActions);
    }

    updateActions = () => {
        this.updateVisibility();
    };

    canElementRender = (action) => {
        const isDynamic = action.classList.contains("dynamic");
        if (!isDynamic) return true;

        const currentChartIndex = getCurrentChartIndex();
        const currentStepIndex = getCurrentStepIndex();
        const currentNarrationIndex = getCurrentNarrationIndex();

        const chartId = action.getAttribute("chartId") || "";
        const stepIndex = parseInt(action.getAttribute("stepIndex") || "-1");
        const narrationIndex = parseInt(action.getAttribute("narrationIndex") || "-1");

        if (
            Cast.megaSequence.includes(chartId) &&
            (Cast.megaSequence.indexOf(chartId) < currentChartIndex ||
                (Cast.megaSequence.indexOf(chartId) === currentChartIndex &&
                    (stepIndex < currentStepIndex || (stepIndex === currentStepIndex && narrationIndex <= currentNarrationIndex))))
        ) {
            return true;
        }

        return false;
    };

    updateLocale = () => {
        const actionElementsList = this.element.querySelectorAll(".static-action-list-body .action");

        //Gather all the elements and iterate
        const dynamicTextActionTypes = [
            "product",
            "renewal",
            "calendly",
            "chilipiper",
            "surveymonkey",
            "googleforms",
            "goodtime",
            "blog",
            "community",
            "webinar",
            "youtube",
            "upsell",
            "web",
            "typeform",
            "wufoo",
            "deeplink",
            "phone",
            "mailto",
            "mail",
        ];

        const collectActionElementTexts = (actionElements) => {
            const _untranslatedContent = [];
            for (let i = 0; i < actionElements.length; i++) {
                const el = actionElements[i].querySelector(".call-to-action");
                const currentActionTitleEl = actionElements[i].querySelector(".action-title-text");
                const currentActionContent = actionElements[i].querySelector(".action-title-content");
                const actionType = actionElements[i].getAttribute("actionType");

                if (dynamicTextActionTypes.indexOf(actionType) < 0) {
                    switch (actionType) {
                        case "replay":
                        case "cast.app":
                            break;
                        default:
                            break;
                    }

                    _untranslatedContent.push(currentActionTitleEl.textContent);
                    if (actionType !== "web" && currentActionContent && currentActionContent.textContent !== "") {
                        _untranslatedContent.push(currentActionContent.textContent);
                    }
                } else {
                    //Handle translation for dynamic types

                    _untranslatedContent.push(currentActionTitleEl.textContent.trim());

                    if (currentActionContent && currentActionContent.textContent !== "") {
                        _untranslatedContent.push(currentActionContent.textContent.trim());
                    }

                    _untranslatedContent.push(el.textContent.trim());
                }
            }
            return _untranslatedContent;
        };

        const updateActionElementTexts = (actionElements, translationText) => {
            //these types have dynamic texts for title, content and ctaLabel
            translationText = translationText.concat();
            for (let i = 0; i < actionElements.length; i++) {
                const el = actionElements[i].querySelector(".call-to-action");
                const currentActionTitleEl = actionElements[i].querySelector(".action-title-text");
                const currentActionContent = actionElements[i].querySelector(".action-title-content");
                const actionType = actionElements[i].getAttribute("actionType");

                if (dynamicTextActionTypes.indexOf(actionType) < 0) {
                    switch (actionType) {
                        case "replay":
                            el.innerHTML = Cast.locale.translatedContent["callToReplayActionText"];
                            break;

                        case "cast.app":
                            el.innerHTML = Cast.locale.translatedContent["callToCastAppActionText"];
                            break;
                        default:
                            break;
                    }

                    currentActionTitleEl.innerHTML = translationText.shift();

                    if (actionType === "web") {
                        currentActionContent.innerHTML = [Cast.locale.translatedContent["visit"], actionElements[i].getAttribute("weburl")].join(" ");
                    } else if (currentActionContent && currentActionContent.textContent !== "") {
                        currentActionContent.innerHTML = translationText.shift();
                        checkActionContentForLines(this.element);
                    }
                } else {
                    currentActionTitleEl.innerHTML = translationText.shift();

                    if (currentActionContent && currentActionContent.textContent !== "") {
                        currentActionContent.innerHTML = translationText.shift();
                        checkActionContentForLines(this.element);
                    }

                    el.innerHTML = translationText.shift();
                }
            }
        };
        let translationData = model.translationRecommentationPanel.data;
        if (!translationData?.originalContent) {
            model.translationRecommentationPanel.data = {};
            model.translationRecommentationPanel.data.originalContent = collectActionElementTexts(actionElementsList);
            translationData = model.translationRecommentationPanel.data;
        }

        if (Cast.locale.isNotToBeTranslated(Cast.locale.lang)) {
            updateActionElementTexts(actionElementsList, translationData.originalContent);
        } else {
            if (!translationData?.translatedContent) {
                Cast.locale.translateTextXHR(model.translationRecommentationPanel.data.originalContent, Cast.locale.lang, (translatedContent) => {
                    model.translationRecommentationPanel.data.translatedContent = translatedContent;
                    updateActionElementTexts(actionElementsList, translatedContent);
                });
            } else {
                updateActionElementTexts(actionElementsList, translationData.translatedContent);
            }
        }

        checkActionContentForLines(this.element);

        const elementsToLocales = {};

        Object.keys(elementsToLocales).map((key) => {
            gsap.set(key, { innerHTML: Cast.locale.translatedContent[elementsToLocales[key]] });
        });

        this.updateTitleText();
    };

    updateVisibility = () => {
        const visibleElements = [];

        this.element.querySelectorAll(".static-action-list-body .action").forEach((el) => {
            if (this.canElementRender(el)) {
                gsap.set(el, { display: "block", clearProps: "position,scale,top,margin-top,left,right" });
                visibleElements.push(el);
            } else {
                gsap.set(el, { display: "none" });
            }
        });

        if (this.isCollapsed) {
            let hiddenActions = [];

            hiddenActions = visibleElements.slice(0, gsap.utils.clamp(0, visibleElements.length, visibleElements.length - this.collapsedVisibleElementsNumber));
            this.currentRecommendationCount = hiddenActions && hiddenActions.length > 0 ? hiddenActions.length : 0;

            this.updateTitleText();

            const hiddenActionsToHide = hiddenActions.slice(0, gsap.utils.clamp(0, hiddenActions.length, hiddenActions.length - this.collapsedStakedElementsNumber));

            hiddenActionsToHide.forEach((action) => {
                gsap.set(action, { display: "none" });
            });
            hiddenActions.splice(0, hiddenActions.length - this.collapsedStakedElementsNumber);

            hiddenActions.forEach((action, idx) => {
                gsap.set(action, {
                    position: "absolute",
                    top: idx * 10,
                    left: "0",
                    right: "0",
                    scale: 0.95 - (hiddenActions.length - idx - 1) * 0.05,
                    transformOrigin: "center top",
                });
            });

            visibleElements.splice(0, visibleElements.length - this.collapsedVisibleElementsNumber);
            gsap.set(visibleElements[0], { marginTop: 6 + hiddenActions.length * 10 });
        } else {
            this.currentRecommendationCount = visibleElements && visibleElements.length > 0 ? visibleElements.length : 0;
            this.updateTitleText();
        }

        const lastElement = visibleElements[visibleElements.length - 1];
        if (lastElement && !this._isMouseOverScrollList) {
            const top = lastElement.offsetTop;
            this.el("#action-list").scrollTop = top;
        }
    };

    updateTitleText = () => {
        const count = this.currentRecommendationCount;
        if (count > 0) {
            let title = count === 1 ? Cast.locale.translatedContent["recommendationSingular"] : Cast.locale.translatedContent["recommendationPlural"];
            if (this.isCollapsed)
                title =
                    count.length === 1
                        ? [Cast.locale.translatedContent["moreText"], Cast.locale.translatedContent["recommendationSingular"]].join(" ")
                        : [Cast.locale.translatedContent["moreText"], Cast.locale.translatedContent["recommendationPlural"]].join(" ");

            gsap.set(this.el("#action-menu-title-text"), { innerHTML: [count, title].join(" ") });
            gsap.set(this.el("#action-menu-heading"), { display: "flex" });
        } else {
            gsap.set(this.el("#action-menu-heading"), { display: "none" });
        }
        gsap.set(this.el(".action-menu-title-icon"), { innerHTML: this.isCollapsed ? SVG.chevronDownIcon() : SVG.chevronUpIcon() });
    };

    renderActions = () => {
        this.element.querySelector(".static-action-list-body").innerHTML = "";

        let data = model.dynamicAndStaticRecommendations.data;
        if (data) {
            data = data.concat([]).reverse();

            data.forEach((action) => {
                const actionElement = createActionElement(action);

                this.el(".static-action-list-body").appendChild(actionElement);
            });

            this.updateLocale();

            this.updateVisibility();
        }

        checkActionContentForLines(this.element);

        this.element.addEventListener("mouseenter", () => {
            this._isMouseOverScrollList = true;
        });
        this.element.addEventListener("mouseleave", () => {
            this._isMouseOverScrollList = false;
        });
    };
    el = (selector) => {
        return this.element.querySelector(selector);
    };

    render() {
        const html = `
        
         <div id="action-menu-heading">                
                    <div id="action-menu-title">                       
                        <span id="action-menu-title-text">${Cast.locale.translatedContent["actionMenuTitle"]}</span>
                         <span class="action-menu-title-icon">${SVG.chevronDownIcon()}</span>
                    </div>                    
                </div>
                
                <div id="action-list">
                  
                         
                        <div class="static-action-list-body"></div>                   
                </div>
               `;

        this.element.innerHTML = html;

        this.el("#action-menu-title").addEventListener("click", () => {
            this.isCollapsed = !this.isCollapsed;
            this.updateVisibility();
        });
    }
}
