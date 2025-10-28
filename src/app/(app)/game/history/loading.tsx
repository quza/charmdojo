export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#04060c]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#e15f6e] border-t-transparent" />
        <p className="text-sm text-gray-400">Loading history...</p>
      </div>
    </div>
  );
}

