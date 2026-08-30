// ============================================================
// POEM IRIS
// ============================================================


// ============================================================
// 1. DEFAULT TEXT
// ============================================================

const defaultSentences = [
    "This one better be short",
    "And this one better be a bit longer",
    "Try to put longer sentences at the end for aesthetics"
];


// ============================================================
// 2. SETTINGS
// ============================================================

const CENTER_RADIUS = 2;

const BELT_WIDTH = 200;

const SENTENCE_LINE_WIDTH = 1.5;

const LETTER_LINE_WIDTH = 1.2;

const ALPHABET_LINE_WIDTH = 0.8;

let WORD_CONNECTION_WIDTH = 1.0;

const LETTER_NODE_SIZE = 70;


// ============================================================
// 3. VISUALIZATION COLOR
// ============================================================

let VIS_COLOR = "#FFFFFF";


// ============================================================
// 4. ALPHABET
// ============================================================

const alphabet = {};

"abcdefghijklmnopqrstuvwxyz"
    .split("")
    .forEach((letter, index) => {
        alphabet[letter] = index + 1;
    });


// ============================================================
// 5. DOM
// ============================================================

const svg = document.getElementById("iris");

const sentenceCountInput =
    document.getElementById("sentenceCount");

const sentenceInputs =
    document.getElementById("sentenceInputs");

const redrawButton =
    document.getElementById("redrawButton");

const increaseButton =
    document.getElementById("increaseSentences");

const decreaseButton =
    document.getElementById("decreaseSentences");

const downloadButton =
    document.getElementById("downloadSVG");


// ============================================================
// COLOR CONTROLS
// ============================================================

const colorPicker =
    document.getElementById("colorPicker");

const colorValue =
    document.getElementById("colorValue");


// ============================================================
// CONNECTION THICKNESS CONTROLS
// ============================================================

const connectionSlider =
    document.getElementById("connectionSlider");

const connectionValue =
    document.getElementById("connectionValue");


// ============================================================
// ABOUT CONTROLS
// ============================================================

const aboutButton =
    document.getElementById("aboutButton");

const aboutPanel =
    document.getElementById("aboutPanel");

const closeAbout =
    document.getElementById("closeAbout");


// ============================================================
// 6. SENTENCE STATE
// ============================================================

let sentences = [...defaultSentences];


// ============================================================
// 7. CLEAN WORDS
// ============================================================

function cleanWords(sentence) {

    return sentence.match(
        /[A-Za-z]+(?:'[A-Za-z]+)?/g
    ) || [];

}


// ============================================================
// 8. POLAR TO CARTESIAN
// ============================================================

function polarToXY(radius, angle) {

    const theta =
        angle * Math.PI / 180;

    const x =
        radius * Math.cos(theta);

    const y =
        -radius * Math.sin(theta);

    return {
        x,
        y
    };

}


// ============================================================
// 9. CREATE SVG ELEMENT
// ============================================================

function createSVGElement(type, attributes = {}) {

    const element =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            type
        );

    for (const [key, value] of Object.entries(attributes)) {

        element.setAttribute(
            key,
            value
        );

    }

    return element;

}


// ============================================================
// 10. DRAW CIRCLE
// ============================================================

function drawCircle(
    group,
    radius,
    lineWidth,
    fill = "none"
) {

    const circle =
        createSVGElement(
            "circle",
            {
                cx: 0,
                cy: 0,
                r: radius,
                fill: fill,
                stroke: VIS_COLOR,
                "stroke-width": lineWidth
            }
        );

    group.appendChild(circle);

}


// ============================================================
// 11. DRAW RADIAL LINE
// ============================================================

function drawRadialLine(
    group,
    radius1,
    radius2,
    angle,
    lineWidth
) {

    const p1 =
        polarToXY(
            radius1,
            angle
        );

    const p2 =
        polarToXY(
            radius2,
            angle
        );

    const line =
        createSVGElement(
            "line",
            {
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y,
                stroke: VIS_COLOR,
                "stroke-width": lineWidth
            }
        );

    group.appendChild(line);

}


// ============================================================
// 12. DRAW ARC
// ============================================================

function drawArc(
    group,
    radius,
    startAngle,
    endAngle,
    lineWidth
) {

    const start =
        polarToXY(
            radius,
            startAngle
        );

    const end =
        polarToXY(
            radius,
            endAngle
        );

    const angleDifference =
        Math.abs(
            endAngle - startAngle
        );

    const largeArcFlag =
        angleDifference > 180
            ? 1
            : 0;

    const sweepFlag = 0;

    const pathData = `
        M ${start.x} ${start.y}
        A ${radius} ${radius}
          0 ${largeArcFlag}
          ${sweepFlag}
          ${end.x} ${end.y}
    `;

    const path =
        createSVGElement(
            "path",
            {
                d: pathData,
                fill: "none",
                stroke: VIS_COLOR,
                "stroke-width": lineWidth
            }
        );

    group.appendChild(path);

}


