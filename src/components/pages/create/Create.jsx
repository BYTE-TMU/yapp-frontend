import { useState } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import Header from '@/components/header/Header';
import CreatePost from './CreatePost';
import CreateEvent from './CreateEvent';

function Create() {
  const [activeTab, setActiveTab] = useState('post');
  const [isFormFocused, setIsFormFocused] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div
      className="h-screen overflow-hidden"
      style={{
        fontFamily: 'Albert Sans',
      }}
    >
      <Header />
      <Sidebar />

      <div className="md:ml-64 h-full overflow-y-auto relative pb-20 md:pb-6 scrollbar-hide md:scrollbar-custom">
        {/* Animated Background */}
        <div className="fixed inset-0 md:ml-64 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-primary/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-orange-600/20 to-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex items-start justify-center px-3 md:px-6 py-4 md:py-12 pb-24 md:pb-12">
          <div
            className={`w-full max-w-2xl relative z-10 transform transition-all duration-700 ease-out ${isFormFocused ? 'scale-105' : ''}`}
          >
            {/* Header with Animation */}
            <div className="text-center mb-4 md:mb-10">
              <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-3 bg-linear-to-r from-orange-400 to-primary bg-clip-text text-transparent">
                Create {activeTab === 'post' ? 'Post' : 'Event'}
              </h1>
              <p className={`text-sm md:text-lg text-muted-foreground`}>
                {activeTab === 'post'
                  ? 'Share your thoughts with the community'
                  : 'Plan something amazing for everyone'}
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex mb-4 md:mb-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1.5 md:p-2 shadow-2xl">
              <button
                onClick={() => handleTabChange('post')}
                className={`flex-1 py-2.5 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                  activeTab === 'post'
                    ? 'bg-linear-to-r from-primary to-orange-600 text-white shadow-lg shadow-primary/25 transform scale-105'
                    : 'hover:bg-white/10 hover:scale-105'
                }`}
              >
                <span>📝</span>
                <span>Post</span>
              </button>
              <button
                onClick={() => handleTabChange('event')}
                className={`flex-1 py-2.5 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                  activeTab === 'event'
                    ? 'bg-linear-to-r from-primary to-orange-600 text-white shadow-lg shadow-primary/25 transform scale-105'
                    : 'hover:bg-white/10 hover:scale-105'
                }`}
              >
                <span>🎉</span>
                <span>Event</span>
              </button>
            </div>

            {/* Form Container with Glass Effect */}
            <div
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 md:p-8 shadow-2xl"
              onFocus={() => setIsFormFocused(true)}
              onBlur={() => setIsFormFocused(false)}
            >
              {/* Content with smooth transition */}
              <div className="transition-all duration-500 ease-in-out">
                {activeTab === 'post' ? <CreatePost /> : <CreateEvent />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Create;
