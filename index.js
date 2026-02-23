import { CalcMath, checkExpression } from "./math.js";
import { setupHistory, setupMemory } from "./storage.js";

// buttons
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
        "+": "add", "−": "subtract", "×": "multiply", "÷": "divide",
        "=": "equals", "C": "clear", "CE": "clearEntry", "⌫": "backspace",
        "%": "percent", "+/-": "toggleSign", "x²": "square", "√x": "sqrt",
        "1/x": "reciprocal", "π": "pi", "e": "euler", "xʸ": "power",
        "n!": "factorial", "mod": "modulo", "exp": "exp", "10ˣ": "tenPower",
        "log": "log10", "ln": "ln", "|x|": "abs", "sin": "sin", "cos": "cos",
        "tan": "tan", "sec": "sec", "csc": "csc", "cot": "cot",
        "rand": "random", "⌊x⌋": "floor", "⌈x⌉": "ceil",
        "→dms": "toDMS", "→deg": "toDeg",
        "(": "openBracket", ")": "closeBracket",
        "MC": "memoryClear", "MR": "memoryRecall",
        "M+": "memoryAdd", "M-": "memorySubtract", "MS": "memoryStore"
    };
    if (text === "2nd") return context === "trig" ? "trigSecond" : "sciSecond";
    return map[text] || "number";
}

// state var
let currDisplay = "0";
let currExpression = "";
let storedValue = null;
let currOperator = null;
let shouldReset = false;
let isExponential = false;
let isSciSecond = false;
let isTrigSecond = false;
let isDegree = true;

const math = new CalcMath(true);
const history = setupHistory();
const memory = setupMemory();

// dom ref
const valueDisplay = document.querySelector(".value");
const resultDisplay = document.querySelector(".result");
const calculator = document.getElementById("calculator");
const angleBtn = document.getElementById("angle-mode");
const feBtn = document.querySelector(".fe-fn");
const themeToggle = document.getElementById("theme-toggle");

// for display
function updateDisplay() {
    valueDisplay.innerText = currDisplay;
}

function updateResult(val, expr) {
    currDisplay = val.toString();
    resultDisplay.innerText = expr;
    shouldReset = true;
    if (expr) history.addEntry(expr, currDisplay);
    updateDisplay();
}

function appendDisplay(val) {
    if (shouldReset) {
        currDisplay = val === "." ? "0." : val;
        shouldReset = false;
        updateDisplay();
        return;
    }
    if (val === "." && currDisplay.includes(".")) return;
    currDisplay = currDisplay === "0" ? (val === "." ? "0." : val) : currDisplay + val;
    updateDisplay();
}

//basic func
function clearAll() {
    currDisplay = "0"; currExpression = "";
    storedValue = null; currOperator = null;
    resultDisplay.innerText = "";
    updateDisplay();
}
function clearEntry() {
    currDisplay = "0";
    updateDisplay();
}
function backSpace() {
    currDisplay = currDisplay.length === 1 ? "0" : currDisplay.slice(0, -1);
    updateDisplay();
}
function toggleSign() {
    if (currDisplay === "0" || currDisplay === "Error") return;
    currDisplay = currDisplay.startsWith("-") ? currDisplay.slice(1) : "-" + currDisplay;
    updateDisplay();
}
function percentage() {
    const curr = parseFloat(currDisplay);
    currDisplay = (storedValue !== null && currOperator !== null)
        ? (parseFloat(storedValue) * curr / 100).toString()
        : (curr / 100).toString();
    updateDisplay();
}
function chooseOperator(op) {
    if (currExpression === "") currExpression = currDisplay;
    else if (!shouldReset) currExpression += currDisplay;
    else {
        currExpression = currExpression.trim();
        if (/[+\-×÷^%]$/.test(currExpression)) currExpression = currExpression.slice(0, -1);
    }
    currExpression += " " + op + " ";
    resultDisplay.innerText = currExpression;
    shouldReset = true;
}
function calculate() {
    if (!shouldReset) currExpression += currDisplay;
    let expr = currExpression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/\^/g, "**")
        .replace(/mod/g, "%");

    if (!checkExpression(expr)) { updateResult("Error", ""); currExpression = ""; return; }

    let result;
    try {
        result = eval(expr);
    } catch {
        result = NaN;
    }
    if (!isFinite(result)) {
        updateResult("Error", "");
        currExpression = "";
        return;
    }

    updateResult(result, currExpression + " =");
    currExpression = "";
}
function insConst(value) {
    if (!shouldReset && /[0-9)]$/.test(currDisplay)) chooseOperator("×");
    appendDisplay(value.toString());
}

// func for unary operators
function unCalc(result, label) {
    if (result === null || !isFinite(result)) {
        updateResult("Error", "");
        return;
    }
    updateResult(result, label);
}

