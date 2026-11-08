import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        404
      </p>
      <h1 className="mt-6 text-3xl font-bold text-white">Page not found</h1>
      <p className="mt-3 max-w-md text-gray-400">
        The page you are looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
      >
        Back to home
      </Link>
    </main>
  );
}
