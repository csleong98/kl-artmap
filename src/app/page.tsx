import Map from '@/components/ui/map';
import FloatingPanel from '@/components/ui/floating-panel';

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      {/* Fullscreen Map */}
      <Map className="w-full h-full" />

      {/* Floating Panel */}
      <FloatingPanel />
    </div>
  );
}