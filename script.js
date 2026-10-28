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

// Display a message in the chat.
function displayMessage(text, type) {
    const message = document.createElement("div");
    message.classList.add("message");

    if (type === "user") {
        message.classList.add("user-message");
        // Preserve line breaks in the user's message safely.
        message.textContent = text;
    } else {
        message.classList.add("bot-message");

        // Format the AI's Markdown response safely.
        if (
            typeof marked !== "undefined" &&
            typeof DOMPurify !== "undefined"
        ) {
            message.innerHTML = DOMPurify.sanitize(
                marked.parse(text)
            );
        } else {
            message.textContent = text;
            console.error("Markdown libraries did not load.");
        }
    }

    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;

    return message;
}

// Automatically grow the textarea as the user types.
function resizeInput() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 180) + "px";
}

input.addEventListener("input", resizeInput);

// Enter sends. Shift + Enter adds a new line.
input.addEventListener("keydown", function (event) {
    if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.isComposing
    ) {
        event.preventDefault();

        if (typeof form.requestSubmit === "function") {
            form.requestSubmit();
        }
    }
});

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

    // Display the user's message, preserving code line breaks.
    displayMessage(text, "user");

    input.value = "";
    resizeInput();
    input.focus();

    const reply = displayMessage("Thinking...", "bot");
    const sendButton = form.querySelector('button[type="submit"]');

    if (sendButton) {
        sendButton.disabled = true;
    }

    input.disabled = true;

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

        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error(
                "Invalid server response:",
                response.status,
                responseText
            );

            throw new Error(
                response.status === 524
                    ? "The AI service took too long to respond. Please try again later."
                    : `The server returned an invalid response (HTTP ${response.status}). Please try again.`
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                `The AI service returned HTTP ${response.status}.`
            );
        }

        if (
            typeof data.reply !== "string" ||
            !data.reply.trim()
        ) {
            throw new Error("The AI returned an empty response.");
        }

        // Render the AI response with safe Markdown formatting.
        if (
            typeof marked !== "undefined" &&
            typeof DOMPurify !== "undefined"
        ) {
            reply.innerHTML = DOMPurify.sanitize(
                marked.parse(data.reply)
            );
        } else {
            reply.textContent = data.reply;
        }
    } catch (error) {
        console.error("AI CHATBOT ERROR:", error);

        reply.textContent =
            error.message ||
            "Sorry, I couldn't connect to the AI service. Please try again.";
    } finally {
        if (sendButton) {
            sendButton.disabled = false;
        }

        input.disabled = false;
        messages.scrollTop = messages.scrollHeight;
        input.focus();
    }
});

// Start a new chat.
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
        resizeInput();
        input.focus();
    });
}


});
