let mode = document.querySelector(".mode");
let deg = document.getElementById("deg-rad");
let trigo = document.getElementById("trigo-func");
const valueDisplay = document.querySelector(".value");
const resultDisplay = document.querySelector(".result");
const historyContainer = document.getElementById("history-panel");
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

let currExpression = "";
let memoryStore = [];

let isDegree = true;
let isExponential = false;
let isTrigSecond = false;
let isSciSecond = false;

const sciSecondMap = {
    "x²": { label: "x³", action: "cube" },
    "√x": { label: "³√x", action: "cubeRoot" },
    "10ˣ": { label: "2ˣ", action: "twoPower" },
    "log": { label: "logᵧ", action: "logBaseY" },
    "ln": { label: "eˣ", action: "expPower" },
    "xʸ": { label: "ʸ√x", action: "nthRoot" },
};
function getActionId(text, context) {
    const map = {
        "+": "add",
        "−": "subtract",
        "×": "multiply",
        "÷": "divide",
        "=": "equals",
        "C": "clear",
        "CE": "clearEntry",
        "⌫": "backspace",
        "%": "percent",
        "+/-": "toggleSign",
        "x²": "square",
        "√x": "sqrt",
        "1/x": "reciprocal",
        "π": "pi",
        "e": "euler",
        "xʸ": "power",
        "n!": "factorial",
        "mod": "modulo",
        "exp": "exp",
        "10ˣ": "tenPower",
        "log": "log10",
        "ln": "ln",
        "|x|": "abs",
        "sin": "sin",
        "cos": "cos",
        "tan": "tan",
        "sec": "sec",
        "csc": "csc",
        "cot": "cot",
        "rand": "random",
        "⌊x⌋": "floor",
        "⌈x⌉": "ceil",
        "→dms": "toDMS",
        "→deg": "toDeg",
        "(": "openBracket",
        ")": "closeBracket",
        "MC": "memoryClear",
        "MR": "memoryRecall",
        "M+": "memoryAdd",
        "M-": "memorySubtract",
        "MS": "memoryStore"

    };

    if (text === "2nd") {
        return context === "trig" ? "trigSecond" : "sciSecond";
    }

    return map[text] || "number";
}

angleBtn.addEventListener("click", () => {
    isDegree = !isDegree;
    angleBtn.innerText = isDegree ? "DEG" : "RAD";
});

let trigGridAbortController = null;
function attachTrigGridListener() {
    if (trigGridAbortController) {
        trigGridAbortController.abort();
    }
    trigGridAbortController = new AbortController();

    document.getElementById("trig-grid").addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        if (btn.dataset.action === "trigSecond") {
            handleInput("trigSecond", btn.innerText.trim());
            e.stopPropagation();
        }
    }, { signal: trigGridAbortController.signal });
}

function renderDropdownButtons(buttonSet, containerId, columns) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const gridDiv = document.createElement("div");
    gridDiv.style.display = "grid";
    gridDiv.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    gridDiv.style.gap = "8px";
    gridDiv.style.width = "20vw";

    buttonSet.forEach(text => {
        let displayText = text;

        if (isTrigSecond) {
            if (text === "sin") displayText = "sin⁻¹";
            else if (text === "cos") displayText = "cos⁻¹";
            else if (text === "tan") displayText = "tan⁻¹";
            else if (text === "sec") displayText = "sec⁻¹";
            else if (text === "csc") displayText = "csc⁻¹";
            else if (text === "cot") displayText = "cot⁻¹";
        }

        const btn = document.createElement("button");
        btn.className = "trigo btn btn-light w-100";
        btn.innerText = displayText;
        btn.dataset.action = getActionId(text, "trig");
        gridDiv.appendChild(btn);
    });

    container.appendChild(gridDiv);
}

