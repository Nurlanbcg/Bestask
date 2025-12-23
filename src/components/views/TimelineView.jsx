import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, ChevronRight, ChevronDown, MoreHorizontal, Calendar, X, ArrowRight, RotateCcw, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../ConfirmModal';

const TimelineView = () => {
    const { activeSpaceId, getSpaceTasks, addTask, openTaskDrawer, getActiveSprint, sprints: allSprints, updateSprint, deleteSprint } = useApp();
    const [viewMode, setViewMode] = useState('Months'); // Weeks, Months, Quarters
    const [isCreatingEpic, setIsCreatingEpic] = useState(false);
    const [selectedSprintId, setSelectedSprintId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(null); // id of the sprint whose menu is open
    const [editingSprint, setEditingSprint] = useState(null);
    const [sprintToDelete, setSprintToDelete] = useState(null);
    const [newEpicName, setNewEpicName] = useState('');
    const [expandedItems, setExpandedItems] = useState({});
    const [hoveredItem, setHoveredItem] = useState(null);

    const tasks = getSpaceTasks(activeSpaceId);
    const spaceSprints = allSprints[activeSpaceId]?.sprints || [];

    // Group tasks by type
    const epics = tasks.filter(t => t.type === 'Epic');
    const stories = tasks.filter(t => t.type === 'Story' && !t.parentId);
    const sprintTasks = tasks.filter(t => t.status !== 'backlog');

    // Get current date for timeline positioning
    const today = new Date();
    const currentMonth = today.toLocaleDateString('en-US', { month: 'long' });
    const currentYear = today.getFullYear();

    // Generate timeline scale based on viewMode
    const generateScale = () => {
        if (viewMode === 'Quarters') {
            const quarters = [];
            const start = new Date(today);
            start.setMonth(Math.floor(start.getMonth() / 3) * 3 - 3); // Go back 1 quarter

            for (let i = 0; i < 6; i++) {
                const date = new Date(start);
                date.setMonth(start.getMonth() + (i * 3));
                const q = Math.floor(date.getMonth() / 3) + 1;
                quarters.push({
                    name: `Q${q} ${date.getFullYear()}`,
                    isQuarter: true,
                    daysCount: 90, // Simplified for positioning
                    fullDate: new Date(date.setHours(0, 0, 0, 0))
                });
            }
            return quarters;
        } else if (viewMode === 'Months') {
            const months = [];
            const start = new Date(today);
            start.setMonth(start.getMonth() - 2);

            for (let i = 0; i < 12; i++) {
                const date = new Date(start);
                date.setMonth(start.getMonth() + i);
                months.push({
                    name: date.toLocaleDateString('en-US', { month: 'long' }),
                    year: date.getFullYear(),
                    isMonth: true,
                    daysCount: 30, // Simplified
                    fullDate: new Date(date.setHours(0, 0, 0, 0))
                });
            }
            return months;
        } else {
            // "Weeks" view (Daily scale)
            const days = [];
            const start = new Date(today);
            start.setDate(today.getDate() - 14); // Show 2 weeks back

            for (let i = 0; i < 60; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                days.push({
                    day: date.getDate(),
                    month: date.toLocaleDateString('en-US', { month: 'short' }),
                    year: date.getFullYear(),
                    isToday: date.toDateString() === today.toDateString(),
                    fullDate: new Date(date.setHours(0, 0, 0, 0))
                });
            }

            const groups = [];
            days.forEach(d => {
                const monthName = d.month;
                let group = groups.find(g => g.name === monthName);
                if (!group) {
                    group = { name: monthName, days: [] };
                    groups.push(group);
                }
                group.days.push(d);
            });
            return groups;
        }
    };

    const timelineScale = generateScale();

    // Helper to calculate position for sprint bars
    const getPosition = (dateStr) => {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        const allItems = viewMode === 'Weeks' ? timelineScale.flatMap(g => g.days) : timelineScale;
        const firstItemDate = allItems[0].fullDate;

        if (date < firstItemDate) return 0;

        if (viewMode === 'Weeks') {
            const startIndex = allItems.findIndex(d => d.fullDate.getTime() === date.getTime());
            if (startIndex === -1) return 100;
            return (startIndex / allItems.length) * 100;
        } else {
            const totalDays = allItems.reduce((acc, item) => acc + item.daysCount, 0);
            let daysPassed = 0;
            for (const item of allItems) {
                if (date < new Date(new Date(item.fullDate).setMonth(item.fullDate.getMonth() + (item.isQuarter ? 3 : 1)))) {
                    const diffTime = Math.abs(date - item.fullDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return ((daysPassed + diffDays) / totalDays) * 100;
                }
                daysPassed += item.daysCount;
            }
            return 100;
        }
    };

    const getWidth = (startStr, endStr) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const allItems = viewMode === 'Weeks' ? timelineScale.flatMap(g => g.days) : timelineScale;
        const totalDays = viewMode === 'Weeks' ? allItems.length : allItems.reduce((acc, item) => acc + item.daysCount, 0);

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return (diffDays / totalDays) * 100;
    };

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

    const handleEditSprint = (sprint) => {
        setEditingSprint(sprint);
        setIsEditModalOpen(true);
        setSelectedSprintId(null);
        setIsMenuOpen(null);
    };

    const handleUpdateSprint = (e) => {
        e.preventDefault();
        updateSprint(activeSpaceId, editingSprint.id, editingSprint);
        setIsEditModalOpen(false);
        setEditingSprint(null);
    };

    const handleDeleteSprint = (sprint) => {
        setSprintToDelete(sprint);
        setIsMenuOpen(null);
    };

    const confirmDeleteSprint = () => {
        if (sprintToDelete) {
            deleteSprint(activeSpaceId, sprintToDelete.id);
            setSprintToDelete(null);
            setSelectedSprintId(null);
        }
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
                    <button
                        onClick={() => setViewMode('Weeks')}
                        className={clsx(
                            "px-3 py-1.5 text-sm rounded transition-colors",
                            viewMode === 'Weeks' ? "text-white bg-blue-600 font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                    >
                        Weeks
                    </button>
                    <button
                        onClick={() => setViewMode('Months')}
                        className={clsx(
                            "px-3 py-1.5 text-sm rounded transition-colors",
                            viewMode === 'Months' ? "text-white bg-blue-600 font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                    >
                        Months
                    </button>
                    <button
                        onClick={() => setViewMode('Quarters')}
                        className={clsx(
                            "px-3 py-1.5 text-sm rounded transition-colors",
                            viewMode === 'Quarters' ? "text-white bg-blue-600 font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                    >
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
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                        <div style={{ width: viewMode === 'Weeks' ? '2400px' : viewMode === 'Months' ? '1800px' : '1200px' }} className="relative bg-slate-50/30">
                            {/* Headers */}
                            <div className="sticky top-0 bg-white border-b border-slate-200 z-30">
                                {(viewMode === 'Months' || viewMode === 'Quarters') ? (
                                    <div className="flex">
                                        {timelineScale.map((item, idx) => (
                                            <div key={idx} className="flex-1 min-w-[150px] px-4 py-3 text-center border-r border-slate-200">
                                                <div className="text-sm font-medium text-slate-700">{item.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <div className="flex border-b border-slate-100">
                                            {timelineScale.map((group, idx) => (
                                                <div key={idx} style={{ flex: group.days.length }} className="px-2 py-1 text-xs font-bold text-slate-500 border-r border-slate-200 bg-slate-50">
                                                    {group.name}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex">
                                            {timelineScale.flatMap(g => g.days).map((day, idx) => (
                                                <div key={idx} className={clsx(
                                                    "flex-1 min-w-[40px] py-2 text-center border-r border-slate-100 flex flex-col items-center",
                                                    day.isToday && "bg-blue-50/30"
                                                )}>
                                                    <div className={clsx(
                                                        "text-[10px] font-bold mb-1",
                                                        day.isToday ? "text-blue-600" : "text-slate-400"
                                                    )}>{day.day}</div>
                                                    {day.isToday && <div className="w-1 h-1 bg-blue-600 rounded-full"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timeline Bars Area */}
                            <div className="relative pt-12" style={{ minHeight: '600px' }}>
                                {/* Vertical Grid Lines */}
                                <div className="absolute inset-0 flex pointer-events-none">
                                    {viewMode === 'Weeks' ?
                                        timelineScale.flatMap(g => g.days).map((_, i) => (
                                            <div key={i} className="flex-1 border-r border-slate-100 h-full"></div>
                                        )) :
                                        timelineScale.map((_, i) => (
                                            <div key={i} className="flex-1 border-r border-slate-200 h-full"></div>
                                        ))
                                    }
                                </div>

                                {/* Sprint Bars */}
                                {spaceSprints.map((sprint, idx) => {
                                    const left = getPosition(sprint.startDate);
                                    const width = getWidth(sprint.startDate, sprint.endDate);

                                    return (
                                        <div key={sprint.id || idx} className="absolute z-20" style={{
                                            left: `${left}%`,
                                            width: `${width}%`,
                                            top: `${idx * 40 + 20}px`
                                        }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSprintId(selectedSprintId === (sprint.id || idx) ? null : (sprint.id || idx));
                                                }}
                                                className="w-full h-8 flex items-center justify-center bg-white border border-blue-400 rounded-md text-slate-700 text-xs font-bold shadow-sm overflow-hidden px-2 hover:border-blue-600 transition-colors"
                                            >
                                                <div className="absolute inset-0 bg-blue-50 opacity-10"></div>
                                                <span className="relative truncate">{sprint.name}</span>
                                            </button>

                                            {/* Sprint Details Popover (matching image but in project style) */}
                                            <AnimatePresence>
                                                {selectedSprintId === (sprint.id || idx) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                        className="absolute top-full mt-2 left-0 w-80 bg-white text-slate-900 p-5 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[60] border border-slate-200"
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-slate-400">
                                                                    <RotateCcw size={18} className="rotate-90" />
                                                                </div>
                                                                <h3 className="font-bold text-base text-slate-800">{sprint.name}</h3>
                                                            </div>
                                                            <div className="flex items-center gap-2 relative">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setIsMenuOpen(isMenuOpen === (sprint.id || idx) ? null : (sprint.id || idx));
                                                                    }}
                                                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                                                >
                                                                    <MoreHorizontal size={18} />
                                                                </button>

                                                                {/* Dropdown Menu */}
                                                                <AnimatePresence>
                                                                    {isMenuOpen === (sprint.id || idx) && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                                            className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-100 z-[70] py-1"
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEditSprint(sprint);
                                                                                }}
                                                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                                            >
                                                                                Edit sprint
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteSprint(sprint);
                                                                                }}
                                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                                Delete sprint
                                                                            </button>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>

                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedSprintId(null); setIsMenuOpen(null); }}
                                                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="mb-6">
                                                            <span className="px-2.5 py-1 rounded-md border border-blue-100 text-[11px] font-bold text-blue-700 bg-blue-50 uppercase tracking-tight">
                                                                Active sprint
                                                            </span>
                                                        </div>

                                                        <div className="space-y-4 text-left">
                                                            <div>
                                                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                                                    {sprint.goal || "Sprint goal goes here"}
                                                                </p>
                                                            </div>

                                                            <div className="flex gap-8 pt-2">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sprint start</p>
                                                                    <p className="text-sm font-semibold text-slate-700">{sprint.startDate.replace(/-/g, '/')}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sprint end</p>
                                                                    <p className="text-sm font-semibold text-slate-700">{sprint.endDate.replace(/-/g, '/')}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}

                                {/* Current Date Indicator */}
                                <div
                                    className="absolute top-0 bottom-0 w-px bg-blue-500 z-40"
                                    style={{ left: `${getPosition(today)}%` }}
                                >
                                    {viewMode === 'Weeks' ? (
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-blue-500"></div>
                                    ) : (
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Sprint Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingSprint && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-slate-200"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800">Edit Sprint</h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateSprint} className="flex flex-col">
                                <div className="p-6 space-y-6">
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-4">
                                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-900">Sprint Details</h4>
                                            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                                Update the details for <span className="font-bold underline">{editingSprint.name}</span>. Changes will be reflected across the project timeline.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sprint name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editingSprint.name}
                                                onChange={e => setEditingSprint({ ...editingSprint, name: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={editingSprint.startDate}
                                                    onChange={e => setEditingSprint({ ...editingSprint, startDate: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={editingSprint.endDate}
                                                    onChange={e => setEditingSprint({ ...editingSprint, endDate: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sprint goal</label>
                                            <textarea
                                                rows={3}
                                                value={editingSprint.goal}
                                                onChange={e => setEditingSprint({ ...editingSprint, goal: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center gap-2"
                                    >
                                        Save Changes
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Confirmation Modal for Sprint Deletion */}
            <ConfirmModal
                isOpen={!!sprintToDelete}
                onClose={() => setSprintToDelete(null)}
                onConfirm={confirmDeleteSprint}
                title="Delete Sprint"
                message={`Are you sure you want to delete "${sprintToDelete?.name}"? All timeline data for this sprint will be removed. This action cannot be undone.`}
                confirmText="Delete Sprint"
            />
        </div>
    );
};

export default TimelineView;
