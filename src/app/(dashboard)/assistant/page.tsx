import { getCurrentContext } from "@/lib/current-org";
import { db } from "@/lib/db";
import { Chat } from "@/modules/assistant/chat";

export default async function AssistantPage() {
  const { user, organization } = await getCurrentContext();

  if (process.env.AI_ENABLED !== "true") {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about your finances.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Coming soon.
        </div>
      </div>
    );
  }

  const conversation = await db.conversation.findFirst({
    where: { organizationId: organization.id, userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { role: true, content: true },
      },
    },
  });

  const initialMessages = (conversation?.messages ?? [])
    .reverse()
    .map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions about your finances.
        </p>
      </div>
      <Chat
        initialMessages={initialMessages}
        initialConversationId={conversation?.id ?? null}
      />
    </div>
  );
}