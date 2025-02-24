// viseme.js
/**
 * © 2019 Cast Corporation <https://cast.app>
 *
 * @module
 */

"use strict";

let gNarratorVisibility = "on";
let faceInit = (viseme) => {
    switch (viseme) {
        case "off":
        case "on":
        case "editorial":
            gNarratorVisibility = viseme;
            break;
        default:
            gNarratorVisibility = "on";
            break;
    }
};

const lipz = Object.freeze(["FX", "UL", "LL", "LXShine", "RXShine", "LXShadow", "RXShadow", "Inside", "T", "UT", "LT", "LXWrinkle", "RXWrinkle", "LLShadow"]);
const oliverFaceLipz = Object.freeze(["face", "faceOutline", "mouth", "upper-teeth", "tongue", "lower-teeth", "lower-lip", "upper-lip", "wrinkle"]);

let getLips = (idVGender) => {
    switch (idVGender) {
        case "#MX":
        case "#WX":
            return lipz;
        case "#robotX":
            return ["robotLips"];
        case "#oliver":
            return oliverFaceLipz;
    }
    return null;
};

let getEyes = (idVGender) => {
    if (idVGender === "#MX" || idVGender === "#WX") {
        return eyz;
    } else if (idVGender === "#robotX") {
        return robotEyz;
    } else if (idVGender === "#oliver") {
        return oliverEyz;
    }
    return null;
};

let morphLips = (tl, idVGender = "#MX", id, mId, s, duration) => {
    let lips = getLips(idVGender);
    if (null === lips) return;

    lips.forEach((d) => {
        tl.to(
            selectorLips(idVGender, id, d),
            {
                morphSVG: {
                    shapeIndex: 0,
                    shape: selectorLips(idVGender, mId, d),
                },
                duration: duration,
                ease: "back.inOut(1.2)",
            },
            s
        );
    });
};

function pauseFace(idVGender) {
    //requires inserting a silence mid stream wihout destroying the timeline.
    Cast.tlViseme && Cast.tlViseme.pause();

    const shutUpTL = gsap.timeline();
    if (idVGender === "#blobX") {
        blobAnimate(shutUpTL, idVGender, "VXSilence", 0, 0.33);
    } else {
        let id = " #VXSilence";

        let lips = getLips(idVGender);
        if (null === lips) return;

        lips.forEach((d) => {
            const sel = selectorLips(idVGender, id, d);
            shutUpTL.set(sel, { morphSVG: { shapeIndex: 0, shape: sel } });
        });
    }
}

let selectorLips = (gender, position, component) => gender + " " + position + " #idV" + component;
let selectorEyes = (gender, openclose, side, componentSuffix) => gender + openclose + "#idV" + side + componentSuffix;

function blinkEyes(idVGender) {
    if (idVGender !== "#MX" && idVGender !== "#WX" && idVGender !== "#robotX" && idVGender !== "#oliver") return;

    safeKill(idVEyesTL);

    //https://www.pnas.org/content/110/2/702  10 to 15–20 times per minute --> every 3 to 4 to 5 seconds
    // add a second for short sentences
    let repeatDelay = 2 + 2 * Math.random();
    // console.log("repeatDelay", repeatDelay, "s")
    const newBlinkTL = gsap.timeline({
        id: idVEyesTL,
        repeat: -1,
        repeatDelay: repeatDelay,
    });

    const durationOC = 0.25;
    const closedFor = 0.095;
    const ease = "back.inOut(1.2)";
    const s = 0; //using repeatDelay

    let eyes = getEyes(idVGender);
    if (null === eyes) return;

    eyes.forEach((d) => {
        sidz.forEach((side) => {
            const open = selectorEyes(idVGender, " #EOX ", side, d);
            const closed = selectorEyes(idVGender, " #ECX ", side, d);
            newBlinkTL.to(
                open,
                {
                    morphSVG: { shapeIndex: 0, shape: closed },
                    duration: durationOC,
                    ease: ease,
                },
                s
            );
            newBlinkTL.to(
                open,
                {
                    morphSVG: { shapeIndex: 0, shape: open },
                    duration: durationOC,
                    ease: ease,
                },
                s + durationOC + closedFor
            );
        });
    });
}

function openEyes(tl, idVGender, s = 0) {
    if (idVGender !== "#MX" && idVGender !== "#WX" && idVGender !== "#robotX" && idVGender !== "#oliver") return;

    const durationOC = 0.2;
    const ease = "back.inOut(1.2)";

    let eyes = getEyes(idVGender);
    if (null === eyes) return;

    eyes.forEach((d) => {
        sidz.forEach((side) => {
            const open = selectorEyes(idVGender, " #EOX ", side, d);
            tl.to(
                open,
                {
                    morphSVG: { shapeIndex: 0, shape: open },
                    duration: durationOC,
                    ease: ease,
                },
                s
            );
        });
    });
}

const eyz = Object.freeze(["eyeskin", "eyewht", "eyecolor", "pupil", "pupilWhite", "eyedetail", "lowerlash", "eyelash"]);
const robotEyz = Object.freeze(["eyepurple", "eyesparkle"]);
const oliverEyz = Object.freeze(["Eye", "EyeSparkle", "Brow"]);
//AI mapping["# Face", "# Upper Lip", "# Lower Lip", "#Cheek Shine L", "#Cheek Shine R", "#Cheek Shadow L", "#Cheek Shadow R", "#Inside VX", "#Tongue", "#Upper Teeth", "#Lower Teeth", "#Lip WrinkleL", "#Lip WrinkleR", "#Chin Shadow"]
const sidz = Object.freeze(["LX", "RX"]);