document.addEventListener("DOMContentLoaded", function () {
    changeMode("scientific");
    renderDropdownButtons(trigButtons, "trig-grid", 4);
    renderDropdownButtons(funcButtons, "func-grid", 3);
    attachTrigGridListener();
    renderHistory();
    renderMemory();
    feBtn.addEventListener("click", toggleFE);

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.innerText = "Light Theme";
    }
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
        btn.dataset.originalLabel = text;
        btn.dataset.action = getActionId(text, "sci");

        col.appendChild(btn);
        calculator.appendChild(col);
    });
}

function changeMode(m) {
    if (m === "standard") {
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
    changeMode("scientific");
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
    if (!button || !button.dataset.action) return;
    const action = button.dataset.action;
    const value = button.innerText.trim();
    handleInput(action, value);
});

function appendDisplay(val) {

    if (shouldReset) {
        currDisplay = val === "." ? "0." : val;
        shouldReset = false;
        updateDisplay();
        return;
    }
    if (val === "." && currDisplay.includes(".")) return;
    if (currDisplay === "0") {
        if (val === ".") {
            currDisplay = "0.";
        } else {
            currDisplay = val;
        }
    } else {
        currDisplay += val;
    }
    updateDisplay();
}
function handleInput(action, value) {
    switch (action) {
        case "number":
        case "decimal": appendDisplay(value); break;
        case "add": chooseOperator("+"); break;
        case "subtract": chooseOperator("−"); break;
        case "multiply": chooseOperator("×"); break;
        case "divide": chooseOperator("÷"); break;
        case "equals": calculate(); break;
        case "clear": clearAll(); break;
        case "clearEntry": clearEntry(); break;
        case "backspace": backSpace(); break;
        case "percent": percentage(); break;
        case "toggleSign": toggleSign(); break;
        case "square": square(); break;
        case "sqrt": squareRoot(); break;
        case "reciprocal": reciprocal(); break;
        case "factorial": factorial(); break;
        case "power": chooseOperator("^"); break;
        case "modulo": chooseOperator("mod"); break;
        case "pi": insConst(Math.PI); break;
        case "euler": insConst(Math.E); break;
        case "exp": expPower(); break;
        case "tenPower": tenPower(); break;
        case "log10": logBase10(); break;
        case "ln": naturalLog(); break;
        case "abs": absoluteValue(); break;
        case "sin":
        case "cos":
        case "tan":
        case "sec":
        case "csc":
        case "cot": applyTrig(action); break;
        case "random": randomValue(); break;
        case "floor": floorValue(); break;
        case "ceil": ceilValue(); break;
        case "toDMS": toDMS(); break;
        case "toDeg": toDecimalDegrees(); break;
        case "sciSecond": toggleSciSecond(); break;
        case "trigSecond": toggleTrigSecond(); break;
        case "cube": cube(); break;
        case "cubeRoot": cubeRoot(); break;
        case "twoPower": twoPower(); break;
        case "logBaseY": logBaseY(); break;
        case "nthRoot": nthRoot(); break;
        case "openBracket":
            if (!shouldReset && currDisplay !== "0") {
                currExpression += currDisplay;
            }

            currExpression += "(";
            resultDisplay.innerText = currExpression;

            currDisplay = "0";
            shouldReset = true;
            break;
        case "closeBracket":

            if (!shouldReset && currDisplay !== "0") {
                currExpression += currDisplay;
            }

            currExpression += ")";
            resultDisplay.innerText = currExpression;

            currDisplay = "0";
            shouldReset = true;
            break;
        case "memoryClear": memoryClear(); break;
        case "memoryRecall": memoryRecall(); break;
        case "memoryAdd": memoryAdd(); break;
        case "memorySubtract": memorySubtract(); break;
        case "memoryStore": memoryStoreValue(); break;
    }
}

