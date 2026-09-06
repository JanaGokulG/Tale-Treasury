import Groq from "groq-sdk";

export const generateStoryStream = async (req, res) => {
  const { systemPrompt, messages } = req.body;

  // Validate request body
  if (!systemPrompt) {
    return res.status(400).json({ error: "systemPrompt is required" });
  }

  const abortController = new AbortController();
  
  // Abort Groq stream if client disconnects
  req.on("close", () => {
    abortController.abort();
  });

  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Write SSE headers and flush them immediately
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });
    res.flushHeaders();

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []),
    ];

    const stream = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      max_tokens: 1200,
      stream: true,
    }, {
      signal: abortController.signal,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ token: content })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    // Avoid double-logging client aborts as exceptions if they are normal closures
    if (error.name === "AbortError" || abortController.signal.aborted) {
      console.log("Groq generation stream was aborted by client disconnect.");
      res.end();
      return;
    }

    console.error("Groq generation error:", error);

    // If headers haven't been sent yet (e.g. initial connection failed), write them
    if (!res.headersSent) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });
      res.flushHeaders();
    }

    if (error.status === 429) {
      res.write(`data: ${JSON.stringify({
        error: "rate_limited",
        message: "The story engine is catching its breath. Try again in a moment!"
      })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({
        error: "generation_failed",
        message: "The magic quill slipped. Please try again."
      })}\n\n`);
    }
    res.end();
  }
};
