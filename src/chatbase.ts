const CHATBASE_SCRIPT_URL = "https://www.chatbase.co/embed.min.js";
const CHATBASE_SCRIPT_ID = "2R2s-Ak6VZIoRP8STnISV";

type ChatbaseCommand = (...args: unknown[]) => void;

declare global {
  interface Window {
    chatbase?: ChatbaseCommand & {
      q?: unknown[][];
    };
  }
}

function loadChatbase() {
  if (document.querySelector(`script[src="${CHATBASE_SCRIPT_URL}"]`)) return;

  const script = document.createElement("script");
  script.src = CHATBASE_SCRIPT_URL;
  script.id = CHATBASE_SCRIPT_ID;
  script.domain = "www.chatbase.co";
  document.body.appendChild(script);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (!window.chatbase || window.chatbase("getState") !== "initialized") {
    const chatbase: ChatbaseCommand & { q?: unknown[][] } = (...args) => {
      chatbase.q ??= [];
      chatbase.q.push(args);
    };

    window.chatbase = new Proxy(chatbase, {
      get(target, property) {
        if (property === "q") return target.q;
        return (...args: unknown[]) => target(property, ...args);
      },
    });
  }

  if (document.readyState === "complete") {
    loadChatbase();
  } else {
    window.addEventListener("load", loadChatbase, { once: true });
  }
}

export {};
