
import Chatbot from "@/components/chatbot/Chatbot";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          University of Swat
        </h1>

        <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
          University AI Assistant — your digital guide to university
          information and services.
        </p>

        <p className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-500">
          Chatbot interface development preview
        </p>
      </div>

      <Chatbot />
    </main>
  );
}
