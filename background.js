chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "log_owner_id_and_email"}, function(response) {
            console.log(response);
        });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "check_email") {
        let emailBody = request.emailBody;

        // Use a separate function to handle the email summarization
        handleEmailSummarization(emailBody, sendResponse);

        // Inform Chrome that we will use sendResponse asynchronously
        return true;
    }
});

const handleEmailSummarization = async (emailBody, sendResponse) => {
    try {
        let email_check = await generate(emailBody);

        if (email_check && email_check.content) {
            sendResponse({ email_check: email_check.content });
        } else {
            sendResponse({ error: 'No summary generated' });
        }
    } catch (error) {
        console.error("Detailed Error:", error);  // This will log more detailed error info
        sendResponse({ error: 'Error generating summary' });
    }
};

const generate = async (text) => {
    // Get your API key from storage
    const key = "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";
    const url = "https://api.openai.com/v1/chat/completions";

    console.log("generating completion...");

    const body = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
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
