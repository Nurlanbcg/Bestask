import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, MoreHorizontal, ExternalLink, User, Zap, Calendar, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const NotificationsPopover = ({ isOpen, onClose }) => {
    const { tasks, DEFAULT_MEMBERS, openTaskDrawer, activeSpaceId } = useApp();
    const currentUser = DEFAULT_MEMBERS[0];
    const [activeTab, setActiveTab] = useState('direct'); // direct, watching
    const [onlyUnread, setOnlyUnread] = useState(false);

    // Mocking some unread/read state and "watching"
    const relevantTasks = tasks.filter(t => t.assignee === currentUser || t.reporter === currentUser);

    // Sort tasks by date (mocking latest activity)
    const sortedTasks = [...relevantTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for closing */}
                    <div className="fixed inset-0 z-[100]" onClick={onClose}></div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-[480px] bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 z-[110] flex flex-col max-h-[700px] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 mr-2">
                                        <span className="text-[11px] font-bold text-slate-500">Only show unread</span>
                                        <button
                                            onClick={() => setOnlyUnread(!onlyUnread)}
                                            className={clsx(
                                                "w-8 h-4 rounded-full relative transition-colors duration-200 focus:outline-none",
                                                onlyUnread ? "bg-blue-600" : "bg-slate-300"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow-sm",
                                                onlyUnread ? "right-0.5" : "left-0.5"
                                            )}></div>
                                        </button>
                                    </div>
                                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all" title="View all">
                                        <ExternalLink size={16} />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs & Mark as read */}
                            <div className="flex items-center justify-between">
                                <div className="flex gap-6">
                                    {['Direct', 'Watching'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab.toLowerCase())}
                                            className={clsx(
                                                "text-sm font-bold pb-2 transition-all relative px-1",
                                                activeTab === tab.toLowerCase()
                                                    ? "text-blue-600"
                                                    : "text-slate-500 hover:text-slate-800"
                                            )}
                                        >
                                            {tab}
                                            {activeTab === tab.toLowerCase() && (
                                                <motion.div
                                                    layoutId="activeTabNotify"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline">
                                    Mark all as read
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/30">
                            <div className="p-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Latest</h4>

                                <div className="space-y-1">
                                    {sortedTasks.length > 0 ? (
                                        sortedTasks.map((task) => (
                                            <button
                                                key={task.id}
                                                onClick={() => {
                                                    openTaskDrawer(task.id);
                                                    onClose();
                                                }}
                                                className="w-full text-left p-4 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all flex gap-4 group relative"
                                            >
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors",
                                                    task.assignee === currentUser ? "bg-blue-600" : "bg-indigo-600"
                                                )}>
                                                    <span className="text-white font-bold text-xs">
                                                        {task.assignee === currentUser ? <User size={18} /> : <Zap size={18} />}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                                            {task.title}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">• 2 min ago</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        {task.assignee === currentUser
                                                            ? `You were assigned to this ${task.type.toLowerCase()} by ${task.reporter}.`
                                                            : `Status updated to ${task.status.replace('-', ' ')} on task you created.`}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">
                                                            {task.id}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                                                            {task.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Blue dot for unread */}
                                                {!onlyUnread && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-600 absolute right-4 top-5 shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                                <Bell size={32} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">All caught up!</p>
                                            <p className="text-xs text-slate-500 mt-1">No new notifications for you.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer like image */}
                                <div className="mt-6 flex flex-col items-center justify-center pb-8 opacity-50">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-3 rotate-12">
                                        <Bell size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500">That's all your notifications from</p>
                                    <p className="text-xs font-bold text-slate-500">the last 30 days.</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Shortcuts */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400">Press</span>
                                <div className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-600 shadow-sm">↓</div>
                                <div className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-600 shadow-sm">↑</div>
                                <span className="text-[10px] font-bold text-slate-400 ml-1">to move through notifications.</span>
                            </div>
                            <button className="text-[10px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-white border border-slate-200 shadow-sm transition-all active:scale-[0.98]">
                                See all shortcuts
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationsPopover;
