/* eslint-disable */
"use strict";

import model from "../env/model/AppModel";

export default class Scrubber {
    constructor(props) {
        this.props = props;

        const set = gsap.set;
        const svgWidth = 212;
        const svgHeight = 40;
        this.svgWidth = svgWidth;
        this.svgHeight = svgHeight;

        const svg = document.createElementNS(gSvgNS, "svg");
        set(svg, {
            attr: {
                viewBox: [0, 0, svgWidth, svgHeight].join(" "),
            },
        });

        this.element = svg;

        const container = document.createElementNS(gSvgNS, "g");
        const bgContainer = document.createElementNS(gSvgNS, "rect");
        set(bgContainer, {
            attr: {
                height: svgHeight,
                width: svgWidth,
                fill: "red",
                "fill-opacity": 0,
            },
        });
        container.appendChild(bgContainer);

        const thumbContainer = document.createElementNS(gSvgNS, "g");
        const thumb = document.createElementNS(gSvgNS, "rect");
        set(thumb, {
            attr: {
                rx: 3,
                height: 16,
                width: 8,
                fill: customCssVariable("--cast-color-current-dominant"),
                "fill-opacity": 0.48,
                stroke: customCssVariable("--cast-color-current-dominant"),
                "stroke-width": 2,
                style: "cursor: pointer",
            },
        });

        set(thumbContainer, {
            y: (svgHeight - 16) / 2,
            x: 6,
        });

        thumbContainer.appendChild(thumb);

        const linePadding = 6;
        const line = document.createElementNS(gSvgNS, "rect");
        set(line, {
            attr: {
                rx: 3,
                y: (svgHeight - 2) / 2,
                x: linePadding,
                height: 2,
                width: svgWidth - linePadding * 2,
                fill: "#595551",
                "fill-opacity": 1,
            },
        });

        svg.appendChild(line);

        svg.appendChild(container);
        svg.appendChild(thumbContainer);

        this.container = container;
        this.thumb = thumbContainer;

        this.updateCurrentSequence();
        model.currentSequence.subscribe(this.updateCurrentSequence);

        model.updateCurrentNarration.subscribe(this.updateCurrentNarration);

        bgContainer.addEventListener("click", (e) => {
            const svgRect = svg.getBoundingClientRect();
            const viewBox = svg.viewBox.baseVal;
            const scaleX = svgRect.width / viewBox.width;
            const clickX = (e.clientX - svgRect.left - viewBox.x) / scaleX;

            const snapPoints = this.ticksNarrations.map((n) => {
                const [x, y] = n.getAttribute("data-position").split(",");
                return parseInt(x);
            });
            const snap = gsap.utils.snap(snapPoints);
            for (let i = 0; i < this.ticksNarrations.length; i++) {
                const c = this.ticksNarrations[i];
                const [x, y] = c.getAttribute("data-position").split(",");
                if (parseInt(x) === snap(clickX)) {
                    const [chartID, stepIndex, narrationIndex] = c.className.baseVal.split("_");
                    goToSpecificNarration(chartID, stepIndex, narrationIndex);
                }
            }
        });
    }

    getCurrentNarrationIndex = () => {
        const currentStepIndex = getCurrentStepIndex();
        const currentNarrationIndex = getCurrentNarrationIndex();
        const currentChartID = Cast.currentChart._chartIdentifier;

        let idx = 0;

        for (let i = 0; i < this.ticksNarrations.length; i++) {
            const [chartID, stepIndex, narrationIndex] = this.ticksNarrations[i].className.baseVal.split("_");
            if (chartID === currentChartID && parseInt(stepIndex) === currentStepIndex && parseInt(narrationIndex) === currentNarrationIndex) {
                idx = i;
                break;
            }
        }

        return idx;
    };

    updateCurrentNarration = () => {
        const idx = this.getCurrentNarrationIndex();
        const tickNarration = this.ticksNarrations[idx];
        const [x, y] = tickNarration.getAttribute("data-position").split(",");
        gsap.to(this.thumb, {
            x: x - 4,
        });
    };

