import type { Metadata } from "next";
import "./globals.css";
import { TripProvider } from "@/contexts/TripContext";
import { PlaceProvider } from "@/contexts/PlaceContext";
import ChatSidebar from "@/components/ChatSidebar";
import { ChatProvider } from "@/contexts/ChatContext";

export const metadata: Metadata = {
  title: "Wanderlust - Trip Planner",
  description: "Plan your adventures with an interactive itinerary builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased h-screen flex flex-col overflow-hidden">
        <TripProvider>
          <PlaceProvider>
            <ChatProvider>
              <div className="flex flex-1 min-h-0">
                <div className="flex-1 min-w-0 flex flex-col overflow-auto">
                  {children}
                </div>
                <ChatSidebar />
              </div>
            </ChatProvider>
          </PlaceProvider>
        </TripProvider>
      </body>
    </html>
  );
}
