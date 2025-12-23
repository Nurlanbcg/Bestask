
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useApp } from '../../context/AppContext';
import { Plus, MoreHorizontal } from 'lucide-react';
import TaskCard from '../TaskCard';
import clsx from 'clsx';

const BoardView = ({ template }) => {
    const { activeSpaceId, getSpaceTasks, updateTaskStatus, addTask, openTaskDrawer } = useApp();
    const tasks = getSpaceTasks(activeSpaceId);

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;

        // In a real app, we would handle reordering within column too.
        // Here we just update status if column changed.
        if (destination.droppableId !== source.droppableId) {
            updateTaskStatus(draggableId, destination.droppableId);
        }
    };

    const handleCreateTask = (statusId) => {
        openTaskDrawer('new', {
            status: statusId,
            type: template.taskTypes[0],
            priority: 'Medium'
        });
    };

    return (
        <div className="h-full flex px-6 py-8 gap-6 overflow-x-auto items-start">
            <DragDropContext onDragEnd={onDragEnd}>
                {template.statuses.map((status) => {
                    // Show all tasks including Epics, Stories, Tasks, Bugs
                    const columnTasks = tasks.filter(t => t.status === status.id);

                    return (
                        <div key={status.id} className="flex-shrink-0 w-80 flex flex-col max-h-full bg-slate-100/50 rounded-xl border border-slate-200">
                            {/* Column Header */}
                            <div className="p-3 flex items-center justify-between border-b border-slate-100 mb-1 sticky top-0 bg-slate-100/50 backdrop-blur-sm z-10 rounded-t-xl">
                                <div className="flex items-center gap-2">
                                    <span className={clsx("w-3 h-3 rounded-full", status.color)}></span>
                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{status.name}</h3>
                                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">{columnTasks.length}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleCreateTask(status.id)} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded">
                                        <Plus size={16} />
                                    </button>
                                    <button className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Droppable Area */}
                            <Droppable droppableId={status.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={clsx(
                                            "flex-1 p-2 space-y-3 overflow-y-auto min-h-[150px] transition-colors rounded-b-xl",
                                            snapshot.isDraggingOver ? "bg-slate-100" : ""
                                        )}
                                    >
                                        {columnTasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{ ...provided.draggableProps.style }}
                                                        className="focus:outline-none"
                                                    >
                                                        <TaskCard task={task} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        <button
                                            onClick={() => handleCreateTask(status.id)}
                                            className="w-full py-2 flex items-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg text-sm transition-colors px-2"
                                        >
                                            <Plus size={16} />
                                            Create issue
                                        </button>
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </DragDropContext>
        </div>
    );
};

export default BoardView;
