import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", function () {
    // =========================================
    // FIREBASE AUTHENTICATION ELEMENTS
    // =========================================

    const authModal = document.getElementById("authModal");
    const openSignInBtn = document.getElementById("openSignInBtn");
    const openLoginBtn = document.getElementById("openLoginBtn");
    const closeAuthBtn = document.getElementById("closeAuthBtn");
    const authTitle = document.getElementById("authTitle");
    const authDescription = document.getElementById("authDescription");
    const authForm = document.getElementById("authForm");

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
                "Log in to your AI Astra account."
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

    // Create a new Firebase account.
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

    // Log in when the popup form is submitted.
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

            const loginButton = document.getElementById("loginBtn");

            try {
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
                if (loginButton) loginButton.disabled = false;
            }
        });
    }

    // Log out.
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

    // Update the popup when Firebase authentication changes.
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
                    "You are signed in to AI Astra.";
            }

        } else {
            if (loggedOutView) loggedOutView.hidden = false;
            if (loggedInView) loggedInView.hidden = true;
            if (userEmail) userEmail.textContent = "";
        }
    });


    // =========================================
    // CHATBOT ELEMENTS
    // =========================================

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
    "https://my-ai-chatbot-api.abdurrshaik.workers.dev/chat";

    const STORAGE_KEY = "aiChatbotConversationsV1";

    const MAX_IMAGES = 3;
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    let selectedImages = [];
    let isSending = false;


    // =========================================
    // IMAGE PREVIEW AREA
    // =========================================

    const inputArea = document.querySelector(".input-area");

    let previewArea = document.getElementById("attachmentPreview");

    if (!previewArea) {
        previewArea = document.createElement("div");
        previewArea.id = "attachmentPreview";
        previewArea.className = "attachment-preview";
    }

    previewArea.setAttribute(
        "aria-label",
        "Selected image attachments"
    );

    if (inputArea && form) {
        inputArea.insertBefore(previewArea, form);
    }


    // =========================================
    // ATTACHMENT STATUS MESSAGE
    // =========================================

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

        if (inputArea && form) {
            inputArea.insertBefore(attachmentStatus, form);
        }
    }

    function setAttachmentStatus(text, isError) {
        if (!attachmentStatus) return;

        attachmentStatus.textContent = text || "";
        attachmentStatus.style.color = isError ? "#dc2626" : "";
    }


    // =========================================
    // ATTACHMENT MENU
    // =========================================

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


    // =========================================
    // IMAGE READING AND VALIDATION
    // =========================================

    function getImageType(file) {
        if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return file.type;
        }

        const extension = file.name
            .split(".")
            .pop()
            .toLowerCase();

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
            if (!(file instanceof Blob)) {
                reject(new Error("The selected item is not a valid file."));
                return;
            }

            const reader = new FileReader();

            reader.onload = function () {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                } else {
                    reject(new Error("The image data could not be read."));
                }
            };

            reader.onerror = function () {
                reject(
                    reader.error ||
                    new Error("The browser could not read this file.")
                );
            };

            reader.onabort = function () {
                reject(new Error("Reading the image was cancelled."));
            };

            reader.readAsDataURL(file);
        });
    }

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
                    file.name + " is too large. Maximum size is 5 MB.",
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
                console.error("Selected file:", file);

                setAttachmentStatus(
                    "Could not read image: " +
                    (error.message || "Unknown error"),
                    true
                );
            }
        }
    }

    function renderImagePreviews() {
        if (!previewArea) return;

        previewArea.replaceChildren();

        selectedImages.forEach(function (image, index) {
            const preview = document.createElement("div");
            preview.className = "attachment-preview-item";

            const img = document.createElement("img");

            img.src = image.dataURL;
            img.alt = image.name || "Attached image";
            img.loading = "lazy";

            img.style.setProperty("display", "block", "important");
            img.style.setProperty("width", "auto", "important");
            img.style.setProperty("height", "auto", "important");
            img.style.setProperty("max-width", "320px", "important");
            img.style.setProperty("max-height", "300px", "important");
            img.style.setProperty("object-fit", "contain");

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

        previewArea.hidden = selectedImages.length === 0;
    }

    [cameraInput, photosInput, filesInput].forEach(function (fileInput) {
        if (!fileInput) return;

        fileInput.addEventListener("change", async function () {
            await handleSelectedFiles(fileInput.files);

            // Allow the same image to be selected again later.
            fileInput.value = "";
        });
    });


    // =========================================
// MOBILE SIDEBAR
// =========================================


// =========================================
// MOBILE SIDEBAR
// =========================================

// Track whether the mobile menu has its own browser history entry.
let sidebarHistoryOpen = false;

function closeSidebar() {
    if (!sidebar || !app) return;

    // On mobile, use browser history to handle closing.
    if (window.innerWidth <= 768 && sidebarHistoryOpen) {
        history.back();
        return;
    }

    sidebar.classList.remove("sidebar-open");
    app.classList.remove("sidebar-visible");

    if (sidebarToggle) {
        sidebarToggle.setAttribute("aria-expanded", "false");
    }
}

function openSidebar() {
    if (!sidebar || !app) return;

    // Add a history entry when opening the mobile menu.
    if (window.innerWidth <= 768 && !sidebarHistoryOpen) {
        history.pushState(
            { mobileSidebar: true },
            "",
            window.location.pathname + "#menu"
        );

        sidebarHistoryOpen = true;
    }

    sidebar.classList.add("sidebar-open");
    app.classList.add("sidebar-visible");

    if (sidebarToggle) {
        sidebarToggle.setAttribute("aria-expanded", "true");
    }
}

function toggleSidebar() {
    if (!sidebar || !app) return;

    if (app.classList.contains("sidebar-visible")) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

// Start with the sidebar closed on mobile.
if (sidebar && app) {
    if (window.innerWidth <= 768) {
        sidebar.classList.remove("sidebar-open");
        app.classList.remove("sidebar-visible");
    } else {
        openSidebar();
    }
}

// Menu button
if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
}

// Android/browser Back button
window.addEventListener("popstate", function () {
    if (!sidebarHistoryOpen) return;

    sidebarHistoryOpen = false;

    sidebar.classList.remove("sidebar-open");
    app.classList.remove("sidebar-visible");

    if (sidebarToggle) {
        sidebarToggle.setAttribute("aria-expanded", "false");
    }
});

// Close the menu with Escape on a keyboard.
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeSidebar();
    }
});

