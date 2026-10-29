import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", function () {
    // Login popup elements
    const authModal = document.getElementById("authModal");
    const openSignInBtn = document.getElementById("openSignInBtn");
    const openLoginBtn = document.getElementById("openLoginBtn");
    const closeAuthBtn = document.getElementById("closeAuthBtn");
    const authTitle = document.getElementById("authTitle");
    const authDescription = document.getElementById("authDescription");
    const authForm = document.getElementById("authForm");

    // Firebase account elements
    const authEmail = document.getElementById("authEmail");
    const authPassword = document.getElementById("authPassword");
    const signUpBtn = document.getElementById("signUpBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const loggedOutView = document.getElementById("loggedOutView");
    const loggedInView = document.getElementById("loggedInView");
    const userEmail = document.getElementById("userEmail");
    const authStatus = document.getElementById("authStatus");

    function openAuthPopup(title, description) {
        if (!authModal) return;

        if (authTitle) authTitle.textContent = title;
        if (authDescription) authDescription.textContent = description;
        if (authStatus) authStatus.textContent = "";

        authModal.hidden = false;

        if (authEmail) authEmail.focus();
    }

    if (openSignInBtn) {
        openSignInBtn.addEventListener("click", function () {
            openAuthPopup(
                "Create Your Account",
                "Create an account to get started."
            );
        });
    }

    if (openLoginBtn) {
        openLoginBtn.addEventListener("click", function () {
            openAuthPopup(
                "Welcome Back",
                "Log in to your AI Chatbot account."
            );
        });
    }

    if (closeAuthBtn && authModal) {
        closeAuthBtn.addEventListener("click", function () {
            authModal.hidden = true;
        });

        authModal.addEventListener("click", function (event) {
            if (event.target === authModal) {
                authModal.hidden = true;
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && !authModal.hidden) {
                authModal.hidden = true;
            }
        });
    }

    // Create a new Firebase account
    if (signUpBtn) {
        signUpBtn.addEventListener("click", async function () {
            const email = authEmail ? authEmail.value.trim() : "";
            const password = authPassword ? authPassword.value : "";

            if (!email || !password) {
                if (authStatus) {
                    authStatus.textContent =
                        "Please enter your email and password.";
                }
                return;
            }

            if (password.length < 6) {
                if (authStatus) {
                    authStatus.textContent =
                        "Choose a password with at least 6 characters.";
                }
                return;
            }

            try {
                signUpBtn.disabled = true;

                if (authStatus) {
                    authStatus.textContent = "Creating your account...";
                }

                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                if (authStatus) {
                    authStatus.textContent =
                        "Account created successfully!";
                }

                if (authPassword) authPassword.value = "";

            } catch (error) {
                console.error("Firebase sign-up error:", error);

                if (authStatus) {
                    authStatus.textContent =
                        getAuthErrorMessage(error.code);
                }

            } finally {
                signUpBtn.disabled = false;
            }
        });
    }

    // Log in when the popup form is submitted
    if (authForm) {
        authForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = authEmail ? authEmail.value.trim() : "";
            const password = authPassword ? authPassword.value : "";

            if (!email || !password) {
                if (authStatus) {
                    authStatus.textContent =
                        "Please enter your email and password.";
                }
                return;
            }

            try {
                const loginButton =
                    document.getElementById("loginBtn");

                if (loginButton) loginButton.disabled = true;

                if (authStatus) {
                    authStatus.textContent = "Logging in...";
                }

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                if (authStatus) {
                    authStatus.textContent = "Logged in successfully!";
                }

                if (authPassword) authPassword.value = "";

            } catch (error) {
                console.error("Firebase login error:", error);

                if (authStatus) {
                    authStatus.textContent =
                        getAuthErrorMessage(error.code);
                }

            } finally {
                const loginButton =
                    document.getElementById("loginBtn");

                if (loginButton) loginButton.disabled = false;
            }
        });
    }

    // Log out
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async function () {
            try {
                await signOut(auth);

                if (authStatus) {
                    authStatus.textContent = "You have logged out.";
                }

            } catch (error) {
                console.error("Firebase logout error:", error);

                if (authStatus) {
                    authStatus.textContent =
                        "Could not log out. Please try again.";
                }
            }
        });
    }

    // Update popup when Firebase authentication changes
    onAuthStateChanged(auth, function (user) {
        if (user) {
            if (loggedOutView) loggedOutView.hidden = true;
            if (loggedInView) loggedInView.hidden = false;

            if (userEmail) {
                userEmail.textContent = user.email || "Signed in";
            }

            if (authTitle) authTitle.textContent = "Your Account";

            if (authDescription) {
                authDescription.textContent =
                    "You are signed in to AI Chatbot.";
            }

        } else {
            if (loggedOutView) loggedOutView.hidden = false;
            if (loggedInView) loggedInView.hidden = true;
            if (userEmail) userEmail.textContent = "";
        }
    });

    function getAuthErrorMessage(code) {
        const messages = {
            "auth/invalid-email":
                "Please enter a valid email address.",

            "auth/email-already-in-use":
                "This email already has an account. Please log in.",

            "auth/weak-password":
                "Choose a stronger password with at least 6 characters.",

            "auth/invalid-credential":
                "Email or password is incorrect.",

            "auth/too-many-requests":
                "Too many attempts. Please try again later.",

            "auth/network-request-failed":
                "Network error. Check your internet connection.",

            "auth/operation-not-allowed":
                "Email/password sign-in is not enabled in Firebase."
        };

        return messages[code] ||
            "Something went wrong. Please try again.";
    }

    // Chatbot elements
    const form = document.getElementById("chatForm");
    const input = document.getElementById("userInput");
    const messages = document.getElementById("messages");

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
    const MAX_IMAGES = 3;
    const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    let selectedImages = [];
    let isSending = false;

    // Image previews appear above the message composer.
    const previewArea = document.createElement("div");
    previewArea.className = "attachment-preview";
    previewArea.id = "attachmentPreview";
    previewArea.setAttribute(
        "aria-label",
        "Selected image attachments"
    );

    const inputArea = document.querySelector(".input-area");

    if (inputArea) {
        inputArea.insertBefore(previewArea, form);
    }

    // Accessible status messages.
    let attachmentStatus =
        document.getElementById("attachmentStatus");

    if (!attachmentStatus) {
        attachmentStatus = document.createElement("div");
        attachmentStatus.id = "attachmentStatus";
        attachmentStatus.setAttribute("aria-live", "polite");
        attachmentStatus.style.fontSize = "12px";
        attachmentStatus.style.margin = "0 auto 6px";
        attachmentStatus.style.maxWidth = "900px";
        attachmentStatus.style.overflowWrap = "anywhere";

        if (inputArea) {
            inputArea.insertBefore(attachmentStatus, form);
        }
    }

    function setAttachmentStatus(text, isError) {
        attachmentStatus.textContent = text || "";
        attachmentStatus.style.color = isError ? "#dc2626" : "";
    }

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
            if (
                !event.target.closest(".attachment-wrapper") &&
                !event.target.closest("#attachmentMenu")
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

    function getImageType(file) {
        if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return file.type;
        }

        const extension = file.name.split(".").pop().toLowerCase();

        const types = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            gif: "image/gif"
        };

        return types[extension] || "";
    }

    function readImageAsDataURL(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();

            reader.onload = function () {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                } else {
                    reject(new Error("Could not read image."));
                }
            };

            reader.onerror = function () {
                reject(new Error("Could not read image."));
            };

            reader.readAsDataURL(file);
        });
    }
        // Handle selected images
    async function handleSelectedFiles(fileList) {
        const files = Array.from(fileList || []);

        if (files.length === 0) return;

        const remainingSlots = MAX_IMAGES - selectedImages.length;

        if (remainingSlots <= 0) {
            setAttachmentStatus(
                "You can attach up to 3 images per message.",
                true
            );
            return;
        }

        const filesToProcess = files.slice(0, remainingSlots);

        for (const file of filesToProcess) {
            if (selectedImages.length >= MAX_IMAGES) {
                setAttachmentStatus(
                    "You can attach up to 3 images per message.",
                    true
                );
                break;
            }

            const imageType = getImageType(file);

            if (!imageType) {
                setAttachmentStatus(
                    "Please select a JPG, PNG, WEBP, or GIF image.",
                    true
                );
                continue;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                setAttachmentStatus(
                    file.name + " is too large. Maximum size is 3 MB.",
                    true
                );
                continue;
            }

            try {
                const dataURL = await readImageAsDataURL(file);

                selectedImages.push({
                    name: file.name,
                    type: imageType,
                    dataURL: dataURL
                });

                renderImagePreviews();

                setAttachmentStatus(
                    selectedImages.length + " image(s) attached.",
                    false
                );
            } catch (error) {
                console.error("Image reading error:", error);

                setAttachmentStatus(
                    "Could not read " + file.name + ". Please try again.",
                    true
                );
            }
        }
    }

    function renderImagePreviews() {
        previewArea.replaceChildren();

        selectedImages.forEach(function (image, index) {
            const preview = document.createElement("div");
            preview.className = "attachment-preview-item";

            const img = document.createElement("img");
            img.src = image.dataURL;
            img.alt = image.name;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "×";
            removeButton.setAttribute(
                "aria-label",
                "Remove " + image.name
            );

            removeButton.addEventListener("click", function () {
                selectedImages.splice(index, 1);
                renderImagePreviews();

                setAttachmentStatus(
                    selectedImages.length
                        ? selectedImages.length + " image(s) attached."
                        : "",
                    false
                );
            });

            preview.appendChild(img);
            preview.appendChild(removeButton);

            previewArea.appendChild(preview);
        });
    }

    [cameraInput, photosInput, filesInput].forEach(function (fileInput) {
        if (!fileInput) return;

        fileInput.addEventListener("change", async function () {
            await handleSelectedFiles(fileInput.files);

            // Allow the same image to be selected again later.
            fileInput.value = "";
        });
    });

    // Mobile sidebar
