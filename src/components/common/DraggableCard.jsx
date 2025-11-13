const DraggableCard = (props) => {
    const onDragStart = (event) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({
            name: props.name,
            iconName: props.iconKey,
            args: props.args
        }));
        event.dataTransfer.effectAllowed = 'move';
    };

    return(
        <a 
            className="w-28 flex flex-col items-center gap-2 p-2 rounded text-white hover:bg-dark2 cursor-pointer" 
            draggable
            onDragStart={onDragStart}
        >
            <props.icon size={props.size} /> {props.name}
        </a>
    )
}

export default DraggableCard;