import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Calendar, Briefcase, X, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

const ListView = () => {
    const { activeSpace, activeSpaceId, getSpaceTasks, updateTaskStatus, addTask, openTaskDrawer, startSprint, getActiveSprint } = useApp();
    const [isStartSprintOpen, setIsStartSprintOpen] = useState(false);
    const [sprints, setSprints] = useState([{ id: 1, name: 'Sprint 1', status: 'active' }]); // Track all sprints

    // Sprint Form State
    const activeSprint = getActiveSprint(activeSpaceId);
    const [sprintName, setSprintName] = useState(`ES Sprint ${activeSprint}`);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 12096e5).toISOString().split('T')[0]);
    const [sprintGoal, setSprintGoal] = useState('');

    const tasks = getSpaceTasks(activeSpaceId);

    const backlogTasks = tasks.filter(t => t.status === 'backlog');
    const sprintTasks = tasks.filter(t => t.status !== 'backlog');

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;

        // Determine new status based on drop destination
        let newStatus;
        if (destination.droppableId === 'backlog') {
            newStatus = 'backlog';
        } else {
            // If moving to sprint, default to 'todo' if it was backlog, otherwise keep current status (if we supported reordering in same list)
            // simplest for this requirement: set to 'todo' if coming from backlog, else keep as is (but we need to know the 'todo' status id for this template).
            // For now hardcoding 'todo' as the default "Active" status.
            newStatus = 'todo';
        }

        updateTaskStatus(draggableId, newStatus);
    };

    const handleStartSprint = (e) => {
        e.preventDefault();

        // Start the sprint
        startSprint(activeSpaceId, {
            name: sprintName,
            startDate,
            endDate,
            goal: sprintGoal,
            taskCount: sprintTasks.length
        });

        // Close modal and update sprint name for next sprint
        setIsStartSprintOpen(false);
        setSprintName(`ES Sprint ${activeSprint + 1}`);
        setSprintGoal('');
    };

    const handleStartDateChange = (e) => {
        const newStart = e.target.value;
        setStartDate(newStart);
        // Auto set end date to 2 weeks later
        const end = new Date(new Date(newStart).getTime() + 12096e5);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleCreateSprint = () => {
        const newSprintNumber = sprints.length + 1;
        setSprints([...sprints, {
            id: newSprintNumber,
            name: `Sprint ${newSprintNumber}`,
            status: 'planning'
        }]);
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="h-full overflow-y-auto p-8 space-y-8">
                    {/* Sprint Sections - Render all sprints */}
                    {sprints.map((sprint, index) => (
                        <Section
                            key={sprint.id}
                            id={`sprint-${sprint.id}`}
                            title={sprint.name}
                            subtitle={index === 0 ? "Active Sprint" : "Planning"}
                            count={index === 0 ? sprintTasks.length : 0}
                            tasks={index === 0 ? sprintTasks : []}
                            isSprint={true}
                            onStartSprint={index === 0 ? () => setIsStartSprintOpen(true) : undefined}
                            onAdd={() => {
                                openTaskDrawer('new', {
                                    status: 'todo',
                                    type: 'Task',
                                    priority: 'Medium'
                                });
                            }}
                            onTaskClick={openTaskDrawer}
                        />
                    ))}

                    {/* Backlog Section */}
                    <Section
                        id="backlog"
                        title="Backlog"
                        count={backlogTasks.length}
                        tasks={backlogTasks}
                        isBacklog={true}
                        onCreateSprint={handleCreateSprint}
                        onAdd={() => {
                            openTaskDrawer('new', {
                                status: 'backlog',
                                type: 'Story',
                                priority: 'Medium'
                            });
                        }}
                        onTaskClick={openTaskDrawer}
                    />
                </div>
            </DragDropContext>

            {/* Start Sprint Modal */}
            <AnimatePresence>
                {isStartSprintOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-slate-200"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800">Start Sprint</h2>
                                <button
                                    onClick={() => setIsStartSprintOpen(false)}
                                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleStartSprint} className="flex flex-col">
                                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-4">
                                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-900">Sprint Planning</h4>
                                            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                                You are about to start <span className="font-bold underline">{sprintName}</span>.
                                                This will include <span className="font-bold">{sprintTasks.length} work items</span> in your active sprint view.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sprint name</label>
                                            <input
                                                type="text"
                                                required
                                                value={sprintName}
                                                onChange={e => setSprintName(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                                placeholder="e.g. EB Sprint 1"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start date</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        required
                                                        value={startDate}
                                                        onChange={handleStartDateChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End date</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        required
                                                        value={endDate}
                                                        onChange={e => setEndDate(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sprint goal</label>
                                            <textarea
                                                rows={3}
                                                value={sprintGoal}
                                                onChange={e => setSprintGoal(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-400"
                                                placeholder="What are we aiming to achieve in this sprint?"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsStartSprintOpen(false)}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center gap-2"
                                    >
                                        Start Sprint
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

const Section = ({ id, title, subtitle, count, tasks, isSprint, isBacklog, onAdd, onStartSprint, onCreateSprint, onTaskClick }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between group mb-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                    {subtitle && <span className="text-xs text-slate-500 font-medium px-2 border-l border-slate-300 ml-1">{subtitle}</span>}
                    <span className="text-xs text-slate-400">({count} issues)</span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isSprint && onStartSprint && (
                        <button
                            onClick={onStartSprint}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
                        >
                            Start sprint
                        </button>
                    )}
                    {isBacklog && (
                        <button
                            onClick={onCreateSprint}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
                        >
                            Create sprint
                        </button>
                    )}
                    <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Content Box */}
            {isExpanded && (
                <div className="border border-slate-200 rounded-lg bg-slate-50/50 min-h-[100px] flex flex-col">
                    <Droppable droppableId={id}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={clsx(
                                    "flex-1 transition-colors rounded-t-lg min-h-[50px]",
                                    snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                                )}
                            >
                                {tasks.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {tasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{ ...provided.draggableProps.style }}
                                                        onClick={() => onTaskClick(task.id)}
                                                        className={clsx(
                                                            "bg-white p-3 hover:bg-slate-50 flex items-center gap-4 group/item cursor-pointer border-l-4 border-transparent hover:border-blue-500 transition-all",
                                                            snapshot.isDragging ? "shadow-lg z-50 ring-2 ring-blue-500/20 rotate-1" : ""
                                                        )}
                                                    >
                                                        <div className="text-slate-400">
                                                            <Briefcase size={16} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className="text-sm font-medium text-slate-900 truncate">{task.title}</span>
                                                                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 rounded tracking-wider">{task.id}</span>
                                                            </div>
                                                            {task.description && <p className="text-xs text-slate-500 truncate">{task.description}</p>}
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className={clsx(
                                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                                                                task.status === 'done' ? "bg-green-100 text-green-700" :
                                                                    task.status === 'in-progress' ? "bg-blue-100 text-blue-700" :
                                                                        "bg-slate-100 text-slate-600"
                                                            )}>
                                                                {task.status}
                                                            </span>
                                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                                                                {task.assignee ? task.assignee.charAt(0) : '?'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        {isSprint ? (
                                            <div className="max-w-md mx-auto">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3">
                                                    <Calendar size={24} />
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-900 mb-1">Plan your sprint</h4>
                                                <p className="text-xs text-slate-500">Drag work items from the Backlog section or create new ones to plan the work for this sprint.</p>
                                            </div>
                                        ) : (
                                            <div className="max-w-md mx-auto">
                                                <h4 className="text-sm font-bold text-slate-400">Your backlog is empty.</h4>
                                            </div>
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </div>
                        )}
                    </Droppable>

                    {/* Create Button Footer */}
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 p-3 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border-t border-slate-200 rounded-b-lg"
                    >
                        <Plus size={16} />
                        Create
                    </button>
                </div>
            )}
        </div>
    );
};

export default ListView;