function applyTrig(type) {
    const result = math.trig(type, parseFloat(currDisplay), isTrigSecond);
    unCalc(result, `${type}${isTrigSecond ? "⁻¹" : ""}(${currDisplay})`);
}

// render buttons
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

function renderDropdownButtons(buttonSet, containerId, columns) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const grid = document.createElement("div");
    grid.style.cssText = `display:grid;grid-template-columns:repeat(${columns},1fr);gap:8px;width:20vw`;
    buttonSet.forEach(text => {
        let label = text;
        if (isTrigSecond) {
            const inv = { sin: "sin⁻¹", cos: "cos⁻¹", tan: "tan⁻¹", sec: "sec⁻¹", csc: "csc⁻¹", cot: "cot⁻¹" };
            label = inv[text] || text;
        }
        const btn = document.createElement("button");
        btn.className = "trigo btn btn-light w-100";
        btn.innerText = label;
        btn.dataset.action = getActionId(text, "trig");
        grid.appendChild(btn);
    });
    container.appendChild(grid);
}

let trigAbortController = null;
function attachTrigGridListener() {
    if (trigAbortController) trigAbortController.abort();
    trigAbortController = new AbortController();
    document.getElementById("trig-grid").addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        if (btn.dataset.action === "trigSecond") {
            isTrigSecond = !isTrigSecond;
            renderDropdownButtons(trigButtons, "trig-grid", 4);
            attachTrigGridListener();
            e.stopPropagation();
        }
    }, { signal: trigAbortController.signal });
}

function toggleSciSecond() {
    isSciSecond = !isSciSecond;
    calculator.querySelectorAll("button").forEach(btn => {
        const original = btn.dataset.originalLabel;
        if (!original) return;
        if (isSciSecond && sciSecondMap[original]) {
            btn.innerText = sciSecondMap[original].label;
            btn.dataset.action = sciSecondMap[original].action;
        } else {
            btn.innerText = original;
            btn.dataset.action = getActionId(original, "sci");
        }
    });
}

// mode change
const modeLabel = document.querySelector(".mode");
const degEl = document.getElementById("deg-rad");
const trigoEl = document.getElementById("trigo-func");

window.changeToStandard = function () {
    degEl.classList.replace("d-flex", "d-none");
    trigoEl.classList.replace("d-flex", "d-none");
    renderButtons(standardButtons, 4);
    modeLabel.innerHTML = "Standard";
};
window.changeToScientific = function () {
    degEl.classList.replace("d-none", "d-flex");
    trigoEl.classList.replace("d-none", "d-flex");
    renderButtons(scientificButtons, 5);
    modeLabel.innerHTML = "Scientific";
};

// calls function for particular input
function handleInput(action, value) {
    const n = parseFloat(currDisplay);
    switch (action) {
        case "number":
            appendDisplay(value); break;
        case "add":
            chooseOperator("+"); break;
        case "subtract":
            chooseOperator("−"); break;
        case "multiply":
            chooseOperator("×"); break;
        case "divide":
            chooseOperator("÷"); break;
        case "equals":
            calculate(); break;
        case "clear":
            clearAll(); break;
        case "clearEntry":
            clearEntry(); break;
        case "backspace":
            backSpace(); break;
        case "percent":
            percentage(); break;
        case "toggleSign":
            toggleSign(); break;
        case "square":
            unCalc(math.square(n), currDisplay + "²"); break;
        case "tenPower":
            unCalc(math.tenToThePower(n),  "10^(" + currDisplay + ")"); break;
        case "cube":
            unCalc(math.cube(n), currDisplay + "³"); break;
        case "sqrt":
            unCalc(math.squareRoot(n), "√(" + currDisplay + ")"); break;
        case "cubeRoot":
            unCalc(math.cubeRoot(n), "³√(" + currDisplay + ")"); break;
        case "reciprocal":
            unCalc(math.reciprocal(n), "1/(" + currDisplay + ")"); break;
        case "abs":
            unCalc(math.abs(n), "|" + currDisplay + "|"); break;
        case "floor":
            unCalc(math.floor(n), "⌊" + currDisplay + "⌋"); break;
        case "ceil":
            unCalc(math.ceil(n), "⌈" + currDisplay + "⌉"); break;
        case "exp":
            unCalc(math.twoToThePower(n), "2^(" + currDisplay + ")"); break;
        case "log10":
            unCalc(math.log(n), "log(" + currDisplay + ")"); break;
        case "ln":
            unCalc(math.naturalLog(n), "ln(" + currDisplay + ")"); break;
        case "factorial":
            unCalc(math.factorial(n), "fact(" + currDisplay + ")"); break;
        case "random":
            updateResult(Math.random(), "rand()"); break;
        case "power":
            chooseOperator("^"); break;
        case "modulo":
            chooseOperator("mod"); break;
        case "pi":
            insConst(Math.PI); break;
        case "euler":
            insConst(Math.E); break;
        case "sin":
        case "cos":
        case "tan":
        case "sec":
        case "csc":
        case "cot":
            applyTrig(action); break;
        case "toDMS": {
            const res = math.toDMS(n);
            if (res) { currDisplay = res; updateDisplay(); }
            break;
        }
        case "toDeg":
            unCalc(math.DMSToDecimal(currDisplay), "→deg"); break;
        case "nthRoot": {
            if (storedValue === null) { chooseOperator("nthRoot"); break; }
            unCalc(math.nthRoot(n, parseFloat(storedValue)), storedValue + "√" + currDisplay);
            storedValue = null; currOperator = null; break;
        }
        case "logBaseY": {
            if (storedValue === null) {
                chooseOperator("logBaseY");
                break;
            }
            unCalc(math.logBaseY(n, parseFloat(storedValue)), "log" + storedValue + "(" + currDisplay + ")");
            storedValue = null;
            currOperator = null;
            break;
        }
        case "openBracket":
            if (!shouldReset && currDisplay !== "0") currExpression += currDisplay;
            currExpression += "(";
            resultDisplay.innerText = currExpression;
            currDisplay = "0";
            shouldReset = true;
            break;
        case "closeBracket": {
            if (!shouldReset && currDisplay !== "0") {
                currExpression += currDisplay;
            }
            const openCount = (currExpression.match(/\(/g) || []).length;
            const closeCount = (currExpression.match(/\)/g) || []).length;

            if (openCount > closeCount) {
                currExpression += ")";
                resultDisplay.innerText = currExpression;
                currDisplay = "0";
                shouldReset = true;
            }

            break;
        }
        case "memoryClear":
            memory.clearMemory(); break;
        case "memoryRecall":
            {
                const v = memory.getLastValue();
                if (v !== null) { currDisplay = v.toString(); updateDisplay(); } break;
            }
        case "memoryAdd":
            memory.addToMemory(n); break;
        case "memorySubtract":
            memory.subtractFromMemory(n); break;
        case "memoryStore":
            memory.saveToMemory(n); break;
        case "sciSecond":
            toggleSciSecond(); break;
    }
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !btn.dataset.action) return;
    handleInput(btn.dataset.action, btn.innerText.trim());
});

