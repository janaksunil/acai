chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message from content.js");
  if (request.action === "process_data") {
    const { email, ownerId, text } = request.data;
    const instruction = `Pretend you are a Chrome extension that detects if a user is using the wrong first name when sending an email. You have 3 inputs Receiver's email : ${email} , Owner ID (If applicable) :  ${ownerId},  Email body : ${text}". The email body should contain a phrase like Dear Name. Compare that Name with the first name in the receiver's email/Owner ID. Use your best judgment, if you think the name in the email body matches the first name in the receiver's email/name, return 1. if you think they don't match, return 0. Only alert the user if there is no possibility the first name is correct. Prioritize not disturbing the user. Respond with 1 or 0, and explain your reasoning. remember, 1 if names match, 0 if they dont`;

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
