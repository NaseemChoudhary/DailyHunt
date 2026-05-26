import { useState } from 'react';
import { closestCorners, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import SwipeableTask from "./SwipeableTask";
import "./ListRender.css"
import { arrayMove, sortableKeyboardCoordinates} from "@dnd-kit/sortable";

function ListRender({taskList, deleteTask, handleStatus, setTaskList}){
  // Track which item is currently open for swipe actions
  const [activeItemId, setActiveItemId] = useState(null);

  const getIndex = id => taskList.findIndex(task => task.id == id);

  const handleDragEnd = (e) => {
    const {active, over} = e 
    if(active.id == over.id) return;
    setTaskList(() => {
      const originalPos = getIndex(active.id);
      const newPos = getIndex(over.id);
      return arrayMove(taskList, originalPos, newPos);
    });
  }

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  return(
    <div className="task-List">
    <DndContext 
    sensors={sensors}
    onDragEnd={handleDragEnd}
    collisionDetection={closestCorners}>
    {
      taskList.map((t, i) => 
        <SwipeableTask 
          key={t.id} 
          t={t} 
          deleteTask={deleteTask} 
          handleStatus={handleStatus}
          activeItemId={activeItemId}
          setActiveItemId={setActiveItemId}
        />
      )
      
    }
    </DndContext>
    </div>

  );
}
export default ListRender;