function backSpace() {
    currDisplay = currDisplay.length === 1 ? "0" : currDisplay.slice(0, -1);
    updateDisplay();
}
function clearEntry() { currDisplay = "0"; updateDisplay(); }
function clearAll() {
    currDisplay = "0";
    currExpression = "";
    storedValue = null;
    currOperator = null;
    resultDisplay.innerText = "";
    updateDisplay();
}
function chooseOperator(op) {

    if (!shouldReset && currDisplay !== "0") {
        currExpression += currDisplay;
    }

    currExpression += " " + op + " ";
    resultDisplay.innerText = currExpression;

    currDisplay = "0";
    shouldReset = true;
}
function calculate() {

    if (!shouldReset) {
        currExpression += currDisplay;
    }

    let expression = currExpression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/\^/g, "**")
        .replace(/mod/g, "%");

    if (!isValidExpression(expression)) {
        updateResult("Error", "");
        currExpression = "";
        return;
    }

    let result = eval(expression);

    if (!isFinite(result)) {
        updateResult("Error", "");
        currExpression = "";
        return;
    }

    updateResult(result, currExpression + " =");

    currExpression = "";
}
function isValidExpression(expr) {
    if (!/^[0-9+\-*/%.()\s]+$/.test(expr)) return false;

    let balance = 0;
    for (let char of expr) {
        if (char === "(") balance++;
        if (char === ")") balance--;
        if (balance < 0) return false;
    }
    if (balance !== 0) return false;

    return true;
}
function toggleSign() {
    if (currDisplay === "0" || currDisplay === "Error") return;
    currDisplay = currDisplay.startsWith("-") ? currDisplay.slice(1) : "-" + currDisplay;
    updateDisplay();
}
function percentage() {
    const curr = parseFloat(currDisplay);
    currDisplay = storedValue !== null && currOperator !== null
        ? (parseFloat(storedValue) * curr / 100).toString()
        : (curr / 100).toString();
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

function cube() { updateResult(parseFloat(currDisplay) ** 3, currDisplay + "³"); }
function squareRoot() {
    const num = parseFloat(currDisplay);
    if (num < 0) updateResult("Error", "");
    else updateResult(Math.sqrt(num), "√(" + currDisplay + ")");
}

function cubeRoot() { updateResult(Math.cbrt(parseFloat(currDisplay)), "³√(" + currDisplay + ")"); }

function nthRoot() {
    if (storedValue === null) { chooseOperator("nthRoot"); return; }
    const x = parseFloat(currDisplay);
    const y = parseFloat(storedValue);
    updateResult(Math.pow(x, 1 / y), storedValue + "√" + currDisplay);
    storedValue = null; currOperator = null;
}
function reciprocal() {
    const num = parseFloat(currDisplay);
    if (num === 0) updateResult("Error", "");
    else updateResult(1 / num, "1/(" + currDisplay + ")");
}
function factorial() {
    const num = parseFloat(currDisplay);
    if (num < 0 || !Number.isInteger(num)) { updateResult("Error", ""); return; }
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    updateResult(result, "fact(" + currDisplay + ")");
}
function expPower() { updateResult(Math.exp(parseFloat(currDisplay)), "e^(" + currDisplay + ")"); }
function tenPower() { updateResult(Math.pow(10, parseFloat(currDisplay)), "10^(" + currDisplay + ")"); }

function twoPower() { updateResult(Math.pow(2, parseFloat(currDisplay)), "2^(" + currDisplay + ")"); }
function logBase10() {
    const num = parseFloat(currDisplay);
    if (num <= 0) updateResult("Error", "");
    else updateResult(Math.log10(num), "log(" + currDisplay + ")");
}

function logBaseY() {
    if (storedValue === null) { chooseOperator("logBaseY"); return; }
    const x = parseFloat(currDisplay);
    const y = parseFloat(storedValue);
    if (x <= 0 || y <= 0 || y === 1) { updateResult("Error", ""); return; }
    updateResult(Math.log(x) / Math.log(y), "log" + storedValue + "(" + currDisplay + ")");
    storedValue = null; currOperator = null;
}
function naturalLog() {
    const num = parseFloat(currDisplay);
    if (num <= 0) updateResult("Error", "");
    else updateResult(Math.log(num), "ln(" + currDisplay + ")");
}
function absoluteValue() { updateResult(Math.abs(parseFloat(currDisplay)), "|" + currDisplay + "|"); }
function insConst(value) {
    if (!shouldReset && /[0-9)]$/.test(currDisplay)) chooseOperator("×");
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
        historyContainer.innerHTML = "<div class='text-secondary text-end p-2'>No history yet</div>";
        return;
    }
    clearBtn.style.opacity = "1";
    clearBtn.style.pointerEvents = "auto";
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
    if (!isTrigSecond && isDegree) num = num * (Math.PI / 180);
    let result;
    if (!isTrigSecond) {
        switch (type) {
            case "sin": result = Math.sin(num); break;
            case "cos": result = Math.cos(num); break;
            case "tan": result = Math.tan(num); break;
            case "sec": result = 1 / Math.cos(num); break;
            case "csc": result = 1 / Math.sin(num); break;
            case "cot": result = 1 / Math.tan(num); break;
        }
    } else {
        switch (type) {
            case "sin": result = Math.asin(num); break;
            case "cos": result = Math.acos(num); break;
            case "tan": result = Math.atan(num); break;
            case "sec": result = Math.acos(1 / num); break;
            case "csc": result = Math.asin(1 / num); break;
            case "cot": result = Math.atan(1 / num); break;
        }
        if (isDegree) result = result * (180 / Math.PI);
    }

    if (!isFinite(result)) { updateResult("Error", ""); return; }
    updateResult(result, `${type}${isTrigSecond ? "⁻¹" : ""}(${currDisplay})`);
}

