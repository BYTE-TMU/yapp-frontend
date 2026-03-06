function WaypointLegend() {
    return (
        <div className="absolute top-4 right-4 z-[1000] hidden md:block" style={{fontFamily: 'Albert Sans'}}>
            <div className="bg-white rounded-lg p-3 shadow-lg">
                <h4 className="font-bold text-gray-800 mb-2 text-sm">Legend</h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2"><span>🍕</span><span className="text-gray-700">Food & Events</span></div>
                    <div className="flex items-center space-x-2"><span>📚</span><span className="text-gray-700">Study Spots</span></div>
                    <div className="flex items-center space-x-2"><span>👥</span><span className="text-gray-700">Groups & Social</span></div>
                    <div className="flex items-center space-x-2"><span>🎉</span><span className="text-gray-700">Social Events</span></div>
                    <div className="flex items-center space-x-2"><span>📅</span><span className="text-gray-700">Events</span></div>
                </div>
            </div>
        </div>
    );
}

export default WaypointLegend;