// Handle screen resizing.
window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
        sidebarHistoryOpen = false;
        sidebar.classList.add("sidebar-open");
        app.classList.add("sidebar-visible");
    } else {
        sidebar.classList.remove("sidebar-open");
        app.classList.remove("sidebar-visible");

        if (sidebarToggle) {
            sidebarToggle.setAttribute("aria-expanded", "false");
        }
    }
});


// =========================================
// MOBILE KEYBOARD / INPUT POSITION
// =========================================

function updateKeyboardPosition() {
    if (!app) return;

    if (window.visualViewport && window.innerWidth <= 768) {
        const viewport = window.visualViewport;
        const keyboardHeight = Math.max(
            0,
            window.innerHeight - viewport.height - viewport.offsetTop
        );

        app.style.setProperty(
            "--keyboard-height",
            keyboardHeight + "px"
        );
    } else {
        app.style.setProperty("--keyboard-height", "0px");
    }
}

if (window.visualViewport) {
    window.visualViewport.addEventListener(
        "resize",
        updateKeyboardPosition
    );

    window.visualViewport.addEventListener(
        "scroll",
        updateKeyboardPosition
    );
}

window.addEventListener("resize", updateKeyboardPosition);

updateKeyboardPosition();


    // =========================================
    // CONVERSATION DATA
    // =========================================

    let conversations = [];
    let currentChatId = null;

    function createChatId() {
        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {
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

        selectedImages = [];
        renderImagePreviews();
        setAttachmentStatus("", false);

        saveConversations();
        renderChatHistory();
        renderCurrentChat();

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


    // =========================================
    // DISPLAY CHAT MESSAGES
    // =========================================

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

                img.style.setProperty("display", "block", "important");
                img.style.setProperty("width", "auto", "important");
                img.style.setProperty("height", "auto", "important");
                img.style.setProperty("max-width", "320px", "important");
                img.style.setProperty("max-height", "300px", "important");
                img.style.setProperty("object-fit", "contain");

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
            heading.textContent = "Welcome to AI Astra";

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


    // =========================================
    // CHAT HISTORY SIDEBAR
    // =========================================

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

                selectedImages = [];
                renderImagePreviews();
                setAttachmentStatus("", false);

                renderChatHistory();
                renderCurrentChat();

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


    // =========================================
    // LOAD SAVED CHATS
    // =========================================

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
        newChatBtn.addEventListener("click", function (event) {
            event.preventDefault();
            createNewChat();
        });
    }


    // =========================================
    // SEND CHAT MESSAGE
    // =========================================

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

        const userMessage = {
            role: "user",
            text: userText,
            images: attachedImages,
            timestamp: Date.now()
        };

        chat.messages.push(userMessage);

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

        const loadingMessage = document.createElement("div");

        loadingMessage.className = "message bot-message";
        loadingMessage.textContent = "AI is thinking…";
        loadingMessage.setAttribute("aria-live", "polite");

        messages.appendChild(loadingMessage);
        messages.scrollTop = messages.scrollHeight;

        try {
            const latestMessage =
                chat.messages[chat.messages.length - 1];

            const content = [];

            if (latestMessage.text) {
                content.push({
                    type: "text",
                    text: latestMessage.text
                });
            }

            const latestImages = Array.isArray(latestMessage.images)
                ? latestMessage.images
                : [];

            latestImages.forEach(function (image) {
                if (!image || !image.dataURL) return;

                content.push({
                    type: "image_url",
                    image_url: {
                        url: image.dataURL
                    }
                });
            });

            const apiMessages = [{
                role: latestMessage.role,
                content: content
            }];

            const response = await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        message: latestMessage.text || "Please describe the attached image."
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
                    // Use the default error message.
                }

                throw new Error(
                    "HTTP " + response.status + ": " + errorMessage
                );
            }

            const data = await response.json();

            let botText = "";

            if (
                data.choices &&
                data.choices[0] &&
                data.choices[0].message
            ) {
                const responseContent =
                    data.choices[0].message.content;

                if (typeof responseContent === "string") {
                    botText = responseContent;

                } else if (Array.isArray(responseContent)) {
                    botText = responseContent
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

            loadingMessage.remove();

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


    // =========================================
    // ENTER SENDS; SHIFT + ENTER ADDS A NEW LINE
    // =========================================

    input.addEventListener("keydown", function (event) {
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            input.tagName.toLowerCase() === "textarea"
        ) {
            event.preventDefault();

            if (typeof form.requestSubmit === "function") {
                form.requestSubmit();
            } else {
                form.dispatchEvent(
                    new Event("submit", {
                        bubbles: true,
                        cancelable: true
                    })
                );
            }
        }
    });


    // =========================================
    // KEEP LATEST MESSAGE VISIBLE
    // =========================================

    const messageObserver = new MutationObserver(function () {
        messages.scrollTop = messages.scrollHeight;
    });

    messageObserver.observe(messages, {
        childList: true
    });

    console.log("AI Astra script loaded successfully.");
});

