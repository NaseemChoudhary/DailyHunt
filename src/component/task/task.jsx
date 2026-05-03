import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
export default function Task({t, deleteTask, handleStatus}){
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id : t.id});
    const style = {
        transfor: CSS.Transform.toString(transform),
        transition
    };

    return(
        <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="task-block" key={t.id}>
            <div className="task">{t.name}</div>
            <button className="status" onClick={() => handleStatus(t.id)}>{t.status?"Done":"Pending"}</button>
            <button className="delete" onClick={() => deleteTask(t.id)}>Delete</button>
        </div>
    )
}