/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

/* eslint-disable */
"use strict";

import Component from "./Component";

export default class RightPanelComponent extends Component {
    constructor() {
        super("div", "right-panel-container", []);

        this._minWidthExpanded = 400;
    }

    setUpElement = (el) => {
        this.element.append(el);
    };

    resetElement = (el) => {
        this.element = document.createElement(this.tag);
        this.element.id = this.id;
        Component.addClassNames(this.element, this.classNames);
        this.setUpElement(el);
    };

    setState() {
        gsap.set("html", {
            // "--right-panel-shadow": customCssVariable("--initial-right-panel-shadow-width"),
            "--right-panel-shadow": this._minWidthExpanded,
            "--min-width-right-panel-shadow": this._minWidthExpanded,
        });
        gsap.set("#rfs-container", { autoAlpha: 1 });
        gsap.set("#side-panel-content", { width: "100%" });
    }
}
