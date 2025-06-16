import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import appController from "../../Controllers/AppController";
import type { SchemeMetadata } from "../../core/services/StorageService";

const WelcomeScreen: React.FC = () => {
  const [schemes, setSchemes] = useState<SchemeMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState("");
  const navigate = useNavigate();

  const loadSchemes = useCallback(async (): Promise<void> => {
    try {
      const schemesData = await appController.getAllSchemes();
      setSchemes(schemesData);
    } catch (error) {
      appController.logError("Failed to load schemes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchemes();

    const handlePopState = () => {
      loadSchemes();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [loadSchemes]);

  const deleteScheme = async (schemeId: string): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this scheme?",
    );
    if (!confirmed) return;

    try {
      await appController.deleteSchemeFromStorage(schemeId);
      setSchemes((prev) => prev.filter((scheme) => scheme.id !== schemeId));
      appController.logInfo(`Scheme ${schemeId} deleted successfully`);
    } catch (error) {
      appController.logError("Failed to delete scheme:", error);
    }
  };

  const handleCreateScheme = (): void => {
    if (newSchemeName.trim()) {
      const schemeId = `scheme_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      navigate(
        `/editor?id=${schemeId}&name=${encodeURIComponent(
          newSchemeName.trim(),
        )}&new=true`,
      );
    }
  };

  const handleOpenScheme = (schemeId: string): void => {
    navigate(`/editor?id=${schemeId}`);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-gray-700">
            Loading schemes...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Scheme Editor
                </h1>
                <p className="text-gray-600 font-medium">
                  Create and manage your diagrams with ease
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create New Scheme
              </button>
            </div>
          </div>
        </div>
      </header>

      {}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {schemes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="size-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No schemes yet
            </h2>
            <p className="text-gray-600 mb-8 text-center max-w-md">
              Start creating beautiful diagrams and flowcharts. Your first
              scheme is just a click away.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Your First Scheme
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Schemes
                </h2>
                <p className="text-gray-600">
                  {schemes.length} scheme{schemes.length !== 1 ? "s" : ""} ready
                  for editing
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Sort by modified</option>
                  <option>Sort by name</option>
                  <option>Sort by created</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {schemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 overflow-hidden"
                >
                  {}
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                    {scheme.preview ? (
                      <img
                        src={scheme.preview}
                        alt={`Preview of ${scheme.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-sm text-gray-400">No preview</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {}
                  <div className="p-5">
                    <h3
                      className="font-semibold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors"
                      title={scheme.name}
                    >
                      {scheme.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {formatDate(scheme.lastModified)}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenScheme(scheme.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteScheme(scheme.id)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        title="Delete scheme"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"></div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Create New Scheme
                  </h2>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="schemeName"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Scheme Name
                  </label>
                  <input
                    id="schemeName"
                    type="text"
                    value={newSchemeName}
                    onChange={(e) => setNewSchemeName(e.target.value)}
                    placeholder="Enter a descriptive name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateScheme();
                      } else if (e.key === "Escape") {
                        setShowCreateModal(false);
                        setNewSchemeName("");
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewSchemeName("");
                    }}
                    className="flex-1 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateScheme}
                    disabled={!newSchemeName.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WelcomeScreen;
