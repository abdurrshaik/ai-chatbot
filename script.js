document.addEventListener("DOMContentLoaded", function () {
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
const newChatBtn = document.getElementById("newChatBtn");


console.log("SCRIPT LOADED SUCCESSFULLY");

if (!form || !input || !messages) {
    console.error("ERROR: HTML elements were not found!");
    return;
}

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

form.addEventListener("submit", function (event) {
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

    setTimeout(function () {
        const question = text.toLowerCase();
        let answer;

        if (/^(hi|hello|hey)[!. ]*$/.test(question)) {
            answer = "Hello! 👋 Welcome to AI Chatbot. How can I help you?";
        } else if (question.includes("how are you")) {
            answer = "I'm working correctly! 😊 What would you like to learn today?";
        } else if (question.includes("your name")) {
            answer = "I'm AI Chatbot, your virtual assistant!";
        } else if (question.includes("python")) {
            answer = "Python is a programming language used in AI, automation, and web development.";
        } else if (question.includes("what is ai") || question.includes("artificial intelligence")) {
            answer = "Artificial Intelligence (AI) enables computers to perform tasks that usually require human intelligence.";
        } else if (question.includes("thank")) {
            answer = "You're welcome! 😊";
        } else {
            answer = "Your message was received: " + text +
                "\n\nI'm currently running in demo mode. To answer this question intelligently, I need to be connected to a real AI service.";
        }

        reply.textContent = answer;
        messages.scrollTop = messages.scrollHeight;
    }, 500);
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
