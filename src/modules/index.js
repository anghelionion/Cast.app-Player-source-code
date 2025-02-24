import "../player.css";

import DesktopBottomBar from "./app/components/DesktopBottomBar";
import MobileBottomBar from "./app/components/MobileBottomBar";
import RecommendationsAndFeedbackComponent from "./app/components/RecommendationsAndFeedbackComponent";
import RightPanelComponent from "./app/components/RightPanelComponent";
import ToastComponent from "./app/components/ToastComponent";
import TrayContainerComponent from "./app/components/TrayContainerComponent";
import { countDynamicActions, getActionIcon } from "./app/components/utils/RecommendationUtils";
import Story from "./app/env/Story";
// eslint-disable-next-line spellcheck/spell-checker
import { doFeedbackPlusDynamicActions, gCurrentNarrationInfo, pauseNtts, playIntro, prefetchAllNarrations, restartAudio, utterAllNarrationsOfStep } from "./app/env/TTS";
import model from "./app/env/model/AppModel";
import BaseChart from "./app/slides/BaseChart";
import VideoSlide from "./app/slides/VideoSlide";

const windowMaps = {
    BaseChart,
    DesktopBottomBar,
    MobileBottomBar,
    RecommendationsAndFeedbackComponent,
    RightPanelComponent,
    Story,
    ToastComponent,
    TrayContainerComponent,
    VideoSlide,
    countDynamicActions,
    doFeedbackPlusDynamicActions,
    gCurrentNarrationInfo,
    getActionIcon,
    model,
    // eslint-disable-next-line spellcheck/spell-checker
    pauseNtts,
    playIntro,
    prefetchAllNarrations,
    restartAudio,
    utterAllNarrationsOfStep,
};

Object.keys(windowMaps).forEach((key) => {
    window[key] = windowMaps[key];
});

// Module code can go in this folder.
// Currently the player depends on many things being in the global scope.
// See combine.js in the repository root for more info.
