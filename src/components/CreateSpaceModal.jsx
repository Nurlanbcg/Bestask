import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Users, Code, ArrowRight, Monitor, Briefcase, LayoutGrid, Plus, ChevronDown, Search } from 'lucide-react';
import { TEMPLATES } from '../data/templates';
import { useApp, DEFAULT_MEMBERS } from '../context/AppContext';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

// Group templates by category
const CATEGORIES = [
    {
        id: 'software-dev',
        name: 'Software Development',
        description: 'Agile workflows for development teams',
        icon: Code,
        color: 'bg-blue-500',
        templates: TEMPLATES.filter(t => t.id.includes('dev') || t.id.includes('kanban') || t.id.includes('scrum') || t.id.includes('pm'))
    },
    {
        id: 'hr',
        name: 'HR & Recruitment',
        description: 'Manage recruitment and employee processes',
        icon: TEMPLATES.find(t => t.id === 'hr')?.icon || Users,
        color: 'bg-rose-500',
        templates: [TEMPLATES.find(t => t.id === 'hr')].filter(Boolean)
    },
    {
        id: 'sales',
        name: 'Sales & CRM',
        description: 'Track deals and customer relationships',
        icon: TEMPLATES.find(t => t.id === 'sales')?.icon || Briefcase,
        color: 'bg-green-500',
        templates: [TEMPLATES.find(t => t.id === 'sales')].filter(Boolean)
    },
    {
        id: 'support',
        name: 'IT Support',
        description: 'Manage tickets and incidents',
        icon: TEMPLATES.find(t => t.id === 'it')?.icon || Monitor,
        color: 'bg-purple-500',
        templates: [TEMPLATES.find(t => t.id === 'it')].filter(Boolean)
    }
].filter(cat => cat.templates.length > 0); // Filter out empty categories

const CreateSpaceModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [selectedMembers, setSelectedMembers] = useState(DEFAULT_MEMBERS); // Initialize with default
    const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const dropdownRef = useRef(null);
    const { addSpace, setActiveSpaceId } = useApp();
    const { showNotification } = useNotification();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMemberDropdownOpen(false);
            }
        };

        if (isMemberDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMemberDropdownOpen]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedCategory(null);
            setSelectedTemplateId(null);
            setFormData({ name: '', description: '' });
            setSelectedMembers(DEFAULT_MEMBERS);
        }
    }, [isOpen]);

    const toggleMember = (member) => {
        if (selectedMembers.includes(member)) {
            setSelectedMembers(selectedMembers.filter(m => m !== member));
        } else {
            setSelectedMembers([...selectedMembers, member]);
        }
    };

    const handleCategorySelect = (categoryId) => {
        const category = CATEGORIES.find(c => c.id === categoryId);
        if (!category || !category.templates || category.templates.length === 0) return;

        setSelectedCategory(categoryId);

        // If category has only one template, skip to details
        if (category.templates.length === 1 && category.templates[0]) {
            setSelectedTemplateId(category.templates[0].id);
            setStep(3);
        } else {
            setStep(2);
        }
    };

    const handleTemplateSelect = (id) => {
        setSelectedTemplateId(id);
        setStep(3);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !selectedTemplateId) return;

        const newSpace = addSpace({
            name: formData.name,
            description: formData.description,
            templateId: selectedTemplateId,
            members: selectedMembers
        });

        setActiveSpaceId(newSpace.id);
        showNotification(`${formData.name} space created successfully!`, 'success');
        onClose();
        // Reset state
        setTimeout(() => {
            setStep(1);
            setSelectedCategory(null);
            setSelectedTemplateId(null);
            setFormData({ name: '', description: '' });
            setSelectedMembers(DEFAULT_MEMBERS);
        }, 300);
    };

    const handleBack = () => {
        if (step === 3) {
            const category = CATEGORIES.find(c => c.id === selectedCategory);
            if (category && category.templates && category.templates.length === 1) {
                setStep(1);
                setSelectedCategory(null);
            } else {
                setStep(2);
            }
        } else if (step === 2) {
            setStep(1);
            setSelectedCategory(null);
        }
    };

    if (!isOpen) return null;

    const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Create New Space</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 bg-slate-50 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {CATEGORIES.map(category => {
                                    const Icon = category.icon || LayoutGrid;
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategorySelect(category.id)}
                                            className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-900/5 transition-all text-left flex items-start gap-4 group cursor-pointer"
                                        >
                                            <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0", category.color)}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1">
                                                    {category.name}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {category.description}
                                                </p>
                                                <div className="mt-3 text-xs text-slate-400">
                                                    {category.templates.length} template{category.templates.length > 1 ? 's' : ''} available
                                                </div>
                                            </div>
                                            <ArrowRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
                                        </button>
                                    );
                                })}
                            </motion.div>
                        ) : step === 2 ? (
                            <motion.div
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {selectedCategoryData?.templates?.map(template => {
                                    if (!template) return null;
                                    const TemplateIcon = template.icon || LayoutGrid;
                                    return (
                                        <button
                                            key={template.id}
                                            onClick={() => handleTemplateSelect(template.id)}
                                            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-900/5 transition-all text-left flex flex-col gap-3 group cursor-pointer"
                                        >
                                            <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center text-white", template.color)}>
                                                <TemplateIcon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
                                            </div>
                                            <div className="mt-auto pt-3 flex flex-wrap gap-1">
                                                {template.taskTypes.slice(0, 3).map(type => (
                                                    <span key={type} className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-600 font-medium">
                                                        {type}
                                                    </span>
                                                ))}
                                                {template.taskTypes.length > 3 && <span className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-600 font-medium">+</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.form
                                key="step3"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="max-w-xl mx-auto space-y-6"
                                onSubmit={handleSubmit}
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Space Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="e.g. Q4 Marketing Campaign"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-24 resize-none"
                                        placeholder="Briefly describe the purpose of this space..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Team Members</label>
                                    <div className="relative">
                                        <div
                                            className="bg-white border border-slate-300 rounded-lg p-2 min-h-[44px] flex flex-wrap gap-2 cursor-pointer hover:border-blue-400 transition-colors"
                                            onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                                        >
                                            {selectedMembers.map(member => (
                                                <div key={member} className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 font-medium">
                                                    <div className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-[10px] text-blue-800">
                                                        {member.charAt(0)}
                                                    </div>
                                                    {member}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMember(member);
                                                        }}
                                                        className="hover:text-blue-900 ml-1"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            {selectedMembers.length === 0 && (
                                                <span className="text-slate-400 text-sm py-1 px-2">Select team members...</span>
                                            )}
                                            <div className="ml-auto pr-1 flex items-center">
                                                <ChevronDown size={16} className={clsx("text-slate-400 transition-transform", isMemberDropdownOpen && "rotate-180")} />
                                            </div>
                                        </div>

                                        {/* Dropdown */}
                                        <AnimatePresence>
                                            {isMemberDropdownOpen && (
                                                <motion.div
                                                    ref={dropdownRef}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 5 }}
                                                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-[70] max-h-60 overflow-hidden flex flex-col"
                                                >
                                                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                                                        <div className="relative">
                                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search members..."
                                                                value={memberSearch}
                                                                onChange={(e) => setMemberSearch(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="overflow-y-auto py-1">
                                                        {DEFAULT_MEMBERS.filter(m => m.toLowerCase().includes(memberSearch.toLowerCase())).map(member => (
                                                            <button
                                                                key={member}
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleMember(member);
                                                                }}
                                                                className="w-full px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-sm text-slate-700"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                                        {member.charAt(0)}
                                                                    </div>
                                                                    {member}
                                                                </div>
                                                                {selectedMembers.includes(member) && (
                                                                    <Check size={16} className="text-blue-600" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 italic">Selected members will have access to this space.</p>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-between bg-white">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                        >
                            Back
                        </button>
                    ) : <div></div>}

                    {step === 3 && (
                        <button
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                        >
                            Create Space <Check size={18} />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CreateSpaceModal;
