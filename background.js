chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message from content.js");
  if (request.action === "process_data") {
    const { email, ownerId, text } = request.data;
    const instruction = `Given the Receiver's email: ${email}, Owner ID (if applicable): ${ownerId}, and Email body: ${text}, please determine the following: 1. Extract the most likely first name or initials from the Receiver's email and Owner ID. Identify the name or initials in the 'Dear [Name]' or similar greeting in the email body. If the name or initials from the email/Owner ID absolutely do not match the name in the email body, return 0. If there's a possibility that they match or there's any ambiguity, return 1. If the email or Owner ID consists of initials or an abbreviation, exercise extreme caution in determining a mismatch. Avoid false positives at all costs; it's better not to alert if unsure. Respond only with 1 or 0, where 1 indicates a possible match or ambiguity and 0 indicates a definite mismatch.Respond with only 1 or 0,nothing else`;

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
