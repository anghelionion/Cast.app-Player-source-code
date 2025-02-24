let is_iOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);

let is_Mac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
let is_iPhone = navigator.platform == "iPhone";
let is_iPod = navigator.platform == "iPod";
let is_iPad = navigator.platform == "iPad";
let is_Windows = navigator.platform == "Win32";

function scanner() {
    "use strict";
    if (typeof window.speechSynthesis === "undefined") {
        return;
    }

    voices = window.speechSynthesis.getVoices();
    // if (!voices.length) {
    //   //chrome bravo
    //   return;  //let re-entrancy happen faster
    // }

    let nonpremium = [];
    let premium = [];

    document.getElementById("voiceSelect").innerHTML += "user agent: " + navigator.userAgent + "<br>";

    for (let i = 0; i < voices.length; i++) {
        if (true /* voices[i].lang.indexOf("en") > -1 */) {
            writeVoice(i);

            if (voices[i].lang == "en-US" && is_Mac && voices[i].name.indexOf("Samantha") > -1)
                voices[i].voiceURI.indexOf("premium") > -1 ? premium.push(voices[i]) : nonpremium.push(voices[i]);

            if (voices[i].lang == "en-US" && is_iOS && voices[i].name.indexOf("Samantha") > -1)
                voices[i].voiceURI.indexOf("premium") > -1 ? premium.push(voices[i]) : nonpremium.push(voices[i]);

            if (voices[i].lang == "en-GB" && is_Mac && voices[i].name.indexOf("Daniel") > -1)
                voices[i].voiceURI.indexOf("premium") > -1 ? premium.push(voices[i]) : nonpremium.push(voices[i]);

            if (voices[i].lang == "en-GB" && is_iOS && voices[i].name.indexOf("Arthur") > -1)
                voices[i].voiceURI.indexOf("premium") > -1 ? premium.push(voices[i]) : nonpremium.push(voices[i]);

            if (voices[i].lang == "en-AU" && is_Mac && voices[i].name.indexOf("Karen") > -1)
                voices[i].voiceURI.indexOf("premium") > -1 ? premium.push(voices[i]) : nonpremium.push(voices[i]);

            if (voices[i].lang == "en-AU" && is_iOS && voices[i].name.indexOf("Catherine") > -1)
                voices[i].voiceURI.indexOf("premium") > -1 ? premium.push(voices[i]) : nonpremium.push(voices[i]);

            if (voices[i].lang == "en-ZA" && voices[i].name.indexOf("Tessa") > -1)
                voices[i].voiceURI.indexOf("premium") > -1 ? premium.push(voices[i]) : nonpremium.push(voices[i]);

            if (voices[i].lang == "en-IN" && (voices[i].name.indexOf("Rishi") > -1 || voices[i].name.indexOf("Veena") > -1))
                voices[i].voiceURI.indexOf("premium") > -1 ? premium.push(voices[i]) : nonpremium.push(voices[i]);
        }
    }

    //remove nonpremium duplicates
    //n^2 over < 10 items
    for (let np = 0; np < nonpremium.length; np++) {
        for (let pr = 0; pr < premium.length; pr++) {
            if (nonpremium[np] && nonpremium[np].name == premium[pr].name) delete nonpremium[np];
        }
    }
    //copy remaining to premium
    for (let np = 0; np < nonpremium.length; np++) {
        if (nonpremium[np] !== undefined) premium.push(nonpremium[np]);
    }

    //create maps
    for (let fv of premium) {
        voiceDict[fv.lang] = fv;
        peopleDict[fv.name] = fv;
    }

    // document.getElementById("voiceSelect").innerHTML += `lang: ${voice.lang} ${voice.name} uri:${voice.voiceURI}` + "<br>";
    document.getElementById("voiceSelect").innerHTML += "Selected<br>";

    for (let item in voiceDict) {
        let voice = voiceDict[item];
        document.getElementById("voiceSelect").innerHTML += `lang: ${voice.lang} ${voice.name} uri:${voice.voiceURI}` + "<br>";
    }
}

function writeVoice(i) {
    "use strict";
    let d = document.createElement("div");
    d.setAttribute("style", "font-size:10px;font-family:'Lucida Console', Monaco, courier, monospace;");
    d.innerHTML = i + ": " + `${voices[i].lang} ${voices[i].name} -- uri:${voices[i].voiceURI}`;
    if (voices[i].default) {
        d.textContent += " -- default";
    }
    if (voices[i].localService) {
        d.textContent += " -- local";
    } else d.textContent += " -- remote";
    document.getElementById("voiceSelect").appendChild(d);
}