const visemeToIdStrings = Object.freeze({
    "": "VXSilence", //Research why non-english send ""
    sil: "VXSilence",
    J: "VXSilence", //TO DO French Woman
    "@": "VXAt",
    E: "VXE_e",
    O: "VXO_o",
    S: "VXS",
    T: "VXT",
    a: "VX_a",
    e: "VXE_e", //E and e
    f: "VX_f",
    i: "VX_i",
    k: "VX_k",
    o: "VXO_o", //O and o
    p: "VX_p",
    r: "VX_r",
    s: "VX_s",
    t: "VX_t",
    u: "VX_u",
});

// let isValid = (v) => typeof v !== "undefined" && (typeof v !== "object" || !v)
const idVLipsTL = Object.freeze("idV153M3Lips" + performance.timing.navigationStart + performance.now());
const idVEyesTL = Object.freeze("idV153M3Eyes" + performance.timing.navigationStart + performance.now());

// let counter = 0;
function doViseme(result) {
    if (typeof result === "undefined") return null;
    if (result === null) return null;
    if (result.castViseme === null) return null;
    if (result.castTime === null) return null;

    blobCounter = 0;

    const idVGender = Cast.narratorAvatar;
    const isCharacter = ["#MX", "#WX", "#robotX", "#oliver"].includes(idVGender);

    const viseme = result.castViseme.split(",");
    const millisecs = result.castTime.split(",");

    safeKill(idVLipsTL);

    const visemeTimeline = gsap.timeline({ id: idVLipsTL });
    let visemeIndex = 0,
        durBasis = 0;

    if (isCharacter) openEyes(visemeTimeline, idVGender);

    millisecs.forEach((element) => {
        let sec = element / 1000;
        let dur = sec - durBasis;

        let visemeID = visemeToIdStrings[viseme[visemeIndex]];
        if (!visemeID || visemeID.length === 0) {
            visemeID = "VXSilence";
        }
        visemeIndex++;
        durBasis = sec;

        if (overrideVisemeID != null) visemeID = overrideVisemeID;
        if (isCharacter) morphLips(visemeTimeline, Cast.narratorAvatar, " #VXSilence", " #" + visemeID, sec, dur);
        if (idVGender === "#blobX") blobAnimate(visemeTimeline, Cast.narratorAvatar, visemeID, sec, dur);
    });

    if (isCharacter) blinkEyes(Cast.narratorAvatar);

    return visemeTimeline;
}

let overrideVisemeID = null;
const reconstructViseme = () => {
    if (useFeature("visemeID")) overrideVisemeID = featureValue("visemeID");
    else overrideVisemeID = null;

    let tl = Cast.tlViseme;
    if (!tl) return;
    const currentTime = tl.time();
    const isPaused = tl.paused();
    tl.pause();

    tl = doViseme(Cast.tlVisemeData);
    tl.paused(isPaused);
    tl.time(currentTime);
    Cast.tlViseme = tl;
};

// DO NOT DELETE - FOR DEBUGGING
// function forceCloseMouthtNarrationEnd(vArray, mArray) {
//   if (vArray[vArray.length - 1] !== "sil") {
//     console.log("ADD A SIL to both arrays ", vArray, mArray)
//   }
// }

// DO NOT DELETE - FOR DEBUGGING
//Convert shortArc and ellipse to paths for animation
// MorphSVGPlugin.convertToPath("g#EOX ellipse, g#EOX shortArc, g#ECX ellipse, g#ECX shortArc, #test");
//NEEDED FOR OPTIMIZATIONS
// //      <ellipse id="test" class="ABC" cx="166.5" cy="160.5" rx="8.5" ry="0.5" style="fill:#20354f" />
// Array.from(document.getElementsByClassName("ABC")).forEach(e => {
//   console.log(`<path id=${e.id} d="${e.getAttribute("d")}" style="${e.getAttribute("style")}" />`);
// });

//KEEP DEMO NEEDED FOR CORRECTIONS WHEN IMPORTING
// function demo(idVGender = "#MX") {
//   const visemeStrings = [
//     "VXSilence",
//     "VXAt", "VXE_e", "VXO_o", "VXS", "VXT", "VX_a", "VX_f", "VX_i", "VX_k", "VX_p", "VX_r", "VX_s", "VX_t", "VX_u",
//     "VXSilence"];
//   let gtl = gsap.timeline();

//   let randomBlinkAt = 1 + Math.random() * 2.2;
//   blink(gtl, Cast.narratorAvatar, randomBlinkAt);

//   const durationMin = .1;
//   const durationMax = .4;
//   let base = 0;

//   for (let i = 0; i < 100; i++) {
//     let duration = durationMin + Math.floor(Math.random() * (durationMax - durationMin))
//     let randomIndex = Math.floor(Math.random() * (visemeStrings.length - 1));

//     morphLips(gtl, Cast.narratorAvatar, " #VXSilence", " #" + visemeStrings[randomIndex], base, duration);

//     base += duration;
//   }
// REMOVE LIB LOADING from default.html
// GSDevTools.create({ animation: gtl, css: "z-index: 10000; top:410px;" });
// REMOVE LIB LOADING from default.html
// }

// const gVismeTypesReturnedByPolly = "sil,@,E,O,S,T,a,e,f,i,k,o,p,r,s,t,u".split(",");
// const visemeStrings = ["VXSilence", "VXAt", "VXE_e", "VXO_o", "VXS", "VXT", "VX_a", "VX_f", "VX_i", "VX_k", "VX_p", "VX_r", "VX_s", "VX_t", "VX_u"];
// e  o, p
