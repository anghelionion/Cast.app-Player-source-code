/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

/* eslint-disable */
"use strict";

import Component from "./Component";
import { createActionElement } from "./utils/RecommendationUtils";
import model from "../env/model/AppModel";

export default class ToastComponent extends Component {
    _isFirstTimeTranslating = true;
    _untranslatedContent = [];
    _tl = null;

    constructor() {
        super("div", "toast-container", []);
        this.renderActions();
        model.dynamicRecommendations.subscribe(this.renderActions);
    }

    renderActions = () => {
        const data = model.dynamicRecommendations.data;
        if (data && data.length) {
            data.forEach((item) => {
                const actionElement = createActionElement(item, true);
                this.element.querySelector("#toast-action-list").appendChild(actionElement);
            });
            this.toastDynamicActionElements = this.toastActionListElement.children;
        }
    };

    setUpElement = () => {
        this.element.innerHTML = `
            <div id="toast-action-list"></div>
        `;
        this.toastActionListElement = this.element.querySelector("#toast-action-list");
        this.toastDynamicActionElements = this.toastActionListElement.children;
    };

    _killTl = () => {
        if (this._tl) {
            this._tl.kill();
            this._tl = null;
        }
    };

    updateActions = () => {
        const currentChartIndex = getCurrentChartIndex();
        const currentStepIndex = getCurrentStepIndex();
        const currentNarrationIndex = getCurrentNarrationIndex();

        const narrationBox = document.querySelector(".narrationBox");

        // Check if there are dynamic actions to hide.
        const dynamicActionElements = this.toastActionListElement.children;
        const oldActiveDynamicActionElement = this.toastActionListElement.querySelector(".active.action");
        if (
            oldActiveDynamicActionElement &&
            !(
                Cast.megaSequence.includes(oldActiveDynamicActionElement.getAttribute("chartId") || "") &&
                Cast.megaSequence.indexOf(oldActiveDynamicActionElement.getAttribute("chartId") || "") === currentChartIndex &&
                parseInt(oldActiveDynamicActionElement.getAttribute("stepIndex") || "-1") === currentStepIndex &&
                parseInt(oldActiveDynamicActionElement.getAttribute("narrationIndex") || "-1") === currentNarrationIndex
            )
        ) {
            this._killTl();
            gsap.set(oldActiveDynamicActionElement, { autoAlpha: 0 });
            Component.removeClassNames(oldActiveDynamicActionElement, ["active"]);

            narrationBox.classList.remove("hasDynamicAction");
        }

        // Check if there are dynamic actions to display.
        for (let i = 0; i < dynamicActionElements.length; i++) {
            const chartId = dynamicActionElements[i].getAttribute("chartId") || "";
            const stepIndex = parseInt(dynamicActionElements[i].getAttribute("stepIndex") || "-1");
            const narrationIndex = parseInt(dynamicActionElements[i].getAttribute("narrationIndex") || "-1");
            // If the dynamic action is to be displayed, display that action after adding active class and return.
            // Otherwise, hide it.

            if (
                Cast.megaSequence.includes(chartId) &&
                Cast.megaSequence.indexOf(chartId) === currentChartIndex &&
                stepIndex === currentStepIndex &&
                narrationIndex === currentNarrationIndex
            ) {
                Component.addClassNames(dynamicActionElements[i], ["active"]);

                this._killTl();
                this._tl = gsap.timeline();
                this._tl.to(dynamicActionElements[i], 0.7, { autoAlpha: 1 });

                narrationBox.classList.add("hasDynamicAction");

                return;
            }
        }
    };

    updateLocale = () => {
        const collectActionElementTexts = (actionElements) => {
            for (let i = 0; i < actionElements.length; i++) {
                const currentActionTitle = actionElements[i].querySelector(".call-to-action").textContent;

                this._untranslatedContent.push(currentActionTitle ? currentActionTitle : "");
            }
        };

        const updateActionElementTexts = (actionElements, translationText) => {
            for (let i = 0; i < actionElements.length; i++) {
                this.toastDynamicActionElements[i].querySelector(".call-to-action").innerHTML = translationText.shift();
            }
        };

        if (this._isFirstTimeTranslating) {
            collectActionElementTexts(this.toastDynamicActionElements);
            this._isFirstTimeTranslating = false;
        }

        if (Cast.locale.isNotToBeTranslated(Cast.locale.lang)) {
            updateActionElementTexts(this.toastDynamicActionElements, this._untranslatedContent.concat());
        } else {
            if (this._untranslatedContent.length)
                Cast.locale.translateTextXHR(this._untranslatedContent, Cast.locale.lang, (translatedContent) => {
                    updateActionElementTexts(this.toastDynamicActionElements, translatedContent);
                });
        }
    };
}
