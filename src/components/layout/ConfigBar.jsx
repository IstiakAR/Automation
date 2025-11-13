import React, { useState, useEffect } from "react";
import {CircleX} from "lucide-react";

const ConfigBar = ({ taskData, onClose, onSave }) => {
  const [label, setLabel] = useState("");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState({});

  useEffect(() => {
    if (taskData) {
      console.log("ConfigBar received taskData:", taskData);
      console.log("taskData.args:", taskData.args);
      console.log("taskData.args type:", typeof taskData.args);
      console.log("taskData.args keys:", Object.keys(taskData.args || {}));
      setLabel(taskData.label || "");
      setCommand(taskData.command || "");
      setArgs(taskData.args || {});
    }
  }, [taskData]);

  if (!taskData) return null;

  const handleArgValueChange = (key, value) => {
    setArgs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    const updatedData = {
      ...taskData,
      label,
      command,
      args,
    };
    onSave(updatedData);
    onClose();
  };

  return (
    <div className="w-[300px] h-full bg-dark1 border-l border-dark2 flex flex-col p-4">
      <div className="flex flex-row justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Task Configuration</h3>
        <CircleX className="cursor-pointer text-white" size={30} onClick={onClose}/>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
        <div>
          <label className="text-gray-400 text-sm">Task</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="bg-dark2 text-white rounded p-2 w-full mt-1 border border-dark3 focus:border-blue-500 focus:outline-none"
            readOnly
          />
        </div>

        <div>
          <div className="flex flex-col gap-3">
            {Object.keys(args).length > 0 ? (
              Object.entries(args).map(([key, value]) => (
              <div key={key}>
                <label className="text-gray-400 text-sm">{key}</label>
                  <input
                    type="text"
                    value={typeof value === 'object' ? JSON.stringify(value) : value}
                    onChange={(e) => {
                      let newValue = e.target.value;
                      if (newValue === 'true') newValue = true;
                      else if (newValue === 'false') newValue = false;
                      else if (!isNaN(newValue) && newValue !== '') newValue = Number(newValue);
                      handleArgValueChange(key, newValue);
                    }}
                    className="bg-dark2 text-white rounded p-2 w-full mt-1 border border-dark3 focus:border-blue-500 focus:outline-none"
                  />
              </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No arguments available</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          className="flex-1 text-black bg-white hover:bg-gray-100 rounded px-4 py-2 font-medium"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ConfigBar;