// ============================================================
// 13. DRAW WORD CONNECTION
// ============================================================

function drawConnection(
    group,
    p1,
    p2
) {

    const line =
        createSVGElement(
            "line",
            {
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y,
                stroke: VIS_COLOR,
                "stroke-width": WORD_CONNECTION_WIDTH,
                "stroke-linecap": "round"
            }
        );

    group.appendChild(line);

}


// ============================================================
// 14. DRAW LETTER NODE
// ============================================================

function drawLetterNode(
    group,
    x,
    y
) {

    const radius =
        Math.sqrt(
            LETTER_NODE_SIZE / Math.PI
        );

    const circle =
        createSVGElement(
            "circle",
            {
                cx: x,
                cy: y,
                r: radius,
                fill: VIS_COLOR
            }
        );

    group.appendChild(circle);

}


// ============================================================
// 15. DRAW ONE SENTENCE
// ============================================================

function drawSentence(
    sentence,
    sentenceIndex,
    rootGroup
) {

    // ========================================================
    // SENTENCE BELT
    // ========================================================

    const innerRadius =
        CENTER_RADIUS +
        sentenceIndex * BELT_WIDTH;

    const outerRadius =
        CENTER_RADIUS +
        (sentenceIndex + 1) * BELT_WIDTH;


    // ========================================================
    // SENTENCE BOUNDARIES
    // ========================================================

    if (sentenceIndex > 0) {

        drawCircle(
            rootGroup,
            innerRadius,
            SENTENCE_LINE_WIDTH
        );

    }

    drawCircle(
        rootGroup,
        outerRadius,
        SENTENCE_LINE_WIDTH
    );


    // ========================================================
    // WORDS
    // ========================================================

    const words =
        cleanWords(sentence);

    const numberOfWords =
        words.length;

    if (numberOfWords === 0) {
        return;
    }


    // ========================================================
    // WORD ANGLE
    // ========================================================

    const wordAngle =
        360 / numberOfWords;


    // ========================================================
    // EACH WORD
    // ========================================================

    words.forEach(
        (word, wordIndex) => {

            // =================================================
            // WORD CENTER
            // =================================================

            const wordCenter =
                90 -
                wordIndex * wordAngle;

            const wordStart =
                wordCenter -
                wordAngle / 2;

            const wordEnd =
                wordCenter +
                wordAngle / 2;


            // =================================================
            // WORD SECTOR DIVIDER
            // =================================================

            drawRadialLine(
                rootGroup,
                innerRadius,
                outerRadius,
                wordStart,
                1.0
            );


            // =================================================
            // LETTERS
            // =================================================

            const letters =
                word
                    .toLowerCase()
                    .split("")
                    .filter(
                        letter => alphabet[letter]
                    );

            const numberOfLetters =
                letters.length;

            if (numberOfLetters === 0) {
                return;
            }


            // =================================================
            // RADIAL SPACING
            // =================================================

            const radialStep =
                (
                    outerRadius -
                    innerRadius
                ) /
                (
                    numberOfLetters + 1
                );


            // =================================================
            // LETTER ORDER ARCS
            // =================================================

            for (
                let letterIndex = 0;
                letterIndex < numberOfLetters;
                letterIndex++
            ) {

                const radius =
                    innerRadius +
                    (
                        letterIndex + 1
                    ) *
                    radialStep;

                drawArc(
                    rootGroup,
                    radius,
                    wordStart,
                    wordEnd,
                    LETTER_LINE_WIDTH
                );

            }


            // =================================================
            // 26 ALPHABET DIVISIONS
            // =================================================

            for (
                let alphabetIndex = 0;
                alphabetIndex <= 26;
                alphabetIndex++
            ) {

                const fraction =
                    alphabetIndex / 26;

                const angle =
                    wordEnd -
                    fraction * wordAngle;

                drawRadialLine(
                    rootGroup,
                    innerRadius,
                    outerRadius,
                    angle,
                    ALPHABET_LINE_WIDTH
                );

            }


            // =================================================
            // LETTER POSITIONS
            // =================================================

            const letterPositions = [];


            // =================================================
            // PLACE LETTERS
            // =================================================

            letters.forEach(
                (letter, letterIndex) => {

                    // =========================================
                    // Y = LETTER ORDER
                    // =========================================

                    const radius =
                        innerRadius +
                        (
                            letterIndex + 1
                        ) *
                        radialStep;


                    // =========================================
                    // X = ALPHABET VALUE
                    // =========================================

                    const alphabetValue =
                        alphabet[letter];


                    // =========================================
                    // CENTER OF ALPHABET CELL
                    // =========================================

                    const fraction =
                        (
                            alphabetValue - 0.5
                        ) /
                        26;


                    // =========================================
                    // CLOCKWISE
                    // =========================================

                    const angle =
                        wordEnd -
                        fraction * wordAngle;


                    // =========================================
                    // POSITION
                    // =========================================

                    const position =
                        polarToXY(
                            radius,
                            angle
                        );

                    letterPositions.push(position);


                    // =========================================
                    // NODE
                    // =========================================

                    drawLetterNode(
                        rootGroup,
                        position.x,
                        position.y
                    );

                }
            );


            // =================================================
            // CONNECT LETTERS WITHIN THIS WORD
            // =================================================

            for (
                let i = 0;
                i < letterPositions.length - 1;
                i++
            ) {

                drawConnection(
                    rootGroup,
                    letterPositions[i],
                    letterPositions[i + 1]
                );

            }

        }
    );

}


