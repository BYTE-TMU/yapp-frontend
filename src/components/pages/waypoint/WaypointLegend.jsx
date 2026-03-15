function WaypointLegend() {
    return (
        <div className="absolute bottom-8 right-4 z-[1000] hidden md:block" style={{fontFamily: 'Albert Sans'}}>
            <div className="bg-black/70 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-lg">
                <h4 className="font-bold text-white/80 mb-2 text-xs uppercase tracking-wider">Legend</h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2"><span>🍕</span><span className="text-white/70">Food & Events</span></div>
                    <div className="flex items-center space-x-2"><span>📚</span><span className="text-white/70">Study Spots</span></div>
                    <div className="flex items-center space-x-2"><span>👥</span><span className="text-white/70">Groups & Social</span></div>
                    <div className="flex items-center space-x-2"><span>🎉</span><span className="text-white/70">Social Events</span></div>
                    <div className="flex items-center space-x-2"><span>📅</span><span className="text-white/70">Events</span></div>
                    <div className="flex items-center space-x-2"><span>📍</span><span className="text-white/70">Other</span></div>
                </div>
            </div>
        </div>
    );
}

export default WaypointLegend;