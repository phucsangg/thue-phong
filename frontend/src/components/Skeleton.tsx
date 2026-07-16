

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      {/* Aspect Ratio Box (Image) */}
      <div className="bg-gray-200 aspect-[4/3] w-full"></div>
      
      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        {/* Address */}
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        
        {/* Specs (Price, Area, People) */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
        </div>
      </div>
    </div>
  );
};

export const DetailsSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-8">
      {/* Banner Skeleton */}
      <div className="bg-gray-200 rounded-3xl aspect-[21/9] w-full"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded w-full"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Sidebar */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-64 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
};
