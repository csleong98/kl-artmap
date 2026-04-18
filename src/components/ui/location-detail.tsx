'use client';

import { useState } from 'react';
import { Info, Bus, Copy, Link as LinkIcon, Phone } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Location } from '@/types';
import { WalkingRouteData } from '@/hooks/useWalkingRoutes';
import ContentContainer from './content-container';
import SectionHeader from './section-header';
import { Button } from '@/components/ui/button';
import NearestStationAccordion from './nearest-station-accordion';
import { getStationByName } from '@/data/helpers';

interface LocationDetailProps {
  location: Location;
  onBack?: () => void;
  routeData?: WalkingRouteData[];
  routesLoading?: boolean;
  getStationRouteInfo?: (stationName: string) => WalkingRouteData | undefined;
  onTabChange?: (tab: string) => void;
  initialTab?: string;
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
      <Tabs value={activeTab} onValueChange={handleTabValueChange} className="-mx-6">
        <TabsList>
          <TabsTrigger value="about" className="flex-1">
            <Info className="w-4 h-4" />
            About
          </TabsTrigger>
          <TabsTrigger value="station-guide" className="flex-1">
            <Bus className="w-4 h-4" />
            Nearby stations
          </TabsTrigger>
        </TabsList>

        {/* About tab */}
        <TabsContent value="about" className="mt-6 flex flex-col gap-4">
          {details?.overview ? (
            <>
              {/* Admission Section */}
              <ContentContainer>
                <SectionHeader title="Admission" />

                {details.overview.pricing ? (
                  <>
                    {/* Ticket Info Box (Optional) */}
                    {details.overview.pricing?.ticketInfo && (
                      <div className="flex gap-3 items-center w-full border border-[#adadad] rounded-[32px] px-3 py-2">
                        <p className="flex-1 text-[14px] font-medium text-[#15171e]">
                          {details.overview.pricing.ticketInfo}
                        </p>
                        {details.overview.pricing.ticketUrl && (
                          <button
                            onClick={() => window.open(details.overview.pricing!.ticketUrl!, '_blank')}
                            className="bg-[#140f00] text-white px-[14px] py-[6px] rounded-[16px] text-[14px] font-medium shrink-0"
                          >
                            Get tickets
                          </button>
                        )}
                      </div>
                    )}

                    {/* Pricing Table */}
                    <div className="flex flex-col gap-3 w-full">
                      {details.overview.pricing?.prices.map((item: any, index: number) => (
                        <div key={index} className="flex gap-2 items-center w-full">
                          <span className="text-base text-[#282828] shrink-0">
                            {item.category}
                          </span>
                          <div className="flex-1 border-b border-[#d4d4d4]" />
                          <span className="text-base font-medium text-[#282828] text-right shrink-0 w-14">
                            {item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-base text-[#282828]">
                    {details.overview.admission}
                  </p>
                )}
              </ContentContainer>

              {/* Opening Hours Section */}
              <ContentContainer>
                <SectionHeader title="Opening hours" />

                {details.overview.specialNote && (
                  <div className="flex items-start gap-2 bg-[#f2f2f2] border border-[#bfbfbf] rounded-lg px-2.5 py-2">
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
                  {daysOfWeek.map((day, i) => {
                    const dayName = day.label === 'Mon' ? 'Monday' :
                                    day.label === 'Tue' ? 'Tuesday' :
                                    day.label === 'Wed' ? 'Wednesday' :
                                    day.label === 'Thu' ? 'Thursday' :
                                    day.label === 'Fri' ? 'Friday' :
                                    day.label === 'Sat' ? 'Saturday' : 'Sunday';
                    const hours = details.overview.openingHours[day.key];
                    const isClosed = hours?.toLowerCase() === 'closed';

                    return (
                      <div
                        key={day.key}
                        className={`flex justify-between px-4 py-2 ${
                          i % 2 === 0 ? 'bg-[#f6f3ee]' : 'bg-white'
                        }`}
                      >
                        <span className={`text-base ${isClosed ? 'text-[#e73d3d]' : 'text-[#2a2f3c]'}`}>
                          {dayName}
                        </span>
                        <span className={`text-base ${isClosed ? 'text-[#e73d3d]' : 'text-[#1a1a1a]'}`}>
                          {hours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ContentContainer>

              {/* Contact Details Section */}
              <ContentContainer>
                <SectionHeader title="Contact details" />

                {details.contact ? (
                  <>
                    {/* Address */}
                    <div className="flex flex-col gap-[6px]">
                      <p className="text-[14px] font-semibold text-[#757575]">
                        Address
                      </p>
                      <div className="flex gap-3 items-start">
                        <p className="flex-1 text-base text-[#282828] leading-normal">
                          {details.contact.address}
                        </p>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-[10px] shrink-0 size-9"
                          onClick={() => navigator.clipboard.writeText(details.contact.address || '')}
                        >
                          <Copy className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Website */}
                    {details.contact.website && (
                      <div className="flex flex-col gap-[6px]">
                        <p className="text-[14px] font-semibold text-[#757575]">
                          Official website
                        </p>
                        <div className="flex gap-3 items-start">
                          <p className="flex-1 text-base text-[#282828] leading-normal break-all">
                            {details.contact.website}
                          </p>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-[10px] shrink-0 size-9"
                            onClick={() => window.open(details.contact.website, '_blank')}
                          >
                            <LinkIcon className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-[10px] shrink-0 size-9"
                            onClick={() => navigator.clipboard.writeText(details.contact.website || '')}
                          >
                            <Copy className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {details.contact.phone && (
                      <div className="flex flex-col gap-[6px]">
                        <p className="text-[14px] font-semibold text-[#757575]">
                          Phone number
                        </p>
                        <div className="flex gap-3 items-center">
                          <p className="flex-1 text-base text-[#282828]">
                            {details.contact.phone}
                          </p>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-[10px] shrink-0 size-9"
                            onClick={() => window.location.href = `tel:${details.contact.phone}`}
                          >
                            <Phone className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-[10px] shrink-0 size-9"
                            onClick={() => navigator.clipboard.writeText(details.contact.phone || '')}
                          >
                            <Copy className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-[6px]">
                    <p className="text-[14px] font-semibold text-[#757575]">
                      Address
                    </p>
                    <div className="flex gap-3 items-start">
                      <p className="flex-1 text-base text-[#282828] leading-normal">
                        {location.address}
                      </p>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-[10px] shrink-0 size-9"
                        onClick={() => navigator.clipboard.writeText(location.address)}
                      >
                        <Copy className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </ContentContainer>
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
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#f2f2f2] rounded-[24px] p-6">
                  <div className="h-5 w-40 bg-[#d9d9d9] rounded animate-pulse" />
                  <div className="h-4 w-52 bg-[#d9d9d9] rounded animate-pulse mt-3" />
                </div>
              ))}
            </div>
          ) : routeData && routeData.length > 0 ? (
            <div className="flex flex-col gap-4">
              {routeData.map((route, i) => {
                // Get station code from station name
                const stationData = getStationByName(route.stationName);

                // Skip if we can't find the station code
                if (!stationData) {
                  return null;
                }

                return (
                  <NearestStationAccordion
                    key={i}
                    stationCode={stationData.code}
                    walkTime={route.formattedDuration}
                    walkDistance={route.formattedDistance}
                    exitName={route.exitName}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-ds-text-muted py-4">
              No nearby stations available
            </p>
          )}
        </TabsContent>
      </Tabs>
      </div>
  );
}
