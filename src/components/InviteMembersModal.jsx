import React, { useState } from 'react';
import { X, Mail, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InviteMembersModal = ({ isOpen, onClose, onInvite }) => {
    const [emailInput, setEmailInput] = useState('');
    const [invitedEmails, setInvitedEmails] = useState([]);

    const handleAddEmail = () => {
        const trimmed = emailInput.trim().replace(/,$/, '');
        if (trimmed && !invitedEmails.includes(trimmed)) {
            // Basic email validation could be added here
            setInvitedEmails([...invitedEmails, trimmed]);
            setEmailInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddEmail();
        } else if (e.key === ',') {
            e.preventDefault();
            handleAddEmail();
        } else if (e.key === 'Backspace' && !emailInput && invitedEmails.length > 0) {
            setInvitedEmails(invitedEmails.slice(0, -1));
        }
    };

    const removeEmail = (email) => {
        setInvitedEmails(invitedEmails.filter(e => e !== email));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Include current input if any
        let finalEmails = [...invitedEmails];
        const currentTrimmed = emailInput.trim().replace(/,$/, '');
        if (currentTrimmed && !finalEmails.includes(currentTrimmed)) {
            finalEmails.push(currentTrimmed);
        }

        if (finalEmails.length > 0) {
            onInvite(finalEmails);
            setInvitedEmails([]);
            setEmailInput('');
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <UserPlus size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Invite Members</h2>
                                    <p className="text-sm text-slate-500">Add people to your space</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email addresses
                                </label>
                                <div
                                    className="w-full p-2 border border-slate-300 rounded-lg flex flex-wrap gap-2 min-h-[120px] focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all bg-white cursor-text items-start content-start"
                                    onClick={() => document.getElementById('invite-email-input')?.focus()}
                                >
                                    {invitedEmails.map(email => (
                                        <div key={email} className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 font-medium">
                                            <div className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-[10px] text-blue-800">
                                                {email.charAt(0).toUpperCase()}
                                            </div>
                                            {email}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeEmail(email);
                                                }}
                                                className="hover:text-blue-900 ml-1"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <input
                                        id="invite-email-input"
                                        type="text"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={handleAddEmail}
                                        placeholder={invitedEmails.length === 0 ? "Enter email addresses..." : ""}
                                        className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-slate-900 py-1"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    Press Enter or use a comma to add an email address
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-900/20 transition-colors flex items-center gap-2"
                                >
                                    <Mail size={16} />
                                    Send Invites
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default InviteMembersModal;
