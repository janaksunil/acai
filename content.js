let alreadyCaptured = false;
let lastContent = "";
let recipientEmail = "";
let ownerId = "";
let capturedText = "";

// Function to log and store the email and owner ID
function logEmailAndOwnerId() {
  let elements = document.getElementsByClassName("aoD hl");
  if (!elements.length) {
    console.error('No elements with class "aoD hl" found.');
    return;
  }
  for (let i = 0; i < elements.length; i++) {
    let spans = elements[i].getElementsByTagName("span");
    if (!spans.length) {
      console.error('No "span" elements found within "aoD hl" element.');
      continue;
    }
    for (let j = 0; j < spans.length; j++) {
      let email = spans[j].getAttribute("email");
      let id = spans[j].textContent;
      if (email && id) {
        recipientEmail = email;
        ownerId = id;
        console.log(
          `Stored email and owner ID - Email: ${recipientEmail}, Owner ID: ${ownerId}`
        );
      } else {
        console.error('Email or owner ID not found in "span" element.');
      }
    }
  }
}

function checkForDearName(content) {
  if (content.length === 0) {
    alreadyCaptured = false;
  }

  if (alreadyCaptured) return;

  if (content.length >= 25) {
    capturedText = content.substring(0, 25);
    console.log(`Captured text of 25 characters: ${capturedText}`);
    alreadyCaptured = true;

    // Log and store the email and owner ID
    logEmailAndOwnerId();

    // Now you can send recipientEmail, ownerId, and capturedText together
    console.log(
      `All data - Email: ${recipientEmail}, Owner ID: ${ownerId}, Captured Text: ${capturedText}`
    );
    console.log("Sending message to background.js");
    chrome.runtime.sendMessage(
      {
        action: "process_data",
        data: {
          email: recipientEmail,
          ownerId: ownerId,
          text: capturedText,
        },
      },
      function (response) {
        if (response.gptResponse) {
          console.log(`GPT response: ${response.gptResponse}`);
          if (response.gptResponse === "0") {
            console.log("wrong names \n\n\n");
            window.alert(
              "Warning: The name in the email body does not match the receiver's email."
            );
          }
        } else {
          console.error("No response received from GPT.");
        }
      }
    );
  }
}

function initialize() {
  console.log("Script was initialized.");

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        let emailBodyElement = document.getElementsByClassName(
          "Am Al editable LW-avf tS-tW"
        );
        if (emailBodyElement.length > 0) {
          const emailTextArea = emailBodyElement[0];

          // Listen for input event
          emailTextArea.addEventListener("input", function (event) {
            const content = event.target.innerText || event.target.textContent;

            // If the content has changed, update it
            if (lastContent !== content) {
              lastContent = content;
              checkForDearName(content);
            }
          });

          // Stop observing once we've attached the event listener
          observer.disconnect();
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Run the initialize function when the content script is injected
initialize();
