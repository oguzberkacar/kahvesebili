import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-black flex flex-col items-center justify-center gap-8 text-white">
      <h1 className="text-4xl font-bold tracking-wider">Welcome</h1>
      <Link
        href="/siparis"
        className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
      >
        Sipariş
      </Link>
    </main>
  );
}
