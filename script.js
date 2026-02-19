
let mode = document.querySelector(".mode");
let deg = document.getElementById("deg-rad");
let trigo = document.getElementById("trigo-func");
const valueDisplay = document.querySelector(".value");
const resultDisplay = document.querySelector(".result");

const standardButtons = [
    "%", "CE", "C", "⌫",
    "1/x", "x²", "√x", "÷",
    "7", "8", "9", "×",
    "4", "5", "6", "−",
    "1", "2", "3", "+",
    "+/-", "0", ".", "="
];

const scientificButtons = [
    "2nd", "π", "e", "CE", "⌫",
    "x²", "1/x", "|x|", "exp", "mod",
    "√x", "(", ")", "n!", "÷",
    "xʸ", "7", "8", "9", "×",
    "10ˣ", "4", "5", "6", "−",
    "log", "1", "2", "3", "+",
    "ln", "+/-", "0", ".", "="
];

const calculator = document.getElementById("calculator");

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
document.addEventListener("DOMContentLoaded", function() {

    changeMode("standard");
});

function changeToStandard(){
    // scientific.classList.remove("d-flex");
    // scientific.classList.add("d-none");
    // standard.classList.remove("d-none");
    // standard.classList.add("d-flex");
    deg.classList.remove("d-flex");
    deg.classList.add("d-none");
    trigo.classList.remove("d-flex");
    trigo.classList.add("d-none");
    changeMode("standard");
    mode.innerHTML = "Standard";
}
function changeToScientific(){
    // standard.classList.remove("d-flex");
    // standard.classList.add("d-none");
    // scientific.classList.remove("d-none");
    // scientific.classList.add("d-flex");
    deg.classList.add("d-flex");
    deg.classList.remove("d-none");
    trigo.classList.add("d-flex");
    trigo.classList.remove("d-none");
    changeMode("scientific")
    mode.innerHTML="Scientific";
}

let currDisplay = "0";
let storedValue = null;
let currOperator = null;
let shouldReset = false;

function updateDisplay(){
    valueDisplay.innerText = currDisplay;
}


document.addEventListener("click",(e)=>{
    const button = e.target.closest("button");
    if(!button) return;
    const val = button.innerText.trim();
    if(!val) return;
    handleinput(val); 
})

function appendDisplay(val){
       if (shouldReset) {
        currDisplay = val;
        shouldReset = false;
    } 
    else if(currDisplay==="0"){
        currDisplay=val;
    }
    else{
        currDisplay+=val;
    }
    updateDisplay();
}

function handleinput(val){
    if(!isNaN(val) || val=== "."){
        appendDisplay(val);
    }
    else if(["+","−","×","÷"].includes(val)){
        chooseOperator(val);
    }
    else if(val ==="CE"){
        clearEntry();
    }
    else if(val==="⌫"){
        backSpace();
    }
    else if(val==="C"){
        clearAll();
    }
    else if(val==="="){
        calculate();
    }
}

function backSpace(){
    if(currDisplay.length===1){
        currDisplay="0";
    }
    else{
        currDisplay=currDisplay.slice(0,-1)
    }
    updateDisplay();
}
function clearEntry(){
        currDisplay="0";
        updateDisplay();
}
function clearAll(){
    currDisplay = "0";
    currOperator = null;
    storedValue = null;
    updateDisplay();
}
function chooseOperator(op){
    if(currOperator!==null){
        calculate();
    }
    storedValue = currDisplay;
    currOperator=op;
    shouldReset = true;
}
function calculate(){
    if(currOperator === null || shouldReset) return;

    const curr = parseFloat(currDisplay);
    const prev = parseFloat(storedValue);
    let result;
    switch(currOperator){
        case "+":
        result = prev + curr;
        break;
         case "−":
        result = prev - curr;
        break;
         case "÷":
        result = prev / curr;
        break;
         case "×":
        result = prev * curr;
        break;
    }
    currDisplay = result.toString();
    storedValue = null;
    currOperator = null;
    shouldReset = true;
    updateDisplay();
}