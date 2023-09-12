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
            { role: "system", content: "Pretend you are a Chrome extension that detects if a user is using the wrong first name when sending an email. You have 3 inputs. Receiver's email, and Owner's ID (If applicable) : Email body : Dear Shubh, How are you doing? Use your best judgment, if you think the first name is correct return 1, if you think the user has to be alerted respond with 0, only alert the user if there is no possibility the firs tname is correct. Prioritize not disturbing the user. Make sure the default assumes the first name is correct, only overturn the default when there is a glaring mistake. Respond with only 1 and 0 no other text."},
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