function voiceList() {
    "use strict";
    //first call
    scanner(); //safari, FF

    //reentrancy
    //chrome. bravo
    if (typeof window.speechSynthesis !== "undefined" && window.speechSynthesis.onvoiceschanged !== undefined) {
        //onvoiceschanged not supported on safari https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/onvoiceschanged
        window.speechSynthesis.onvoiceschanged = scanner;
    }
}

let voiceDict = {};
let peopleDict = {};
let voices = [];

let tts = window.speechSynthesis;

voiceList();

let ueh = function (e) {
    "use strict";
    switch (e.type) {
        case "start":
            let utterance = e.utterance ? e.utterance : e.currentTarget;
            console.log(e.type + " " + utterance.text);
            break;
        case "end":
            console.log(e.type);
            break;
    }
};

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dates = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "eleventh",
    "twelfth",
    "thirteenth",
    "fourteenth",
    "fifteenth",
    "sixteenth",
    "seventeenth",
    "eighteenth",
    "nineteenth",
    "twentieth",
    "twenty first",
    "twenty first",
    "twenty second",
    "twenty third",
    "twenty fourth",
    "twenty fifth",
    "sixth",
    "twenty seventh",
    "twenty eighth",
    "twenty ninth",
    "thirtieth",
    "thirty first",
];
const locations = {
    "en-US": "San Francisco, California",
    "en-GB": "London, United Kingdom",
    "en-scotland": "Glasgow, Scotland",
    en: "Glasgow, Scotland", //bug on chrome -
    "en-AU": "Sydney, Australia",
    "en-ZA": "Cape Town, South Africa",
    "en-IE": "Dublin, Ireland",
    "en-IN": "New Delhi, India",
};

function s() {
    "use strict";
    let d = new Date();
    utter(d);
}

function utter(d) {
    "use strict";
    let u = [];
    for (let i in voiceDict) {
        let voice = voiceDict[i];
        u[i] = new SpeechSynthesisUtterance();
        u[i].voice = voice;
        u[i].lang = voice.lang;
        u[i].pitch = 1.1;
        u[i].onstart = ueh;
        u[i].onend = ueh;

        let iAmFromText = locations[u[i].voice.lang];
        iAmFromText = iAmFromText ? "I am from " + iAmFromText + ". " : "";

        u[i].text = "I am " + u[i].voice.name + ". It is " + days[d.getDay()] + ", " + months[d.getMonth()] + ", " + dates[d.getDate()] + ". " + iAmFromText;
        tts.speak(u[i]);
    }
    let uP1 = new SpeechSynthesisUtterance();
    uP1.voice = voiceDict["en-US"];
    uP1.lang = uP1.voice.lang;
    uP1.onstart = ueh;
    uP1.onend = ueh;
    uP1.text = "This is " + uP1.voice.name + ". " + voiceDict["en-GB"].name + ", do you have the 'current' cash reserve numbers? ";
    tts.speak(uP1);

    let uP2 = new SpeechSynthesisUtterance();
    uP2.voice = voiceDict["en-GB"];
    uP2.lang = uP2.voice.lang;
    uP2.pitch = 1.0;
    uP2.onstart = ueh;
    uP2.onend = ueh;
    uP2.text =
        "Yes " +
        voiceDict["en-US"].name +
        ". The cash reserves, as of " +
        days[d.getDay()] +
        ", " +
        months[d.getMonth()] +
        ", " +
        dates[d.getDate()] +
        " are $45,674. By the way, they are up approximately, 8 percent since you inquired last Monday";
    tts.speak(uP2);
}
//from async func
//await new Promise(resolve => setTimeout(resolve, 200));

//macOS Safari
// 0: lang: en - US Alex uri: com.apple.speech.synthesis.voice.Alex-- local
// 7: lang: en - GB Daniel uri: com.apple.speech.synthesis.voice.daniel.premium-- default --local
// 12: lang: en - scotland Fiona uri: com.apple.speech.synthesis.voice.fiona.premium-- default --local
// 36: lang: en - US Samantha uri: com.apple.speech.synthesis.voice.samantha.premium-- local
// 44: lang: en - IN Veena uri: com.apple.speech.synthesis.voice.veena.premium-- default --local
//20: lang: en-AU Karen uri:com.apple.speech.synthesis.voice.karen.premium -- default -- local
//41: lang: en - ZA Tessa uri: com.apple.speech.synthesis.voice.tessa-- local
//44: lang: en - IN Veena uri: com.apple.speech.synthesis.voice.veena.premium-- default --local

