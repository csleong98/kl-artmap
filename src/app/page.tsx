import Map from '@/components/ui/map';

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              KL Art Map
            </h1>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-4rem)]">
        <Map className="w-full h-full" />
      </main>
    </div>
  );
}
