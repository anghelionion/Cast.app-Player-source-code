/* eslint-disable */
"use strict";

class Observer {
    constructor() {
        this._data = null;
        this._observers = [];
    }

    subscribe(observer) {
        this._observers.push(observer);
    }

    unsubscribe(observer) {
        this._observers = this._observers.filter((obs) => obs !== observer);
    }

    notify() {
        this._observers.forEach((observer) => observer.call());
    }

    set data(data) {
        this._data = data;
    }

    get data() {
        return this._data;
    }
}

const model = {};

model.chartSequence = new Observer();
model.dynamicAndStaticRecommendations = new Observer();
model.dynamicRecommendations = new Observer();

model.onViewTranscripts = new Observer();
model.onViewRecommendations = new Observer();
model.onPlayerResize = new Observer();
model.onTranslationChange = new Observer();
model.onConfirmFeedback = new Observer();
model.onNarratorAvatarChange = new Observer();
model.onUpdateActions = new Observer();
model.onUpdateActions.data = 0;

model.translationRecommentationPanel = new Observer();
model.feedbackPanelState = new Observer();
model.controlsState = new Observer();
model.controlsState.data = {
    menuType: "none",
    canSkip: false,
};

model.progressState = new Observer();
model.progressState.data = {
    elapsedTime: "0s",
    totalTime: 0,
    progress: "0s",
};

model.currentSequence = new Observer();
model.updateCurrentNarration = new Observer();

export default model;
