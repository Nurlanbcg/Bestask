
import React from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEMPLATES } from '../data/templates';
import clsx from 'clsx';

const Sidebar = ({ onCreateSpace }) => {
    const { spaces, activeSpaceId, setActiveSpaceId } = useApp();

    return (
        <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 transition-all duration-300">
            <div className="p-4 flex items-center gap-3 border-b border-slate-800">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50">
                    B
                </div>
                <span className="font-bold text-lg text-white tracking-tight">Bestask</span>
            </div>

            <div className="p-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                    Your Spaces
                </h3>
                <div className="space-y-1">
                    {spaces.map(space => {
                        const template = TEMPLATES.find(t => t.id === space.templateId);
                        const Icon = template ? template.icon : LayoutGrid;

                        return (
                            <button
                                key={space.id}
                                onClick={() => setActiveSpaceId(space.id)}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                                    activeSpaceId === space.id
                                        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                                        : "hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon size={18} />
                                <span className="truncate">{space.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-slate-800">
                <button
                    onClick={onCreateSpace}
                    data-create-space-trigger
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-semibold transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40"
                >
                    <Plus size={18} />
                    Create Space
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
