'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Location } from '@/types';
import { WalkingRouteData } from '@/hooks/useWalkingRoutes';

interface LocationDetailProps {
  location: Location;
  onBack?: () => void;
  routeData?: WalkingRouteData[];
  routesLoading?: boolean;
  getStationRouteInfo?: (stationName: string) => WalkingRouteData | undefined;
  onTabChange?: (tab: string) => void;
  initialTab?: string;
}

const LINE_TYPES = ['LRT', 'MRT', 'KTM', 'Monorail', 'ETS', 'KLIA'];

function parseLineInfo(line: string): { type: string; name: string } {
  for (const t of LINE_TYPES) {
    if (line.toUpperCase().startsWith(t.toUpperCase())) {
      const rest = line.slice(t.length).trim();
      return { type: t.toUpperCase(), name: rest || t.toUpperCase() };
    }
  }
  return { type: line, name: line };
}

const daysOfWeek = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
] as const;


export default function LocationDetail({ location, onBack, routeData, routesLoading, getStationRouteInfo, onTabChange, initialTab }: LocationDetailProps) {
  const [activeTab, setActiveTab] = useState(initialTab || 'about');
  const details = location.details;

  const handleTabValueChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
      <div className="flex flex-col w-full">

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabValueChange}>
        <TabsList className="w-full bg-[#f2f2f2] rounded-[10px] p-[3px]">
          <TabsTrigger
            value="about"
            className="flex-1 rounded-[8px] text-sm data-[state=active]:bg-[#d4d4d4] data-[state=active]:border data-[state=active]:border-[#a5adc0] data-[state=active]:shadow-none data-[state=active]:text-[#2a2f3c] text-[#2a2f3c]"
          >
            About
          </TabsTrigger>
          <TabsTrigger
            value="station-guide"
            className="flex-1 rounded-[8px] text-sm data-[state=active]:bg-[#d4d4d4] data-[state=active]:border data-[state=active]:border-[#a5adc0] data-[state=active]:shadow-none data-[state=active]:text-[#2a2f3c] text-[#2a2f3c]"
          >
            Nearby stations
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="flex-1 rounded-[8px] text-sm data-[state=active]:bg-[#d4d4d4] data-[state=active]:border data-[state=active]:border-[#a5adc0] data-[state=active]:shadow-none data-[state=active]:text-[#2a2f3c] text-[#2a2f3c]"
          >
            Contact
          </TabsTrigger>
        </TabsList>

        {/* About tab */}
        <TabsContent value="about" className="mt-6 flex flex-col gap-6">
          {details?.overview ? (
            <>
              {/* Admission */}
              <div>
                <h3 className="text-base font-semibold text-[#191919] mb-3">
                  Admission
                </h3>
                <p className="text-base text-[#1a1a1a]">
                  {details.overview.admission}
                </p>
              </div>

              {/* Opening hours */}
              <div>
                <h3 className="text-base font-semibold text-[#191919] mb-3">
                  Opening hours
                </h3>

                {details.overview.specialNote && (
                  <div className="flex items-start gap-2 bg-[#f2f2f2] border border-[#bfbfbf] rounded-lg px-2.5 py-2 mb-3">
                    <Info className="w-4 h-4 text-ds-text-muted shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm text-[#15171e] font-medium">
                        Take note
                      </p>
                      <p className="text-sm text-[#495269]">
                        {details.overview.specialNote}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col">
                  {daysOfWeek.map((day, i) => (
                    <div
                      key={day.key}
                      className={`flex justify-between px-4 py-2 ${
                        i % 2 === 0 ? 'bg-[#f2f2f2]' : 'bg-white'
                      }`}
                    >
                      <span className="text-base text-[#2a2f3c]">
                        {day.label === 'Mon' ? 'Monday' :
                         day.label === 'Tue' ? 'Tuesday' :
                         day.label === 'Wed' ? 'Wednesday' :
                         day.label === 'Thu' ? 'Thursday' :
                         day.label === 'Fri' ? 'Friday' :
                         day.label === 'Sat' ? 'Saturday' : 'Sunday'}
                      </span>
                      <span className="text-base text-[#1a1a1a]">
                        {details.overview.openingHours[day.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-ds-text-muted py-4">
              <p>{location.openingHours}</p>
              <p className="mt-2">
                Admission: {location.admission === 'free' ? 'Free' : 'Paid'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Nearby stations tab */}
        <TabsContent value="station-guide" className="mt-6 flex flex-col gap-4">
          {/* Info box */}
          <div className="flex items-start gap-2 bg-[#f2f2f2] border border-[#bfbfbf] rounded-lg px-2.5 py-2">
            <Info className="w-4 h-4 text-ds-text-muted shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5">
              <p className="text-sm text-[#15171e] font-medium">
                Walking distance only
              </p>
              <p className="text-sm text-[#495269] leading-[1.2]">
                Station guide shows all train stations that are within 15 mins walkable distance
              </p>
            </div>
          </div>

          {routesLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#f2f2f2] rounded-[10px] p-4">
                  <div className="h-5 w-40 bg-[#d9d9d9] rounded animate-pulse" />
                  <div className="h-4 w-52 bg-[#d9d9d9] rounded animate-pulse mt-3" />
                </div>
              ))}
            </div>
          ) : routeData && routeData.length > 0 ? (
            <div className="flex flex-col gap-2">
              {routeData.map((route, i) => {
                const primaryLine = route.lines[0] || '';
                const lineInfo = parseLineInfo(primaryLine);

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-[#f2f2f2] rounded-[10px] p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <p className="text-lg font-medium leading-[1.4] text-[#1a1a1a]">
                        {route.stationName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-[#404040]">
                        <span>{route.formattedDuration}</span>
                        <div className="flex items-center justify-center size-[5.657px]">
                          <div className="-rotate-45">
                            <div className="bg-[#999] rounded-[1px] size-[4px]" />
                          </div>
                        </div>
                        <span>{route.formattedDistance}</span>
                        <div className="flex items-center justify-center size-[5.657px]">
                          <div className="-rotate-45">
                            <div className="bg-[#999] rounded-[1px] size-[4px]" />
                          </div>
                        </div>
                        <span>{lineInfo.type} {lineInfo.name !== lineInfo.type ? lineInfo.name : ''}</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-[#404040] shrink-0" viewBox="0 0 256 256" fill="currentColor">
                      <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-ds-text-muted py-4">
              No nearby stations available
            </p>
          )}
        </TabsContent>

        {/* Contact tab */}
        <TabsContent value="contact" className="mt-6">
          {details?.contact ? (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[#191919] mb-2">
                  Address
                </h3>
                <p className="text-base text-[#3f475a] leading-[1.4]">
                  {details.contact.address}
                </p>
              </div>
              {details.contact.website && (
                <div>
                  <h3 className="text-sm font-semibold text-[#191919] mb-2">
                    Website
                  </h3>
                  <a
                    href={details.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:underline break-all"
                  >
                    {details.contact.website}
                  </a>
                </div>
              )}
              {details.contact.phone && (
                <div>
                  <h3 className="text-sm font-semibold text-[#191919] mb-2">
                    Phone
                  </h3>
                  <a
                    href={`tel:${details.contact.phone}`}
                    className="text-base text-[#3f475a] hover:underline"
                  >
                    {details.contact.phone}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-[#191919] mb-2">
                Address
              </h3>
              <p className="text-base text-[#3f475a] leading-[1.4]">
                {location.address}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
  );
}
