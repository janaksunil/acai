chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message from content.js");
  if (request.action === "process_data") {
    const { email, ownerId, text } = request.data;
    const instruction = `Review the given details:

    Email: ${email}
    Reliable source: Owner ID ${ownerId}
    Message text: ${text}
    Steps:
    
    Always use the Owner ID first for the primary name. Only if it's unclear, use the email.
    Spot the name right after greetings in ${text}.
    Now, decide:
    If the spotted name and primary name are the same or it's a recognized nickname, return 1.
    If the spotted name could be initials of the primary name, return 1.
    If the spotted name is a logical abbreviation of the primary name, return 1.
    If the spotted name is clearly different from the primary name and none of the above conditions apply, return 0.
    Your goal: If certain of a mismatch, return 0. If unsure or a match, return 1. Be clear in detecting mismatches.
    Only respond 0 if ther is a clear mistmatch or typo, otherwise deffault to 1.Respond with a single number.
    `;

    // Call the GPT function
    generate(instruction).then((response) => {
      // Send the response back to content.js
      console.log(`GPT response: ${response.content}`);
      sendResponse({ gptResponse: response.content });
    });

    // Return true to indicate that we will send the response asynchronously
    return true;
  }
});

const generate = async (text) => {
  // Get your API key from storage
  const key = "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";
  const url = "https://api.openai.com/v1/chat/completions";

  console.log("generating completion...");

  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. Use your best judgement to answer my query. Make sure to be incredibly concise.",
      },
      { role: "user", content: text },
    ],
  };

  const completionResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!completionResponse.ok) {
    throw new Error(`API returned status: ${completionResponse.status}`);
  }

  const completion = await completionResponse.json();
  return completion.choices[0].message;
};
