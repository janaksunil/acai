// // content.js

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         if( request.action === "log_owner_id_and_email" ) {
//             let elements = document.getElementsByClassName('aoD hl');
//             if(!elements.length) {
//                 console.error('No elements with class "aoD hl" found.');
//                 return;
//             }
//             for(let i = 0; i < elements.length; i++) {
//                 let spans = elements[i].getElementsByTagName('span');
//                 if(!spans.length) {
//                     console.error('No "span" elements found within "aoD hl" element.');
//                     continue;
//                 }
//                 for(let j = 0; j < spans.length; j++) {
//                     let email = spans[j].getAttribute('email');
//                     let ownerId = spans[j].textContent; // Get the text content of the span
//                     if(email && ownerId) {
//                         console.log(`Here is the email and the owner ID - Email: ${email}, Owner ID: ${ownerId}`);
//                     } else {
//                         console.error('Email or owner ID not found in "span" element.');
//                         console.log(spans[j]); // Log the span element
//                     }
//                 }
//             }

//             // New code for getting the email body
//             let emailBodyElement = document.querySelector(".Am.Al.editable.LW-avf.tS-tW");
//             if (emailBodyElement) {
//                 let emailBody = emailBodyElement.innerText || emailBodyElement.textContent;
//                 console.log(`Email body content: ${emailBody}`);

//                 chrome.runtime.sendMessage({action: "check_email", emailBody: emailBody}, function(response) {
//                     console.log(response);
//                     if(response.email_check) {
//                         console.log(`Email summary: ${response.email_check}`);
//                     } else {
//                         console.error('No summary received from background.js');
//                     }
//                 });

//             } else {
//                 console.error('No elements with class "Am Al editable LW-avf tS-tW" found.');
//             }

//         } else {
//             console.error('Unexpected action:', request.action);
//         }
//     }
// );

// Function to check for "Dear [Name]" pattern in the email body.
// function checkForDearName(content) {
//   const pattern = /Dear\s+([\w\s]+),?/;
//   const match = content.match(pattern);

//   if (match && match[1]) {
//     const name = match[1].trim();
//     console.log(`Detected 'Dear [Name]' pattern. Name is: ${name}`);
//     // You can do more here, like comparing it with the recipient's name.
//   }
// }
// function checkForDearName(content) {
//   const pattern = /Dear\s.{1,100}/;
//   const match = content.match(pattern);

//   if (match && match[0]) {
//     const capturedText = match[0];
//     console.log(`Detected pattern. Captured text is: ${capturedText}`);
//     // Store the captured text in a final variable
//     const finalCapturedText = capturedText;
//     // You can do more here, like analyzing the captured text.
//   }

// }
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
  if (alreadyCaptured) return;

  if (content.length >= 50) {
    capturedText = content.substring(0, 50);
    console.log(`Captured text of 50 characters: ${capturedText}`);
    alreadyCaptured = true;

    // Log and store the email and owner ID
    logEmailAndOwnerId();

    // Now you can send recipientEmail, ownerId, and capturedText together
    console.log(
      `All data - Email: ${recipientEmail}, Owner ID: ${ownerId}, Captured Text: ${capturedText}`
    );
    // Insert your code here to send them somewhere
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
