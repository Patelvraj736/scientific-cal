let mode = document.querySelector(".mode");
let deg = document.getElementById("deg-rad");
let trigo = document.getElementById("trigo-func");
const valueDisplay = document.querySelector(".value");
const resultDisplay = document.querySelector(".result");
const historyContainer = document.querySelector(".history-list");
const calculator = document.getElementById("calculator");
const angleBtn = document.getElementById("angle-mode");
const feBtn = document.querySelector(".fe-fn");

const standardButtons = [
    "%", "CE", "C", "⌫",
    "1/x", "x²", "√x", "÷",
    "7", "8", "9", "×",
    "4", "5", "6", "−",
    "1", "2", "3", "+",
    "+/-", "0", ".", "="
];

const scientificButtons = [
    "2nd", "π", "e", "C", "⌫",
    "x²", "1/x", "|x|", "exp", "mod",
    "√x", "(", ")", "n!", "÷",
    "xʸ", "7", "8", "9", "×",
    "10ˣ", "4", "5", "6", "−",
    "log", "1", "2", "3", "+",
    "ln", "+/-", "0", ".", "="
];

const trigButtons = ["2nd", "sin", "cos", "tan", "hyp", "sec", "csc", "cot"];
const funcButtons = ["|x|", "⌊x⌋", "⌈x⌉", "rand", "→dms", "→deg"];

let isDegree = true;
let isExponential = false;



angleBtn.addEventListener("click", () => {
    isDegree = !isDegree;
    angleBtn.innerText = isDegree ? "DEG" : "RAD";
});

function renderDropdownButtons(buttonSet, containerId, columns) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const gridDiv = document.createElement("div");
    gridDiv.style.display = "grid";
    gridDiv.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    gridDiv.style.gap = "8px";
    gridDiv.style.width = "20vw";

    buttonSet.forEach(text => {
        const btn = document.createElement("button");
        btn.className = "trigo btn btn-light w-100";
        btn.innerText = text;
        gridDiv.appendChild(btn);
    });

    container.appendChild(gridDiv);
}
document.addEventListener("DOMContentLoaded", function () {

    changeMode("scientific");
    renderDropdownButtons(trigButtons, "trig-grid", 4);
    renderDropdownButtons(funcButtons, "func-grid", 3);
    renderHistory();
});

function renderButtons(buttonSet, columns) {
    calculator.innerHTML = "";
    calculator.className = `row row-cols-${columns} g-1 d-flex flex-grow-1`;

    buttonSet.forEach(text => {
        const col = document.createElement("div");
        col.className = "col";

        const btn = document.createElement("button");
        btn.className = text === "=" ? "btn btn-primary w-100" : "btn btn-light w-100";
        btn.innerHTML = text;

        col.appendChild(btn);
        calculator.appendChild(col);
    });
}

function changeMode(mode) {
    if (mode === "standard") {
        renderButtons(standardButtons, 4);
    } else {
        renderButtons(scientificButtons, 5);
    }
}
function changeToStandard() {
    deg.classList.remove("d-flex");
    deg.classList.add("d-none");
    trigo.classList.remove("d-flex");
    trigo.classList.add("d-none");
    changeMode("standard");
    mode.innerHTML = "Standard";
}
function changeToScientific() {
    deg.classList.add("d-flex");
    deg.classList.remove("d-none");
    trigo.classList.add("d-flex");
    trigo.classList.remove("d-none");
    changeMode("scientific")
    mode.innerHTML = "Scientific";
}

let currDisplay = "0";
let storedValue = null;
let currOperator = null;
let shouldReset = false;

function updateDisplay() {
    valueDisplay.innerText = currDisplay;
}


document.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    const val = button.innerText.trim();
    if (!val) return;
    handleinput(val);
})

function appendDisplay(val) {
    if (shouldReset) {
        currDisplay = val;
        shouldReset = false;
    }
    else if (currDisplay === "0") {
        currDisplay = val;
    }
    else if (val === "." && currDisplay.includes(".")) {
        return;
    }
    else {
        currDisplay += val;
    }
    updateDisplay();
}

