export function TankSkeleton() {
    return (
      <div className="relative w-[20vw] min-w-[100px] max-w-[150px] h-[30vw] min-h-[200px] max-h-[280px] shrink-0 animate-pulse">
        {/* Tank shadow placeholder */}
        <div className="absolute left-1/2 -bottom-4 w-32 h-8 -translate-x-1/2 rounded-full bg-gray-300/50 dark:bg-gray-700/50 blur-md z-0"></div>
        {/* Tank body placeholder */}
        <div className="absolute left-3 right-3 top-10 bottom-12 rounded-b-3xl rounded-t-3xl bg-gray-200 dark:bg-gray-800"></div>
        {/* Tank top placeholder */}
        <div className="absolute left-0 right-0 top-0 h-12 flex flex-col items-center z-20">
          <div className="w-24 h-10 mx-auto rounded-t-full bg-gray-300 dark:bg-gray-700"></div>
        </div>
        {/* Tank bottom placeholder */}
        <div className="absolute left-0 right-0 bottom-0 h-14 flex flex-col items-center z-20">
          <div className="w-24 h-10 mx-auto rounded-b-full bg-gray-300 dark:bg-gray-700"></div>
        </div>
        {/* Label placeholder */}
        <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>
    )
  }
  