angleBtn.addEventListener("click", () => {
    isDegree = !isDegree;
    math.degreeMode = isDegree;
    angleBtn.innerText = isDegree ? "DEG" : "RAD";
});

feBtn.addEventListener("click", () => {
    isExponential = !isExponential;
    feBtn.classList.toggle("active-fe", isExponential);
    const num = parseFloat(currDisplay);
    if (!isNaN(num)) currDisplay = isExponential ? num.toExponential(10) : num.toString();
    updateDisplay();
});

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    themeToggle.innerText = isDark ? "Light Theme" : "Dark Theme";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (!isNaN(key) && key !== " ") { handleInput("number", key); return; }
    if (key === "/") { e.preventDefault(); handleInput("divide", "÷"); return; }
    const keyMap = {
        ".": ["number", "."], "+": ["add"], "-": ["subtract", "−"],
        "*": ["multiply", "×"], "Enter": ["equals"], "=": ["equals"],
        "Backspace": ["backspace"], "Delete": ["clear"], "Escape": ["clearEntry"],
        "(": ["openBracket", "("], ")": ["closeBracket", ")"], "%": ["percent"],
    };
    if (keyMap[key]) { if (["Enter", "="].includes(key)) e.preventDefault(); handleInput(...keyMap[key]); }
});

// hist and mem
window.showHistory = function () {
    document.getElementById("history-panel").classList.remove("d-none");
    document.getElementById("memory-panel").classList.add("d-none");
    document.querySelector(".hist-btn").classList.add("active-tab");
    document.querySelector(".mem-btn").classList.remove("active-tab");
};
window.showMemory = function () {
    document.getElementById("history-panel").classList.add("d-none");
    document.getElementById("memory-panel").classList.remove("d-none");
    document.querySelector(".mem-btn").classList.add("active-tab");
    document.querySelector(".hist-btn").classList.remove("active-tab");
};
window.clearHistory = function () {
    history.deleteAll();
};

// tabs for mobile
const rightPanel = document.getElementById("history-pan");
const mobileCalc = document.getElementById("mobile-calc");
const mobileHistory = document.getElementById("mobile-history");
const mobileMemory = document.getElementById("mobile-memory");

function setActiveMobile(btn) {
    document.querySelectorAll(".mobile-tabs button").forEach(b => b.classList.remove("active-mobile-tab"));
    btn.classList.add("active-mobile-tab");
}
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

renderButtons(scientificButtons, 5);
renderDropdownButtons(trigButtons, "trig-grid", 4);
renderDropdownButtons(funcButtons, "func-grid", 3);
attachTrigGridListener();
history.showHistory();
memory.refreshMemoryPanel();

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    if (themeToggle) themeToggle.innerText = "Light Theme";
}