function toggleFE() {
    isExponential = !isExponential;
    feBtn.classList.toggle("active-fe", isExponential);
    const num = parseFloat(currDisplay);
    if (isNaN(num)) return;
    currDisplay = isExponential ? num.toExponential(10) : num.toString();
    updateDisplay();
}
function floorValue() { updateResult(Math.floor(parseFloat(currDisplay)), `⌊${currDisplay}⌋`); }
function ceilValue() { updateResult(Math.ceil(parseFloat(currDisplay)), `⌈${currDisplay}⌉`); }
function toDecimalDegrees() {
    const match = currDisplay.match(/(-?\d+)°\s*(\d+)'?\s*(\d+(\.\d+)?)?/);
    if (!match) return;
    const d = parseFloat(match[1]), m = parseFloat(match[2]) || 0, s = parseFloat(match[3]) || 0;
    updateResult(d + (m / 60) + (s / 3600), "→deg");
}
function toDMS() {
    const decimal = parseFloat(currDisplay);
    if (isNaN(decimal)) return;
    const degrees = Math.trunc(decimal);
    const minutesFloat = Math.abs((decimal - degrees) * 60);
    const minutes = Math.trunc(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);
    currDisplay = `${degrees}° ${minutes}' ${seconds}"`;
    updateDisplay();
}
function randomValue() { updateResult(Math.random(), "rand()"); }

function toggleTrigSecond() {
    isTrigSecond = !isTrigSecond;
    renderDropdownButtons(trigButtons, "trig-grid", 4);
    attachTrigGridListener();
}

function toggleSciSecond() {
    isSciSecond = !isSciSecond;

    calculator.querySelectorAll("button").forEach(btn => {
        const original = btn.dataset.originalLabel;
        if (!original) return;

        if (isSciSecond && sciSecondMap[original]) {
            btn.innerText = sciSecondMap[original].label;
            btn.dataset.action = sciSecondMap[original].action;
        } else {f
            btn.innerText = original;
            btn.dataset.action = getActionId(original, "sci");
        }
    });
}

const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        themeToggle.innerText = "Light Theme";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.innerText = "Dark Theme";
        localStorage.setItem("theme", "light");
    }
});
function memoryClear() {
    memoryStore = [];
    renderMemory();
}

