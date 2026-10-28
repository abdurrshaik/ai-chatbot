
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

    const newChatBtn = document.getElementById("newChatBtn");
    const sidebar = document.querySelector(".sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const app = document.querySelector(".app");

    if (!form || !input || !messages) {
        console.error("Chatbot HTML elements were not found.");
        return;
    }

    const API_URL =
        "https://my-ai-chatbot-api.abdurrshaik.workers.dev/";

    const STORAGE_KEY = "aiChatbotConversationsV1";

    // Image settings
    const MAX_IMAGES = 3;
    const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    // Images selected for the next message only.
    let selectedImages = [];
    let isSending = false;

    // Create a small attachment status area.
    const attachmentWrapper =
        document.querySelector(".attachment-wrapper");

    let attachmentStatus =
        document.getElementById("attachmentStatus");

    if (attachmentWrapper && !attachmentStatus) {
        attachmentStatus = document.createElement("div");
        attachmentStatus.id = "attachmentStatus";
        attachmentStatus.setAttribute("aria-live", "polite");

        attachmentStatus.style.fontSize = "13px";
        attachmentStatus.style.marginTop = "6px";
        attachmentStatus.style.overflowWrap = "anywhere";

        attachmentWrapper.appendChild(attachmentStatus);
    }

    function setAttachmentStatus(text, isError = false) {
        if (!attachmentStatus) return;

        attachmentStatus.textContent = text;
        attachmentStatus.style.color = isError
            ? "#dc2626"
            : "inherit";
    }

    function closeAttachmentMenu() {
        if (!attachmentMenu || !attachBtn) return;

        attachmentMenu.hidden = true;
        attachBtn.setAttribute("aria-expanded", "false");
    }

    // Open and close the attachment menu.
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
            if (
                !event.target.closest(".attachment-wrapper")
            ) {
                closeAttachmentMenu();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeAttachmentMenu();
            }
        });
    }

    // Open each file picker.
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

    // Convert an image file into a data URL for the Worker.
    function readImageAsDataURL(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();

            reader.onload = function () {
                if (typeof reader.result !== "string") {
                    reject(new Error(
                        "Could not read " + file.name
                    ));
                    return;
                }

                resolve({
                    name: file.name,
                    type: file.type,
                    data: reader.result
                });
            };

            reader.onerror = function () {
                reject(new Error(
                    "Could not read " + file.name
                ));
            };

            reader.readAsDataURL(file);
        });
    }

    // Handle selected images.
    async function handleSelectedFiles(fileInput) {
        if (
            !fileInput ||
            !fileInput.files ||
            fileInput.files.length === 0
        ) {
            return;
        }

        const files = Array.from(fileInput.files);

        // Clear the picker so the same file can be selected again.
        fileInput.value = "";

        const remainingSlots = MAX_IMAGES - selectedImages.length;

        if (remainingSlots <= 0) {
            setAttachmentStatus(
                "You can attach up to 3 images per message.",
                true
            );
            return;
        }

        const filesToProcess = files.slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            setAttachmentStatus(
                "Only " + remainingSlots +
                " more image(s) can be attached.",
                true
            );
        }

        for (const file of filesToProcess) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                setAttachmentStatus(
                    "Unsupported file: " + file.name +
                    ". Choose a JPG, PNG, WEBP, or GIF image.",
                    true
                );
                continue;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                setAttachmentStatus(
                    file.name +
                    " is too large. Please choose an image under 3 MB.",
                    true
                );
                continue;
            }

            try {
                const image = await readImageAsDataURL(file);
                selectedImages.push(image);
            } catch (error) {
                console.error(error);

                setAttachmentStatus(
                    "Could not read " + file.name + ".",
                    true
                );
            }
        }

        updateAttachmentStatus();
    }

    function updateAttachmentStatus() {
        if (selectedImages.length === 0) {
            setAttachmentStatus("");
            return;
        }

        const names = selectedImages.map(function (image) {
            return image.name;
        });

        setAttachmentStatus(
            "Attached (" + selectedImages.length + "/" +
            MAX_IMAGES + "): " + names.join(", ") +
            ". Send a message to analyze the image(s)."
        );
    }

    function clearSelectedImages() {
        selectedImages = [];
        setAttachmentStatus("");
    }

    [cameraInput, photosInput, filesInput].forEach(
        function (fileInput) {
            if (fileInput) {
                fileInput.addEventListener(
                    "change",
                    function () {
                        handleSelectedFiles(fileInput);
                    }
                );
            }
        }
    );

    // Sidebar open/close functionality.
    let sidebarOverlay =
        document.querySelector(".sidebar-overlay");

    if (!sidebarOverlay) {
        sidebarOverlay = document.createElement("div");
        sidebarOverlay.className = "sidebar-overlay";
        document.body.appendChild(sidebarOverlay);
    }

    function closeSidebar() {
        if (!app) return;

        app.classList.add("sidebar-closed");

        sidebarOverlay.classList.remove("visible");

        if (sidebarToggle) {
            sidebarToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }

    function openSidebar() {
        if (!app) return;

        app.classList.remove("sidebar-closed");

        if (window.innerWidth <= 600) {
            sidebarOverlay.classList.add("visible");
        }

        if (sidebarToggle) {
            sidebarToggle.setAttribute(
                "aria-expanded",
                "true"
            );
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

    sidebarOverlay.addEventListener("click", closeSidebar);

    if (window.innerWidth <= 600) {
        closeSidebar();
    } else {
        openSidebar();
    }

    window.addEventListener("resize", function () {
        if (window.innerWidth > 600) {
            sidebarOverlay.classList.remove("visible");

            if (sidebarToggle && app) {
                sidebarToggle.setAttribute(
                    "aria-expanded",
                    String(
                        !app.classList.contains("sidebar-closed")
                    )
                );
            }
        } else if (
            app &&
            !app.classList.contains("sidebar-closed")
        ) {
            sidebarOverlay.classList.add("visible");
        }
    });

    // Conversation storage.
    let conversations = loadConversations();
    let activeChatId = null;

    function loadConversations() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );

            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error(
                "Could not load saved conversations:",
                error
            );
            return [];
        }
    }

    function saveConversations() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(conversations)
            );
        } catch (error) {
            console.error(
                "Could not save conversations:",
                error
            );
        }
    }

    function createId() {
        return Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8);
    }

    function getActiveChat() {
        return conversations.find(function (chat) {
            return chat.id === activeChatId;
        });
    }

    function makeTitle(text) {
        const cleanText = text.replace(/\s+/g, " ").trim();

        return cleanText.length > 35
            ? cleanText.slice(0, 35) + "..."
            : cleanText;
    }

    // Display messages.
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

    function openConversation(chatId) {
        if (isSending) return;

        const chat = conversations.find(function (item) {
            return item.id === chatId;
        });

        if (!chat) return;

        activeChatId = chatId;
        messages.innerHTML = "";

        if (!chat.messages.length) {
            showWelcome();
        } else {
            chat.messages.forEach(function (item) {
                displayMessage(item.content, item.role);
            });
        }

        renderHistory();

        if (window.innerWidth <= 600) {
            closeSidebar();
        }

        input.focus();
    }

    function startNewChat() {
        if (isSending) return;

        activeChatId = null;
        input.value = "";
        resizeInput();
        clearSelectedImages();
        showWelcome();
        renderHistory();
        input.focus();
    }

    // Conversation history sidebar.
    let historyContainer =
        document.getElementById("chatHistory");

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

    function renderHistory() {
        if (!historyContainer) return;

        historyContainer.innerHTML = "";

        const sorted = [...conversations].sort(
            function (a, b) {
                return b.updatedAt - a.updatedAt;
            }
        );

        if (sorted.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-history";
            empty.textContent =
                "Your conversations will appear here.";

            historyContainer.appendChild(empty);
            return;
        }

        sorted.forEach(function (chat) {
            const row = document.createElement("div");
            row.className = "history-row";

            if (chat.id === activeChatId) {
                row.classList.add("active-history");
            }

            const openButton = document.createElement("button");
            openButton.type = "button";
            openButton.className = "history-item";
            openButton.textContent =
                chat.title || "New conversation";
            openButton.title =
                chat.title || "New conversation";

            openButton.addEventListener("click", function () {
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

            deleteButton.addEventListener(
                "click",
                function (event) {
                    event.stopPropagation();

                    if (isSending) return;

                    conversations = conversations.filter(
                        function (item) {
                            return item.id !== chat.id;
                        }
                    );

                    if (activeChatId === chat.id) {
                        activeChatId = null;
                        showWelcome();
                    }

                    saveConversations();
                    renderHistory();
                }
            );

            row.appendChild(openButton);
            row.appendChild(deleteButton);
            historyContainer.appendChild(row);
        });
    }

    // Resize the message input.
    function resizeInput() {
        input.style.height = "auto";

        input.style.height =
            Math.min(input.scrollHeight, 180) + "px";
    }

    input.addEventListener("input", resizeInput);

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

    // Send text and selected images to the AI Worker.
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (isSending) return;

        const text = input.value.trim();

        if (!text && selectedImages.length === 0) {
            return;
        }

        const imagesToSend = selectedImages.slice();

        const messageText = text ||
            "Please describe the attached image.";

        const visibleUserMessage = imagesToSend.length > 0
            ? messageText + "\n📎 " +
                imagesToSend.map(function (image) {
                    return image.name;
                }).join(", ")
            : messageText;

        if (!activeChatId) {
            const chat = {
                id: createId(),
                title: makeTitle(messageText),
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            conversations.push(chat);
            activeChatId = chat.id;
        }

        const chat = getActiveChat();

        if (!chat) return;

        const previousHistory = chat.messages.map(
            function (item) {
                return {
                    role: item.role,
                    content: item.content
                };
            }
        );

        chat.messages.push({
            role: "user",
            content: visibleUserMessage
        });

        chat.updatedAt = Date.now();
        saveConversations();

        const welcome = document.getElementById("welcome");

        if (welcome) welcome.remove();

        displayMessage(visibleUserMessage, "user");

        input.value = "";
        resizeInput();
        clearSelectedImages();

        const replyElement =
            displayMessage("Thinking...", "assistant");

        const sendButton =
            form.querySelector('button[type="submit"]');

        isSending = true;
        input.disabled = true;

        if (sendButton) sendButton.disabled = true;
        if (newChatBtn) newChatBtn.disabled = true;
        if (attachBtn) attachBtn.disabled = true;

        [cameraOption, photosOption, filesOption].forEach(
            function (button) {
                if (button) button.disabled = true;
            }
        );

        renderHistory();

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: messageText,
                    history: previousHistory,
                    images: imagesToSend.map(function (image) {
                        return {
                            data: image.data,
                            type: image.type
                        };
                    })
                })
            });

            const responseText = await response.text();

            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    "The server returned an invalid response (HTTP " +
                    response.status + ")."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "The AI service returned HTTP " +
                    response.status + "."
                );
            }

            if (
                typeof data.reply !== "string" ||
                !data.reply.trim()
            ) {
                throw new Error(
                    "The AI returned an empty response."
                );
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
                "Sorry, " +
                (error.message ||
                 "I couldn't connect to the AI service.");

            // Remove the failed user message from saved history.
            chat.messages = chat.messages.filter(
                function (item, index, array) {
                    return !(
                        index === array.length - 1 &&
                        item.role === "user" &&
                        item.content === visibleUserMessage
                    );
                }
            );

            saveConversations();

        } finally {
            isSending = false;
            input.disabled = false;

            if (sendButton) sendButton.disabled = false;
            if (newChatBtn) newChatBtn.disabled = false;
            if (attachBtn) attachBtn.disabled = false;

            [cameraOption, photosOption, filesOption].forEach(
                function (button) {
                    if (button) button.disabled = false;
                }
            );

            messages.scrollTop = messages.scrollHeight;
            renderHistory();
            input.focus();
        }
    });

    if (newChatBtn) {
        newChatBtn.addEventListener("click", startNewChat);
    }

    showWelcome();
    renderHistory();
    resizeInput();
});

