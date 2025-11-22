const resultInput = document.getElementById("result");
const historyDiv = document.getElementById("history");
const buttons = document.querySelectorAll(".btn");

const toggleHistory = document.getElementById("toggleHistory");
const historyPanel = document.getElementById("historyPanel");
const historyBack = document.getElementById("historyBack");
const clearHistory = document.getElementById("clearHistory");
const historyList = document.getElementById("historyList");

const degBtn = document.getElementById("degBtn");
const radBtn = document.getElementById("radBtn");
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

let angleMode = "DEG";
let historyData = [];

/* ---------- THEME TOGGLE ---------- */
themeToggle.addEventListener("click", () => {
  const isDark = body.classList.contains("theme-dark");
  body.classList.toggle("theme-dark", !isDark);
  body.classList.toggle("theme-light", isDark);
  themeToggle.textContent = isDark ? "☀️" : "🌙";
});

/* ---------- HISTORY PANEL ---------- */
toggleHistory.onclick = () => {
  historyPanel.classList.add("active");
};

historyBack.onclick = () => {
  historyPanel.classList.remove("active");
};

clearHistory.onclick = () => {
  historyData = [];
  renderHistory();
};

function addToHistory(expr, ans) {
  historyData.unshift({ expr, ans });
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";

  historyData.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div>${item.expr}</div>
      <div>= <strong>${item.ans}</strong></div>
    `;
    div.onclick = () => {
      resultInput.value = item.ans;
      historyPanel.classList.remove("active");
    };
    historyList.appendChild(div);
  });
}

/* ---------- ANGLE MODE ---------- */
degBtn.onclick = () => {
  angleMode = "DEG";
  degBtn.classList.add("active");
  radBtn.classList.remove("active");
};

radBtn.onclick = () => {
  angleMode = "RAD";
  radBtn.classList.add("active");
  degBtn.classList.remove("active");
};

function toRadians(x) {
  return (x * Math.PI) / 180;
}

/* ---------- DISPLAY HELPER ---------- */
function appendToDisplay(val) {
  resultInput.value += val;
}

/* ---------- EXPRESSION EVALUATION ---------- */
function evaluateExpression(expr) {
  try {
    let replaced = expr;
    replaced = replaced.replace(/\^/g, "**");
    replaced = replaced.replace(/÷/g, "/").replace(/×/g, "*");
    replaced = replaced.replace(/π/g, "Math.PI");
    replaced = replaced.replace(/\be\b/g, "Math.E");
    replaced = replaced.replace(/√\(/g, "Math.sqrt(");

    // Wrap trig/log
    replaced = replaced.replace(/(sin|cos|tan|log|ln)(\d+(\.\d+)?)/g, "$1($2)");

    replaced = replaced.replace(/sin\(/g, "SIN(");
    replaced = replaced.replace(/cos\(/g, "COS(");
    replaced = replaced.replace(/tan\(/g, "TAN(");
    replaced = replaced.replace(/log\(/g, "Math.log10(");
    replaced = replaced.replace(/ln\(/g, "Math.log(");

    function SIN(x) {
      return Math.sin(angleMode === "DEG" ? toRadians(x) : x);
    }
    function COS(x) {
      return Math.cos(angleMode === "DEG" ? toRadians(x) : x);
    }
    function TAN(x) {
      return Math.tan(angleMode === "DEG" ? toRadians(x) : x);
    }

    const fn = new Function(
      "SIN",
      "COS",
      "TAN",
      `"use strict"; return (${replaced});`
    );
    const result = fn(SIN, COS, TAN);
    return Number.isFinite(result) ? +result.toPrecision(12) : "Error";
  } catch {
    return "Error";
  }
}

/* ---------- BUTTON HANDLING ---------- */
buttons.forEach((btn) => {
  btn.onclick = () => {
    const val = btn.dataset.value;
    const action = btn.dataset.action;
    const func = btn.dataset.func;

    if (val) appendToDisplay(val);
    else if (func) appendToDisplay(func + "(");
    else if (action) handleAction(action);
  };
});

function handleAction(action) {
  if (action === "clear") {
    resultInput.value = "";
    historyDiv.textContent = "";
    return;
  }

  if (action === "backspace") {
    resultInput.value = resultInput.value.slice(0, -1);
    return;
  }

  if (action === "equals") {
    const expr = resultInput.value;
    const ans = evaluateExpression(expr);
    historyDiv.textContent = expr ? expr + " =" : "";
    resultInput.value = ans;
    if (ans !== "Error" && expr.trim() !== "") addToHistory(expr, ans);
    return;
  }

  if (action === "negate") {
    if (!resultInput.value) return;
    const v = resultInput.value;
    if (!isNaN(Number(v))) {
      resultInput.value = String(-Number(v));
    } else {
      resultInput.value = "-(" + v + ")";
    }
  }
}
