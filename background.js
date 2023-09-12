chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "log_owner_id_and_email"}, function(response) {
            console.log(response);
        });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message from content.js");
    if (request.action === "process_data") {
      const { email, ownerId, text } = request.data;
      const instruction = `Pretend you are a Chrome extension that detects if a user is using the wrong first name when sending an email. You have 3 inputs Receiver's email : ${email} , Owner ID (If applicable) :  ${ownerId},  Email body : ${text}". Use your best judgment, if you think the first name is correct return 1, if you think the user has to be alerted respond with 0, only alert the user if there is no possibility the first name is correct. Prioritize not disturbing the user. Respond with only 1 and 0 no other text.`

  
      // Call the GPT function
      generate(instruction).then(response => {
        // Send the response back to content.js
        console.log(`GPT response: ${response}`);
        sendResponse({ gptResponse: response });
      });
  
      // Return true to indicate that we will send the response asynchronously
      return true;
    }
  });

// const handleEmailSummarization = async (emailBody, sendResponse) => {
//     try {
//         let email_check = await generate(emailBody);

//         if (email_check && email_check.content) {
//             sendResponse({ email_check: email_check.content });
//         } else {
//             sendResponse({ error: 'No summary generated' });
//         }
//     } catch (error) {
//         console.error("Detailed Error:", error);  // This will log more detailed error info
//         sendResponse({ error: 'Error generating summary' });
//     }
// };

const generate = async (text) => {
    // Get your API key from storage
    const key = "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";
    const url = "https://api.openai.com/v1/chat/completions";

    console.log("generating completion...");

    const body = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant. Use your best judgement to answer my query. Make sure to be incredibly concise." },
            { role: "user", content: text }
        ]
    };

    const completionResponse = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`
        },
        body: JSON.stringify(body)
    });

    if (!completionResponse.ok) {
        throw new Error(`API returned status: ${completionResponse.status}`);
    }

    const completion = await completionResponse.json();
    return completion.choices[0].message;
};
