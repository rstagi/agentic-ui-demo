"use client";

import { AgentSubscriber, HttpAgent } from "@ag-ui/client";
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { useTripContext } from "./TripContext";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_LAST_MESSAGE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "TOGGLE_OPEN" }
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "CLEAR_MESSAGES" };

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  isOpen: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "UPDATE_LAST_MESSAGE":
      const updatedMessages = [...state.messages];
      if (updatedMessages.length > 0) {
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          content: action.payload,
        };
      }
      return { ...state, messages: updatedMessages };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "TOGGLE_OPEN":
      return { ...state, isOpen: !state.isOpen };
    case "SET_OPEN":
      return { ...state, isOpen: action.payload };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };
    default:
      return state;
  }
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
  sendMessage: (content: string) => Promise<void>;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const textBufferRef = useRef("");
  const { addTrip } = useTripContext();

  const sendMessage = useCallback(async (content: string) => {
    textBufferRef.current = "";

    const userMessage: Message = { role: "user", content };
    dispatch({ type: "ADD_MESSAGE", payload: userMessage });
    dispatch({ type: "SET_LOADING", payload: true });

    const assistantMessage: Message = { role: "assistant", content: "" };
    dispatch({ type: "ADD_MESSAGE", payload: assistantMessage });

    try {
      const agent = new HttpAgent({
        url: "/api/ag-ui",
      });

      const aguiMessages = [...state.messages, userMessage].map((m) => ({
        id: crypto.randomUUID(),
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      agent.messages = aguiMessages;

      const subscriber: AgentSubscriber = {
        onTextMessageContentEvent: ({ textMessageBuffer }) => {
          textBufferRef.current = textMessageBuffer;
          dispatch({ type: "UPDATE_LAST_MESSAGE", payload: textMessageBuffer });
        },
        onToolCallEndEvent: async ({ toolCallName, toolCallArgs }) => {
          if (toolCallName === "add_trip") {
            await addTrip(toolCallArgs.name, toolCallArgs.description);
          }
        },
      };

      await agent.runAgent({}, subscriber);
    } catch (error) {
      console.error("Chat error:", error);
      dispatch({
        type: "UPDATE_LAST_MESSAGE",
        payload: "Sorry, something went wrong.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.messages]);

  const toggleOpen = useCallback(() => {
    dispatch({ type: "TOGGLE_OPEN" });
  }, []);

  const setOpen = useCallback((open: boolean) => {
    dispatch({ type: "SET_OPEN", payload: open });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: "CLEAR_MESSAGES" });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages: state.messages,
        isLoading: state.isLoading,
        isOpen: state.isOpen,
        sendMessage,
        toggleOpen,
        setOpen,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
