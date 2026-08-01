const API_URL = "/api/recipe/generate";

// ── DOM refs ──────────────────────────────────────────────
const input       = document.getElementById("ingredientsInput");
const generateBtn = document.getElementById("generateBtn");
const loadingCard = document.getElementById("loadingCard");
const recipeCard  = document.getElementById("recipeCard");
const errorCard   = document.getElementById("errorCard");
const recipeContent = document.getElementById("recipeContent");
const errorMessage  = document.getElementById("errorMessage");

// ── Chip fill ─────────────────────────────────────────────
function addChip(value) {
  input.value = value;
  input.focus();
}

// ── Generate Recipe ───────────────────────────────────────
async function generateRecipe() {
  const ingredients = input.value.trim();

  if (!ingredients) {
    shakingInput();
    return;
  }

  showState("loading");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.error || "Server returned an error");
    }

    displayRecipe(data.recipe || "No recipe was returned.");
    showState("recipe");

  } catch (err) {
    if (err.message === "Failed to fetch") {
      errorMessage.textContent = "Cannot reach the backend. Make sure it is running on port 4000.";
    } else {
      errorMessage.textContent = err.message;
    }
    showState("error");
  }
}

// ── Display recipe with markdown rendering ─────────
function displayRecipe(text) {
  if (typeof marked !== "undefined") {
    recipeContent.innerHTML = marked.parse(text);
  } else {
    // Fallback if marked didn't load
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    let html = escaped
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      .replace(/^#{1,3}\s+(.+)$/gm, "<strong>$1</strong>")
      .replace(/^Steps:/gm, "<strong>Steps:</strong>")
      .replace(/^Ingredients:/gm, "<strong>Ingredients:</strong>")
      .replace(/\n/g, "<br/>");
    recipeContent.innerHTML = html;
  }
}

// ── UI States ─────────────────────────────────────────────
function showState(state) {
  loadingCard.classList.add("hidden");
  recipeCard.classList.add("hidden");
  errorCard.classList.add("hidden");

  if (state === "loading") {
    generateBtn.disabled = true;
    loadingCard.classList.remove("hidden");
  } else if (state === "recipe") {
    generateBtn.disabled = false;
    recipeCard.classList.remove("hidden");
  } else if (state === "error") {
    generateBtn.disabled = false;
    errorCard.classList.remove("hidden");
  } else {
    generateBtn.disabled = false;
  }
}

// ── Copy to clipboard ─────────────────────────────────────
function copyRecipe() {
  const text = recipeContent.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.textContent = "✅ Copied!";
    setTimeout(() => { btn.textContent = "📋 Copy"; }, 2000);
  });
}

// ── Try Again ─────────────────────────────────────────────
function tryAgain() {
  showState("none");
  input.focus();
}

// ── Shake input on empty submit ───────────────────────────
function shakingInput() {
  const wrapper = document.querySelector(".input-wrapper");
  wrapper.style.animation = "shake 0.4s ease";
  wrapper.style.borderColor = "#ff6b6b";
  setTimeout(() => {
    wrapper.style.animation = "";
    wrapper.style.borderColor = "";
  }, 500);
}

// Inject shake keyframe dynamically
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-5px); }
    80%       { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);

// ── Enter key support ─────────────────────────────────────
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    generateRecipe();
  }
});

generateBtn.addEventListener("click", generateRecipe);
