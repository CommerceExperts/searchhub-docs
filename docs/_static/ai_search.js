/* AI generated */

document.addEventListener("DOMContentLoaded", function() {
    // 1. Check if we are on the search result page and a query (q=...) exists
    const searchResultsContainer = document.getElementById("search-results");
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q");

    // If not, we don't do anything
    if (!searchResultsContainer || !query) return;

    // 2. Load marked.js dynamically for rendering the markdown
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    script.onload = () => initAISearch(query, searchResultsContainer);
    document.head.appendChild(script);
});

// Global state for this chat session
let chatHistory = [];
const API_URL = "https://docsearch.searchhub.io/api/chat";

async function initAISearch(initialQuery, container) {
    // 3. Inject some basic CSS for the chat bubbles
    const style = document.createElement('style');
    style.innerHTML = `
        .ai-msg-container { margin-bottom: 15px; }
        .ai-msg-user { background: #e9eff5; padding: 10px 15px; border-radius: 8px; margin-left: auto; max-width: 85%; color: #2B2D42; font-weight: 500; border: 1px solid #d3dfea; }
        .ai-msg-bot { padding: 10px 0; }
        .ai-msg-bot p { margin-top: 0; }
        .ai-msg-bot a { color: #2980B9; text-decoration: none; font-weight: bold; border-bottom: 1px dotted #2980B9; }
        .ai-msg-bot a:hover { text-decoration: underline; background-color: #f0f7fb; }
    `;
    document.head.appendChild(style);

    // 4. Create AI-Box in Sphinx design
    const aiBox = document.createElement("div");
    aiBox.id = "ai-overview-box";
    aiBox.style.cssText = `
        background: #fcfcfc;
        border: 1px solid #e1e4e5;
        border-left: 4px solid #2B2D42;
        padding: 20px;
        margin-bottom: 30px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    `;
    
    // We create a chat window and a hidden input area
    aiBox.innerHTML = `
        <h3 style="margin-top: 0; color: #2B2D42; display: flex; align-items: center; gap: 8px;">
            ✨ AI-Overview
        </h3>
        <div id="ai-chat-window" style="max-height: 550px; overflow-y: auto; padding-right: 10px; display: flex; flex-direction: column;">
            <div id="ai-initial-content" class="ai-msg-container ai-msg-bot">
                <em style="color: #666;">Analyzing documentation and generating answer...</em>
            </div>
        </div>
        <div id="ai-input-area" style="display: none; margin-top: 15px; gap: 10px; border-top: 1px solid #eee; padding-top: 15px;">
            <input type="text" id="ai-chat-input" placeholder="Ask a follow-up question..." autocomplete="off" style="flex-grow: 1; padding: 10px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; outline: none;">
            <button id="ai-chat-submit" style="padding: 10px 20px; background: #2B2D42; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.2s;">Ask AI</button>
        </div>
    `;

    // 5. Add the box exactly after the <h2> "Search Results" header
    const h2 = container.querySelector("h2");
    if (h2) {
        h2.after(aiBox);
    } else {
        container.prepend(aiBox);
    }

    // 6. Perform the initial search based on the URL query
    await fetchAndRenderChat(initialQuery, "ai-initial-content", true);

    // 7. Setup event listeners for the follow-up chat
    const submitBtn = document.getElementById("ai-chat-submit");
    const inputField = document.getElementById("ai-chat-input");

    submitBtn.addEventListener("click", handleFollowUp);
    inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleFollowUp();
    });

    // Helper function for follow-up questions
    async function handleFollowUp() {
        const question = inputField.value.trim();
        if (!question) return;

        // Disable input while loading
        inputField.value = "";
        inputField.disabled = true;
        submitBtn.disabled = true;

        const chatWindow = document.getElementById("ai-chat-window");

        // Add user message to UI
        const userMsgDiv = document.createElement("div");
        userMsgDiv.className = "ai-msg-container ai-msg-user";
        userMsgDiv.textContent = question;
        chatWindow.appendChild(userMsgDiv);

        // Add loading placeholder for bot
        const loadingId = "msg-" + Date.now();
        const botMsgDiv = document.createElement("div");
        botMsgDiv.id = loadingId;
        botMsgDiv.className = "ai-msg-container ai-msg-bot";
        botMsgDiv.innerHTML = `<em style="color: #666;">Generating answer...</em>`;
        chatWindow.appendChild(botMsgDiv);

        // Scroll down
        chatWindow.scrollTop = chatWindow.scrollHeight; 

        // Fetch answer
        await fetchAndRenderChat(question, loadingId, false);

        // Re-enable input
        inputField.disabled = false;
        submitBtn.disabled = false;
        inputField.focus();
    }
}

// Function to handle API call, update history, render Markdown, and inject tooltips
async function fetchAndRenderChat(query, targetElementId, isInitial) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: query, history: chatHistory }) 
        });

        if (!response.ok) throw new Error("Network error");

        const data = await response.json();
        
        // Save to history for the next potential follow-up
        chatHistory.push({ role: "user", content: query });
        chatHistory.push({ role: "model", content: data.answer });

        // 1. Render markdown to a raw HTML string
        let rawHtml = marked.parse(data.answer);
        
        // 2. Create a temporary DOM element to manipulate the inline links safely
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = rawHtml;

        // 3. Find all anchor tags generated by the LLM
        const links = tempDiv.querySelectorAll("a");
        links.forEach(link => {
            // Force links to open in a new tab
            link.setAttribute("target", "_blank");

            // Compare link href with our provided backend sources
            if (data.sources && data.sources.length > 0) {
                const matchedSource = data.sources.find(src => {
                    const fullSourceUrl = src.page_url + (src.anchor || "");
                    // Check if the link generated by Gemini matches the actual source URL
                    return link.href === fullSourceUrl || link.href.includes(fullSourceUrl);
                });

                // If a match is found, attach the text for the tooltip listener
                if (matchedSource) {
                    link.classList.add("source-link"); // Class for the tooltip event listener
                    const safeText = matchedSource.text.replace(/"/g, '&quot;');
                    link.setAttribute("data-text", safeText);
                }
            }
        });

        // 4. Update the DOM with the manipulated HTML
        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
            targetElement.innerHTML = tempDiv.innerHTML;
            
            // Scroll to bottom automatically
            const chatWindow = document.getElementById("ai-chat-window");
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }

        // If this was the first load, reveal the chat input box now
        if (isInitial) {
            document.getElementById("ai-input-area").style.display = "flex";
        }

    } catch (error) {
        console.error("AI Search Error:", error);
        const errorMsg = `<span style="color: #d9534f;">Failed to load AI response. Please try again or use the regular search results below.</span>`;
        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
            targetElement.innerHTML = errorMsg;
        }
    }
}