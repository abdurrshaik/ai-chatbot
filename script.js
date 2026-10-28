document.addEventListener("DOMContentLoaded", function () {
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");

// Attachment menu
const attachBtn = document.getElementById("attachBtn");
const attachmentMenu = document.getElementById("attachmentMenu");

const cameraInput = document.getElementById("cameraInput");
const photosInput = document.getElementById("photosInput");
const filesInput = document.getElementById("filesInput");

const cameraOption = document.getElementById("cameraOption");
const photosOption = document.getElementById("photosOption");
const filesOption = document.getElementById("filesOption");

function closeAttachmentMenu() {
    if (!attachmentMenu || !attachBtn) return;

    attachmentMenu.hidden = true;
    attachBtn.setAttribute("aria-expanded", "false");
}

if (attachBtn && attachmentMenu) {
    attachBtn.addEventListener("click", function (event) {
        event.stopPropagation();

        attachmentMenu.hidden = !attachmentMenu.hidden;

        attachBtn.setAttribute(
            "aria-expanded",
            String(!attachmentMenu.hidden)
        );
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".attachment-wrapper")) {
            closeAttachmentMenu();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeAttachmentMenu();
        }
    });
}

if (cameraOption && cameraInput) {
    cameraOption.addEventListener("click", function () {
        closeAttachmentMenu();
        cameraInput.click();
    });
}

if (photosOption && photosInput) {
    photosOption.addEventListener("click", function () {
        closeAttachmentMenu();
        photosInput.click();
    });
}

if (filesOption && filesInput) {
    filesOption.addEventListener("click", function () {
        closeAttachmentMenu();
        filesInput.click();
    });
}

function showSelectedFiles(fileInput) {
    if (!fileInput || !fileInput.files.length) return;

    const names = Array.from(fileInput.files)
        .map(file => file.name)
        .join(", ");

    alert(
        "Selected: " + names +
        "\n\nFile upload and AI attachment processing are not connected yet."
    );
}

[cameraInput, photosInput, filesInput].forEach(function (fileInput) {
    if (fileInput) {
        fileInput.addEventListener("change", function () {
            showSelectedFiles(fileInput);
        });
    }
});


const newChatBtn = document.getElementById("newChatBtn");
const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const app = document.querySelector(".app");

if (!form || !input || !messages) {
    console.error("Chatbot HTML elements were not found.");
    return;
}

const API_URL = "https://my-ai-chatbot-api.abdurrshaik.workers.dev/";
const STORAGE_KEY = "aiChatbotConversationsV1";
// Sidebar open/close functionality
let sidebarOverlay = document.querySelector(".sidebar-overlay");

if (!sidebarOverlay) {
    sidebarOverlay = document.createElement("div");
    sidebarOverlay.className = "sidebar-overlay";
    document.body.appendChild(sidebarOverlay);
}

function closeSidebar() {
    if (!app) return;

    app.classList.add("sidebar-closed");

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("visible");
    }

    if (sidebarToggle) {
        sidebarToggle.setAttribute("aria-expanded", "false");
    }
}

function openSidebar() {
    if (!app) return;

    app.classList.remove("sidebar-closed");

    if (window.innerWidth <= 600 && sidebarOverlay) {
        sidebarOverlay.classList.add("visible");
    }

    if (sidebarToggle) {
        sidebarToggle.setAttribute("aria-expanded", "true");
    }
}

if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
        if (app.classList.contains("sidebar-closed")) {
            openSidebar();
        } else {
            closeSidebar();
        }
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
}

// Start with the sidebar open on desktop and closed on mobile.
if (window.innerWidth <= 600) {
    closeSidebar();
} else {
    openSidebar();
}

// Close the mobile sidebar after selecting a conversation.
window.addEventListener("resize", function () {
    if (window.innerWidth > 600) {
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("visible");
        }

        if (sidebarToggle) {
            sidebarToggle.setAttribute(
                "aria-expanded",
                String(!app.classList.contains("sidebar-closed"))
            );
        }
    } else if (app && !app.classList.contains("sidebar-closed")) {
        if (sidebarOverlay) {
            sidebarOverlay.classList.add("visible");
        }
    }
});
let conversations = loadConversations();
let activeChatId = null;
let isSending = false;

// Load conversations saved in this browser.
function loadConversations() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        console.error("Could not load saved conversations:", error);
        return [];
    }
}

function saveConversations() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
        console.error("Could not save conversations:", error);
    }
}

function createId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2, 8);
}

function getActiveChat() {
    return conversations.find(chat => chat.id === activeChatId);
}

function makeTitle(text) {
    const cleanText = text.replace(/\s+/g, " ").trim();
    return cleanText.length > 35
        ? cleanText.slice(0, 35) + "..."
        : cleanText;
}

// Display user and AI messages.
function displayMessage(text, role) {
    const element = document.createElement("div");
    element.classList.add("message");

    if (role === "user") {
        element.classList.add("user-message");
        element.textContent = text;
    } else {
        element.classList.add("bot-message");

        if (
            typeof marked !== "undefined" &&
            typeof DOMPurify !== "undefined"
        ) {
            element.innerHTML = DOMPurify.sanitize(
                marked.parse(text)
            );
        } else {
            element.textContent = text;
        }
    }

    messages.appendChild(element);
    messages.scrollTop = messages.scrollHeight;

    return element;
}

