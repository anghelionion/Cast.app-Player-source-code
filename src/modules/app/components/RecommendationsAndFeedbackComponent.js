/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

/* eslint-disable */
"use strict";

import Component from "./Component";
import TranscriptsComponent from "./TranscriptsComponent";
import model from "../env/model/AppModel";
import RecommendationPanel from "./RecommendationPanel";
import { checkActionContentForLines } from "./utils/RecommendationUtils";

export default class RecommendationsAndFeedbackComponent extends Component {
    constructor() {
        super("div", "rfs-container", []);
    }

    setUpElement = () => {
        this.element.innerHTML = ``;

        model.onViewTranscripts.subscribe(this._onViewTranscripts);
        model.onViewRecommendations.subscribe(this._onViewRecommendations);
        model.onPlayerResize.subscribe(this._onPlayerResize);
        this._onViewRecommendations();
    };

    _onPlayerResize = () => {
        if (this.view instanceof RecommendationPanel) {
            checkActionContentForLines(this.element);
        }
    };

    _onViewTranscripts = () => {
        const container = this.element;
        container.innerHTML = "";
        this.view = new TranscriptsComponent();
        container.append(this.view.element);
        this.view.scrollCurrentNarration();
        TranscriptMenuDetails.setCurrent("on");
        updateTranscriptsVisibility();
    };

    _onViewRecommendations = () => {
        const container = this.element;
        container.innerHTML = "";
        this.view = new RecommendationPanel();
        container.append(this.view.element);
        this.view.updateVisibility();
        TranscriptMenuDetails.setCurrent("off");
        updateTranscriptsVisibility();
    };

    updateSelectedPlaybackSpeed = () => {
        const speeds = { slow: 0.5, medium: 1, fast: 1.5, "x-fast": 2 };
        const speed = speeds[PlayRateSetting.getCurrent()];

        gsap.set([".right-panel-playback-speed-current", ".side-panel-playback-speed"], { innerText: speed + "x" });
    };

    expandRecommendation = () => {
        if (!(this.view instanceof RecommendationPanel)) {
            model.onViewRecommendations.notify();
        }
    };
    collapseRecommendation = () => {};

    resetFeedbackMenuTitle = () => {
        if (this.feedbackMenuTitleTextElement) this.feedbackMenuTitleTextElement.innerHTML = Cast.locale.translatedContent["feedbackMenuTitle"];
    };

    //TODO: move
    updateCurrentNarration() {
        if (this.view instanceof TranscriptsComponent) {
            this.view.updateCurrentNarration();
        }
    }
}