function memoryRecall() {
    if (memoryStore.length === 0) return;
    currDisplay = memoryStore[memoryStore.length - 1].toString();
    updateDisplay();
}

function memoryAdd() {
    const value = parseFloat(currDisplay);

    if (memoryStore.length === 0) {
        memoryStore.push(value);
    } else {
        memoryStore[memoryStore.length - 1] += value;
    }

    renderMemory();
}

function memorySubtract() {
    const value = parseFloat(currDisplay);

    if (memoryStore.length === 0) {
        memoryStore.push(-value);
    } else {
        memoryStore[memoryStore.length - 1] -= value;
    }

    renderMemory();
}
function memoryStoreValue() {
    memoryStore.push(parseFloat(currDisplay));
    renderMemory();
}
function renderMemory() {
    const panel = document.getElementById("memory-panel");
    panel.innerHTML = "";

    if (memoryStore.length === 0) {
        panel.innerHTML = "<div class='text-secondary text-end p-2'>No memory yet</div>";
        return;
    }

    memoryStore.forEach((val, index) => {
        const div = document.createElement("div");
        div.className = "text-end fw-bold p-2 border-bottom";
        div.innerText = val;
        panel.prepend(div);
    });
}
function showHistory() {
    document.getElementById("history-panel").classList.remove("d-none");
    document.getElementById("memory-panel").classList.add("d-none");

    document.querySelector(".hist-btn").classList.add("active-tab");
    document.querySelector(".mem-btn").classList.remove("active-tab");
}

function showMemory() {
    document.getElementById("history-panel").classList.add("d-none");
    document.getElementById("memory-panel").classList.remove("d-none");

    document.querySelector(".mem-btn").classList.add("active-tab");
    document.querySelector(".hist-btn").classList.remove("active-tab");
}

document.addEventListener("keydown", (e) => {

    const key = e.key;

    if (!isNaN(key)) {
        handleInput("number", key);
        return;
    }

    if (key === ".") {
        handleInput("number", ".");
        return;
    }

    if (key === "+") {
        handleInput("add", "+");
        return;
    }

    if (key === "-") {
        handleInput("subtract", "−");
        return;
    }

    if (key === "*") {
        handleInput("multiply", "×");
        return;
    }

    if (key === "/") {
        e.preventDefault();
        handleInput("divide", "÷");
        return;
    }

    if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleInput("equals", "=");
        return;
    }

    if (key === "Backspace") {
        handleInput("backspace");
        return;
    }

    if (key === "Delete") {
        handleInput("clear");
        return;
    }

    if (key === "Escape") {
        handleInput("clearEntry");
        return;
    }

    if (key === "(") {
        handleInput("openBracket", "(");
        return;
    }

    if (key === ")") {
        handleInput("closeBracket", ")");
        return;
    }

    if (key === "%") {
        handleInput("percent");
        return;
    }

});

const mobileCalc = document.getElementById("mobile-calc");
const mobileHistory = document.getElementById("mobile-history");
const mobileMemory = document.getElementById("mobile-memory");
const rightPanel = document.getElementById("history-pan");

mobileCalc.addEventListener("click", () => {
    rightPanel.classList.remove("show-mobile");
    setActiveMobile(mobileCalc);
});

mobileHistory.addEventListener("click", () => {
    rightPanel.classList.add("show-mobile");
    showHistory();
    setActiveMobile(mobileHistory);
});

mobileMemory.addEventListener("click", () => {
    rightPanel.classList.add("show-mobile");
    showMemory();
    setActiveMobile(mobileMemory);
});
function setActiveMobile(activeBtn) {
    document.querySelectorAll(".mobile-tabs button")
        .forEach(btn => btn.classList.remove("active-mobile-tab"));

    activeBtn.classList.add("active-mobile-tab");
}