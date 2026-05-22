export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-950 text-white">
      <div className="w-full max-w-md p-8 space-y-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Voxlab Platform</h1>
          <p className="text-sm text-slate-400">Secure Portal Entry</p>
        </div>
        
        {/* Placeholder UI */}
        <div className="p-12 text-center border border-dashed border-slate-700 rounded-xl text-slate-500">
          Supabase Authentication Coming Soon
        </div>
      </div>
    </main>
  );
}