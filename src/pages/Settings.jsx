import { useState } from "react";
import Topbar from "../components/layout/Topbar";
import { useNavigate } from "react-router-dom";
import { sections, connections } from "../data/settingsOptions";
import AccountsBar from "../components/common/AccountsBar";


const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("connections");
  const [selectedConnection, setSelectedConnection] = useState(null);

  const handleBackToEditor = () => {
    navigate("/Editor");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "connections":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Connections</h2>
              <p className="mt-1 text-sm text-gray-400">
                Manage how you sign in and connect external services.
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-800 bg-dark1">
              <ul className="divide-y divide-gray-800">
                {connections.map((connection) => (
                  <li
                    key={connection.id}
                    onClick={() => setSelectedConnection(connection)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-dark2/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-dark2 text-xs text-gray-300">
                        {connection.label.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-100">{connection.label}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${
                          connection.status === "Enabled"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-gray-700 bg-dark2 text-gray-400"
                        }`}
                      >
                        {connection.status}
                      </span>
                      <span className="text-gray-600">›</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Appearance</h2>
              <p className="mt-1 text-sm text-gray-400">
                Tweak how the app looks. These are local-only settings.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md bg-dark1 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Theme</p>
                </div>
                <select className="appearance-none rounded-md border border-gray-700 bg-dark2 px-3 py-1 text-sm text-gray-200 outline-none">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
              <p className="mt-1 text-sm text-gray-400">
                Control what you get notified about.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md bg-dark1 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Desktop notifications</p>
                </div>
                <input
                  type="checkbox"
                  className="appearance-none h-4 w-4 cursor-pointer rounded border-gray-600 bg-dark2 text-primary focus:ring-0"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between rounded-md bg-dark1 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Email updates</p>
                </div>
                <input
                  type="checkbox"
                  className="appearance-none h-4 w-4 cursor-pointer rounded border-gray-600 bg-dark2 text-primary focus:ring-0"
                />
              </div>
            </div>
          </div>
        );

      case "advanced":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Advanced</h2>
              <p className="mt-1 text-sm text-gray-400">
                A few low-level options for power users.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md bg-dark1 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Developer logs</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-gray-600 bg-dark2 text-primary focus:ring-0"
                />
              </div>

              <div className="rounded-md bg-dark1 px-4 py-3">
                <p className="text-sm font-medium text-white">Reset workspace</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="select-none flex h-screen flex-col bg-dark0 text-gray-100 overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-60 flex-col border-r border-gray-800 bg-dark1/80 backdrop-blur-sm">
          <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4 pt-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeSection === section.id
                    ? "text-primary-foreground bg-dark2"
                    : "text-gray-300 hover:bg-dark2 hover:text-white"
                }`}
              >
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
          <div className="border-t border-gray-800 px-4 py-3">
            <button
              onClick={handleBackToEditor}
              className="w-full rounded-md bg-dark2 px-3 py-2 text-xs font-medium text-gray-200 transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Back to editor
            </button>
          </div>
        </aside>

        <main className="flex flex-1 gap-6 overflow-hidden bg-dark0 px-8 py-6">
          <section
            className={`w-full max-w-2xl pb-12 overflow-y-auto ${
              activeSection === "connections" ? "" : "mx-auto"
            }`}
          >
            {renderContent()}
          </section>

          {activeSection === "connections" && (
            <AccountsBar
              selectedConnection={selectedConnection}
              onClose={() => setSelectedConnection(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;