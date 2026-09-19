(() => {
  const SOPHIE_ENDPOINT =
    "https://tgnanphlebiyuaxrsjec.supabase.co/functions/v1/sophie-chat";

  const PHONE_DISPLAY = "1-844-MR-SONIC";
  const PHONE_LINK = "tel:+18446776642";

  let history = [];
  let busy = false;

  const getSessionId = () => {
    let id = localStorage.getItem("blueSonicSophieSession");

    if (!id) {
      if (window.crypto && crypto.randomUUID) {
        id = crypto.randomUUID();
      } else {
        id =
          "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
      }

      localStorage.setItem("blueSonicSophieSession", id);
    }

    return id;
  };

  const sessionId = getSessionId();

  const style = document.createElement("style");

  style.textContent = `
    #bs-sophie-launcher {
      position: fixed;
      right: 22px;
      bottom: 22px;
      width: 64px;
      height: 64px;
      border: none;
      border-radius: 50%;
      background: linear-gradient(135deg, #008cff, #0054c7);
      color: #fff;
      font-size: 27px;
      cursor: pointer;
      z-index: 999998;
      box-shadow: 0 10px 30px rgba(0,0,0,.32);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #bs-sophie-launcher:hover {
      transform: scale(1.04);
    }

    #bs-sophie-window {
      position: fixed;
      right: 22px;
      bottom: 98px;
      width: min(390px, calc(100vw - 24px));
      height: min(610px, calc(100vh - 130px));
      background: #0c111b;
      border: 1px solid rgba(255,255,255,.15);
      border-radius: 20px;
      z-index: 999999;
      box-shadow: 0 20px 60px rgba(0,0,0,.48);
      overflow: hidden;
      display: none;
      flex-direction: column;
      font-family: Arial, Helvetica, sans-serif;
    }

    #bs-sophie-window.bs-open {
      display: flex;
    }

    .bs-sophie-header {
      background: linear-gradient(135deg, #06182e, #006edc);
      color: white;
      padding: 16px 17px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bs-sophie-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #fff;
      color: #006edc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 19px;
      flex: 0 0 auto;
    }

    .bs-sophie-title {
      flex: 1;
    }

    .bs-sophie-title strong {
      display: block;
      font-size: 17px;
    }

    .bs-sophie-title span {
      font-size: 12px;
      opacity: .85;
    }

    #bs-sophie-close {
      border: none;
      background: transparent;
      color: white;
      font-size: 27px;
      cursor: pointer;
    }

    #bs-sophie-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      background:
        radial-gradient(circle at top, rgba(0,111,220,.10), transparent 35%),
        #0c111b;
    }

    .bs-msg {
      max-width: 84%;
      padding: 11px 13px;
      margin: 8px 0;
      border-radius: 15px;
      line-height: 1.42;
      font-size: 14px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .bs-assistant {
      background: #172235;
      color: #f5f8ff;
      border-bottom-left-radius: 4px;
    }

    .bs-user {
      background: #087cf0;
      color: white;
      margin-left: auto;
      border-bottom-right-radius: 4px;
    }

    .bs-typing {
      opacity: .72;
      font-style: italic;
    }

    .bs-sophie-call {
      padding: 8px 14px 0;
      background: #0c111b;
      font-size: 12px;
      color: #aebbd0;
    }

    .bs-sophie-call a {
      color: #62adff;
      text-decoration: none;
      font-weight: 700;
    }

    .bs-sophie-form {
      display: flex;
      gap: 8px;
      padding: 12px;
      background: #111927;
      border-top: 1px solid rgba(255,255,255,.1);
    }

    #bs-sophie-input {
      flex: 1;
      min-width: 0;
      border: 1px solid #33435d;
      border-radius: 12px;
      padding: 11px 12px;
      background: #080d15;
      color: white;
      outline: none;
      font-size: 14px;
    }

    #bs-sophie-input::placeholder {
      color: #8793a5;
    }

    #bs-sophie-send {
      border: none;
      border-radius: 12px;
      padding: 0 15px;
      background: #087cf0;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    #bs-sophie-send:disabled {
      opacity: .55;
      cursor: default;
    }

    @media (max-width: 600px) {
      #bs-sophie-launcher {
        right: 14px;
        bottom: 16px;
      }

      #bs-sophie-window {
        right: 12px;
        bottom: 92px;
        width: calc(100vw - 24px);
        height: min(620px, calc(100vh - 112px));
      }
    }
  `;

  document.head.appendChild(style);

  const launcher = document.createElement("button");
  launcher.id = "bs-sophie-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Chat with Sophie");
  launcher.innerHTML = "💬";

  const widget = document.createElement("section");
  widget.id = "bs-sophie-window";
  widget.setAttribute("aria-label", "Blue Sonic Sophie AI Chat");

  widget.innerHTML = `
    <div class="bs-sophie-header">
      <div class="bs-sophie-avatar">S</div>

      <div class="bs-sophie-title">
        <strong>Sophie</strong>
        <span>Blue Sonic AI Assistant • Online</span>
      </div>

      <button
        id="bs-sophie-close"
        type="button"
        aria-label="Close chat"
      >
        &times;
      </button>
    </div>

    <div id="bs-sophie-messages"></div>

    <div class="bs-sophie-call">
      Prefer to call?
      <a href="${PHONE_LINK}">
        ${PHONE_DISPLAY}
      </a>
    </div>

    <form class="bs-sophie-form" id="bs-sophie-form">
      <input
        id="bs-sophie-input"
        type="text"
        autocomplete="off"
        maxlength="1200"
        placeholder="Ask Sophie anything..."
      >

      <button
        id="bs-sophie-send"
        type="submit"
      >
        Send
      </button>
    </form>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(widget);

  const closeButton =
    document.getElementById("bs-sophie-close");

  const form =
    document.getElementById("bs-sophie-form");

  const input =
    document.getElementById("bs-sophie-input");

  const sendButton =
    document.getElementById("bs-sophie-send");

  const messages =
    document.getElementById("bs-sophie-messages");

  const addMessage = (
    role,
    text,
    extraClass = ""
  ) => {
    const bubble = document.createElement("div");

    bubble.className =
      `bs-msg ${
        role === "user"
          ? "bs-user"
          : "bs-assistant"
      } ${extraClass}`;

    bubble.textContent = text;

    messages.appendChild(bubble);

    messages.scrollTop =
      messages.scrollHeight;

    return bubble;
  };

  addMessage(
    "assistant",
    "Hi! I’m Sophie, Blue Sonic’s AI assistant. I can help with moving, demolition, debris removal, construction support, project inquiries, estimates, and general questions. How can I help you today?"
  );

  launcher.addEventListener(
    "click",
    () => {
      widget.classList.toggle("bs-open");

      if (
        widget.classList.contains("bs-open")
      ) {
        setTimeout(
          () => input.focus(),
          100
        );
      }
    }
  );

  closeButton.addEventListener(
    "click",
    () => {
      widget.classList.remove("bs-open");
    }
  );

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const message =
        input.value.trim();

      if (!message || busy) {
        return;
      }

      busy = true;

      input.value = "";

      sendButton.disabled = true;

      addMessage(
        "user",
        message
      );

      const typing =
        addMessage(
          "assistant",
          "Sophie is typing...",
          "bs-typing"
        );

      const previousHistory =
        history.slice(-10);

      history.push({
        role: "user",
        content: message
      });

      try {
        const controller =
          new AbortController();

        const timeoutId =
          setTimeout(
            () => controller.abort(),
            45000
          );

        const response =
          await fetch(
            SOPHIE_ENDPOINT,
            {
              method: "POST",

              mode: "cors",

              cache: "no-store",

              credentials: "omit",

              headers: {
                "Content-Type":
                  "text/plain;charset=UTF-8",

                "Accept":
                  "application/json"
              },

              body:
                JSON.stringify({
                  session_id:
                    sessionId,

                  message:
                    message,

                  history:
                    previousHistory,

                  page_url:
                    window.location.href,

                  page_title:
                    document.title
                }),

              signal:
                controller.signal
            }
          );

        clearTimeout(timeoutId);

        const raw =
          await response.text();

        let data = {};

        try {
          data =
            raw
              ? JSON.parse(raw)
              : {};
        } catch (_) {
          data = {};
        }

        typing.remove();

        if (!response.ok) {
          throw new Error(
            data.error ||
            `Sophie chat service error (${response.status})`
          );
        }

        const reply =
          data.reply ||
          data.message ||
          "Thanks. I received your message. How else can I help?";

        addMessage(
          "assistant",
          reply
        );

        history.push({
          role: "assistant",
          content: reply
        });

      } catch (error) {

        console.error(
          "Sophie chat error:",
          error
        );

        if (
          typing.isConnected
        ) {
          typing.remove();
        }

        const timedOut =
          error &&
          typeof error === "object" &&
          error.name === "AbortError";

        addMessage(
          "assistant",

          timedOut
            ? `The chat request took too long. Please try again, or call ${PHONE_DISPLAY}.`
            : `I'm having trouble connecting right now. Please call ${PHONE_DISPLAY} and Blue Sonic can assist you.`
        );

      } finally {

        busy = false;

        sendButton.disabled = false;

        input.focus();
      }
    }
  );
})();