// ============================================================
// 16. DRAW ENTIRE VISUALIZATION
// ============================================================

function drawVisualization() {

    // ========================================================
    // CLEAR SVG
    // ========================================================

    while (svg.firstChild) {

        svg.removeChild(
            svg.firstChild
        );

    }


    // ========================================================
    // SVG SIZE
    // ========================================================

    const maximumRadius =
        CENTER_RADIUS +
        sentences.length * BELT_WIDTH;

    const margin = 2;

    const size =
        2 *
        (
            maximumRadius +
            margin
        );

    svg.setAttribute(
        "viewBox",
        `${-size / 2} ${-size / 2} ${size} ${size}`
    );


    // ========================================================
    // MAIN GROUP
    // ========================================================

    const rootGroup =
        createSVGElement("g");

    svg.appendChild(rootGroup);


    // ========================================================
    // EMPTY CENTER
    // ========================================================

    const center =
        createSVGElement(
            "circle",
            {
                cx: 0,
                cy: 0,
                r: CENTER_RADIUS,
                fill: "#000000",
                stroke: VIS_COLOR,
                "stroke-width": SENTENCE_LINE_WIDTH
            }
        );

    rootGroup.appendChild(center);


    // ========================================================
    // SENTENCES
    // ========================================================

    sentences.forEach(
        (sentence, sentenceIndex) => {

            drawSentence(
                sentence,
                sentenceIndex,
                rootGroup
            );

        }
    );

}


// ============================================================
// 17. CREATE SENTENCE INPUTS
// ============================================================

function createSentenceInputs() {

    sentenceInputs.innerHTML = "";

    sentences.forEach(
        (sentence, index) => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "sentence-field";


            const label =
                document.createElement("label");

            label.textContent =
                `Sentence ${index + 1}`;


            const textarea =
                document.createElement("textarea");

            textarea.value =
                sentence;

            textarea.dataset.index =
                index;


            textarea.addEventListener(
                "input",
                () => {

                    sentences[index] =
                        textarea.value;

                    drawVisualization();

                }
            );


            wrapper.appendChild(label);

            wrapper.appendChild(textarea);

            sentenceInputs.appendChild(wrapper);

        }
    );

}


// ============================================================
// 18. CHANGE NUMBER OF SENTENCES
// ============================================================

function updateSentenceCount() {

    let count =
        parseInt(
            sentenceCountInput.value,
            10
        );

    if (isNaN(count)) {
        count = 1;
    }

    count =
        Math.max(
            1,
            Math.min(
                10,
                count
            )
        );

    sentenceCountInput.value =
        count;


    // ========================================================
    // ADD
    // ========================================================

    while (sentences.length < count) {

        sentences.push("");

    }


    // ========================================================
    // REMOVE
    // ========================================================

    while (sentences.length > count) {

        sentences.pop();

    }


    createSentenceInputs();

    drawVisualization();

}


// ============================================================
// 19. NUMBER BUTTONS
// ============================================================

increaseButton.addEventListener(
    "click",
    () => {

        let count =
            parseInt(
                sentenceCountInput.value,
                10
            );

        if (isNaN(count)) {
            count = 1;
        }

        if (count < 10) {

            sentenceCountInput.value =
                count + 1;

            updateSentenceCount();

        }

    }
);


decreaseButton.addEventListener(
    "click",
    () => {

        let count =
            parseInt(
                sentenceCountInput.value,
                10
            );

        if (isNaN(count)) {
            count = 1;
        }

        if (count > 1) {

            sentenceCountInput.value =
                count - 1;

            updateSentenceCount();

        }

    }
);


sentenceCountInput.addEventListener(
    "change",
    updateSentenceCount
);


