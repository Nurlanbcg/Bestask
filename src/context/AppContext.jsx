
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TEMPLATES } from '../data/templates';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Default team members for all spaces
export const DEFAULT_MEMBERS = [
    'Nurlan Ibrahimov',
    'Ulviyya Mikayilova',
    'Jamal Zeynalli',
    'Gunel Akbarli',
    'Ulkar Karimova'
];

// Initial Mock Data
const INITIAL_SPACES = [
    {
        id: 'demo-space',
        name: 'IT Support',
        description: 'Tracking the development of this project.',
        templateId: 'it',
        members: DEFAULT_MEMBERS,
        icon: 'Code'
    }
];

const INITIAL_TASKS = [
    {
        id: 'T-1',
        spaceId: 'demo-space',
        title: 'Setup Project Structure',
        description: 'Initialize Vite, Tailwind, and folder structure.',
        status: 'done',
        type: 'Story',
        priority: 'High',
        assignee: 'Nurlan Ibrahimov',
        dueDate: new Date().toISOString()
    },
    {
        id: 'T-2',
        spaceId: 'demo-space',
        title: 'Implement Sidebar',
        description: 'Create the responsive sidebar navigation.',
        status: 'in-progress',
        type: 'Story',
        priority: 'Medium',
        assignee: 'Ulviyya Mikayilova',
        dueDate: new Date().toISOString()
    },
    {
        id: 'T-3',
        spaceId: 'demo-space',
        title: 'Kanban Board Drag & Drop',
        description: 'Integrate @hello-pangea/dnd.',
        status: 'todo',
        type: 'Story',
        priority: 'High',
        assignee: 'Jamal Zeynalli',
        dueDate: new Date(Date.now() + 86400000).toISOString()
    }
];

export const AppProvider = ({ children }) => {
    const [spaces, setSpaces] = useState(() => {
        const saved = localStorage.getItem('bestask_spaces');
        return saved ? JSON.parse(saved) : INITIAL_SPACES;
    });
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('bestask_tasks');
        return saved ? JSON.parse(saved) : INITIAL_TASKS;
    });
    const [activeSpaceId, setActiveSpaceId] = useState(() => {
        const saved = localStorage.getItem('bestask_active_space');
        return saved || INITIAL_SPACES[0].id;
    });
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [draftTask, setDraftTask] = useState(null);
    const [sprints, setSprints] = useState(() => {
        const saved = localStorage.getItem('bestask_sprints');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('bestask_spaces', JSON.stringify(spaces));
    }, [spaces]);

    useEffect(() => {
        localStorage.setItem('bestask_tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('bestask_active_space', activeSpaceId);
    }, [activeSpaceId]);

    useEffect(() => {
        localStorage.setItem('bestask_sprints', JSON.stringify(sprints));
    }, [sprints]);

    const openTaskDrawer = (taskId, initialData = null) => {
        if (taskId === 'new') {
            const nextNum = tasks.length > 0
                ? Math.max(...tasks.map(t => {
                    const match = t.id.match(/T-(\d+)/i) || t.id.match(/t-(\d+)/i);
                    return match ? parseInt(match[1]) : 0;
                })) + 1
                : 1;

            setDraftTask({
                id: `T-${nextNum}`,
                spaceId: activeSpaceId,
                title: '',
                description: '',
                status: 'todo',
                type: 'Task',
                assignee: 'Unassigned',
                priority: 'Medium',
                comments: [],
                ...initialData
            });
        }
        setSelectedTaskId(taskId);
    };

    const closeTaskDrawer = () => {
        setSelectedTaskId(null);
        setDraftTask(null);
    };

    const addSpace = (spaceData) => {
        const newSpace = {
            id: uuidv4(),
            owner: DEFAULT_MEMBERS[0],
            ...spaceData,
            members: spaceData.members || [...DEFAULT_MEMBERS]
        };
        setSpaces([...spaces, newSpace]);
        return newSpace; // Return for navigation
    };

    const updateSpace = (spaceId, updates) => {
        setSpaces(spaces.map(s => s.id === spaceId ? { ...s, ...updates } : s));
    };

    const deleteSpace = (spaceId) => {
        setSpaces(spaces.filter(s => s.id !== spaceId));
        setTasks(tasks.filter(t => t.spaceId !== spaceId));
        if (activeSpaceId === spaceId) {
            setActiveSpaceId(spaces[0]?.id || 'home');
        }
    };

    const addTask = (taskData) => {
        const newTask = {
            createdAt: new Date().toISOString(),
            comments: [],
            ...taskData
        };

        if (!newTask.id || newTask.id === 'new') {
            const nextNum = tasks.length > 0
                ? Math.max(...tasks.map(t => {
                    const match = t.id.match(/T-(\d+)/i);
                    return match ? parseInt(match[1]) : 0;
                })) + 1
                : 1;
            newTask.id = `T-${nextNum}`;
        } else if (typeof newTask.id === 'string' && newTask.id.startsWith('t-')) {
            newTask.id = newTask.id.replace('t-', 'T-');
        }

        setTasks([...tasks, newTask]);
        return newTask;
    };

    const updateTaskStatus = (taskId, newStatus) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    const updateTask = (updatedTask) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const deleteTask = (taskId) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const getSpaceTasks = (spaceId) => tasks.filter(t => t.spaceId === spaceId);

    const startSprint = (spaceId, sprintData) => {
        const spaceSprintData = sprints[spaceId] || { activeSprint: 0, sprints: [] };
        const newSprintNumber = spaceSprintData.activeSprint + 1;

        setSprints({
            ...sprints,
            [spaceId]: {
                activeSprint: newSprintNumber,
                sprints: [...spaceSprintData.sprints, { ...sprintData, number: newSprintNumber }]
            }
        });
    };

    const getActiveSprint = (spaceId) => {
        return sprints[spaceId]?.activeSprint || 1;
    };

    const addMembersToSpace = (spaceId, newMembers) => {
        setSpaces(spaces.map(s => {
            if (s.id === spaceId) {
                const uniqueMembers = [...new Set([...s.members, ...newMembers])];
                return { ...s, members: uniqueMembers };
            }
            return s;
        }));
    };

    const activeSpace = spaces.find(s => s.id === activeSpaceId);

    return (
        <AppContext.Provider value={{
            spaces,
            activeSpace,
            activeSpaceId,
            setActiveSpaceId,
            selectedTaskId,
            draftTask,
            openTaskDrawer,
            closeTaskDrawer,
            addSpace,
            updateSpace,
            deleteSpace,
            addMembersToSpace,
            tasks,
            addTask,
            updateTaskStatus,
            updateTask,
            deleteTask,
            getSpaceTasks,
            startSprint,
            getActiveSprint,
            sprints
        }}>
            {children}
        </AppContext.Provider>
    );
};
