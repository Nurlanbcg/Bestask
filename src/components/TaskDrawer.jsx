import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, User, Tag, Flag, Trash2, Send, Plus, Link as LinkIcon, Eye, Share2, MoreHorizontal, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InviteMembersModal from './InviteMembersModal';

const TaskDrawer = () => {
    const {
        selectedTaskId,
        closeTaskDrawer,
        tasks,
        updateTask,
        deleteTask,
        activeSpace,
        addTask,
        openTaskDrawer,
        draftTask
    } = useApp();
    const [commentText, setCommentText] = useState('');
    const [childItemText, setChildItemText] = useState('');
    const [isAddingChild, setIsAddingChild] = useState(false);
    const [linkedItemText, setLinkedItemText] = useState('');
    const [linkType, setLinkType] = useState('is blocked by');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const { addMembersToSpace, activeSpaceId } = useApp();

    // Find task or use draft
    const isNew = selectedTaskId === 'new';
    const originalTask = isNew ? draftTask : tasks.find(t => t.id === selectedTaskId);

    // Local state for edits
    const [localTask, setLocalTask] = useState(null);

    React.useEffect(() => {
        if (originalTask) {
            setLocalTask(originalTask);
        } else {
            setLocalTask(null);
        }
    }, [selectedTaskId, originalTask]);

    if (!localTask) return null;

    const handleUpdate = (field, value) => {
        const updated = { ...localTask, [field]: value };
        setLocalTask(updated);
        if (!isNew) {
            updateTask(updated);
        }
    };

    const handleSaveNew = () => {
        addTask(localTask);
        closeTaskDrawer();
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const newComment = {
            id: Date.now(),
            text: commentText,
            author: 'You',
            createdAt: new Date().toISOString()
        };

        const updatedComments = localTask.comments ? [...localTask.comments, newComment] : [newComment];
        handleUpdate('comments', updatedComments);
        setCommentText('');
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(localTask.id);
            closeTaskDrawer();
        }
    };

    const handleAddChildItem = () => {
        if (!childItemText.trim()) return;

        addTask({
            spaceId: localTask.spaceId,
            title: childItemText,
            description: '',
            status: 'todo',
            type: 'Story',
            priority: 'Medium',
            assignee: null,
            dueDate: null,
            parentId: localTask.id
        });
        setChildItemText('');
        setIsAddingChild(false);
    };

    // Derived lists
    const members = activeSpace ? activeSpace.members : [];
    const childItems = tasks.filter(t => t.parentId === localTask.id);

    return (
        <AnimatePresence>
            {selectedTaskId && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeTaskDrawer}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                {isNew && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest rounded border border-yellow-200 shadow-sm">
                                        Draft
                                    </span>
                                )}
                                <div className="flex items-center gap-2 px-2 py-1 bg-purple-100 border border-purple-300 rounded">
                                    <Zap size={14} className="text-purple-600" />
                                    <span className="text-xs font-mono text-purple-700">{localTask.id.toUpperCase()}</span>
                                </div>
                                <span className="text-sm font-medium text-slate-600">{localTask.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
                                    <Eye size={18} />
                                    <span className="ml-1 text-sm">1</span>
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
                                    <Share2 size={18} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
                                    <MoreHorizontal size={18} />
                                </button>
                                <button onClick={closeTaskDrawer} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <input
                                type="text"
                                value={localTask.title}
                                onChange={(e) => handleUpdate('title', e.target.value)}
                                className="w-full text-2xl font-bold text-slate-900 border-none focus:ring-0 outline-none placeholder:text-slate-400 mb-4 bg-transparent"
                                placeholder="Task title"
                                autoFocus={isNew}
                            />

                            {/* Status Dropdown */}
                            <div className="mb-6">
                                <select
                                    value={localTask.status}
                                    onChange={(e) => handleUpdate('status', e.target.value)}
                                    className="bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option value="backlog">Backlog</option>
                                    <option value="todo">To Do</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-700 mb-2">Description</h3>
                                <textarea
                                    value={localTask.description}
                                    onChange={(e) => handleUpdate('description', e.target.value)}
                                    className="w-full min-h-[100px] text-slate-700 leading-relaxed text-sm p-3 rounded-lg border border-slate-300 hover:border-slate-400 bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                                    placeholder="Add a description..."
                                />
                            </div>

                            {/* Child Work Items */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Child work items</h3>
                                {childItems.length > 0 ? (
                                    <div className="space-y-2 mb-3">
                                        {childItems.map(child => (
                                            <button
                                                key={child.id}
                                                onClick={() => openTaskDrawer(child.id)}
                                                className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-2 transition-colors"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                <span className="text-sm text-slate-700">{child.title}</span>
                                                <span className="ml-auto text-xs text-slate-500">{child.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 mb-3">Add child work item</p>
                                )}
                                {isAddingChild ? (
                                    <input
                                        type="text"
                                        value={childItemText}
                                        onChange={(e) => setChildItemText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddChildItem();
                                            if (e.key === 'Escape') setIsAddingChild(false);
                                        }}
                                        onBlur={() => {
                                            if (childItemText.trim()) handleAddChildItem();
                                            else setIsAddingChild(false);
                                        }}
                                        placeholder="Child item title..."
                                        autoFocus
                                        className="w-full bg-white border border-blue-500 rounded px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <button
                                        onClick={() => setIsAddingChild(true)}
                                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <Plus size={14} />
                                        Add child item
                                    </button>
                                )}
                            </div>

                            {/* Linked Work Items */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Linked work items</h3>
                                <div className="flex gap-2 mb-3">
                                    <select
                                        value={linkType}
                                        onChange={(e) => setLinkType(e.target.value)}
                                        className="bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option>is blocked by</option>
                                        <option>blocks</option>
                                        <option>relates to</option>
                                        <option>duplicates</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={linkedItemText}
                                        onChange={(e) => setLinkedItemText(e.target.value)}
                                        placeholder="Type, search or paste URL"
                                        className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    <Plus size={14} />
                                    Create linked work item
                                </button>
                            </div>

                            {/* Details Section */}
                            <div className="mb-6">
                                <button className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors">
                                    <span className="text-sm font-bold text-slate-700">Details</span>
                                    <span className="text-slate-500">▼</span>
                                </button>
                                <div className="mt-3 space-y-4 px-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Assignee</span>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={localTask.assignee || ''}
                                                onChange={(e) => handleUpdate('assignee', e.target.value)}
                                                className="bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            >
                                                <option value="">Unassigned</option>
                                                {members.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <button
                                                onClick={() => setIsInviteModalOpen(true)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                                                title="Invite new member"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Labels</span>
                                        <span className="text-sm text-slate-500">None</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Due date</span>
                                        <input
                                            type="date"
                                            value={localTask.dueDate ? localTask.dueDate.split('T')[0] : ''}
                                            onChange={(e) => handleUpdate('dueDate', new Date(e.target.value).toISOString())}
                                            className="bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Activity Section */}
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 mb-4">Activity</h3>

                                <div className="space-y-4 mb-6">
                                    {localTask.comments && localTask.comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                {comment.author.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-slate-700">{comment.author}</span>
                                                    <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
                                                </div>
                                                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                    {comment.text}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleAddComment} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                        Y
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Add a comment..."
                                            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!commentText.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                            {isNew ? (
                                <>
                                    <button
                                        onClick={closeTaskDrawer}
                                        className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveNew}
                                        disabled={!localTask.title.trim()}
                                        className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                                    >
                                        Save Task
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Invite Members Modal */}
                    <InviteMembersModal
                        isOpen={isInviteModalOpen}
                        onClose={() => setIsInviteModalOpen(false)}
                        onInvite={(emails) => {
                            addMembersToSpace(activeSpaceId, emails);
                        }}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

export default TaskDrawer;
