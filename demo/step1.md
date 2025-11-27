# Add AG-UI

## Switch to the AG-UI endpoint

### In the `ChatProvider`

Add this:
```ts
  const textBufferRef = useRef<string>("");
    textBufferRef.current = "";
```


And then replace everything in the try with:
```
```

```ts
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
      };

      await agent.runAgent({}, subscriber);
```
```
```


## Add the `add_trip` tool
### `agent.ts` file

```ts
export const addTripTool = createTool({
  id: "add_trip",
  description: "Add a new trip to the user's trip list. Use this when user wants to create/add a trip.",
  inputSchema: z.object({
    name: z.string().describe("Name of the trip"),
    description: z.string().optional().describe("Optional description of the trip"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    return {
      success: true,
      message: `Trip "${context.name}" will be added.`,
    };
  },
});
```

Then add it in the `tools: { add_trip: addTripTool }`


### `ChatProvider`

```ts
        onToolCallEndEvent: async ({ toolCallName, toolCallArgs }) => {
          if (toolCallName === "add_trip") {
            await addTrip(toolCallArgs.name, toolCallArgs.description);
          }
        },
```
```
```
