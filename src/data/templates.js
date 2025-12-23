
import { Users, Briefcase, Code, Monitor, Layers, Kanban, GitBranch, Target } from 'lucide-react';

export const TEMPLATES = [
    {
        id: 'kanban-dev',
        name: 'Kanban',
        description: 'Simple, flexible workflow for continuous delivery.',
        icon: Kanban,
        color: 'bg-emerald-500',
        taskTypes: ['Task', 'Bug', 'Improvement'],
        statuses: [
            { id: 'todo', name: 'To Do', color: 'bg-slate-200' },
            { id: 'in-progress', name: 'In Progress', color: 'bg-blue-200' },
            { id: 'done', name: 'Done', color: 'bg-emerald-200' }
        ]
    },
    {
        id: 'scrum-dev',
        name: 'Scrum',
        description: 'Iterative delivery with Backlog, Sprints, and QA.',
        icon: Code,
        color: 'bg-blue-600',
        taskTypes: ['Epic', 'Story', 'Task', 'Bug'],
        statuses: [
            { id: 'backlog', name: 'Backlog', color: 'bg-slate-200' },
            { id: 'todo', name: 'To Do', color: 'bg-slate-300' },
            { id: 'in-progress', name: 'In Progress', color: 'bg-blue-200' },
            { id: 'review', name: 'Code Review', color: 'bg-purple-200' },
            { id: 'qa', name: 'QA', color: 'bg-orange-200' },
            { id: 'done', name: 'Done', color: 'bg-emerald-200' }
        ]
    },
    {
        id: 'pm-dev',
        name: 'Project Management',
        description: 'Comprehensive project tracking for larger initiatives.',
        icon: Target,
        color: 'bg-indigo-600',
        taskTypes: ['Milestone', 'Task', 'Risk', 'Deliverable'],
        statuses: [
            { id: 'planning', name: 'Planning', color: 'bg-slate-300' },
            { id: 'in-progress', name: 'In Progress', color: 'bg-blue-200' },
            { id: 'blocked', name: 'Blocked', color: 'bg-red-200' },
            { id: 'review', name: 'Review', color: 'bg-purple-200' },
            { id: 'completed', name: 'Completed', color: 'bg-emerald-200' }
        ]
    },
    {
        id: 'hr',
        name: 'HR & Recruitment',
        description: 'Manage recruitment, onboarding, and employee requests.',
        icon: Users,
        color: 'bg-rose-500',
        taskTypes: ['Recruitment', 'Onboarding', 'Leave Request', 'Performance Review'],
        statuses: [
            { id: 'requested', name: 'Requested', color: 'bg-slate-200' },
            { id: 'in-review', name: 'In Review', color: 'bg-blue-200' },
            { id: 'approved', name: 'Approved', color: 'bg-green-200' },
            { id: 'completed', name: 'Completed', color: 'bg-slate-800' }
        ]
    },
    {
        id: 'sales',
        name: 'Sales Pipeline',
        description: 'Track leads, opportunities, and close deals.',
        icon: Briefcase,
        color: 'bg-amber-500',
        taskTypes: ['Lead', 'Opportunity', 'Deal', 'Follow-up'],
        statuses: [
            { id: 'new', name: 'New Lead', color: 'bg-blue-100' },
            { id: 'contacted', name: 'Contacted', color: 'bg-yellow-100' },
            { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100' },
            { id: 'won', name: 'Won', color: 'bg-emerald-200' },
            { id: 'lost', name: 'Lost', color: 'bg-red-200' }
        ]
    },
    {
        id: 'it',
        name: 'IT Support',
        description: 'Handle incidents, service requests, and hardware.',
        icon: Monitor,
        color: 'bg-cyan-500',
        taskTypes: ['Incident', 'Service Request', 'Change'],
        statuses: [
            { id: 'open', name: 'Open', color: 'bg-red-100' },
            { id: 'assigned', name: 'Assigned', color: 'bg-blue-100' },
            { id: 'in-progress', name: 'In Progress', color: 'bg-yellow-100' },
            { id: 'resolved', name: 'Resolved', color: 'bg-emerald-100' },
            { id: 'closed', name: 'Closed', color: 'bg-gray-200' }
        ]
    }
];
