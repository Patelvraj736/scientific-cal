//construnctor func
export function CalcMath(degreeMode) {
    this.degreeMode = degreeMode;
}

//adding func to prototype 
CalcMath.prototype.convertToRad = function (num) {
    return this.degreeMode ? num * (Math.PI / 180) : num;
};

CalcMath.prototype.convertToDeg = function (num) {
    return this.degreeMode ? num * (180 / Math.PI) : num;
};

CalcMath.prototype.square = function (n) {
     return n ** 2; 
    };
CalcMath.prototype.cube = function (n) { 
    return n ** 3; 
};
CalcMath.prototype.squareRoot = function (n) { 
    return n < 0 ? null : Math.sqrt(n); 
};
CalcMath.prototype.cubeRoot = function (n) {
     return Math.cbrt(n); 
    };
CalcMath.prototype.reciprocal = function (n) { 
    return n === 0 ? null : 1 / n; 
};
CalcMath.prototype.abs = function (n) {
     return Math.abs(n); 
    };
CalcMath.prototype.floor = function (n) { 
    return Math.floor(n); 
};
CalcMath.prototype.ceil = function (n) { 
    return Math.ceil(n); 
};
CalcMath.prototype.eToThePower = function (n) { 
    return Math.exp(n); 
};
CalcMath.prototype.tenToThePower = function (n) { 
    return Math.pow(10, n); 
};
CalcMath.prototype.twoToThePower = function (n) { 
    return Math.pow(2, n); 
};
CalcMath.prototype.log = function (n) { 
    return n <= 0 ? null : Math.log10(n); 
};
CalcMath.prototype.naturalLog = function (n) { 
    return n <= 0 ? null : Math.log(n); 
};
CalcMath.prototype.nthRoot = function (num, root) { 
    return Math.pow(num, 1 / root); 
};

CalcMath.prototype.logBaseY = function (num, base) {
    if (num <= 0 || base <= 0 || base === 1) return null;
    return Math.log(num) / Math.log(base);
};

CalcMath.prototype.factorial = function (n) {
    if (n < 0 || !Number.isInteger(n)) return null;
    let ans = 1;
    for (let i = 2; i <= n; i++) ans *= i;
    return ans;
};

// trig func and its inverse
CalcMath.prototype.trig = function (type, num, inverse) {
    const trigFunctions = {
        sin: [Math.sin, Math.asin],
        cos: [Math.cos, Math.acos],
        tan: [Math.tan, Math.atan],
        sec: [x => 1 / Math.cos(x), x => Math.acos(1 / x)],
        csc: [x => 1 / Math.sin(x), x => Math.asin(1 / x)],
        cot: [x => 1 / Math.tan(x), x => Math.atan(1 / x)],
    };

    if (!trigFunctions[type]) return null;

    if (!inverse) {
        return trigFunctions[type][0](this.convertToRad(num));
    }
    return this.convertToDeg(trigFunctions[type][1](num));
};

CalcMath.prototype.toDMS = function (decimal) {
    if (isNaN(decimal)) return null;
    const deg = Math.trunc(decimal);
    const minFloat = Math.abs((decimal - deg) * 60);
    const min = Math.trunc(minFloat);
    const sec = ((minFloat - min) * 60).toFixed(2);
    return `${deg}° ${min}' ${sec}"`;
};

CalcMath.prototype.DMSToDecimal = function (str) {
    const match = str.match(/(-?\d+)°\s*(\d+)'?\s*(\d+(\.\d+)?)?/);
    if (!match) return null;
    return parseFloat(match[1]) + (parseFloat(match[2]) || 0) / 60 + (parseFloat(match[3]) || 0) / 3600;
};
//exp check 
export function checkExpression(expr) {
    if (!/^[0-9+\-*/%.()\s]+$/.test(expr)) return false;
    let open = 0;
    for (const ch of expr) {
        if (ch === "(") open++;
        if (ch === ")") open--;
        if (open < 0) return false;
    }
    return open === 0;
}
