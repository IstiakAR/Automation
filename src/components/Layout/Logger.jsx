import {ChevronsDown} from "lucide-react";

const Logger = ({ logOpen, setLogOpen }) => {
    return (
        <div className="w-full h-96 resize-y bg-dark0 border-t border-dark2 flex flex-col">
            <div className="text-white gap-2 border-b border-dark2 p-2 flex flex-row justify-between items-center">
                <div className="flex flex-row gap-2 items-center ml-1 text-lg">
                    <h2 className="text-white">Logs</h2>
                </div>
                <ChevronsDown size={20} className="hover:bg-dark2 cursor-pointer text-white" onClick={() => setLogOpen(!logOpen)}/>
            </div>
            <div className="flex-1 overflow-auto flex flex-col gap-2 p-3 text-sm text-white select-text cursor-text">
                <span>Log 1</span>
                <span>Log 2</span>
                <span>Log 3</span>
            </div>
        </div>
    );
};

export default Logger;
