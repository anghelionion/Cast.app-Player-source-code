/* eslint-disable */
"use strict";

import model from "../env/model/AppModel";
import { createDynamicAction, checkActionContentForLines } from "./utils/RecommendationUtils";

import "./TranscriptsComponent.css";

export default class TranscriptsComponent {
    _currentStepHighlightTL = null;
    _currentChartHighlightTL = null;
    _currentChartId = null;
    _isMouseOverScrollList = false;

    constructor(props) {
        this.props = props;
        this.element = document.createElement("div");
        this.element.id = "transcript-chart-containers";
        this.element.classList.add("transcripts-container");

        this.render();
        this.updateTranscript();

        model.chartSequence.subscribe(this.updateTranscript);
        model.onPlayerResize.subscribe(this.onPlayerResize);

        model.onTranslationChange.subscribe(this.onTranslationChange);
    }

    onTranslationChange = () => {
        gsap.set(this.element.querySelector(".static-action-menu-title-text"), { innerHTML: Cast.locale.translatedContent["settingTranscript"] });
    };

    el = (selector) => {
        return this.element.querySelector(selector);
    };

    render() {
        const html = `        
        <div class="static-action-menu-heading">
            <div class="static-action-menu-title">
                <span class="transcripts-title-icon">${SVG.transcriptsButtonIcon()}</span>                
                <span class="static-action-menu-title-text">${Cast.locale.translatedContent["settingTranscript"]}</span>
                
            </div>
        </div>
        <div id="transcript-chart-box"></div>
        <span class="scroll-paused-tooltip"></span>  
            `;

        this.element.innerHTML = html;

        this.element.addEventListener("mouseenter", () => {
            this._isMouseOverScrollList = true;

            const container = this.el("#transcript-chart-box");
            if (container.scrollHeight > container.clientHeight) {
                gsap.set(this.el(".scroll-paused-tooltip"), {
                    autoAlpha: 0.5,
                    innerText: Cast.locale.translatedContent["scrollPausedTooltip"],
                    display: "block",
                });
            }
        });
        this.element.addEventListener("mouseleave", () => {
            this._isMouseOverScrollList = false;

            gsap.set(this.el(".scroll-paused-tooltip"), { autoAlpha: 0, display: "none" });
        });
    }

    updateTranscript = () => {
        const chartSeq = model.chartSequence.data;

        let popupTranscriptContainerContent = "";
        let updatedSubtitles = [];

        // For each chart...
        if (chartSeq && chartSeq.length)
            chartSeq.forEach((chartID, chartIndex) => {
                updatedSubtitles[chartIndex] = [];

                // Transcript Chart Title
                const type = chartType(gStory.getTranslatedStory(), chartID) || chartType(gStory.getUntranslatedStory(), chartID) || "Slide";
                let heading = chartHeadingTitle(gStory, chartID, type);
                if (type === "landing") {
                    let titleOrReport;
                    const title = chartHeadingTitle(gStory, chartID, "reservedReportName");
                    if (title == "reservedEmpty") {
                        titleOrReport = "&nbsp;";
                    } else if (title == "reservedReportName") {
                        titleOrReport = storyAndProductName(gStory);
                    } else {
                        titleOrReport = title;
                    }
                    heading = titleOrReport;
                }

                popupTranscriptContainerContent += `
                <div class="transcript-chart-container">                    
                    <div
                        id="${"popup-transcript-at-chart-" + chartID}" 
                        class="transcript-chart-title" onclick="actionPlayChart('${chartID}')"
                    >
                        <div class="transcript-chart-icon">
                            ${this.getChartIcon(chartType(gStory.getUntranslatedStory(), chartID), chartMode(gStory.getUntranslatedStory(), chartID))}
                        </div>
                        <div class="transcript-chart-name">
                            <div class="full-chart-name">${heading}</div>                           
                        </div>
                         <span class="transcript-chart-play-pause-button" onmouseover="highlightTranscriptNarrationOnMouseOver(this)" onmouseout="resetTranscriptNarrationOnMouseOut(this)">
                            <svg class="play-button" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM9.5547 7.16795C9.24784 6.96338 8.8533 6.94431 8.52814 7.11833C8.20298 7.29235 8 7.63121 8 8V12C8 12.3688 8.20298 12.7077 8.52814 12.8817C8.8533 13.0557 9.24784 13.0366 9.5547 12.8321L12.5547 10.8321C12.8329 10.6466 13 10.3344 13 10C13 9.66565 12.8329 9.35342 12.5547 9.16795L9.5547 7.16795Z" fill="#f9f5f1"/>
                            </svg>
                        </span>
                    </div>
                `;

                // For each step...
                if (steps(chartID) && steps(chartID).length) {
                    let stepNarrationsText = "";
                    steps(chartID).forEach((step, stepIndex) => {
                        updatedSubtitles[chartIndex][stepIndex] = [];

                        if (step.narrations) {
                            if (step.narrations && step.narrations.length) {
                                step.narrations.forEach((narration, narrationIndex) => {
                                    let narrationText = `<p class="transcript-step-narration ${chartID + "_" + stepIndex + "_" + narrationIndex}">`;

                                    let dynamicAction = null;
                                    let cleanedNarration;
                                    if (typeof narration === "object" || narration instanceof Object) {
                                        cleanedNarration = narration.value;
                                        if (narration.dynamicAction) {
                                            dynamicAction = narration.dynamicAction;
                                        }
                                    } else cleanedNarration = narration;

                                    const transfrom = gsap.utils.pipe(removeEndHypenForNarrationBox, moveFootnoteToEndOfNarration, changeCastMarksToMarks);

                                    cleanedNarration = transfrom(cleanedNarration) + " ";
                                    narrationText += cleanedNarration;
                                    updatedSubtitles[chartIndex][stepIndex][narrationIndex] = cleanedNarration;

                                    narrationText = moveFootnoteToEndOfNarration(narrationText);

                                    narrationText += "</p>";

                                    if (step.dynamicAction && step.dynamicAction[narrationIndex]) dynamicAction = step.dynamicAction[narrationIndex];

                                    if (dynamicAction) {
                                        const actionElement = createDynamicAction(dynamicAction, true, chartID, step, 0);
                                        narrationText += actionElement.outerHTML;
                                    }

                                    stepNarrationsText += narrationText;
                                });
                            }
                        }
                    });

                    popupTranscriptContainerContent += `
                        <div class="readmodeNarrations" id="${"rm-n-" + chartID}">${stepNarrationsText}</div>
                    </div>
                `;
                }
            });

        const popupTranscriptContainer = this.element.querySelector("#transcript-chart-box");
        if (popupTranscriptContainer) {
            popupTranscriptContainer.innerHTML = popupTranscriptContainerContent;
            popupTranscriptContainer.querySelectorAll(".transcript-step-narration").forEach((narration) => {
                narration.addEventListener("click", (e) => {
                    const [chartID, stepIndex, narrationIndex] = e.currentTarget.classList[1].split("_");
                    goToSpecificNarration(chartID, stepIndex, narrationIndex);
                });
            });
        }

        //this.checkActionContentForLines();
        this.scrollCurrentNarration();
        this.updateCurrentNarration();

        Cast.subtitles = updatedSubtitles;

        if (TranscriptMenuDetails.getCurrent() === "collapsed") collapseTranscriptMenuDetails();
    };

