import Map from '@/components/ui/map';

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      {/* Fullscreen Map */}
      <Map className="w-full h-full" />

      {/* Floating Panel */}
      <div className="absolute top-4 left-4 w-80 bg-white rounded-lg shadow-lg z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            KL Art Map
          </h1>
          <p className="text-gray-600 mb-4">
            Discover Street Art in Kuala Lumpur
          </p>

          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 13l-6-3" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Interactive Map</h3>
                <p className="text-sm text-gray-600">Browse art locations</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Curated Collection</h3>
                <p className="text-sm text-gray-600">Handpicked street art</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Artist Profiles</h3>
                <p className="text-sm text-gray-600">Meet the artists</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}