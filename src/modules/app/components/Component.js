/* global customCssVariable */

export default class Component {
    tag;
    id;
    classNames;
    element;

    constructor(tag, id, classNames) {
        this.tag = tag;
        this.id = id;
        this.classNames = [...classNames];
        this.element = document.createElement(this.tag);
        this.element.id = this.id;
        Component.addClassNames(this.element, this.classNames);
    }

    static addClassNames = (element, classNames) => {
        if (element) {
            for (const className of classNames) {
                element.classList.add(className);
            }
        }
    };

    static removeClassNames = (element, classNames) => {
        if (element) {
            for (const className of classNames) {
                element.classList.remove(className);
            }
        }
    };

    static replaceClassNames = (element, oldClassNames, newClassNames) => {
        if (element) {
            Component.removeClassNames(element, oldClassNames);
            Component.addClassNames(element, newClassNames);
        }
    };

    static enableElement = (element, display = "block", cursor = "default", autoAlpha = 1) => {
        if (element) {
            gsap.set(element, { autoAlpha, cursor, display });
        }
    };

    static disableElement = (element, display = "block", cursor = "default", autoAlpha = customCssVariable("--cast-default-disabled-element-opacity")) => {
        if (element) {
            gsap.set(element, { autoAlpha, cursor, display });
        }
    };

    static showElement = (element, mode = "enabled", display = "block", cursor = "default", autoAlpha = 1) => {
        if (element) {
            if (mode === "enabled") {
                this.enableElement(element, display, cursor, autoAlpha);
            } else {
                this.disableElement(element);
            }
        }
    };

    static hideElement = (el) => {
        if (el) {
            gsap.set(el, { display: "none" });
        }
    };

    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    setUpElement = () => {};

    resetElement = () => {
        this.element = document.createElement(this.tag);
        this.element.id = this.id;
        Component.addClassNames(this.element, this.classNames);
        this.setUpElement();
    };
}
