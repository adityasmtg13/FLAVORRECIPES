import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

/* =========================
   INIT GEMINI
========================= */

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/* =========================
   SAFE RESPONSE EXTRACTOR
   (Fixes 500 error)
========================= */

const extractText = (result) => {
  const text =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    result?.response?.text?.() ||
    "";

  if (!text) {
    console.error("❌ Empty Gemini response:", result);
    throw new Error("Gemini returned empty response");
  }

  return text;
};

/* =========================
   JSON CLEANERS
========================= */

const cleanJSON = (text) => {
  try {
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("No JSON object detected");
    }

    return JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    console.error("❌ RAW GEMINI RESPONSE:\n", text);
    throw new Error("Invalid JSON returned from AI");
  }
};

const cleanJSONArray = (text) => {
  try {
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("No JSON array detected");
    }

    return JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    console.error("❌ RAW GEMINI RESPONSE:\n", text);
    throw new Error("Invalid JSON array returned from AI");
  }
};

/* =========================
   RECIPE GENERATION
========================= */

export const generateRecipe = async ({
  ingredients,
  dietary_restrictions = [],
  cuisine_type = "any",
  servings = 4,
  cooking_time = "medium",
}) => {
  // 🔥 prevents backend crashes
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("Ingredients must be a non-empty array");
  }

  const dietaryInfo =
    dietary_restrictions.length > 0
      ? `Dietary restrictions: ${dietary_restrictions.join(", ")}`
      : "No dietary restrictions";

  const timeGuide = {
    short: "under 30 minutes",
    medium: "30-60 minutes",
    long: "over 60 minutes",
  };

  const prompt = `
Generate a cooking recipe.

Ingredients Available: ${ingredients.join(", ")}
${dietaryInfo}
Cuisine type: ${cuisine_type}
Servings: ${servings}
Cooking time: ${timeGuide[cooking_time] || "any"}

Return ONLY valid JSON:

{
"name": "",
"description": "",
"cuisine_type": "",
"difficulty": "easy|medium|hard",
"prep_time": number,
"cook_time": number,
"servings": number,
"ingredients":[{"name":"","quantity":number,"unit":""}],
"instructions":["Step"],
"dietary_tags":[],
"nutrition":{
"calories":number,
"protein":number,
"carbs":number,
"fats":number,
"fiber":number
},
"cooking_tips":[]
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = extractText(result);

    console.log("✅ Gemini Recipe Response:\n", text);

    return cleanJSON(text);
  } catch (err) {
    console.error("❌ Gemini Recipe Error:", err);
    throw err; // IMPORTANT: don't hide real error
  }
};

/* =========================
   PANTRY SUGGESTIONS
========================= */

export const generatePantrySuggestions = async (
  pantryItems,
  expiringItems = []
) => {
  const ingredients = pantryItems.map((i) => i.name).join(", ");

  const prompt = `
Based on ingredients: ${ingredients}
Priority ingredients: ${expiringItems.join(", ")}

Return ONLY JSON array:
["Idea 1","Idea 2","Idea 3"]
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = extractText(result);

    console.log("✅ Pantry Suggestions:\n", text);

    return cleanJSONArray(text);
  } catch (err) {
    console.error("❌ Pantry AI Error:", err);
    throw err;
  }
};

/* =========================
   COOKING TIPS
========================= */

export const generateCookingTips = async (recipe) => {
  const ingredients =
    recipe.ingredients?.map((i) => i.name).join(", ") || "N/A";

  const prompt = `
Recipe: ${recipe.name}
Ingredients: ${ingredients}

Return ONLY JSON array:
["Tip 1","Tip 2","Tip 3"]
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = extractText(result);

    console.log("✅ Cooking Tips:\n", text);

    return cleanJSONArray(text);
  } catch (err) {
    console.error("❌ Cooking Tips AI Error:", err);
    throw err;
  }
};

export default {
  generateRecipe,
  generatePantrySuggestions,
  generateCookingTips,
};