import React, { useState } from 'react';
import { X, Settings, Trash2, User } from 'lucide-react';
import { useApp, DEFAULT_MEMBERS } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const SpaceSettingsModal = ({ isOpen, onClose, space }) => {
    const { updateSpace, deleteSpace, setActiveSpaceId } = useApp();
    const [formData, setFormData] = useState({
        name: space?.name || '',
        owner: space?.owner || 'You',
        description: space?.description || ''
    });

    if (!isOpen || !space) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        updateSpace(space.id, formData);
        onClose();
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${space.name}"? This action cannot be undone.`)) {
            deleteSpace(space.id);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <Settings size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Space Settings</h2>
                                    <p className="text-sm text-slate-500">Manage your space configuration</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Space Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Enter space name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Space Owner
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <select
                                        value={formData.owner}
                                        onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white appearance-none"
                                    >
                                        {DEFAULT_MEMBERS.map(member => (
                                            <option key={member} value={member}>{member}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-24 resize-none"
                                    placeholder="Describe your space..."
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <h3 className="text-sm font-bold text-slate-900 mb-2">Danger Zone</h3>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Delete Space
                                </button>
                            </div>
                        </form>

                        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SpaceSettingsModal;
