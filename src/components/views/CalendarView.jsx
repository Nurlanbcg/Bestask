import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, Filter, Plus, Calendar as CalendarIcon, Search, MoreHorizontal, X, User, Tag, Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { TEMPLATES } from '../../data/templates';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarView = () => {
    const { activeSpaceId, getSpaceTasks, updateTask, openTaskDrawer, activeSpace, sprints } = useApp();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState('Month');
    const [searchUnscheduled, setSearchUnscheduled] = useState('');
    const [filters, setFilters] = useState({
        assignee: [],
        type: [],
        status: [],
        search: ''
    });

    const tasks = getSpaceTasks(activeSpaceId);
    const template = TEMPLATES.find(t => t.id === activeSpace?.templateId);
    const members = activeSpace?.members || [];

    // Filter tasks based on all active filters
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = !filters.search ||
            task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            task.id.toLowerCase().includes(filters.search.toLowerCase());

        const matchesAssignee = filters.assignee.length === 0 || (task.assignee ? filters.assignee.includes(task.assignee) : filters.assignee.includes('Unassigned'));
        const matchesType = filters.type.length === 0 || filters.type.includes(task.type);
        const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status);

        return matchesSearch && matchesAssignee && matchesType && matchesStatus;
    });

    const spaceSprints = sprints[activeSpaceId]?.sprints || [];

    // Calendar logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Adjust for Monday start (JS default is Sunday = 0)
    // 0 = Sun, 1 = Mon ... 6 = Sat
    // We want: 0 = Mon, 1 = Tue ... 6 = Sun
    let startDayIndex = firstDayOfMonth.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6; // Sunday

    const totalDaysInMonth = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // Generate days grid
    const days = [];

    // Previous month padding
    for (let i = startDayIndex - 1; i >= 0; i--) {
        days.push({
            day: prevMonthLastDay - i,
            month: month - 1,
            year: year,
            isCurrentMonth: false,
            date: new Date(year, month - 1, prevMonthLastDay - i)
        });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
        days.push({
            day: i,
            month: month,
            year: year,
            isCurrentMonth: true,
            date: new Date(year, month, i)
        });
    }

    // Next month padding
    const remainingSlots = 42 - days.length; // 6 weeks
    for (let i = 1; i <= remainingSlots; i++) {
        days.push({
            day: i,
            month: month + 1,
            year: year,
            isCurrentMonth: false,
            date: new Date(year, month + 1, i)
        });
    }

    const monthName = currentDate.toLocaleString('default', { month: 'short' });

    // Week calculation logic
    const getWeekDays = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday start
        const monday = new Date(d.setDate(diff));

        return Array.from({ length: 7 }, (_, i) => {
            const dayDate = new Date(monday);
            dayDate.setDate(monday.getDate() + i);
            return dayDate;
        });
    };

    const weekDays = getWeekDays(currentDate);

    const nextTime = () => {
        if (viewMode === 'Month') {
            setCurrentDate(new Date(year, month + 1, 1));
        } else {
            const nextWeek = new Date(currentDate);
            nextWeek.setDate(currentDate.getDate() + 7);
            setCurrentDate(nextWeek);
        }
    };

    const prevTime = () => {
        if (viewMode === 'Month') {
            setCurrentDate(new Date(year, month - 1, 1));
        } else {
            const prevWeek = new Date(currentDate);
            prevWeek.setDate(currentDate.getDate() - 7);
            setCurrentDate(prevWeek);
        }
    };

    const prevMonth = prevTime;
    const nextMonth = nextTime;

    const setToday = () => {
        setCurrentDate(new Date());
    };

    const getTasksForDate = (date) => {
        return filteredTasks.filter(t => {
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d.toDateString() === date.toDateString();
        });
    };

    const isDateInSprint = (date, sprint) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const start = new Date(sprint.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(sprint.endDate);
        end.setHours(0, 0, 0, 0);
        return d >= start && d <= end;
    };

    const unscheduledTasks = filteredTasks.filter(t => !t.dueDate).filter(t =>
        t.title.toLowerCase().includes(searchUnscheduled.toLowerCase()) ||
        t.id.toLowerCase().includes(searchUnscheduled.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 relative selection:bg-blue-100">
            {/* Filter Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-1 duration-500">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search calendar"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="pl-9 pr-4 py-1.5 bg-slate-100 border border-transparent rounded-md text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 w-48 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <AdvancedFilterDropdown
                            label="Assignee"
                            selectedValues={filters.assignee}
                            options={[
                                { id: 'Unassigned', name: 'Unassigned', type: 'special' },
                                ...members.map(m => ({ id: m, name: m }))
                            ]}
                            onChange={(vals) => setFilters({ ...filters, assignee: vals })}
                            type="assignee"
                        />
                        <AdvancedFilterDropdown
                            label="Type"
                            selectedValues={filters.type}
                            options={[
                                { id: 'Task', name: 'Task' },
                                { id: 'Epic', name: 'Epic' },
                                { id: 'Bug', name: 'Bug' },
                                { id: 'Story', name: 'Story' },
                                { id: 'Subtask', name: 'Subtask' }
                            ]}
                            onChange={(vals) => setFilters({ ...filters, type: vals })}
                        />
                        <AdvancedFilterDropdown
                            label="Status"
                            selectedValues={filters.status}
                            options={[
                                { id: 'todo', name: 'To Do' },
                                { id: 'in-progress', name: 'In Progress' },
                                { id: 'done', name: 'Done' }
                            ]}
                            onChange={(vals) => setFilters({ ...filters, status: vals })}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100/80 backdrop-blur-sm rounded-lg p-1 border border-slate-200">
                        <button onClick={setToday} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-md transition-all">Today</button>
                        <div className="flex items-center gap-1 mx-3">
                            <button onClick={prevTime} className="p-1.5 hover:bg-white hover:shadow-sm hover:text-blue-600 rounded-md transition-all"><ChevronLeft size={14} /></button>
                            <span className="text-sm font-black min-w-[120px] text-center text-slate-800 tracking-tight">
                                {viewMode === 'Month'
                                    ? `${monthName} ${year}`
                                    : `${weekDays[0].getDate()} ${weekDays[0].toLocaleString('default', { month: 'short' })} - ${weekDays[6].getDate()} ${weekDays[6].toLocaleString('default', { month: 'short' })}`
                                }
                            </span>
                            <button onClick={nextTime} className="p-1.5 hover:bg-white hover:shadow-sm hover:text-blue-600 rounded-md transition-all"><ChevronRight size={14} /></button>
                        </div>

                        <div className="relative group/view">
                            <button
                                onClick={() => setViewMode(viewMode === 'Month' ? 'Week' : 'Month')}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                {viewMode}
                                <ChevronDown size={12} className="opacity-50" />
                            </button>
                        </div>
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-1"></div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={clsx(
                                "p-2 rounded-md border transition-all relative",
                                isSidebarOpen
                                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                            )}
                            title="Unscheduled work"
                        >
                            <CalendarIcon size={18} />
                            {unscheduledTasks.length > 0 && !isSidebarOpen && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white">
                                    {unscheduledTasks.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Calendar Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {viewMode === 'Month' ? (
                        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-7 border-b border-slate-200 sticky top-0 z-10">
                                {DAYS.map(day => (
                                    <div key={day} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white/80 backdrop-blur-md">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 auto-rows-fr h-full">
                                {days.map((d, i) => {
                                    const dayTasks = getTasksForDate(d.date);
                                    const isToday = new Date().toDateString() === d.date.toDateString();
                                    const sprint = spaceSprints.find(s => isDateInSprint(d.date, s));

                                    return (
                                        <div
                                            key={i}
                                            className={clsx(
                                                "border-r border-b border-slate-200 min-h-[140px] p-2 transition-colors relative group/day",
                                                d.isCurrentMonth ? "bg-white" : "bg-slate-50/50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={clsx(
                                                    "text-xs font-black w-7 h-7 flex items-center justify-center rounded-full transition-all",
                                                    isToday
                                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110"
                                                        : (d.isCurrentMonth ? "text-slate-800 group-hover/day:text-blue-600" : "text-slate-300")
                                                )}>
                                                    {d.day}
                                                </span>
                                                {d.day === 1 && (
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.isCurrentMonth ? monthName : d.date.toLocaleString('default', { month: 'short' })}</span>
                                                )}
                                            </div>

                                            <div className="space-y-1.5 relative z-0">
                                                {sprint && (
                                                    <div className={clsx(
                                                        "h-6 px-2 text-[10px] font-bold text-blue-700 bg-blue-100/50 border-y border-blue-200 flex items-center gap-1.5 overflow-hidden whitespace-nowrap",
                                                        new Date(sprint.startDate).toDateString() === d.date.toDateString() && "rounded-l-md border-l",
                                                        new Date(sprint.endDate).toDateString() === d.date.toDateString() && "rounded-r-md border-r"
                                                    )}>
                                                        <CalendarIcon size={10} />
                                                        {sprint.name}
                                                    </div>
                                                )}
                                                {dayTasks.map(task => (
                                                    <div key={task.id} onClick={() => openTaskDrawer(task.id)} className="group/task relative cursor-pointer">
                                                        <div className={clsx(
                                                            "px-2 py-1.5 text-[11px] font-bold rounded-lg border shadow-sm transition-all truncate flex items-center gap-1.5",
                                                            task.status === 'done' ? "bg-slate-50 border-slate-100 text-slate-400 line-through" : "bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:shadow-md hover:translate-x-1"
                                                        )}>
                                                            <span className={clsx("w-1.5 h-1.5 rounded-full ring-2 ring-white", task.type === 'Bug' ? 'bg-red-500' : task.type === 'Story' ? 'bg-green-500' : 'bg-blue-500')}></span>
                                                            {task.title}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Week View - Integrated Project Style */
                        <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden animate-in fade-in duration-500">
                            <div className="grid grid-cols-7 border-b border-slate-200 sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
                                {weekDays.map((date, idx) => {
                                    const isToday = new Date().toDateString() === date.toDateString();
                                    return (
                                        <div key={idx} className="py-4 flex flex-col items-center gap-1 border-r border-slate-100 last:border-r-0">
                                            <span className={clsx(
                                                "text-[10px] font-black uppercase tracking-[0.2em]",
                                                isToday ? "text-blue-600" : "text-slate-400"
                                            )}>
                                                {DAYS[idx]}
                                            </span>
                                            <span className={clsx(
                                                "w-8 h-8 flex items-center justify-center rounded-full text-sm font-black transition-all",
                                                isToday ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110" : "text-slate-700"
                                            )}>
                                                {date.getDate()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex-1 grid grid-cols-7 relative overflow-y-auto custom-scrollbar">
                                {/* Sprint Layer - Uses Project Primary Blue */}
                                {spaceSprints.map(s => {
                                    const startIdx = weekDays.findIndex(d => d.toDateString() === new Date(s.startDate).toDateString());
                                    const endIdx = weekDays.findIndex(d => d.toDateString() === new Date(s.endDate).toDateString());

                                    if (startIdx === -1 && endIdx === -1) return null;

                                    return (
                                        <div
                                            key={s.id}
                                            className="absolute top-2 h-7 bg-blue-600/10 border-y border-blue-500/20 text-blue-700 text-[10px] font-black flex items-center px-4 gap-2 z-10 backdrop-blur-sm"
                                            style={{
                                                left: `${Math.max(0, startIdx) * (100 / 7)}%`,
                                                width: `${(Math.min(6, endIdx === -1 ? 6 : endIdx) - Math.max(0, startIdx) + 1) * (100 / 7)}%`
                                            }}
                                        >
                                            <CalendarIcon size={12} className="text-blue-500" />
                                            <span className="uppercase tracking-widest">{s.name}</span>
                                        </div>
                                    );
                                })}

                                {weekDays.map((date, idx) => {
                                    const dayTasks = getTasksForDate(date);
                                    return (
                                        <div key={idx} className="border-r border-slate-100 last:border-r-0 flex flex-col p-3 pt-12 gap-3 min-h-full hover:bg-white/40 transition-colors">
                                            {dayTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    onClick={() => openTaskDrawer(task.id)}
                                                    className="group/task bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-blue-500/50 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={clsx(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                task.type === 'Bug' ? 'bg-red-500' :
                                                                    task.type === 'Story' ? 'bg-emerald-500' :
                                                                        'bg-blue-500'
                                                            )}></span>
                                                            <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">{task.id}</span>
                                                        </div>
                                                        <button className="opacity-0 group-hover/task:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity">
                                                            <MoreHorizontal size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-700 leading-snug group-hover/task:text-blue-600 transition-colors line-clamp-2">
                                                        {task.title}
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-500 uppercase tracking-tight">
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                        {task.assignee && (
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-black text-white uppercase border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                                {task.assignee.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Quick Add Placeholder */}
                                            <button
                                                onClick={() => openTaskDrawer('new', {
                                                    status: 'todo',
                                                    type: template?.taskTypes?.[0] || 'Task',
                                                    dueDate: date.toISOString().split('T')[0]
                                                })}
                                                className="opacity-0 group-hover:opacity-100 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-xs font-bold gap-2"
                                            >
                                                <Plus size={14} />
                                                <span>Add item</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Unscheduled Sidebar */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-white border-l border-slate-200 flex flex-col shadow-xl"
                        >
                            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Unscheduled work</h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-4 bg-slate-50 border-b border-slate-100">
                                <p className="text-xs text-slate-500 mb-3">
                                    Below are items without a due date. Drag them onto the calendar to schedule.
                                </p>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search items..."
                                        value={searchUnscheduled}
                                        onChange={(e) => setSearchUnscheduled(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {unscheduledTasks.length > 0 ? (
                                    unscheduledTasks.map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => openTaskDrawer(task.id)}
                                            className="p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={clsx(
                                                        "w-2 h-2 rounded-full",
                                                        task.type === 'Bug' ? 'bg-red-500' :
                                                            task.type === 'Story' ? 'bg-green-500' :
                                                                'bg-blue-500'
                                                    )}></span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{task.id}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User size={10} className="text-slate-400" />
                                                    <span className="text-[10px] text-slate-500">{task.assignee ? task.assignee.split(' ')[0] : 'Unassigned'}</span>
                                                </div>
                                            </div>
                                            <h4 className="text-sm font-medium text-slate-700 leading-tight mb-2 group-hover:text-blue-600">{task.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded uppercase tracking-wide border border-slate-200">
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-sm text-slate-400">No unscheduled items</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const AdvancedFilterDropdown = ({ label, selectedValues, options, onChange, type, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleValue = (val) => {
        const newValues = selectedValues.includes(val)
            ? selectedValues.filter(v => v !== val)
            : [...selectedValues, val];
        onChange(newValues);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded transition-all text-[13px] font-bold tracking-tight",
                    selectedValues.length > 0
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
            >
                {label} {selectedValues.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">{selectedValues.length}</span>}
                <ChevronDown size={14} className={clsx("transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 z-50 overflow-hidden"
                        >
                            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                                    <input
                                        type="text"
                                        placeholder={placeholder || `Search ${label.toLowerCase()}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => toggleValue(opt.id)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left group/item"
                                        >
                                            <div className={clsx(
                                                "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                selectedValues.includes(opt.id)
                                                    ? "bg-blue-600 border-blue-600 scale-110 shadow-sm"
                                                    : "border-slate-300 group-hover/item:border-slate-400"
                                            )}>
                                                {selectedValues.includes(opt.id) && <Check size={12} className="text-white" />}
                                            </div>

                                            {type === 'assignee' && (
                                                <div className={clsx(
                                                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm ring-1 ring-slate-100",
                                                    opt.id === 'Unassigned' ? "bg-slate-100 text-slate-400" : "bg-indigo-100 text-indigo-700"
                                                )}>
                                                    {opt.id === 'Unassigned' ? <User size={12} /> : opt.name.charAt(0)}
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-slate-700 truncate">{opt.name}</div>
                                                {opt.id === 'Unassigned' && <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">No owner</div>}
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-8 text-center px-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                                            <Search size={20} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No results found</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <button
                                    onClick={() => onChange([])}
                                    className="px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-[0.1em] transition-colors"
                                >
                                    Clear all
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-1.5 bg-white border border-slate-200 rounded-md text-[10px] font-black text-blue-600 hover:bg-white hover:border-blue-200 shadow-sm uppercase tracking-[0.1em] transition-all"
                                >
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalendarView;
