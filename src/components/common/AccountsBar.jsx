import React from "react";

const AccountsBar = ({ selectedConnection, onClose }) => {
  if (!selectedConnection) return null;

  return (
    <aside className="flex w-80 flex-shrink-0 flex-col rounded-lg border border-gray-800 bg-dark1/90 p-4 shadow-lg">
      <div className="mb-4 border-b border-gray-800 pb-3">
        <div className="flex flex-row items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Login
          </p>
          <button
            type="button"
            className="cursor-pointer text-gray-400 hover:text-gray-200"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <h2 className="mt-1 text-lg font-semibold text-white">
          Connect {selectedConnection.label}
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          This is a placeholder panel for authenticating with this provider.
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-gray-400">
            Identifier
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-700 bg-dark2 px-3 py-2 text-sm text-gray-100 outline-none focus:border-primary"
            placeholder="email, handle, or client id"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-gray-400">
            Secret / Token
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-gray-700 bg-dark2 px-3 py-2 text-sm text-gray-100 outline-none focus:border-primary"
            placeholder="not actually used here"
          />
        </div>

        <button className="mt-2 w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:brightness-110">
          Continue
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-md border border-gray-700 bg-dark2 px-3 py-2 text-xs font-medium text-gray-200 transition-colors hover:bg-dark2/80"
        >
          Close
        </button>
      </div>
    </aside>
  );
};

export default AccountsBar;
