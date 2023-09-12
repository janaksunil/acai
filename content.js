// content.js

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.action === "log_owner_id_and_email" ) {
            let elements = document.getElementsByClassName('aoD hl');
            if(!elements.length) {
                console.error('No elements with class "aoD hl" found.');
                return;
            }
            for(let i = 0; i < elements.length; i++) {
                let spans = elements[i].getElementsByTagName('span');
                if(!spans.length) {
                    console.error('No "span" elements found within "aoD hl" element.');
                    continue;
                }
                for(let j = 0; j < spans.length; j++) {
                    let email = spans[j].getAttribute('email');
                    let ownerId = spans[j].textContent; // Get the text content of the span
                    if(email && ownerId) {
                        console.log(`Here is the email and the owner ID - Email: ${email}, Owner ID: ${ownerId}`);
                    } else {
                        console.error('Email or owner ID not found in "span" element.');
                        console.log(spans[j]); // Log the span element
                    }
                }
            }

            // New code for getting the email body
            let emailBodyElement = document.querySelector(".Am.Al.editable.LW-avf.tS-tW");
            if (emailBodyElement) {
                let emailBody = emailBodyElement.innerText || emailBodyElement.textContent;
                console.log(`Email body content: ${emailBody}`);

                chrome.runtime.sendMessage({action: "check_email", emailBody: emailBody}, function(response) {
                    console.log(response);
                    if(response.email_check) {
                        console.log(`Email summary: ${response.email_check}`);
                    } else {
                        console.error('No summary received from background.js');
                    }
                });

            } else {
                console.error('No elements with class "Am Al editable LW-avf tS-tW" found.');
            }


        } else {
            console.error('Unexpected action:', request.action);
        }
    }
);