import { Chat } from "@/modules/assistant/chat";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions about your finances.
        </p>
      </div>
      <Chat />
    </div>
  );
}