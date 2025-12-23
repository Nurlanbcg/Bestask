
import React from 'react';
import { MoreHorizontal, AlertCircle, ArrowUp, ArrowDown, CheckCircle2, Bookmark } from 'lucide-react';
import { useApp } from '../context/AppContext';
import clsx from 'clsx';

const PriorityIcon = ({ priority }) => {
    switch (priority?.toLowerCase()) {
        case 'high': return <ArrowUp size={14} className="text-red-500" />;
        case 'medium': return <CheckCircle2 size={14} className="text-blue-500" />; // Just an icon
        case 'low': return <ArrowDown size={14} className="text-slate-400" />;
        default: return <Bookmark size={14} className="text-slate-400" />;
    }
}

const TaskCard = ({ task }) => {
    const { openTaskDrawer } = useApp();

    return (
        <div
            onClick={() => openTaskDrawer(task.id)}
            className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-slate-500 hover:text-blue-600 hover:underline">{task.type}</span>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <h4 className="text-sm font-medium text-slate-800 mb-3 leading-snug line-clamp-2">
                {task.title}
            </h4>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded bg-slate-100" title={task.priority}>
                        <PriorityIcon priority={task.priority} />
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{task.id.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2">
                    {task.assignee && (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700" title={`Assigned to ${task.assignee}`}>
                            {task.assignee.charAt(0)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
