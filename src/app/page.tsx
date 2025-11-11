import { HashGenerator } from "@/components/hash-generator";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <HashGenerator />
    </main>
  );
}
