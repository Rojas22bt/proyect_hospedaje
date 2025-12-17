import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AdBanner from '@/components/ads/AdBanner';

const Layout: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleSidebarHover = (expanded: boolean) => {
        if (!sidebarCollapsed) {
            setSidebarExpanded(expanded);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                onMouseEnter={() => handleSidebarHover(true)}
                onMouseLeave={() => handleSidebarHover(false)}
            >
                <Sidebar
                    isCollapsed={sidebarCollapsed}
                    isExpanded={sidebarExpanded}
                    onToggle={toggleSidebar}
                />
            </div>

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Header onToggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-y-auto p-6">
                    <AdBanner />
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;