function handleinput(val) {
    if (!isNaN(val) || val === ".") {
        appendDisplay(val);
    }
    else if (["+", "−", "×", "÷"].includes(val)) {
        chooseOperator(val);
    }
    else if (val === "CE") {
        clearEntry();
    }
    else if (val === "⌫") {
        backSpace();
    }
    else if (val === "C") {
        clearAll();
    }
    else if (val === "=") {
        calculate();
    }
    else if (val === "+/-") {
        toggleSign();
    }
    else if (val === "%") {
        percentage();
    }
    else if (val === "x²") {
        square();
    }
    else if (val === "√x") {
        squareRoot();
    }
    else if (val === "1/x") {
        reciprocal();
    }
    else if (val === "π") {
        insConst(Math.PI);
    }
    else if (val === "e") {
        insConst(Math.E);
    }
    else if (val === "xʸ") {
        chooseOperator("^");
    }
    else if (val === "n!") {
        factorial();
    }
    else if (val === "mod") {
        chooseOperator(val);
    }
    else if (val === "exp") {
        expPower();
    }
    else if (val === "10ˣ") {
        tenPower();
    }
    else if (val === "log") {
        logBase10();
    }
    else if (val === "ln") {
        naturalLog();
    }
    else if (val === "|x|") {
        absoluteValue();
    }
    else if (["sin", "cos", "tan", "sec", "csc", "cot"].includes(val)) {
        applyTrig(val);
    }
    else if (val === "F-E") {
    toggleFE();
}
else if (val === "⌊x⌋") {
    floorValue();
}
else if (val === "rand") {
    randomValue();
}
else if (val === "→dms") {
    toDMS();
}
else if (val === "→deg") {
    toDecimalDegrees();
}
}

function backSpace() {
    if (currDisplay.length === 1) {
        currDisplay = "0";
    }
    else {
        currDisplay = currDisplay.slice(0, -1)
    }
    updateDisplay();
}
function clearEntry() {
    currDisplay = "0";
    updateDisplay();
}
function clearAll() {
    currDisplay = "0";
    currOperator = null;
    storedValue = null;
    resultDisplay.innerText = "";
    updateDisplay();
}
function chooseOperator(op) {
    if (currOperator !== null) {
        calculate();
    }
    storedValue = currDisplay;
    currOperator = op;
    shouldReset = true;
    resultDisplay.innerText = storedValue + " " + op;
}

function calculate() {
    if (currOperator === null || shouldReset) return;

    const curr = parseFloat(currDisplay);
    const prev = parseFloat(storedValue);
    let result;
    switch (currOperator) {
        case "+": result = prev + curr; break;
        case "−": result = prev - curr; break;
        case "÷":
            if (curr === 0) {
                updateResult("Error", "");
                storedValue = null;
                currOperator = null;
                return;
            }
            result = prev / curr; break;
        case "×": result = prev * curr; break;
        case "^": result = Math.pow(prev, curr); break;
        case "mod": result = prev % curr; break;
    }
    updateResult(result, prev + " " + currOperator + " " + curr + " =");
    storedValue = null;
    currOperator = null;
}
function toggleSign() {
    if (currDisplay === "0" || currDisplay === "Error") return;

    if (currDisplay.startsWith("-")) {
        currDisplay = currDisplay.slice(1);
    } else {
        currDisplay = "-" + currDisplay;
    }

    updateDisplay();
}
function percentage() {

    const curr = parseFloat(currDisplay);

    if (storedValue !== null && currOperator !== null) {
        const prev = parseFloat(storedValue);
        currDisplay = (prev * curr / 100).toString();
    } else {
        currDisplay = (curr / 100).toString();
    }

    updateDisplay();
}

function updateResult(currDisplayValue, displayExpression) {
    currDisplay = currDisplayValue.toString();
    resultDisplay.innerText = displayExpression;
    shouldReset = true;

    if (displayExpression) saveToHistory(displayExpression, currDisplay);
    updateDisplay();
}

