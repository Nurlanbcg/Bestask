import React from 'react';
import { Search, Bell, HelpCircle, User, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import clsx from 'clsx';
import NotificationsPopover from './NotificationsPopover';

const TopNav = () => {
    const { activeSpace } = useApp();
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
            <div className="flex items-center w-1/3">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks, spaces, or people..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={clsx(
                            "relative p-2 rounded-full transition-all",
                            isNotificationsOpen
                                ? "bg-blue-50 text-blue-600 ring-2 ring-blue-100"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        )}
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    <NotificationsPopover
                        isOpen={isNotificationsOpen}
                        onClose={() => setIsNotificationsOpen(false)}
                    />
                </div>

                <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                    <HelpCircle size={20} />
                </button>

                <div className="h-8 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-100 bg-slate-50/50">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold border border-indigo-200">
                            N
                        </div>
                        <span className="text-sm font-medium text-slate-700 max-sm:hidden">Nurlan İbrahimov</span>
                    </div>

                    <button
                        onClick={() => {
                            // In a real app, handle logout logic here
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-sm font-medium group"
                    >
                        <LogOut size={18} className="transition-transform group-hover:translate-x-0.5" />
                        <span className="max-sm:hidden">Log out</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
