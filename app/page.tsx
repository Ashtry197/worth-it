import { Calculator } from "@/components/Calculator";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Worth It</h1>
        <p className="text-gray-600">
          Score a job on pay, hours, commute and conditions — not salary alone.
          Everything runs in your browser; nothing is sent anywhere.
        </p>
      </header>
      <Calculator />
    </main>
  );
}