//macOS FireFox
// 0: lang: en - US Alex uri: urn: moz - tts: osx: com.apple.speech.synthesis.voice.Alex-- default --local
// 7: lang: en - GB Daniel uri: urn: moz - tts: osx: com.apple.speech.synthesis.voice.daniel-- local
// 10: lang: en - scotland Fiona uri: urn: moz - tts: osx: com.apple.speech.synthesis.voice.fiona-- local
// 11: lang: en - US Fred uri: urn: moz - tts: osx: com.apple.speech.synthesis.voice.Fred-- local
// 17: lang: en - AU Karen uri: urn: moz - tts: osx: com.apple.speech.synthesis.voice.karen.premium-- local
// 28: lang: en - IE Moira uri: urn: moz - tts: osx: com.apple.speech.synthesis.voice.moira-- local
// 32: lang: en - US Samantha uri: urn: moz - tts: osx: com.apple.speech.synthesis.voice.samantha.premium-- local
// 36: lang: en - ZA Tessa uri: urn: moz - tts: osx: com.apple.speech.synthesis.voice.tessa-- local
// 39: lang: en - IN Veena uri: urn: moz - tts: osx: com.apple.speech.synthesis.voice.veena-- local

//macOS Brave
// 0: lang: en - US Alex uri: Alex-- default --local
// 7: lang: en - GB Daniel uri: Daniel-- local
// 10: lang: en Fiona uri: Fiona-- local
// 11: lang: en - US Fred uri: Fred-- local
// 17: lang: en - AU Karen uri: Karen-- local
// 28: lang: en - IE Moira uri: Moira-- local
// 32: lang: en - US Samantha uri: Samantha-- local
// 36: lang: en - ZA Tessa uri: Tessa-- local
// 39: lang: en - IN Veena uri: Veena-- local

//macOS Chrome
// 0: lang: en - US Alex uri: Alex-- default --local
// 7: lang: en - GB Daniel uri: Daniel-- local
// 10: lang: en Fiona uri: Fiona-- local
// 17: lang: en - AU Karen uri: Karen-- local
// 28: lang: en - IE Moira uri: Moira-- local
// 32: lang: en - US Samantha uri: Samantha-- local
// 36: lang: en - ZA Tessa uri: Tessa-- local
// 39: lang: en - IN Veena uri: Veena-- local
// 48: lang: en - US Google US English uri: Google US English-- remote
// 49: lang: en - GB Google UK English Female uri: Google UK English Female-- remote
// 50: lang: en - GB Google UK English Male uri: Google UK English Male-- remote

// iOS /iPadOS 12
// 7: lang: en - AU Catherine uri: com.apple.ttsbundle.siri_female_en - AU_compact-- default --local
// 10: lang: en - GB Arthur uri: com.apple.ttsbundle.siri_male_en - GB_compact-- default --local
// 13: lang: en - IE Moira uri: com.apple.ttsbundle.Moira - compact-- default --local
// 14: lang: en - US Aaron uri: com.apple.ttsbundle.siri_male_en - US_compact-- default --local
// 18: lang: en - ZA Tessa uri: com.apple.ttsbundle.Tessa - compact-- default --local

//iOS 13
// 7: lang: en - AU Catherine uri: com.apple.ttsbundle.siri_female_en - AU_compact-- default --local
// 10: lang: en - GB Arthur uri: com.apple.ttsbundle.siri_male_en - GB_compact-- default --local
// 13: lang: en - IE Moira uri: com.apple.ttsbundle.Moira-compact-- default --local
// 14: lang: en - IN Rishi uri: com.apple.ttsbundle.Rishi-compact - US_compact-- default --local
// 15: lang: en - US Aaron uri: com.apple.ttsbundle.siri_male_en - US_compact-- default --local
// 19: lang: en - ZA Tessa uri: com.apple.ttsbundle.Tessa - compact-- default --local
// 53: lang: en - US Alex uri: com.apple.speech.voice.Alex-- default --local