// =====================================
// GEMINI LIVE VOICE CHAT
// Replace the previous voice-chat block
// =====================================

document.addEventListener("DOMContentLoaded", function () {
    const WORKER_URL =
        "https://my-ai-chatbot-api.abdurrshaik.workers.dev";

    // This model must match the model allowed by your Worker token.
    const LIVE_MODEL = "models/gemini-3.8-live";

    const openBtn = document.getElementById("openVoiceBtn");
    const overlay = document.getElementById("voiceOverlay");
    const closeBtn = document.getElementById("voiceCloseBtn");
    const startBtn = document.getElementById("voiceStartBtn");
    const muteBtn = document.getElementById("voiceMuteBtn");
    const stopBtn = document.getElementById("voiceStopBtn");
    const statusText = document.getElementById("voiceStatus");

    if (
        !openBtn || !overlay || !closeBtn || !startBtn ||
        !muteBtn || !stopBtn || !statusText
    ) {
        console.warn("Voice chat HTML elements are missing. Check their IDs.");
        return;
    }

    let socket = null;
    let microphoneStream = null;
    let audioContext = null;
    let microphoneSource = null;
    let microphoneProcessor = null;
    let silentGain = null;

    let isStarting = false;
    let isMuted = false;
    let setupFinished = false;
    let nextPlaybackTime = 0;

    function setStatus(message) {
        statusText.textContent = message;
    }

    function setButtons(isActive) {
        startBtn.disabled = isActive;
        muteBtn.disabled = !isActive;
        stopBtn.disabled = !isActive;
    }

    function bytesToBase64(bytes) {
        let binary = "";
        const chunkSize = 0x8000;

        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(
                ...bytes.subarray(i, i + chunkSize)
            );
        }

        return btoa(binary);
    }

    function base64ToBytes(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        return bytes;
    }

    function resampleTo16k(input, inputRate) {
        const outputRate = 16000;

        if (inputRate === outputRate) {
            return input;
        }

        const ratio = inputRate / outputRate;
        const outputLength = Math.floor(input.length / ratio);
        const output = new Float32Array(outputLength);

        for (let i = 0; i < outputLength; i++) {
            const position = i * ratio;
            const left = Math.floor(position);
            const right = Math.min(left + 1, input.length - 1);
            const fraction = position - left;

            output[i] =
                input[left] * (1 - fraction) +
                input[right] * fraction;
        }

        return output;
    }

    function floatToPcm16(samples) {
        const pcm = new Int16Array(samples.length);

        for (let i = 0; i < samples.length; i++) {
            const sample = Math.max(-1, Math.min(1, samples[i]));

            pcm[i] = sample < 0
                ? sample * 0x8000
                : sample * 0x7fff;
        }

        return new Uint8Array(pcm.buffer);
    }

    function sendMicrophoneAudio(samples) {
        if (
            !socket ||
            socket.readyState !== WebSocket.OPEN ||
            !setupFinished ||
            isMuted
        ) {
            return;
        }

        const resampled = resampleTo16k(
            samples,
            audioContext.sampleRate
        );

        const pcmBytes = floatToPcm16(resampled);

        socket.send(JSON.stringify({
            realtimeInput: {
                audio: {
                    mimeType: "audio/pcm;rate=16000",
                    data: bytesToBase64(pcmBytes)
                }
            }
        }));
    }

    function playGeminiAudio(base64Audio) {
        if (!audioContext || audioContext.state === "closed") {
            return;
        }

        const bytes = base64ToBytes(base64Audio);
        const usableLength = bytes.byteLength - (bytes.byteLength % 2);

        if (!usableLength) {
            return;
        }

        const pcm = new Int16Array(
            bytes.buffer,
            bytes.byteOffset,
            usableLength / 2
        );

        const audioBuffer = audioContext.createBuffer(
            1,
            pcm.length,
            24000
        );

        const channel = audioBuffer.getChannelData(0);

        for (let i = 0; i < pcm.length; i++) {
            channel[i] = pcm[i] / 32768;
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        const startAt = Math.max(
            audioContext.currentTime,
            nextPlaybackTime
        );

        source.start(startAt);
        nextPlaybackTime = startAt + audioBuffer.duration;
    }

    function startMicrophone() {
        microphoneSource =
            audioContext.createMediaStreamSource(microphoneStream);

        microphoneProcessor =
            audioContext.createScriptProcessor(4096, 1, 1);

        microphoneProcessor.onaudioprocess = function (event) {
            const inputSamples =
                event.inputBuffer.getChannelData(0);

            sendMicrophoneAudio(new Float32Array(inputSamples));
        };

        // Keep the microphone processor running without outputting mic audio.
        silentGain = audioContext.createGain();
        silentGain.gain.value = 0;

        microphoneSource.connect(microphoneProcessor);
        microphoneProcessor.connect(silentGain);
        silentGain.connect(audioContext.destination);
    }

    function stopVoiceChat() {
        setupFinished = false;

        const oldSocket = socket;
        socket = null;

        if (
            oldSocket &&
            (
                oldSocket.readyState === WebSocket.OPEN ||
                oldSocket.readyState === WebSocket.CONNECTING
            )
        ) {
            oldSocket.close();
        }

        if (microphoneProcessor) {
            microphoneProcessor.disconnect();
            microphoneProcessor.onaudioprocess = null;
            microphoneProcessor = null;
        }

        if (microphoneSource) {
            microphoneSource.disconnect();
            microphoneSource = null;
        }

        if (silentGain) {
            silentGain.disconnect();
            silentGain = null;
        }

        if (microphoneStream) {
            microphoneStream.getTracks().forEach(function (track) {
                track.stop();
            });
            microphoneStream = null;
        }

        if (audioContext && audioContext.state !== "closed") {
            audioContext.close();
        }

        audioContext = null;
        nextPlaybackTime = 0;
        isMuted = false;

        muteBtn.textContent = "Mute";
        setButtons(false);
    }

    function handleGeminiMessage(event) {
        let data;

        try {
            data = JSON.parse(event.data);
        } catch (error) {
            console.warn("Could not read Gemini voice message.", error);
            return;
        }

        if (data.setupComplete) {
            setupFinished = true;

            try {
                startMicrophone();
                setButtons(true);
                setStatus("Listening… Speak naturally.");
            } catch (error) {
                console.error("Microphone setup failed:", error);
                setStatus("Could not start the microphone.");
                stopVoiceChat();
            }

            return;
        }

        if (data.serverContent) {
            const content = data.serverContent;

            if (content.modelTurn && content.modelTurn.parts) {
                content.modelTurn.parts.forEach(function (part) {
                    if (
                        part.inlineData &&
                        part.inlineData.mimeType &&
                        part.inlineData.mimeType.startsWith("audio/pcm") &&
                        typeof part.inlineData.data === "string"
                    ) {
                        playGeminiAudio(part.inlineData.data);
                    }
                });
            }

            if (content.turnComplete) {
                setStatus("Listening… Speak whenever you're ready.");
            }
        }

        if (data.error) {
            console.error("Gemini Live error:", data.error);
            setStatus(
                data.error.message || "Gemini voice chat returned an error."
            );
        }
    }

    async function startVoiceChat() {
        if (isStarting || socket) {
            return;
        }

        isStarting = true;
        setupFinished = false;
        startBtn.disabled = true;
        setStatus("Connecting to Gemini…");

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error(
                    "Microphone access needs a secure HTTPS connection."
                );
            }

            // Get a short-lived token from your Cloudflare Worker.
            const tokenResponse = await fetch(
                `${WORKER_URL}/voice-token`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({})
                }
            );

            const tokenData = await tokenResponse.json();

            if (!tokenResponse.ok || !tokenData.token) {
                throw new Error(
                    tokenData.error || "Could not get a Gemini voice token."
                );
            }

            microphoneStream =
                await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });

            audioContext = new AudioContext();
            await audioContext.resume();

            const wsUrl =
                "wss://generativelanguage.googleapis.com/ws/" +
                "google.ai.generativelanguage.v1alpha.GenerativeService." +
                "BidiGenerateContentConstrained?access_token=" +
                encodeURIComponent(tokenData.token);

            socket = new WebSocket(wsUrl);

            socket.onopen = function () {
                setStatus("Setting up voice chat…");

                socket.send(JSON.stringify({
                    setup: {
                        model: LIVE_MODEL,
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: "Kore"
                                    }
                                }
                            }
                        },
                        systemInstruction: {
                            parts: [{
                                text:
                                    "You are a helpful voice assistant. " +
                                    "Answer naturally and clearly. " +
                                    "Keep spoken answers concise unless " +
                                    "the user asks for more detail."
                            }]
                        }
                    }
                }));
            };

            socket.onmessage = handleGeminiMessage;

            socket.onerror = function () {
                setStatus("Voice connection error. Please try again.");
            };

            socket.onclose = function (event) {
                console.warn(
                    "Gemini voice connection closed:",
                    event.code,
                    event.reason
                );

                stopVoiceChat();
                setStatus("Voice chat ended. Press Start to reconnect.");
            };

        } catch (error) {
            console.error("Could not start voice chat:", error);
            setStatus(error.message || "Could not start voice chat.");
            stopVoiceChat();

        } finally {
            isStarting = false;

            if (!socket) {
                startBtn.disabled = false;
            }
        }
    }

    openBtn.addEventListener("click", function () {
        overlay.hidden = false;
        setStatus("Press Start to begin.");
    });

    closeBtn.addEventListener("click", function () {
        stopVoiceChat();
        overlay.hidden = true;
    });

    startBtn.addEventListener("click", startVoiceChat);

    stopBtn.addEventListener("click", function () {
        stopVoiceChat();
        setStatus("Voice chat stopped.");
    });

    muteBtn.addEventListener("click", function () {
        if (!microphoneStream) {
            return;
        }

        isMuted = !isMuted;

        microphoneStream.getAudioTracks().forEach(function (track) {
            track.enabled = !isMuted;
        });

        muteBtn.textContent = isMuted ? "Unmute" : "Mute";

        setStatus(
            isMuted
                ? "Microphone muted."
                : "Listening… Speak naturally."
        );
    });

    setButtons(false);
});

// =====================================
// ANDROID KEYBOARD INPUT POSITION
// =====================================

// =====================================
// ANDROID KEYBOARD INPUT POSITION
// =====================================

(function () {
    const viewport = window.visualViewport;
    const inputArea = document.querySelector(".input-area");

    if (!viewport || !inputArea) return;

    function updateLayout() {
        const keyboardHeight = Math.max(
            0,
            window.innerHeight - viewport.height - viewport.offsetTop
        );

        document.documentElement.style.setProperty(
            "--keyboard-offset",
            keyboardHeight + "px"
        );

        // Measure the complete input area, including disclaimer.
        const inputHeight = inputArea.getBoundingClientRect().height;

        document.documentElement.style.setProperty(
            "--input-area-height",
            inputHeight + "px"
        );
    }

    viewport.addEventListener("resize", updateLayout);
    viewport.addEventListener("scroll", updateLayout);
    window.addEventListener("resize", updateLayout);

    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(updateLayout);
        observer.observe(inputArea);
    }

    updateLayout();
})();