    updateCurrentNarration() {
        const currentStepIndex = getCurrentStepIndex();
        const currentNarrationIndex = getCurrentNarrationIndex();
        let tl = null;

        if (Playback.hasEnded && Playback.isPaused) {
            this._currentStepHighlightTL?.revert();
            this._currentStepHighlightTL = null;
            this._currentChartHighlightTL?.revert();
            this._currentChartHighlightTL = null;
            return;
        }
        if (Cast.currentChart) {
            if (this._currentStepHighlightTL) {
                this._currentStepHighlightTL.revert();
                this._currentStepHighlightTL = null;
            }

            if (this._currentChartId !== Cast.currentChart._chartIdentifier) {
                this._currentChartHighlightTL?.revert();
                this._currentChartHighlightTL = null;

                tl = gsap.timeline();
                tl.to(this.element.querySelector("#popup-transcript-at-chart-" + Cast.currentChart._chartIdentifier + " .transcript-chart-name"), { color: "orange" });
                this._currentChartHighlightTL = tl;
                this._currentChartId = Cast.currentChart._chartIdentifier;
            }

            tl = gsap.timeline();
            const el = this.element.querySelector("." + Cast.currentChart._chartIdentifier + "_" + currentStepIndex + "_" + currentNarrationIndex);
            tl.to(el, {
                color: "orange",
                scale: 1.05,
                borderLeft: "3px orange solid",
                borderRadius: "3px",
            });
            this._currentStepHighlightTL = tl;

            this.scrollCurrentNarration();
        }
    }

    scrollCurrentNarration() {
        if (!Cast.currentChart) return;
        const currentStepIndex = getCurrentStepIndex();
        const currentNarrationIndex = getCurrentNarrationIndex();
        const el = this.element.querySelector("." + Cast.currentChart._chartIdentifier + "_" + currentStepIndex + "_" + currentNarrationIndex);

        if (!this._isMouseOverScrollList && el) {
            const top = el.offsetTop;
            this.element.querySelector("#transcript-chart-box").scrollTop = top;
        }
    }

    getChartIcon(type, chartMode) {
        const CHART_ICONS = {
            pieBar: SVG.categorizationChartIcon,
            checklistDataDriven: SVG.checklistChartIcon,
            checklist: SVG.checklistChartIcon,
            compareBar: SVG.comparebarsChartIcon,
            landing: SVG.welcomeChartIcon,
            funnel: SVG.funnelChartIcon,
            gauges: SVG.gaugesChartIcon,
            bars: SVG.multibarsChartIcon,
            line: SVG.lineareaChartIcon,
            metrics: SVG.metricsChartIcon,
            options: SVG.navigationChartIcon,
            column: SVG.barsChartIcon,
            paths: SVG.stackedbarsChartIcon,
            waterfall: SVG.waterfallChartIcon,
            welcome: SVG.welcomeChartIcon,
            dashboard: SVG.widgetsChartIcon,
        };

        if (type === "landing" && chartMode !== "editorial") {
            type = "metrics";
        }

        const iconFunction = CHART_ICONS[type];
        if (iconFunction) return iconFunction();
        else return "";
    }

    onPlayerResize = () => {
        checkActionContentForLines(this.element);
    };
}
