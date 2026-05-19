const input = document.querySelector("#userinput");
const chatContainer = document.querySelector("#chat_container");
const askButton = document.querySelector("#ask_button");
const inputBox = document.querySelector("#input_box");
const uploadBtn = document.querySelector("#upload_btn");
const uploadInput = document.querySelector("#pdf_upload");
const uploadStatus = document.querySelector("#upload_status");

uploadBtn.addEventListener("click", () => {
  uploadInput.click();
});

uploadInput.addEventListener("change", uploadPdf);
input.addEventListener("keydown", handleEnter);
askButton.addEventListener("click", handleAsk);

// Loading Bubble for chat

const loading = document.createElement("div");

// Tailwind classes for bubble
loading.className = "my-6 bg-neutral-800 p-3 rounded-xl w-fit";

// Inner dots container
loading.innerHTML = `
  <div class="flex items-center gap-1">
    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
`;

// function for generating messages from LLM

async function generate(text) {

  let assistantMsg;

  try{

  // Scrolling Function

  setTimeout(() => {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }, 100);

  // Append user message to chat UI

  const msg = document.createElement("div");
  msg.className = `bg-neutral-800 my-6 p-4 rounded-xl ml-auto max-w-fit`;
  msg.textContent = text;
  chatContainer?.appendChild(msg);
  input.value = "";

  // Adding Loading Bubble to chat UI

  chatContainer?.appendChild(loading);

  // Send Message To LLM

  const assistantResponse = await callServer(text);
  console.log(assistantResponse);

  // Append assistant message to chat UI

  assistantMsg = document.createElement("div");
  assistantMsg.className = `max-w-fit`;
  assistantMsg.textContent = assistantResponse;
  chatContainer?.appendChild(assistantMsg);

} catch (error) {

    console.log(error);

    const errorMsg =
      document.createElement("div");

    errorMsg.className =
      "text-red-400 my-6";

    errorMsg.textContent =
      "Something went wrong";

    chatContainer.appendChild(errorMsg);

} finally {

  // Remove Loading Bubble from chat UI

  if (assistantMsg) {
    chatContainer?.removeChild(loading);
  }

  // Scrolling Function

  setTimeout(() => {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }, 100);

   askButton.disabled = false;
}
}

// Function for calling server

async function callServer(inputText) {
  const response = await fetch("https://sacnexus-ai-backend.onrender.com/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ message: inputText }),
  });

  if (!response.ok) {
    throw new Error("Failed to connect server");
  }

  const result = await response.json();
  return result.Assistant_Message;
}

// function for Ask button

async function handleAsk() {
  const text = input.value.trim();
  if (!text) return;
  askButton.disabled = true;
  await generate(text);
}

// function for Enter key

async function handleEnter(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    askButton.disabled = true;
    await generate(text);
  }
}

// function for Uploading Pdf

async function uploadPdf(){

   const file = uploadInput.files[0];

  if (!file) {
    return;
  }

  uploadBtn.disabled = true;

  uploadBtn.innerHTML =
    `<i class="fa-solid fa-spinner fa-spin"></i>`;

  const formData = new FormData();

  formData.append("pdf", file);

  try{

  const response = await fetch(
    "https://sacnexus-ai-backend.onrender.com/upload",
    {
      method: "POST",
      body: formData,
    }
  );

    const result = await response.json();

    uploadBtn.innerHTML =
      `<i class="fa-solid fa-check"></i>`;

    setTimeout(() => {

      uploadBtn.innerHTML =
        `<i class="fa-solid fa-file-arrow-up"></i>`;

    }, 2000);

  } catch (error) {

    console.log(error);

    uploadBtn.innerHTML =
      `<i class="fa-solid fa-xmark"></i>`;

  } finally {

    uploadBtn.disabled = false;

    uploadInput.value = "";
  }
}

