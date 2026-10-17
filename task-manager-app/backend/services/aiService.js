const OpenAI = require("openai");

/**
 * AI Service for Practical 13: AI API Integration into a Web Application
 * Handles external AI API communication (OpenAI / Gemini)
 * with robust Graceful Degradation on network or authentication failures.
 */

// Heuristic keyword analysis for suggested priority
function inferPriority(title = "") {
  const lower = title.toLowerCase();
  if (
    lower.includes("urgent") ||
    lower.includes("critical") ||
    lower.includes("emergency") ||
    lower.includes("fix") ||
    lower.includes("bug") ||
    lower.includes("crash") ||
    lower.includes("security") ||
    lower.includes("deadline") ||
    lower.includes("asap")
  ) {
    return "high";
  }
  if (
    lower.includes("explore") ||
    lower.includes("research") ||
    lower.includes("read") ||
    lower.includes("cleanup") ||
    lower.includes("optional") ||
    lower.includes("trivial") ||
    lower.includes("minor")
  ) {
    return "low";
  }
  return "medium";
}

/**
 * High-quality fallback template generator used when external AI is unavailable
 * (e.g. invalid API key, offline network, quota exceeded, or missing key)
 */
function generateFallbackDescription(title = "") {
  const cleanTitle = title.trim();
  const lower = cleanTitle.toLowerCase();

  if (lower.includes("fix") || lower.includes("bug") || lower.includes("error")) {
    return `Investigate and troubleshoot "${cleanTitle}". Identify root cause, write regression tests, and apply code fix.`;
  }
  if (lower.includes("create") || lower.includes("build") || lower.includes("develop") || lower.includes("add")) {
    return `Implement feature "${cleanTitle}". Scaffold necessary components, integrate API endpoints, and verify behavior.`;
  }
  if (lower.includes("test") || lower.includes("verify") || lower.includes("qa")) {
    return `Design test cases for "${cleanTitle}". Execute end-to-end and unit validation, ensuring all edge cases pass.`;
  }
  if (lower.includes("deploy") || lower.includes("release")) {
    return `Prepare deployment for "${cleanTitle}". Review environment configurations, run pre-flight checks, and monitor release logs.`;
  }
  if (lower.includes("study") || lower.includes("read") || lower.includes("review")) {
    return `Review documentation and reference materials for "${cleanTitle}". Summarize key takeaways and action items.`;
  }

  return `Work on "${cleanTitle}": Outline core requirements, execute required implementation steps, and verify completed deliverables.`;
}

/**
 * Calls OpenAI API (gpt-4o-mini or gpt-3.5-turbo)
 */
async function callOpenAI(apiKey, title) {
  const client = new OpenAI({ apiKey });
  const prompt = `You are a concise task assistant. Write a short, actionable, single-sentence task description (maximum 30 words) for a task titled: "${title}". Do not include quotes or conversational preamble.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an assistant that generates concise, professional task descriptions."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 60,
    temperature: 0.7
  });

  const description = completion.choices[0]?.message?.content?.trim() || "";
  return description;
}

/**
 * Calls Google Gemini API (gemini-1.5-flash) via native fetch
 */
async function callGemini(apiKey, title) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const prompt = `Write a short, actionable, single-sentence task description (maximum 30 words) for a task titled: "${title}". Return plain text only.`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 60, temperature: 0.7 }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  return description;
}

/**
 * Main AI Generation Service with Graceful Degradation
 * @param {string} title - Task title
 * @param {Object} options - Override options (e.g. for testing invalid keys)
 */
async function generateTaskDescription(title, options = {}) {
  const suggestedPriority = inferPriority(title);
  const provider = options.provider || process.env.AI_PROVIDER || "openai";
  const openaiKey = options.apiKey || process.env.OPENAI_API_KEY;
  const geminiKey = options.apiKey || process.env.GEMINI_API_KEY;

  // Determine if a real, plausible API key is configured
  const hasOpenAI = openaiKey && !openaiKey.includes("your_") && openaiKey.trim().length > 10;
  const hasGemini = geminiKey && !geminiKey.includes("your_") && geminiKey.trim().length > 10;

  // If testing failure path or explicitly using a dummy/custom test key
  const isExplicitTestKey = options.apiKey && (options.apiKey.startsWith("sk-invalid") || options.apiKey.includes("test"));

  try {
    let generatedText = "";

    if (isExplicitTestKey) {
      // Intentionally trigger the real external API call with the invalid key
      // to demonstrate real 401 Unauthorized handling
      console.log(`[AI Service] Testing failure path with provided test key...`);
      generatedText = await callOpenAI(options.apiKey, title);
    } else if (provider === "gemini" && hasGemini) {
      console.log(`[AI Service] Calling Gemini API for title: "${title}"...`);
      generatedText = await callGemini(geminiKey, title);
    } else if (hasOpenAI) {
      console.log(`[AI Service] Calling OpenAI API (gpt-4o-mini) for title: "${title}"...`);
      generatedText = await callOpenAI(openaiKey, title);
    } else {
      // No active external key configured yet:
      // Graceful offline fallback behavior (non-crashing)
      console.warn(`[AI Service Info] No live API key configured in .env. Applying Graceful Fallback Template.`);
      return {
        success: true,
        description: generateFallbackDescription(title),
        suggestedPriority,
        fallback: true,
        source: "fallback-template",
        message: "Generated via local fallback template (Configure OPENAI_API_KEY in .env for live AI)"
      };
    }

    return {
      success: true,
      description: generatedText || generateFallbackDescription(title),
      suggestedPriority,
      fallback: false,
      source: provider === "gemini" ? "gemini-1.5-flash" : "openai-gpt-4o-mini",
      message: "Generated successfully by external AI model"
    };
  } catch (error) {
    // GRACEFUL DEGRADATION:
    // If the external AI service fails, times out, or rejects credentials,
    // catch the error, log diagnostic details, and return a fallback description
    // so the core Task Management application never crashes!
    console.error(`[AI Service Warning - Graceful Degradation Triggered]`);
    console.error(`Error details: ${error.message}`);

    const fallbackDescription = generateFallbackDescription(title);

    return {
      success: true,
      description: fallbackDescription,
      suggestedPriority,
      fallback: true,
      source: "fallback-template",
      warning: `External AI API failed (${error.message}). Graceful fallback applied automatically.`,
      errorDetail: error.message
    };
  }
}

module.exports = {
  generateTaskDescription,
  generateFallbackDescription,
  inferPriority
};
