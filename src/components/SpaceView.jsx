
import React, { useState } from 'react';
import { Kanban, List as ListIcon, Calendar, Clock, Plus, Filter, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEMPLATES } from '../data/templates';
import SummaryView from './views/SummaryView';
import BoardView from './views/BoardView';
import ListView from './views/ListView';
import TimelineView from './views/TimelineView';
import CalendarView from './views/CalendarView';
import SpaceSettingsModal from './SpaceSettingsModal';
import InviteMembersModal from './InviteMembersModal';
import clsx from 'clsx';

const ALL_TABS = [
    { id: 'summary', name: 'Summary', icon: LayoutGrid },
    { id: 'board', name: 'Board', icon: Kanban },
    { id: 'list', name: 'List', icon: ListIcon },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'timeline', name: 'Timeline', icon: Clock },
];

const SearchInput = () => (
    <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
            type="text"
            placeholder="Search this space..."
            className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-blue-500 w-64 outline-none transition-all focus:bg-white focus:shadow-sm"
        />
    </div>
);

// Function to get available tabs based on template
const getAvailableTabs = (templateId) => {
    // Kanban template only shows Board, Calendar, and Timeline (no List)
    if (templateId === 'kanban-dev') {
        return ALL_TABS.filter(tab => tab.id !== 'list');
    }
    // All other templates show all tabs
    return ALL_TABS;
};

const SpaceView = () => {
    const { activeSpace, spaces, activeSpaceId, addTask, openTaskDrawer, addMembersToSpace } = useApp();
    const [activeTab, setActiveTab] = useState('summary');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    if (!activeSpace) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-600">No Space Selected</h2>
                    <p>Select a space from the sidebar or create a new one.</p>
                </div>
            </div>
        )
    }

    const template = TEMPLATES.find(t => t.id === activeSpace.templateId) || TEMPLATES[0] || {
        id: 'default',
        name: 'General',
        statuses: [{ id: 'todo', name: 'To Do', color: 'bg-slate-200' }],
        taskTypes: ['Task']
    };

    return (
        <div className="flex flex-col h-full">
            {/* Space Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                            <span>Spaces</span>
                            <span>/</span>
                            <span className="font-medium text-slate-700">{activeSpace.name}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">{activeSpace.name}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 mr-4">
                            {activeSpace.members.map((m, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600" title={m}>
                                    {m.charAt(0)}
                                </div>
                            ))}
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="w-8 h-8 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="relative group">
                            <button
                                onClick={() => {
                                    openTaskDrawer('new', {
                                        status: template?.statuses?.[0]?.id || 'todo',
                                        type: template?.taskTypes?.[0] || 'Task',
                                        priority: 'Medium'
                                    });
                                }}
                                className="bg-blue-600 text-white px-3 py-2 rounded-l-md font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <Plus size={16} />
                                New Task
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                {['Story', 'Task', 'Bug', 'Epic'].map(taskType => (
                                    <button
                                        key={taskType}
                                        onClick={() => {
                                            openTaskDrawer('new', {
                                                status: template?.statuses?.[0]?.id || 'todo',
                                                type: taskType,
                                                priority: 'Medium'
                                            });
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                                    >
                                        <span className={clsx(
                                            "w-2 h-2 rounded-full",
                                            taskType === 'Story' ? 'bg-green-500' :
                                                taskType === 'Task' ? 'bg-blue-500' :
                                                    taskType === 'Bug' ? 'bg-red-500' :
                                                        'bg-purple-500'
                                        )}></span>
                                        {taskType}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="bg-slate-100 text-slate-600 px-3 py-2 rounded-md font-medium text-sm hover:bg-slate-200 transition-colors"
                        >
                            Space Settings
                        </button>
                    </div>
                </div>

                {/* Tabs & Filters */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        {getAvailableTabs(activeSpace.templateId).map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                    activeTab === tab.id
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                )}
                            >
                                <tab.icon size={16} />
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50/50">
                {activeTab === 'summary' && <SummaryView />}
                {activeTab === 'board' && <BoardView template={template} />}
                {activeTab === 'list' && <ListView />}
                {activeTab === 'calendar' && <CalendarView />}
                {activeTab === 'timeline' && <TimelineView />}
            </div>

            {/* Space Settings Modal */}
            <SpaceSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                space={activeSpace}
            />

            {/* Invite Members Modal */}
            <InviteMembersModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={(emails) => {
                    // Convert emails to names (in real app, would send invites)
                    addMembersToSpace(activeSpaceId, emails);
                }}
            />
        </div>
    );
};

export default SpaceView;
