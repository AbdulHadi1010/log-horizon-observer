import { useState } from "react";
import { TicketSystem } from "@/components/resolvix/TicketSystem";
import { TicketDetails } from "@/components/resolvix/TicketDetails";

export default function TicketsPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  if (selectedTicketId) {
    return (
      <TicketDetails 
        ticketId={selectedTicketId} 
        onBack={() => setSelectedTicketId(null)} 
      />
    );
  }

  return <TicketSystem onTicketSelect={setSelectedTicketId} />;
}
