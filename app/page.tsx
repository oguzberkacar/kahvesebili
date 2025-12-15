import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  const env = process.env.APP_ENV;

  if (env === "master") {
    redirect("/siparis");
  }

  if (env === "station") {
    const stationId = process.env.STATION_ID;
    if (stationId) {
      redirect(`/station/${stationId}`);
    }
  }

  return (
    <main className="min-h-screen w-full bg-black flex flex-col items-center justify-center gap-8 text-white">
      <h1 className="text-4xl font-bold tracking-wider">Welcome</h1>
      <Link
        href="/siparis"
        className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
      >
        Sipariş
      </Link>
      <Link
        href="/station/guatemala/biriyasinisevsin"
        className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
      >
        test order
      </Link>
      <Link
        href="/station/guatemala"
        className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
      >
        idle
      </Link>
      <Link
        href="/station/ethiopia"
        className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
      >
        not active
      </Link>
      <Link
        href="/pin"
        className="px-8 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
      >
        GPIO /pin
      </Link>
    </main>
  );
}
