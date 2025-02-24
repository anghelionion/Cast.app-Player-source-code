// config.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

class Setting {
    static /** @type {string} */ current = "";
    static /** @type {string} */ new = "";

    static getCurrent() {
        return this.current;
    }

    static getNew() {
        return this.new;
    }

    static setCurrent(/** @type {string} */ selection) {
        this.current = selection;
    }

    static setNew(/** @type {string} */ selection) {
        this.new = selection;
    }

    static hasNew() {
        return (this.new && this.new !== this.current) || false;
    }

    static applyNew() {
        if (this.new !== this.current) {
            this.current = this.new;
            this.new = "";
        }
    }

    static cancelNew() {
        this.new = "";
    }
}

/**
 * Sample rate for Amazon Polly
 */
class SampleRateSetting extends Setting {
    static /** @type {string} */ current = "24000";
}

class PlayRateSetting extends Setting {
    static current = "medium";

    static applyNew() {
        if (PlayRateSetting.new !== PlayRateSetting.current) {
            PlayRateSetting.current = PlayRateSetting.new;
            PlayRateSetting.new = "";
            resetMp3CacheLookahead();
        }
    }

    static getBackendRate(language) {
        //https://docs.aws.amazon.com/polly/latest/dg/voice-speed-vip.html

        // console.log(language)

        const tuneSpeed = undefined === language || "english" === language;
        if (!tuneSpeed) return PlayRateSetting.current;

        // re-tuned for Ruth and Stephen

        switch (PlayRateSetting.current) {
            // valid values are 20% - 100%, fast, medium (100%), x-fast, slow
            case "slow": //0.5
                return tuneSpeed ? "85%" : PlayRateSetting.current; //78
            case "fast": // 1.5
                return tuneSpeed ? "125%" : PlayRateSetting.current; //130
            case "medium": // 1
                return tuneSpeed ? "94%" : PlayRateSetting.current; //94
            case "x-fast": // 2
                return tuneSpeed ? "150%" : PlayRateSetting.current; // "x-fast";
            default:
                return PlayRateSetting.current;
        }
    }

    static getXRate() {
        switch (PlayRateSetting.current) {
            case "slow":
                return "½";
            case "fast":
                return "1½";
            case "x-fast":
                return "2";
            default:
                return "1";
        }
    }

    static getNumberRate() {
        switch (PlayRateSetting.current) {
            case "slow":
                return 0.5;
            case "fast":
                return 1.5;
            case "x-fast":
                return 2;
            default:
                return 1;
        }
    }
}

class LocaleSetting extends Setting {
    static /** @type {string} */ current = "english";
}

class NarratorGenderSetting extends Setting {
    static _current = "unknown";
}

class NarratorAvatarSetting extends Setting {
    static current = "character";
    static lastSelectedAvatar = "character";

    static setCurrent(narratorAvatarSetting) {
        if (narratorAvatarSetting === "none") narratorAvatarSetting = "blob";
        // narratorAvatar WILL be "" for legacy cast or casts without avatar commenting below - Dickey sep6, 2021
        NarratorAvatarSetting.current = ["robot", "character", "blob"].includes(narratorAvatarSetting) ? narratorAvatarSetting : "character";
        if (!["blob"].includes(NarratorAvatarSetting.current)) NarratorAvatarSetting.lastSelectedAvatar = NarratorAvatarSetting.current;
    }

    static setNew(narratorAvatarSetting) {
        NarratorAvatarSetting.new = ["robot", "character", "blob"].includes(narratorAvatarSetting) ? narratorAvatarSetting : "character";
        if (!["blob"].includes(NarratorAvatarSetting.current)) NarratorAvatarSetting.lastSelectedAvatar = NarratorAvatarSetting.current;
    }
}

class SubtitleSetting extends Setting {
    static current = "on";

    static setCurrent(subtitleSetting) {
        SubtitleSetting.current = subtitleSetting;
        updateSubtitles();
    }

    static uiSuppress = "no";

    //To set it from designer use this method
    static setUiSuppress(yesno) {
        SubtitleSetting.uiSuppress = yesno;
        updateSubtitles();
    }

    static getUiSuppress() {
        return SubtitleSetting.uiSuppress;
    }
}

class RightPanelSetting extends Setting {
    static current = "on";

    static setCurrent(value) {
        RightPanelSetting.current = value;
        updateSubtitles();
    }
}

class TranscriptMenuDetails extends Setting {
    static current = "off";
}

class ActionListSetting extends Setting {
    static current = "expanded";
}

class FeedbackMenuContainerSetting extends Setting {
    static current = "collapsed";
}
