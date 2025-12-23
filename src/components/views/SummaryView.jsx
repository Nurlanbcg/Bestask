import React from 'react';
import { useApp } from '../../context/AppContext';
import { Filter, CheckCircle, Edit, FileText, Calendar, Zap, Bug, Target, BookOpen } from 'lucide-react';
import clsx from 'clsx';

const SummaryView = () => {
    const { activeSpaceId, getSpaceTasks, tasks } = useApp();
    const spaceTasks = getSpaceTasks(activeSpaceId);

    // Calculate statistics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const completedLast7Days = spaceTasks.filter(t =>
        t.status === 'done' && t.createdAt && new Date(t.createdAt) >= sevenDaysAgo
    ).length;

    const updatedLast7Days = spaceTasks.filter(t =>
        t.updatedAt && new Date(t.updatedAt) >= sevenDaysAgo
    ).length;

    const createdLast7Days = spaceTasks.filter(t =>
        t.createdAt && new Date(t.createdAt) >= sevenDaysAgo
    ).length;

    const dueSoon = spaceTasks.filter(t => {
        if (!t.dueDate || t.status === 'done') return false;
        const dueDate = new Date(t.dueDate);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate <= nextWeek && dueDate >= now;
    }).length;

    // Status breakdown
    const statusCounts = {
        'todo': spaceTasks.filter(t => t.status === 'todo').length,
        'in-progress': spaceTasks.filter(t => t.status === 'in-progress').length,
        'review': spaceTasks.filter(t => t.status === 'review').length,
        'done': spaceTasks.filter(t => t.status === 'done').length,
    };

    const totalTasks = spaceTasks.length;

    // Type breakdown
    const typeCounts = {
        'Epic': spaceTasks.filter(t => t.type === 'Epic').length,
        'Task': spaceTasks.filter(t => t.type === 'Task').length,
        'Bug': spaceTasks.filter(t => t.type === 'Bug').length,
        'Story': spaceTasks.filter(t => t.type === 'Story').length,
    };

    // Priority breakdown
    const priorityCounts = {
        'High': spaceTasks.filter(t => t.priority === 'High').length,
        'Medium': spaceTasks.filter(t => t.priority === 'Medium').length,
        'Low': spaceTasks.filter(t => t.priority === 'Low').length,
    };

    // Recent activity
    const recentActivity = spaceTasks
        .filter(t => t.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Epic': return <Zap size={14} className="text-purple-500" />;
            case 'Bug': return <Bug size={14} className="text-red-500" />;
            case 'Story': return <BookOpen size={14} className="text-green-500" />;
            default: return <CheckCircle size={14} className="text-blue-500" />;
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    return (
        <div className="h-full overflow-y-auto p-8 bg-slate-50">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Summary</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Filter size={16} />
                    Filter
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={<CheckCircle size={20} />}
                    title="0 completed"
                    subtitle="in the last 7 days"
                    value={completedLast7Days}
                />
                <StatCard
                    icon={<Edit size={20} />}
                    title={`${updatedLast7Days} updated`}
                    subtitle="in the last 7 days"
                    value={updatedLast7Days}
                />
                <StatCard
                    icon={<FileText size={20} />}
                    title={`${createdLast7Days} created`}
                    subtitle="in the last 7 days"
                    value={createdLast7Days}
                />
                <StatCard
                    icon={<Calendar size={20} />}
                    title={`${dueSoon} due soon`}
                    subtitle="in the next 7 days"
                    value={dueSoon}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Overview */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900">Status overview</h3>
                        <a href="#" className="text-xs text-blue-600 hover:text-blue-700">View all work items</a>
                    </div>

                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="none"
                                    stroke="#e2e8f0"
                                    strokeWidth="16"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="16"
                                    strokeDasharray={`${totalTasks > 0 ? (statusCounts['todo'] / totalTasks) * 502 : 0} 502`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-3xl font-bold text-slate-900">{totalTasks}</div>
                                <div className="text-xs text-slate-500">Total work items</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-slate-700">To Do</span>
                            </div>
                            <span className="font-medium text-slate-900">{statusCounts['todo']}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-slate-700">In Progress</span>
                            </div>
                            <span className="font-medium text-slate-900">{statusCounts['in-progress']}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span className="text-slate-700">Review</span>
                            </div>
                            <span className="font-medium text-slate-900">{statusCounts['review']}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-slate-700">Done</span>
                            </div>
                            <span className="font-medium text-slate-900">{statusCounts['done']}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Recent activity</h3>
                    <p className="text-xs text-slate-500 mb-4">Stay up to date with what's happening across the space.</p>

                    <div className="space-y-3">
                        {recentActivity.length > 0 ? (
                            recentActivity.map(task => (
                                <div key={task.id} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        Y
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-slate-900">You</span>
                                            <span className="text-sm text-slate-600">created</span>
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                                                {getTypeIcon(task.type)}
                                                <span className="text-slate-700">{task.id.toUpperCase()}</span>
                                            </div>
                                            <span className="text-xs text-slate-500">{getTimeAgo(task.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1 truncate">{task.title}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">No recent activity</p>
                        )}
                    </div>
                </div>

                {/* Priority Breakdown */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900">Priority breakdown</h3>
                        <a href="#" className="text-xs text-blue-600 hover:text-blue-700">How to manage priorities</a>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-700">High</span>
                                <span className="font-medium text-slate-900">{priorityCounts['High']}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full transition-all"
                                    style={{ width: `${totalTasks > 0 ? (priorityCounts['High'] / totalTasks) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-700">Medium</span>
                                <span className="font-medium text-slate-900">{priorityCounts['Medium']}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-500 rounded-full transition-all"
                                    style={{ width: `${totalTasks > 0 ? (priorityCounts['Medium'] / totalTasks) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-700">Low</span>
                                <span className="font-medium text-slate-900">{priorityCounts['Low']}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{ width: `${totalTasks > 0 ? (priorityCounts['Low'] / totalTasks) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Types of Work */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900">Types of work</h3>
                        <a href="#" className="text-xs text-blue-600 hover:text-blue-700">View all items</a>
                    </div>

                    <div className="space-y-3">
                        {Object.entries(typeCounts).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getTypeIcon(type)}
                                    <span className="text-sm text-slate-700">{type}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={clsx(
                                                "h-full rounded-full transition-all",
                                                type === 'Epic' ? 'bg-purple-500' :
                                                    type === 'Bug' ? 'bg-red-500' :
                                                        type === 'Story' ? 'bg-green-500' :
                                                            'bg-blue-500'
                                            )}
                                            style={{ width: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900 w-8 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, subtitle, value }) => {
    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="text-slate-600">{icon}</div>
                <div>
                    <div className="text-sm font-bold text-slate-900">{title}</div>
                    <div className="text-xs text-slate-500">{subtitle}</div>
                </div>
            </div>
        </div>
    );
};

export default SummaryView;
