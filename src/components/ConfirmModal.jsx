import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TriangleAlert, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-md rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-200"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <TriangleAlert size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                                        <button
                                            onClick={onClose}
                                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 px-6">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${type === 'danger'
                                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/20'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