// ============================================================
// 20. REDRAW
// ============================================================

redrawButton.addEventListener(
    "click",
    () => {

        const textareas =
            sentenceInputs.querySelectorAll(
                "textarea"
            );

        textareas.forEach(
            textarea => {

                const index =
                    parseInt(
                        textarea.dataset.index,
                        10
                    );

                sentences[index] =
                    textarea.value;

            }
        );

        drawVisualization();

    }
);


// ============================================================
// 21. COLOR PICKER
// ============================================================

colorPicker.value =
    VIS_COLOR;

colorValue.textContent =
    VIS_COLOR.toUpperCase();


colorPicker.addEventListener(
    "input",
    () => {

        VIS_COLOR =
            colorPicker.value;

        colorValue.textContent =
            VIS_COLOR.toUpperCase();

        drawVisualization();

    }
);


// ============================================================
// 22. CONNECTION THICKNESS SLIDER
// ============================================================

connectionSlider.value =
    WORD_CONNECTION_WIDTH;

connectionValue.textContent =
    WORD_CONNECTION_WIDTH.toFixed(1);


connectionSlider.addEventListener(
    "input",
    () => {

        WORD_CONNECTION_WIDTH =
            parseFloat(
                connectionSlider.value
            );

        connectionValue.textContent =
            WORD_CONNECTION_WIDTH.toFixed(1);

        drawVisualization();

    }
);


// ============================================================
// 23. ABOUT PANEL
// ============================================================

function openAbout() {

    aboutPanel.classList.add("visible");

    aboutPanel.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeAboutPanel() {

    aboutPanel.classList.remove("visible");

    aboutPanel.setAttribute(
        "aria-hidden",
        "true"
    );

}


aboutButton.addEventListener(
    "click",
    openAbout
);


closeAbout.addEventListener(
    "click",
    closeAboutPanel
);


aboutPanel.addEventListener(
    "click",
    event => {

        if (event.target === aboutPanel) {

            closeAboutPanel();

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            aboutPanel.classList.contains("visible")
        ) {

            closeAboutPanel();

        }

    }
);


// ============================================================
// 24. DOWNLOAD PNG
// ============================================================

downloadButton.addEventListener(
    "click",
    () => {

        // ----------------------------------------------------
        // Clone SVG
        // ----------------------------------------------------

        const clone =
            svg.cloneNode(true);


        // ----------------------------------------------------
        // XML namespace
        // ----------------------------------------------------

        clone.setAttribute(
            "xmlns",
            "http://www.w3.org/2000/svg"
        );


        // ----------------------------------------------------
        // Get SVG dimensions
        // ----------------------------------------------------

        const viewBox =
            svg.viewBox.baseVal;

        const svgWidth =
            viewBox.width;

        const svgHeight =
            viewBox.height;


        // ----------------------------------------------------
        // PNG resolution
        // ----------------------------------------------------

        const scale = 4;


        const canvas =
            document.createElement("canvas");

        canvas.width =
            svgWidth * scale;

        canvas.height =
            svgHeight * scale;


        const context =
            canvas.getContext("2d");


        // ----------------------------------------------------
        // Black background
        // ----------------------------------------------------

        context.fillStyle =
            "#000000";

        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ----------------------------------------------------
        // Serialize SVG
        // ----------------------------------------------------

        const serializer =
            new XMLSerializer();

        const source =
            serializer.serializeToString(clone);


        // ----------------------------------------------------
        // Create SVG image
        // ----------------------------------------------------

        const svgBlob =
            new Blob(
                [source],
                {
                    type:
                        "image/svg+xml;charset=utf-8"
                }
            );

        const url =
            URL.createObjectURL(svgBlob);


        const image =
            new Image();


        // ----------------------------------------------------
        // Draw SVG onto canvas
        // ----------------------------------------------------

        image.onload =
            () => {

                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                // --------------------------------------------
                // Convert canvas to PNG
                // --------------------------------------------

                canvas.toBlob(
                    blob => {

                        if (!blob) {
                            URL.revokeObjectURL(url);
                            return;
                        }

                        const pngUrl =
                            URL.createObjectURL(blob);

                        const link =
                            document.createElement("a");

                        link.href =
                            pngUrl;

                        link.download =
                            "poem-iris.png";

                        document.body.appendChild(link);

                        link.click();

                        document.body.removeChild(link);

                        URL.revokeObjectURL(pngUrl);

                    },
                    "image/png"
                );


                URL.revokeObjectURL(url);

            };


        image.onerror =
            () => {

                URL.revokeObjectURL(url);

            };


        image.src =
            url;

    }
);


// ============================================================
// 25. INITIALIZE
// ============================================================

createSentenceInputs();

drawVisualization();