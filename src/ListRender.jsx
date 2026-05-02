import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ task, index, handleStatus, deleteTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="task-item" {...attributes} {...listeners}>
      <p className={task.status ? "completed" : ""}>
        {task.name}
      </p>

      <button onClick={(e) => { e.stopPropagation(); handleStatus(index); }}>
        {task.status ? "Done" : "Pending"}
      </button>

      <button onClick={(e) => { e.stopPropagation(); deleteTask(index); }}>
        Delete
      </button>
    </div>
  );
}

export default function ListRender({ tasklist, settasklist, deleteTask, handleStatus }) {

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasklist.findIndex((t) => t.id === active.id);
    const newIndex = tasklist.findIndex((t) => t.id === over.id);

    settasklist((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={tasklist.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="Task-List">
          {tasklist.map((task, index) => (
            <SortableItem
              key={task.id}
              task={task}
              index={index}
              handleStatus={handleStatus}
              deleteTask={deleteTask}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}