gsap.registerPlugin(MorphSVGPlugin);
MorphSVGPlugin.defaultType = "linear"; //"rotational";

// let preCalcSI = "log"; // Log the Math
// let preCalcSI = "auto"; //Do Math
let preCalcSI = 0; //Use the math.

function morphLips(gtl, persona, id, m, s, duration) {
    if (idVGender !== "#MX" && idVGender !== "#WX") return;

    //AI mapping["# Face", "# Upper Lip", "# Lower Lip", "#Cheek Shine L", "#Cheek Shine R", "#Cheek Shadow L", "#Cheek Shadow R", "#Inside VX", "#Tongue", "#Upper Teeth", "#Lower Teeth", "#Lip WrinkleL", "#Lip WrinkleR", "#Chin Shadow"]

    [
        "#idVFX",
        "#idVUL",
        "#idVLL",
        "#idVLXShine",
        "#idVRXShine",
        "#idVLXShadow",
        "#idVRXShadow",
        "#idVInside",
        "#idVT",
        "#idVUT",
        "#idVLT",
        "#idVLXWrinkle",
        "#idVRXWrinkle",
        "#idVLLShadow",
    ].forEach((d) => {
        gtl.to(
            persona + id + " " + d,
            {
                morphSVG: {
                    shapeIndex: preCalcSI,
                    shape: persona + m + " " + d,
                },
                duration: duration,
                ease: ease,
            },
            s
        );
    });
}

function blink(gtl, persona, s) {
    const duration = 0.25;
    const closedFor = 0.1;
    const id = " #EOX";
    const target = " #ECX";
    ["eyeskin", "eyewht", "eyecolor", "pupil", "eyedetail", "lowerlash", "eyelash"].forEach((d) => {
        gtl.to(
            persona + id + " #idVLX" + d,
            {
                morphSVG: {
                    shapeIndex: preCalcSI,
                    shape: persona + target + " #idVLX" + d,
                },
                duration: duration,
                ease: ease,
            },
            s
        );
        gtl.to(
            persona + id + " #idVRX" + d,
            {
                morphSVG: {
                    shapeIndex: preCalcSI,
                    shape: persona + target + " #idVRX" + d,
                },
                duration: duration,
                ease: ease,
            },
            s
        );

        gtl.to(
            persona + id + " #idVLX" + d,
            {
                morphSVG: {
                    shapeIndex: preCalcSI,
                    shape: persona + id + " #idVLX" + d,
                },
                duration: duration,
                ease: ease,
            },
            s + duration + closedFor
        );
        gtl.to(
            persona + id + " #idVRX" + d,
            {
                morphSVG: {
                    shapeIndex: preCalcSI,
                    shape: persona + id + " #idVRX" + d,
                },
                duration: duration,
                ease: ease,
            },
            s + duration + closedFor
        );
    });
}

const ease = "back.inOut(1.2)";
let gtl = gsap.timeline({ yoyo: true, repeat: -1 });

//Convert circle and ellipse to paths for animation
// MorphSVGPlugin.convertToPath("g#EOX ellipse, g#EOX circle, g#ECX ellipse, g#ECX circle, #test");
//NEEDED FOR OPTIMIZATIONS
// //      <ellipse id="test" class="ABC" cx="166.5" cy="160.5" rx="8.5" ry="0.5" style="fill:#20354f" />
// Array.from(document.getElementsByClassName("ABC")).forEach(e => {
//   console.log(`<path id=${e.id} d="${e.getAttribute("d")}" style="${e.getAttribute("style")}" />`);
// });

const visemeStrings = ["VXSilence", "VXAt", "VXE_e", "VXO_o", "VXS", "VXT", "VX_a", "VX_f", "VX_i", "VX_k", "VX_p", "VX_r", "VX_s", "VX_t", "VX_u", "VXSilence"];
// const visemeStrings = ["VXSilence", "VX_p", "VXSilence"];

let randomBlinkAt = 1 + Math.random() * 2.82;
blink(gtl, "#MX", randomBlinkAt);
blink(gtl, "#WX", randomBlinkAt);

const durationMin = 0.1;
const durationMax = 0.4;
let base = 0;
for (let i = 0; i < 100; i++) {
    let duration = durationMin + Math.floor(Math.random() * (durationMax - durationMin));
    let randomIndex = Math.floor(Math.random() * (visemeStrings.length - 1));

    morphLips(gtl, "#MX", " #VXSilence", " #" + visemeStrings[randomIndex], base, duration);

    morphLips(gtl, "#WX", " #VXSilence", " #" + visemeStrings[randomIndex], base, duration);

    base += duration;
}
// GSDevTools.create({ animation: gtl });
