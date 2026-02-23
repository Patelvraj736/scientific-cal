//closures
export function setupHistory() {
    const str = "calcHistory";

    function getSaved() {
        return JSON.parse(localStorage.getItem(str)) || [];
    }

    return {
        addEntry(expression, result) {
            const allHistory = getSaved();
            allHistory.push({ expression, result });
            localStorage.setItem(str, JSON.stringify(allHistory));
            this.showHistory();
        },

        deleteAll() {
            localStorage.removeItem(str);
            this.showHistory();
        },
        showHistory() {
            const box = document.getElementById("history-panel");
            const clearBtn = document.querySelector(".clear-history-btn");
            if (!box) return;

            const allHistory = getSaved();
            box.innerHTML = "";

            if (allHistory.length === 0) {
                if (clearBtn) { clearBtn.style.opacity = "0"; clearBtn.style.pointerEvents = "none"; }
                box.innerHTML = "<div class='text-secondary text-end p-2'>No history yet</div>";
                return;
            }

            if (clearBtn) { clearBtn.style.opacity = "1"; clearBtn.style.pointerEvents = "auto"; }

            allHistory.forEach(item => {
                const row = document.createElement("div");
                row.className = "history-item mb-2";
                row.innerHTML = `
                    <div class="operation text-secondary text-end">${item.expression}</div>
                    <div class="history-result text-end fw-bold">${item.result}</div>
                `;
                box.prepend(row);
            });
        }
    };
}

export function setupMemory() {
    let savedNumbers = [];

    function refreshMemoryPanel() {
        const panel = document.getElementById("memory-panel");
        if (!panel) return;
        panel.innerHTML = "";

        if (savedNumbers.length === 0) {
            panel.innerHTML = "<div class='text-secondary text-end p-2'>No memory yet</div>";
            return;
        }

        savedNumbers.forEach(val => {
            const item = document.createElement("div");
            item.className = "text-end fw-bold p-2 border-bottom";
            item.innerText = val;
            panel.prepend(item);
        });
    }

    return {
        clearMemory() {
             savedNumbers = []; 
             refreshMemoryPanel(); 
            },

        getLastValue() { 
            return savedNumbers.length > 0 ? savedNumbers[savedNumbers.length - 1] : null; 
        },

        addToMemory(val) {
            savedNumbers.length === 0 ? savedNumbers.push(val) : (savedNumbers[savedNumbers.length - 1] += val);
            refreshMemoryPanel();
        },

        subtractFromMemory(val) {
            savedNumbers.length === 0 ? savedNumbers.push(-val) : (savedNumbers[savedNumbers.length - 1] -= val);
            refreshMemoryPanel();
        },
        saveToMemory(val) { 
            savedNumbers.push(val); 
            refreshMemoryPanel(); 
        },

        refreshMemoryPanel
    };
}
