import { closestCorners, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import Task from "./task";
import "./ListRender.css"
import { arrayMove, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
function ListRender({taskList, deleteTask, handleStatus, setTaskList}){

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
        <Task key={t.id} t={t} deleteTask={deleteTask} handleStatus={handleStatus} />
      )
      
    }
    </DndContext>
    </div>

  );
}
export default ListRender;