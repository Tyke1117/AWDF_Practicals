const { generateTaskDescription, generateFallbackDescription, inferPriority } = require("../services/aiService");

/**
 * @desc    Generate AI task description & suggested priority based on task title
 * @route   POST /api/ai/generate-description
 * @access  Public
 */
exports.generateDescription = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { title, testApiKey, provider, maxTokens, temperature } = req.body;

    // Validation: Title is required
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Task title is required to generate an AI description.",
        fallback: false
      });
    }

    // Call AI service with options (supports testApiKey for simulating failure path)
    const result = await generateTaskDescription(title.trim(), {
      apiKey: testApiKey,
      provider: provider,
      maxTokens: maxTokens || 150,
      temperature: temperature !== undefined ? temperature : 0.7
    });

    const latencyMs = Date.now() - startTime;

    // Graceful response: always returns 200 with fallback flag as specified in Practical 13 Step 3
    res.status(200).json({
      ...result,
      latencyMs
    });
  } catch (error) {
    // Top-level safety catch (in case of unexpected runtime error)
    console.error(`[AI Controller Fatal Catch] ${error.message}`);
    const cleanTitle = req.body?.title || "New Task";
    res.status(200).json({
      success: true,
      description: generateFallbackDescription(cleanTitle),
      suggestedPriority: inferPriority(cleanTitle),
      fallback: true,
      errorTrapped: error.message,
      warning: "An unexpected error occurred. Fallback description provided.",
      latencyMs: Date.now() - startTime
    });
  }
};

/**
 * @desc    Simulate Third-Party Failure for Graceful Degradation Verification
 * @route   POST /api/ai/test-failure
 * @access  Public
 * Used for live resilience testing without requiring broken production credentials
 */
exports.simulateFailure = async (req, res) => {
  const startTime = Date.now();
  const title = req.body?.title || "Deploy Microservices to AWS with Docker";
  
  // Algorithmic Fallback Engine activates immediately
  const fallbackData = generateFallbackDescription(title);
  const priority = inferPriority(title);

  // Return HTTP 200 OK with graceful fallback payload (App NEVER crashes)
  res.status(200).json({
    success: true,
    description: fallbackData,
    suggestedPriority: priority,
    fallback: true,
    errorTrapped: "401 Unauthorized: Invalid OpenAI API Key simulated",
    notice: "External AI offline (Graceful fallback active)",
    source: "fallback-algorithmic-engine",
    latencyMs: Date.now() - startTime
  });
};

/**
 * @desc    Get AI configuration status & health
 * @route   GET /api/ai/status
 * @access  Public
 */
exports.getAIStatus = (req, res) => {
  const hasOpenAI = Boolean(
    process.env.OPENAI_API_KEY &&
    !process.env.OPENAI_API_KEY.includes("your_") &&
    process.env.OPENAI_API_KEY.length > 10
  );
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY &&
    !process.env.GEMINI_API_KEY.includes("your_") &&
    process.env.GEMINI_API_KEY.length > 10
  );

  res.status(200).json({
    success: true,
    status: "active",
    provider: process.env.AI_PROVIDER || "openai",
    model: "gpt-4o-mini",
    configured: hasOpenAI || hasGemini,
    openAIConfigured: hasOpenAI,
    geminiConfigured: hasGemini,
    rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE, 10) || 5,
    fallbackEnabled: true,
    securityIsolation: "server-side .env (Key never exposed to client)"
  });
};
