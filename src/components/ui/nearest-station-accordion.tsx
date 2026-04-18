'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Footprints, Ticket } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible';
import {
  getStationByCode,
  getNearbyStationsOnLine,
  getInterchangeInfo,
} from '@/data/helpers';

interface NearestStationAccordionProps {
  stationCode: string;
  walkTime: string;
  walkDistance: string;
  exitName?: string;
}

export default function NearestStationAccordion({
  stationCode,
  walkTime,
  walkDistance,
  exitName,
}: NearestStationAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get station data
  const station = getStationByCode(stationCode);
  if (!station) return null;

  // Get route context (2 stations before and after)
  const routeStops = getNearbyStationsOnLine(stationCode, 2);

  // Get interchange info
  const interchangeInfo = getInterchangeInfo(stationCode);

  // Get line color for styling
  const lineColor = station.lineColor;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-white border border-[#ececec] rounded-[24px] p-6 w-full"
    >
      {/* Header - Always Visible - Entire area is clickable */}
      <CollapsibleTrigger asChild>
        <div className="flex gap-4 items-start w-full cursor-pointer">
          <div className="flex-1 flex flex-col gap-2">
            {/* Station Name & Line Type */}
            <div className="flex gap-1 items-center">
              <p className="font-semibold text-[16px] text-[#282828]">
                {station.name}
              </p>
              <div className="bg-[#cde9d2] px-1 py-0.5 rounded-md">
                <p className="text-[12px] font-medium text-[#398145]">
                  {station.lineType}
                </p>
              </div>
            </div>

            {/* Walking Info Chips */}
            <div className="flex gap-3 items-center">
              {/* Walk Time Chip */}
              <div className="flex gap-1.5 items-center py-1">
                <Footprints className="w-3 h-3 text-[#424242]" />
                <p className="text-[12px] text-[#424242] leading-none">
                  {walkTime} walk from station{exitName ? ` (${exitName})` : ''}
                </p>
              </div>

              {/* Distance Chip */}
              <div className="flex gap-1.5 items-center py-1">
                <Ticket className="w-3 h-3 text-[#424242]" />
                <p className="text-[12px] text-[#424242] leading-none">
                  {walkDistance}
                </p>
              </div>
            </div>
          </div>

          {/* Toggle Icon */}
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            {isOpen ? (
              <ChevronUp className="w-6 h-6 text-[#424242]" />
            ) : (
              <ChevronDown className="w-6 h-6 text-[#424242]" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>

      {/* Expandable Content - Route & Interchange */}
      <CollapsibleContent className="mt-4">
        <div className="flex flex-col">
          {/* Route Stops */}
          {routeStops.map((stop, index) => {
            const isCurrentStation = stop.code === stationCode;
            const isLastStop = index === routeStops.length - 1;

            return (
              <div key={stop.code} className="flex flex-col items-end w-full">
                {/* Station Row */}
                <div className="flex gap-3 items-center py-2 w-full">
                  {/* Indicator Dot */}
                  <div className="w-4 h-4 rounded-full bg-[#35b635] shrink-0" />

                  {/* Station Name & Code */}
                  <div className="flex-1 flex gap-3 items-center">
                    <div className="flex gap-1.5 items-center">
                      <p
                        className={`text-[16px] ${
                          isCurrentStation
                            ? 'font-semibold text-[#282828]'
                            : 'font-normal text-[#282828]'
                        }`}
                      >
                        {stop.name}
                      </p>
                      <div className="bg-[#cde9d2] px-1 py-0.5 rounded-md">
                        <p className="text-[12px] font-medium text-[#398145]">
                          {stop.code}
                        </p>
                      </div>
                    </div>

                    {/* Interchange Icons (if current station has interchange) */}
                    {isCurrentStation && interchangeInfo && (
                      <>
                        <div className="flex-1 h-px bg-[#d4d4d4]" />
                        <div className="flex gap-1 items-center">
                          {interchangeInfo.interchangeLines.map((line) => (
                            <div
                              key={line.id}
                              className="w-5 h-5 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: line.color }}
                            >
                              {/* Train icon placeholder - using simple circle */}
                              <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Connecting Line */}
                {!isLastStop && (
                  <div className="flex gap-5 h-6 items-start pl-2 w-full">
                    <div className="w-px h-full bg-[#35b635]" />
                  </div>
                )}

                {/* Interchange Info Card */}
                {isCurrentStation && interchangeInfo && (
                  <div className="flex gap-5 items-start pl-2 w-full mb-2">
                    <div className="w-px h-6 bg-[#35b635]" />
                    <div className="flex-1 bg-[#fbfaf8] border border-[#ececec] rounded-xl p-4 flex flex-col gap-2">
                      <p className="text-[14px] text-[#595959]">
                        This is an interchange station to{' '}
                        {interchangeInfo.interchangeLines.length} other{' '}
                        {interchangeInfo.interchangeLines.length === 1
                          ? 'line'
                          : 'lines'}
                      </p>
                      {interchangeInfo.interchangeLines.map((line) => (
                        <div
                          key={line.id}
                          className="flex gap-1 items-center px-1 py-0.5 rounded-md w-fit"
                          style={{
                            backgroundColor: `${line.color}20`,
                          }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{ backgroundColor: line.color }}
                          />
                          <p
                            className="text-[12px] font-medium"
                            style={{
                              color: line.color,
                              filter: 'brightness(0.7)',
                            }}
                          >
                            {line.shortName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