function square() { updateResult(parseFloat(currDisplay) ** 2, currDisplay + "²"); }
function squareRoot() {
    const num = parseFloat(currDisplay);
    if (num < 0) updateResult("Error", "");
    else updateResult(Math.sqrt(num), "√(" + currDisplay + ")");
}
function reciprocal() {
    const num = parseFloat(currDisplay);
    if (num === 0) updateResult("Error", "");
    else updateResult(1 / num, "1/(" + currDisplay + ")");
}
function factorial() {
    const num = parseFloat(currDisplay);
    if (num < 0 || !Number.isInteger(num)) { updateResult("Error", ""); return; }
    let result = 1; for (let i = 2; i <= num; i++) result *= i;
    updateResult(result, "fact(" + currDisplay + ")");
}
function expPower() { updateResult(Math.exp(parseFloat(currDisplay)), "e^(" + currDisplay + ")"); }
function tenPower() { updateResult(Math.pow(10, parseFloat(currDisplay)), "10^(" + currDisplay + ")"); }
function logBase10() {
    const num = parseFloat(currDisplay);
    if (num <= 0) updateResult("Error", "");
    else updateResult(Math.log10(num), "log(" + currDisplay + ")");
}
function naturalLog() {
    const num = parseFloat(currDisplay);
    if (num <= 0) updateResult("Error", "");
    else updateResult(Math.log(num), "ln(" + currDisplay + ")");
}
function absoluteValue() { updateResult(Math.abs(parseFloat(currDisplay)), "|" + currDisplay + "|"); }
function insConst(value) {
    if (!shouldReset && /[0-9)]$/.test(currDisplay)) {
        chooseOperator("×");
    }
    appendDisplay(value.toString());
}

function saveToHistory(expression, result) {
    const history = JSON.parse(localStorage.getItem("calcHistory")) || [];

    history.push({ expression, result });

    localStorage.setItem("calcHistory", JSON.stringify(history));

    renderHistory();
}
function renderHistory() {
    const history = JSON.parse(localStorage.getItem("calcHistory")) || [];

    historyContainer.innerHTML = "";

    const clearBtn = document.querySelector(".clear-history-btn");

    if (history.length === 0) {
        clearBtn.style.opacity = "0";
        clearBtn.style.pointerEvents = "none";
        return;
    } else {
        clearBtn.style.opacity = "1";
        clearBtn.style.pointerEvents = "auto";
    }

    history.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.className = "history-item mb-2";

        const exp = document.createElement("div");
        exp.className = "operation text-secondary text-end";
        exp.innerText = item.expression;

        const res = document.createElement("div");
        res.className = "history-result text-end fw-bold";
        res.innerText = item.result;

        wrapper.appendChild(exp);
        wrapper.appendChild(res);

        historyContainer.prepend(wrapper);
    });
}
function clearHistory() {
    localStorage.removeItem("calcHistory");
    renderHistory();
}
function applyTrig(type) {
    let num = parseFloat(currDisplay);

    if (isDegree) {
        num = num * (Math.PI / 180);
    }

    let result;

    switch (type) {
        case "sin":
            result = Math.sin(num);
            break;
        case "cos":
            result = Math.cos(num);
            break;
        case "tan":
            result = Math.tan(num);
            break;
        case "sec":
            result = 1 / Math.cos(num);
            break;
        case "csc":
            result = 1 / Math.sin(num);
            break;
        case "cot":
            result = 1 / Math.tan(num);
            break;
    }

    if (!isFinite(result)) {
        updateResult("Error", "");
        return;
    }

    updateResult(result, `${type}(${currDisplay})`);
}
function toggleFE() {
    isExponential = !isExponential;
        feBtn.classList.toggle("active-fe", isExponential);
    let num = parseFloat(currDisplay);
    if (isNaN(num)) return;

    if (isExponential) {
        currDisplay = num.toExponential(10);
    } else {
        currDisplay = num.toString();
    }

    updateDisplay();
}   
function floorValue() {
    updateResult(Math.floor(parseFloat(currDisplay)), `⌊${currDisplay}⌋`);
}
function toDecimalDegrees() {
    const match = currDisplay.match(/(-?\d+)°\s*(\d+)'?\s*(\d+(\.\d+)?)?/);
    if (!match) return;

    const deg = parseFloat(match[1]);
    const min = parseFloat(match[2]) || 0;
    const sec = parseFloat(match[3]) || 0;

    const decimal = deg + (min / 60) + (sec / 3600);

    updateResult(decimal, "→deg");
}
function toDMS() {
    let decimal = parseFloat(currDisplay);
    if (isNaN(decimal)) return;

    const degrees = Math.trunc(decimal);
    const minutesFloat = Math.abs((decimal - degrees) * 60);
    const minutes = Math.trunc(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);

    const result = `${degrees}° ${minutes}' ${seconds}"`;

    currDisplay = result;
    updateDisplay();
}
function randomValue() {
    const num = Math.random();
    updateResult(num, "rand()");
}
function ceilValue() {
    updateResult(Math.ceil(parseFloat(currDisplay)), `⌈${currDisplay}⌉`);
}       