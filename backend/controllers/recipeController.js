import Groq from "groq-sdk";

export const buildRecipeFromIngredients = (ingredients) => {
  const items = ingredients
    .split(/[,\n]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (items.length === 0) {
    return "Please enter at least one ingredient to generate a recipe.";
  }

  const list = items.join(", ");
  const mainIngredient = items[0];
  const secondaryIngredients = items.slice(1).join(", ");

  const lower = items.join(" ");
  const hasEgg = lower.includes("egg") || lower.includes("eggs");
  const hasRice = lower.includes("rice");
  const hasPasta = lower.includes("pasta") || lower.includes("noodle") || lower.includes("noodles");
  const hasPotato = lower.includes("potato") || lower.includes("potatoes");
  const hasChicken = lower.includes("chicken");
  const hasTomato = lower.includes("tomato") || lower.includes("tomatoes");
  const hasCheese = lower.includes("cheese");
  const hasButter = lower.includes("butter");
  const hasBread = lower.includes("bread");

  let title = `${mainIngredient} Stir-Fry`;
  let style = "stir-fry";
  let steps = [
    "Heat a pan with a little oil.",
    "Add the ingredients and cook until softened and fragrant.",
    "Season with salt, pepper, garlic, or your favorite spices.",
    "Serve warm with rice, bread, or noodles if you have them."
  ];

  if (hasEgg && hasRice) {
    title = `${mainIngredient} Fried Rice`;
    style = "fried rice";
    steps = [
      "Cook the rice until fluffy and slightly cooled.",
      "Scramble the egg in the pan, then add the remaining ingredients.",
      "Stir everything together with soy sauce or seasoning.",
      "Serve hot and enjoy."
    ];
  } else if (hasPasta) {
    title = `${mainIngredient} Pasta`;
    style = "pasta";
    steps = [
      "Boil the pasta until tender.",
      "Cook the other ingredients in a pan with oil or butter.",
      "Mix everything together with a little sauce or seasoning.",
      "Serve hot with grated cheese if available."
    ];
  } else if (hasPotato) {
    title = `${mainIngredient} Potato Skillet`;
    style = "skillet";
    steps = [
      "Cook the potatoes first until golden and tender.",
      "Add the other ingredients and saute until fragrant.",
      "Season well and finish with herbs or cheese.",
      "Serve warm as a hearty meal."
    ];
  } else if (hasChicken) {
    title = `${mainIngredient} Chicken Bowl`;
    style = "bowl";
    steps = [
      "Cook the chicken until fully done.",
      "Add the vegetables and aromatics to the pan.",
      "Toss everything together and season well.",
      "Serve with rice or bread."
    ];
  } else if (hasTomato && hasBread) {
    title = `${mainIngredient} Toasted Sandwich`;
    style = "sandwich";
    steps = [
      "Toast the bread until crisp.",
      "Cook the tomato and other ingredients briefly.",
      "Layer everything onto the bread and add seasoning.",
      "Serve warm and crunchy."
    ];
  } else if (hasCheese && hasButter) {
    title = `${mainIngredient} Buttered Cheese Dish`;
    style = "buttered dish";
    steps = [
      "Melt the butter in a pan.",
      "Add the ingredients and cook gently.",
      "Finish with cheese for a rich, creamy taste.",
      "Serve immediately while warm."
    ];
  }

  return `Recipe Idea: ${title}\n\nIngredients: ${list}.\n\nSteps:\n1. ${steps[0]}\n2. ${steps[1]}\n3. ${steps[2]}\n4. ${steps[3]}\n\nThis ${style} is quick, flexible, and made around the ingredients you listed.`;
};

export const generateRecipe = async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || typeof ingredients !== "string") {
      return res.status(400).json({ error: "Please enter at least one ingredient." });
    }

    const cleanIngredients = ingredients.trim();

    if (!cleanIngredients) {
      return res.status(400).json({ error: "Please enter at least one ingredient." });
    }

    if (process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a professional chef. Create highly realistic, delicious, and well-structured recipes based on the user's ingredients (you may assume basic pantry staples are available). Always format your response in beautiful Markdown with these sections:\n\n# [Recipe Name]\n\n*[Appetizing description]*\n\n**Prep Time:** ... | **Cook Time:** ... | **Servings:** ...\n\n### Ingredients\n- [Precise measurements and ingredients]\n\n### Instructions\n1. [Step-by-step instructions]\n\n### Chef's Tips\n- [Optional pro tips]"
          },
          {
            role: "user",
            content: `Ingredients available: ${cleanIngredients}`,
          },
        ],
      });

      const recipeText = completion?.choices?.[0]?.message?.content?.trim();

      return res.json({
        recipe: recipeText || buildRecipeFromIngredients(cleanIngredients),
        source: "Groq AI (LLaMA 3.1)",
      });
    }

    return res.json({
      recipe: buildRecipeFromIngredients(cleanIngredients),
      source: "Local fallback",
    });
  } catch (error) {
    return res.status(500).json({
      error: "AI generation failed",
      details: error.message,
    });
  }
};