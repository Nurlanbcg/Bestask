import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const TimelineView = () => {
    const { activeSpaceId, getSpaceTasks, addTask, openTaskDrawer, getActiveSprint } = useApp();
    const [isCreatingEpic, setIsCreatingEpic] = useState(false);
    const [newEpicName, setNewEpicName] = useState('');
    const [expandedItems, setExpandedItems] = useState({});
    const [hoveredItem, setHoveredItem] = useState(null);

    const tasks = getSpaceTasks(activeSpaceId);
    const activeSprint = getActiveSprint(activeSpaceId);

    // Group tasks by type
    const epics = tasks.filter(t => t.type === 'Epic');
    const stories = tasks.filter(t => t.type === 'Story' && !t.parentId);
    const sprintTasks = tasks.filter(t => t.status !== 'backlog');

    // Get current date for timeline positioning
    const today = new Date();
    const currentMonth = today.toLocaleDateString('en-US', { month: 'long' });
    const currentYear = today.getFullYear();

    // Generate months for timeline (3 months back, 6 months forward)
    const generateMonths = () => {
        const months = [];
        const start = new Date(today);
        start.setMonth(start.getMonth() - 1);

        for (let i = 0; i < 9; i++) {
            const date = new Date(start);
            date.setMonth(start.getMonth() + i);
            months.push({
                name: date.toLocaleDateString('en-US', { month: 'long' }),
                year: date.getFullYear(),
                abbr: date.toLocaleDateString('en-US', { month: 'short' })
            });
        }
        return months;
    };

    const months = generateMonths();

    const handleCreateEpic = (e) => {
        if (e.key === 'Enter' && newEpicName.trim()) {
            openTaskDrawer('new', {
                title: newEpicName,
                status: 'todo',
                type: 'Epic',
                priority: 'High'
            });
            setNewEpicName('');
            setIsCreatingEpic(false);
        } else if (e.key === 'Escape') {
            setIsCreatingEpic(false);
            setNewEpicName('');
        }
    };

    const handleAddChildItem = (parentId) => {
        openTaskDrawer('new', {
            title: 'New Story',
            status: 'todo',
            type: 'Story',
            priority: 'Medium',
            parentId: parentId
        });
    };

    const toggleExpand = (id) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search timeline"
                        className="bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
                    />
                    <select className="bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                        <option>Status category</option>
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">
                        Today
                    </button>
                    <button className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">
                        Weeks
                    </button>
                    <button className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                        Months
                    </button>
                    <button className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">
                        Quarters
                    </button>
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-auto">
                <div className="flex">
                    {/* Left Sidebar - Items */}
                    <div className="w-64 bg-slate-50 border-r border-slate-200 flex-shrink-0">
                        <div className="p-4 border-b border-slate-200">
                            <div className="text-xs font-bold text-slate-500">Work</div>
                        </div>

                        {/* Work Items */}
                        <div className="py-2">
                            {/* Create Epic Button */}
                            {!isCreatingEpic ? (
                                <button
                                    onClick={() => setIsCreatingEpic(true)}
                                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={14} />
                                    Create Epic
                                </button>
                            ) : (
                                <div className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={newEpicName}
                                        onChange={(e) => setNewEpicName(e.target.value)}
                                        onKeyDown={handleCreateEpic}
                                        onBlur={() => {
                                            if (!newEpicName.trim()) {
                                                setIsCreatingEpic(false);
                                            }
                                        }}
                                        placeholder="Epic name..."
                                        autoFocus
                                        className="w-full bg-white border border-blue-500 rounded px-2 py-1 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            )}

                            {/* Epics */}
                            {epics.map(epic => (
                                <div key={epic.id}>
                                    <div
                                        className="relative group"
                                        onMouseEnter={() => setHoveredItem(epic.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        <button
                                            onClick={() => toggleExpand(epic.id)}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"
                                        >
                                            {expandedItems[epic.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openTaskDrawer(epic.id);
                                                }}
                                                className="hover:underline cursor-pointer"
                                            >
                                                {epic.title}
                                            </span>
                                        </button>
                                        {hoveredItem === epic.id && (
                                            <button
                                                onClick={() => handleAddChildItem(epic.id)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-600 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {expandedItems[epic.id] && (
                                        <div className="pl-6">
                                            {tasks.filter(t => t.parentId === epic.id).map(child => (
                                                <button
                                                    key={child.id}
                                                    onClick={() => openTaskDrawer(child.id)}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
                                                >
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    {child.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Timeline */}
                    <div className="flex-1 relative">
                        {/* Month Headers */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
                            <div className="flex">
                                {months.map((month, idx) => (
                                    <div key={idx} className="flex-1 min-w-[120px] px-4 py-3 text-center border-r border-slate-200">
                                        <div className="text-sm font-medium text-slate-700">{month.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline Bars */}
                        <div className="relative" style={{ minHeight: '400px' }}>
                            {/* Current Date Indicator */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20"
                                style={{ left: '16.67%' }} // Approximate position for current date
                            >
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
