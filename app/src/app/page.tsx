import PresaleCard from "@/components/PresaleCard";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">Launchpad + Presale Demo</h1>
      <PresaleCard />
      <p className="mt-6 text-center text-sm text-gray-500">
        After the sale is finalized, claims unlock per vesting schedule.
      </p>
    </main>
  );
}