function showWelcome() {
    messages.innerHTML = "";

    const welcome = document.createElement("div");
    welcome.className = "welcome";
    welcome.id = "welcome";

    const heading = document.createElement("h1");
    heading.textContent = "What can I help with?";

    const paragraph = document.createElement("p");
    paragraph.textContent = "Ask a question to get started.";

    welcome.appendChild(heading);
    welcome.appendChild(paragraph);
    messages.appendChild(welcome);
}

// Render a saved conversation.
function openConversation(chatId) {
    if (isSending) return;

    const chat = conversations.find(item => item.id === chatId);
    if (!chat) return;

    activeChatId = chatId;
    messages.innerHTML = "";

    if (!chat.messages.length) {
        showWelcome();
    } else {
        chat.messages.forEach(item => {
            displayMessage(item.content, item.role);
        });
    }

  renderHistory();

if (window.innerWidth <= 600) {
    closeSidebar();
}

input.focus();  
}

// Add a new conversation.
function startNewChat() {
    if (isSending) return;

    activeChatId = null;
    input.value = "";
    resizeInput();
    showWelcome();
    renderHistory();
    input.focus();
}

// Create a history section in the sidebar if needed.
let historyContainer = document.getElementById("chatHistory");

if (!historyContainer && sidebar) {
    historyContainer = document.createElement("div");
    historyContainer.id = "chatHistory";
    historyContainer.className = "chat-history";

    const historyHeading = document.createElement("p");
    historyHeading.className = "history-heading";
    historyHeading.textContent = "Your chats";

    sidebar.appendChild(historyHeading);
    sidebar.appendChild(historyContainer);
}

// Show saved conversations in the sidebar.
function renderHistory() {
    if (!historyContainer) return;

    historyContainer.innerHTML = "";

    const sorted = [...conversations].sort(
        (a, b) => b.updatedAt - a.updatedAt
    );

    if (sorted.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-history";
        empty.textContent = "Your conversations will appear here.";
        historyContainer.appendChild(empty);
        return;
    }

    sorted.forEach(chat => {
        const row = document.createElement("div");
        row.className = "history-row";

        if (chat.id === activeChatId) {
            row.classList.add("active-history");
        }

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "history-item";
        openButton.textContent = chat.title || "New conversation";
        openButton.title = chat.title || "New conversation";
        openButton.addEventListener("click", () => {
            openConversation(chat.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-history";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete conversation";
        deleteButton.setAttribute(
            "aria-label",
            "Delete " + (chat.title || "conversation")
        );

        deleteButton.addEventListener("click", event => {
            event.stopPropagation();

            if (isSending) return;

            conversations = conversations.filter(
                item => item.id !== chat.id
            );

            if (activeChatId === chat.id) {
                activeChatId = null;
                showWelcome();
            }

            saveConversations();
            renderHistory();
        });

        row.appendChild(openButton);
        row.appendChild(deleteButton);
        historyContainer.appendChild(row);
    });
}

// Resize the multi-line input.
function resizeInput() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 180) + "px";
}

input.addEventListener("input", resizeInput);

// Enter sends; Shift + Enter adds a new line.
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

// Send a message to the AI with conversation history.
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isSending) return;

    const text = input.value.trim();
    if (!text) return;

    if (!activeChatId) {
        const chat = {
            id: createId(),
            title: makeTitle(text),
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        conversations.push(chat);
        activeChatId = chat.id;
    }

    const chat = getActiveChat();
    if (!chat) return;

    const previousHistory = chat.messages.map(item => ({
        role: item.role,
        content: item.content
    }));

    chat.messages.push({
        role: "user",
        content: text
    });

    chat.updatedAt = Date.now();
    saveConversations();

    const welcome = document.getElementById("welcome");
    if (welcome) welcome.remove();

    displayMessage(text, "user");

    input.value = "";
    resizeInput();

    const replyElement = displayMessage("Thinking...", "assistant");
    const sendButton = form.querySelector('button[type="submit"]');

    isSending = true;
    input.disabled = true;

    if (sendButton) sendButton.disabled = true;
    if (newChatBtn) newChatBtn.disabled = true;

    renderHistory();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                history: previousHistory
            })
        });

        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(
                `The server returned an invalid response (HTTP ${response.status}).`
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

        const answer = data.reply;

        if (
            typeof marked !== "undefined" &&
            typeof DOMPurify !== "undefined"
        ) {
            replyElement.innerHTML = DOMPurify.sanitize(
                marked.parse(answer)
            );
        } else {
            replyElement.textContent = answer;
        }

        chat.messages.push({
            role: "assistant",
            content: answer
        });

        chat.updatedAt = Date.now();
        saveConversations();
    } catch (error) {
        console.error("AI chatbot error:", error);

        replyElement.textContent =
            "Sorry, " + (
                error.message ||
                "I couldn't connect to the AI service."
            );

        // Remove the unanswered user message from saved history,
        // allowing the user to try again.
        chat.messages = chat.messages.filter(
            (item, index) =>
                !(index === chat.messages.length - 1 &&
                  item.role === "user" &&
                  item.content === text)
        );

        saveConversations();
    } finally {
        isSending = false;
        input.disabled = false;

        if (sendButton) sendButton.disabled = false;
        if (newChatBtn) newChatBtn.disabled = false;

        messages.scrollTop = messages.scrollHeight;
        renderHistory();
        input.focus();
    }
});

if (newChatBtn) {
    newChatBtn.addEventListener("click", startNewChat);
}

// Start with a fresh screen and show previous conversations.
showWelcome();
renderHistory();
resizeInput();


});