    updateCurrentSequence = () => {
        // console.log("updateCurrentSequence", model.currentSequence.data);
        if (!model.currentSequence.data) return;

        const narrationsTimes = this._getSequenceNarrationsTimes(model.currentSequence.data);
        const totalNarrationsTime = narrationsTimes.reduce((a, b) => {
            return a + b.time;
        }, 0);

        this.container.querySelectorAll("g").forEach((n) => n.remove());

        const linePadding = 6;
        const totalLineWidth = this.svgWidth - linePadding * 2;

        const ticksNarrations = [];
        const r = Math.min(4, totalLineWidth / narrationsTimes.length);

        let prevTotalTime = 0;
        for (let i = 0; i < narrationsTimes.length; i++) {
            const p = (prevTotalTime + narrationsTimes[i].time) / totalNarrationsTime;
            const { chartID, stepIndex, narrationIndex } = narrationsTimes[i];

            prevTotalTime += narrationsTimes[i].time;

            const container = document.createElementNS(gSvgNS, "g");

            //seems like this is no longer needed
            // const bg = document.createElementNS(gSvgNS, "rect");
            // gsap.set(bg, {
            //     attr: {
            //         rx: 0,
            //         y: -this.svgHeight / 2,
            //         x: -4,
            //         height: this.svgHeight,
            //         width: 8,
            //         fill: "red",
            //         "fill-opacity": 1,
            //     },
            // });

            const ticks = {
                element: document.createElementNS(gSvgNS, "rect"),
                width: narrationsTimes[i].newSlide ? 2 : 1,
                margin: narrationsTimes[i].newSlide ? 15 : 17,
                fill: narrationsTimes[i].newSlide ? customCssVariable("--cast-color-current-dominant") : "#999591",
            };
            gsap.set(ticks.element, {
                attr: {
                    rx: ticks.width / 2,
                    y: ticks.margin - this.svgHeight / 2,
                    x: (-1 * ticks.width) / 2,
                    height: this.svgHeight - ticks.margin - ticks.margin,
                    width: ticks.width,
                    fill: ticks.fill,
                    class: "tick",
                },
            });

            gsap.set(container, {
                x: totalLineWidth * p + linePadding,
                y: this.svgHeight / 2,
                attr: {
                    class: [chartID, stepIndex, narrationIndex].join("_"),
                    "data-position": [totalLineWidth * p + linePadding, 10].join(","),
                    style: "cursor: pointer",
                },
            });

            // container.appendChild(bg);
            container.appendChild(ticks.element);
            this.container.appendChild(container);

            ticksNarrations.push(container);

            container.addEventListener("click", (e) => {
                const [chartID, stepIndex, narrationIndex] = e.currentTarget.className.baseVal.split("_");
                goToSpecificNarration(chartID, stepIndex, narrationIndex);
            });
        }

        this.ticksNarrations = ticksNarrations;
    };

    _getSequenceNarrationsTimes(seq) {
        const narrationsTimes = [];
        const charLengthTime = 0.05;

        for (let i = 0; i < seq.length; i++) {
            const currentSteps = steps(seq[i]);
            for (let j = 0; j < currentSteps.length; j++) {
                const newSlide = j === 0;
                const step = currentSteps[j];
                const narrations = step.narrations;
                if (Array.isArray(narrations) && narrations.length) {
                    narrations.forEach((item, idx) => {
                        if (typeof item === "string" || item instanceof String) {
                            narrationsTimes.push({ time: item.length * charLengthTime, chartID: seq[i], stepIndex: j, narrationIndex: idx, newSlide });
                        } else if (item.value) {
                            narrationsTimes.push({ time: item.value.length * charLengthTime, chartID: seq[i], stepIndex: j, narrationIndex: idx, newSlide });
                        }
                    });
                }
            }
        }

        return narrationsTimes;
    }
}