function closeSidebar() {
    if (!sidebar || !app) return;

    sidebar.classList.remove("sidebar-open");
    app.classList.remove("sidebar-visible");

    if (sidebarToggle) {
        sidebarToggle.setAttribute("aria-expanded", "false");
    }
}

function toggleSidebar() {
    if (!sidebar || !app) return;

    const isOpen = sidebar.classList.contains("sidebar-open");

    if (isOpen) {
        closeSidebar();
    } else {
        sidebar.classList.add("sidebar-open");
        app.classList.add("sidebar-visible");

        if (sidebarToggle) {
            sidebarToggle.setAttribute("aria-expanded", "true");
        }
    }
}

if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
}

// Close the sidebar when clicking outside it on mobile.
document.addEventListener("click", function (event) {
    if (!sidebar || !sidebarToggle) return;

    if (window.innerWidth > 768) return;

    const isOpen = sidebar.classList.contains("sidebar-open");

    if (!isOpen) return;

    if (
        !sidebar.contains(event.target) &&
        !sidebarToggle.contains(event.target)
    ) {
        closeSidebar();
    }
});

// Close the sidebar using Escape.
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeSidebar();
    }
});

// Close the sidebar when returning to desktop layout.
window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
        closeSidebar();
    }
});

    // Conversation data
    let conversations = [];
    let currentChatId = null;

    function createChatId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }

        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2)
        );
    }

    function loadConversations() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) return [];

            const parsed = JSON.parse(saved);

            if (!Array.isArray(parsed)) return [];

            return parsed.filter(function (chat) {
                return (
                    chat &&
                    typeof chat.id === "string" &&
                    Array.isArray(chat.messages)
                );
            });
        } catch (error) {
            console.error("Could not load chat history:", error);
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
            console.error("Could not save chat history:", error);

            setAttachmentStatus(
                "Chat history could not be saved on this device.",
                true
            );
        }
    }

    function getCurrentChat() {
        return conversations.find(function (chat) {
            return chat.id === currentChatId;
        }) || null;
    }

    function createNewChat() {
        const chat = {
            id: createChatId(),
            title: "New Chat",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        conversations.unshift(chat);
        currentChatId = chat.id;

        saveConversations();
        renderChatHistory();
        renderCurrentChat();

        selectedImages = [];
        renderImagePreviews();
        setAttachmentStatus("", false);

        if (input) input.focus();

        closeSidebar();
    }

    function getChatTitle(text) {
        const cleaned = String(text || "")
            .replace(/\s+/g, " ")
            .trim();

        if (!cleaned) return "New Chat";

        return cleaned.length > 35
            ? cleaned.slice(0, 35) + "…"
            : cleaned;
    }

    // Build a safe message element.
    function createMessageElement(message) {
        const wrapper = document.createElement("div");

        wrapper.className =
            "message " +
            (message.role === "user"
                ? "user-message"
                : "bot-message");

        if (message.text) {
            const textElement = document.createElement("div");
            textElement.className = "message-text";

            // Render Markdown safely when the libraries are available.
            if (
                message.role !== "user" &&
                typeof marked !== "undefined" &&
                typeof DOMPurify !== "undefined"
            ) {
                try {
                    textElement.innerHTML = DOMPurify.sanitize(
                        marked.parse(message.text)
                    );
                } catch (error) {
                    textElement.textContent = message.text;
                }
            } else {
                textElement.textContent = message.text;
            }

            wrapper.appendChild(textElement);
        }

        if (Array.isArray(message.images) && message.images.length) {
            const imageContainer = document.createElement("div");
            imageContainer.className = "message-images";

            message.images.forEach(function (image) {
                if (!image || !image.dataURL) return;

                const img = document.createElement("img");

                img.src = image.dataURL;
                img.alt = image.name || "Attached image";
                img.loading = "lazy";

                imageContainer.appendChild(img);
            });

            wrapper.appendChild(imageContainer);
        }

        return wrapper;
    }

    function renderCurrentChat() {
        messages.replaceChildren();

        const chat = getCurrentChat();

        if (!chat || chat.messages.length === 0) {
            const welcome = document.createElement("div");
            welcome.className = "welcome";

            const heading = document.createElement("h1");
            heading.textContent = "Welcome to AI Chatbot";

            const paragraph = document.createElement("p");
            paragraph.textContent = "Ask a question to get started.";

            welcome.appendChild(heading);
            welcome.appendChild(paragraph);
            messages.appendChild(welcome);

            return;
        }

        chat.messages.forEach(function (message) {
            messages.appendChild(createMessageElement(message));
        });

        messages.scrollTop = messages.scrollHeight;
    }

    function renderChatHistory() {
        const chatHistory = document.getElementById("chatHistory");

        if (!chatHistory) return;

        chatHistory.replaceChildren();

        conversations.forEach(function (chat) {
            const item = document.createElement("div");
            item.className = "chat-history-item";

            if (chat.id === currentChatId) {
                item.classList.add("active");
            }

            const openButton = document.createElement("button");
            openButton.type = "button";
            openButton.className = "chat-history-open";
            openButton.textContent = chat.title || "New Chat";
            openButton.title = chat.title || "New Chat";

            openButton.addEventListener("click", function () {
                currentChatId = chat.id;

                renderChatHistory();
                renderCurrentChat();

                selectedImages = [];
                renderImagePreviews();
                setAttachmentStatus("", false);

                closeSidebar();
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "chat-history-delete";
            deleteButton.textContent = "×";
            deleteButton.setAttribute(
                "aria-label",
                "Delete conversation: " + (chat.title || "New Chat")
            );

            deleteButton.addEventListener("click", function () {
                const confirmed = window.confirm(
                    "Delete this conversation?"
                );

                if (!confirmed) return;

                conversations = conversations.filter(function (item) {
                    return item.id !== chat.id;
                });

                if (currentChatId === chat.id) {
                    currentChatId = null;

                    if (conversations.length > 0) {
                        currentChatId = conversations[0].id;
                    } else {
                        createNewChat();
                        return;
                    }
                }

                saveConversations();
                renderChatHistory();
                renderCurrentChat();
            });

            item.appendChild(openButton);
            item.appendChild(deleteButton);

            chatHistory.appendChild(item);
        });
    }

    // Load previously saved conversations from this browser.
    conversations = loadConversations();

    if (conversations.length > 0) {
        currentChatId = conversations[0].id;
    } else {
        const firstChat = {
            id: createChatId(),
            title: "New Chat",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        conversations.push(firstChat);
        currentChatId = firstChat.id;
        saveConversations();
    }

    renderChatHistory();
    renderCurrentChat();

    if (newChatBtn) {
        newChatBtn.addEventListener("click", createNewChat);
    }
        // Send a message to the AI chatbot
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (isSending) return;

        const userText = input.value.trim();

        if (!userText && selectedImages.length === 0) {
            return;
        }

        const chat = getCurrentChat();

        if (!chat) {
            console.error("No active conversation found.");
            return;
        }

        isSending = true;

        const sendButton = form.querySelector(
            'button[type="submit"]'
        );

        if (sendButton) {
            sendButton.disabled = true;
        }

        input.disabled = true;

        const attachedImages = selectedImages.map(function (image) {
            return {
                name: image.name,
                type: image.type,
                dataURL: image.dataURL
            };
        });

        // Save the user's message.
        const userMessage = {
            role: "user",
            text: userText,
            images: attachedImages,
            timestamp: Date.now()
        };

        chat.messages.push(userMessage);

        // Set the conversation title from its first message.
        if (chat.messages.length === 1) {
            chat.title = getChatTitle(
                userText || attachedImages[0]?.name || "Image Chat"
            );
        }

        chat.updatedAt = Date.now();

        input.value = "";
        selectedImages = [];

        renderImagePreviews();
        setAttachmentStatus("", false);
        saveConversations();
        renderChatHistory();
        renderCurrentChat();

        // Show a temporary loading message.
        const loadingMessage = document.createElement("div");

        loadingMessage.className = "message bot-message";
        loadingMessage.textContent = "AI is thinking…";
        loadingMessage.setAttribute("aria-live", "polite");

        messages.appendChild(loadingMessage);
        messages.scrollTop = messages.scrollHeight;

        try {
            // Convert conversation history into the API format.
            const apiMessages = chat.messages.map(function (message) {
                const hasImages =
                    Array.isArray(message.images) &&
                    message.images.length > 0;

                if (!hasImages) {
                    return {
                        role: message.role,
                        content: message.text || ""
                    };
                }

                const content = [];

                if (message.text) {
                    content.push({
                        type: "text",
                        text: message.text
                    });
                }

                message.images.forEach(function (image) {
                    if (!image.dataURL) return;

                    content.push({
                        type: "image_url",
                        image_url: {
                            url: image.dataURL
                        }
                    });
                });

                return {
                    role: message.role,
                    content: content
                };
            });

            // Call your Cloudflare Worker.
            const response = await fetch(API_URL, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    messages: apiMessages
                })
            });

            if (!response.ok) {
                let errorMessage =
                    "The AI service could not process your request.";

                try {
                    const errorData = await response.json();

                    if (errorData.error) {
                        errorMessage =
                            typeof errorData.error === "string"
                                ? errorData.error
                                : errorData.error.message ||
                                  errorMessage;
                    }
                } catch (error) {
                    // Keep the default error message.
                }

                throw new Error(
                    "HTTP " + response.status + ": " + errorMessage
                );
            }

            const data = await response.json();

            // Read the AI response.
            let botText = "";

            if (
                data.choices &&
                data.choices[0] &&
                data.choices[0].message
            ) {
                const content = data.choices[0].message.content;

                if (typeof content === "string") {
                    botText = content;
                } else if (Array.isArray(content)) {
                    botText = content
                        .filter(function (item) {
                            return item.type === "text" && item.text;
                        })
                        .map(function (item) {
                            return item.text;
                        })
                        .join("\n");
                }
            } else if (typeof data.response === "string") {
                botText = data.response;
            } else if (typeof data.reply === "string") {
                botText = data.reply;
            }

            if (!botText.trim()) {
                throw new Error(
                    "The AI returned an empty response. Please try again."
                );
            }

            // Remove the loading message.
            loadingMessage.remove();

            // Save the AI's answer.
            chat.messages.push({
                role: "assistant",
                text: botText,
                images: [],
                timestamp: Date.now()
            });

            chat.updatedAt = Date.now();

            saveConversations();
            renderChatHistory();
            renderCurrentChat();

        } catch (error) {
            console.error("Chatbot API error:", error);

            loadingMessage.remove();

            const errorMessage = document.createElement("div");

            errorMessage.className = "message bot-message";

            errorMessage.textContent =
                "Sorry, I couldn't get a response. " +
                "Please check your internet connection and try again.";

            messages.appendChild(errorMessage);
            messages.scrollTop = messages.scrollHeight;

            setAttachmentStatus(
                "Message failed: " + error.message,
                true
            );

        } finally {
            isSending = false;

            if (sendButton) {
                sendButton.disabled = false;
            }

            input.disabled = false;
            input.focus();
        }
    });

    // Allow Enter to send a message.
    // Shift + Enter can be used for a new line if the input is a textarea.
    input.addEventListener("keydown", function (event) {
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            input.tagName.toLowerCase() === "textarea"
        ) {
            event.preventDefault();

            if (typeof form.requestSubmit === "function") {
                form.requestSubmit();
            }
        }
    });

    // Keep the latest message visible.
    const messageObserver = new MutationObserver(function () {
        messages.scrollTop = messages.scrollHeight;
    });

    messageObserver.observe(messages, {
        childList: true
    });

    console.log("AI Chatbot script loaded successfully.");
});
