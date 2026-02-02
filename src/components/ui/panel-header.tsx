import { TabType } from '@/types';
import { Tabs, TabsList, TabsTrigger } from './tabs';
import { Button } from './button';

interface PanelHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
  resultsCount?: number;
  onFilterClick?: () => void;
  isDetailView?: boolean;
}

export default function PanelHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  showBackButton = false,
  onBackClick,
  title,
  resultsCount,
  onFilterClick,
  isDetailView = false // eslint-disable-line @typescript-eslint/no-unused-vars
}: PanelHeaderProps) {
  if (showBackButton) {
    return (
      <div className="flex items-center gap-3 p-4 border-b">
        <button
          onClick={onBackClick}
          className="p-3 md:p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl md:text-lg font-semibold truncate">{title}</h2>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-3 h-12 md:h-10">
          <TabsTrigger value="art_museums" className="text-xs md:text-sm px-2">Art Museums</TabsTrigger>
          <TabsTrigger value="art_galleries" className="text-xs md:text-sm px-2">Art Galleries</TabsTrigger>
          <TabsTrigger value="art_spaces" className="text-xs md:text-sm px-2">Art Spaces</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-3 md:py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-sm"
          />
        </div>
        <Button
          variant="secondary"
          onClick={onFilterClick}
          className="min-h-[44px] px-4 md:px-3 text-sm md:text-xs whitespace-nowrap"
        >
          <span className="hidden sm:inline">Filter & Sort</span>
          <span className="sm:hidden">Filter</span>
        </Button>
      </div>

      {/* Results count */}
      {resultsCount !== undefined && (
        <div className="text-sm text-gray-600">
          {resultsCount} places found
        </div>
      )}
    </div>
  );
}