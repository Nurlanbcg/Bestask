
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import CreateSpaceModal from '../components/CreateSpaceModal';
import TaskDrawer from '../components/TaskDrawer';

const Layout = ({ children }) => {
    const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);

    return (
        <div className="flex bg-background h-screen overflow-hidden font-sans text-slate-900">
            <Sidebar onCreateSpace={() => setIsSpaceModalOpen(true)} />

            <div className="flex-1 flex flex-col min-w-0">
                <TopNav />
                <main className="flex-1 overflow-auto bg-slate-50 relative scroll-smooth">
                    {children}
                </main>
            </div>

            <CreateSpaceModal
                isOpen={isSpaceModalOpen}
                onClose={() => setIsSpaceModalOpen(false)}
            />
            <TaskDrawer />
        </div>
    );
};

export default Layout;
