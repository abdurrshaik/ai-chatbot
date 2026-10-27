document.addEventListener("DOMContentLoaded", function () {
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
const newChatBtn = document.getElementById("newChatBtn");


console.log("AI CHATBOT LOADED SUCCESSFULLY");

if (!form || !input || !messages) {
    console.error("ERROR: HTML elements were not found!");
    return;
}

const API_URL = "https://my-ai-chatbot-api.abdurrshaik.workers.dev/";

function displayMessage(text, type) {
    const message = document.createElement("div");
    message.classList.add("message");

    if (type === "user") {
        message.classList.add("user-message");
    } else {
        message.classList.add("bot-message");
    }

    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;

    return message;
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const text = input.value.trim();

    if (text === "") {
        return;
    }

    const welcome = document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }

    displayMessage(text, "user");

    input.value = "";
    input.focus();

    const reply = displayMessage("Thinking...", "bot");

    const sendButton = form.querySelector('button[type="submit"]');

    if (sendButton) {
        sendButton.disabled = true;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "The AI service could not answer."
            );
        }

        if (typeof data.reply !== "string" || !data.reply.trim()) {
            throw new Error("The AI returned an empty response.");
        }

        reply.textContent = data.reply;

    } catch (error) {
        console.error("AI CHATBOT ERROR:", error);

        reply.textContent =
            "Sorry, I couldn't connect to the AI service. " +
            "Please try again. If the problem continues, the API " +
            "may need troubleshooting.";

    } finally {
        if (sendButton) {
            sendButton.disabled = false;
        }

        messages.scrollTop = messages.scrollHeight;
        input.focus();
    }
});

if (newChatBtn) {
    newChatBtn.addEventListener("click", function () {
        messages.innerHTML = "";

        const welcome = document.createElement("div");
        welcome.className = "welcome";
        welcome.id = "welcome";

        const heading = document.createElement("h1");
        heading.textContent = "Welcome to AI Chatbot";

        const paragraph = document.createElement("p");
        paragraph.textContent = "Ask a question to get started.";

        welcome.appendChild(heading);
        welcome.appendChild(paragraph);
        messages.appendChild(welcome);

        input.value = "";
        input.focus();
    });
}


});
