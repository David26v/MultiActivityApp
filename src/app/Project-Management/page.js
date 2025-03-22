"use client";
import { useState } from "react";

const ProjectManagement = () => {
  const [step, setStep] = useState(1);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newModule, setNewModule] = useState("");
  const [modules, setModules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createProject = () => {
    if (newProject.name.trim() === "") return;
    const project = { id: projects.length + 1, ...newProject, modules: [] };
    setProjects([...projects, project]);
    setSelectedProject(project);
    setNewProject({ name: "", description: "" });
    setStep(2);
  };

  const addModule = () => {
    if (!selectedProject || newModule.trim() === "") return;
    const updatedModules = [...modules, { name: newModule }];
    setModules(updatedModules);
    setNewModule("");
  };

  const finalizeProject = () => {
    const updatedProjects = projects.map((p) =>
      p.id === selectedProject.id ? { ...p, modules } : p
    );
    setProjects(updatedProjects);
    setModules([]);
    setSelectedProject(null);
    setStep(0);
    setIsModalOpen(false);
  };

  const deleteProject = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const editProject = (project) => {
    setSelectedProject(project);
    setModules(project.modules);
    setStep(4);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Open Modal Button */}
      <button
        onClick={() => {
          setStep(1);
          setIsModalOpen(true);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition"
      >
        Create New Project
      </button>

      {/* Projects Table */}
      {projects.length > 0 && (
        <div className="mt-6 w-full max-w-3xl bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Project List</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Project Name</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Modules</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border">
                  <td className="border p-2">{project.name}</td>
                  <td className="border p-2">{project.description}</td>
                  <td className="border p-2">
                    {project.modules.length > 0
                      ? project.modules.map((mod, i) => (
                          <span key={i} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-1">
                            {mod.name}
                          </span>
                        ))
                      : "No Modules"}
                  </td>
                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={() => editProject(project)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {step === 1 && "Create Project"}
                {step === 2 && "Select Project"}
                {step === 3 && "Add Security Module"}
                {step === 4 && "Review & Confirm"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">✖</button>
            </div>

            {/* Step 1: Create Project */}
            {step === 1 && (
              <div>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="border p-2 w-full mb-2 rounded-md text-black"
                />
                <textarea
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="border p-2 w-full mb-4 rounded-md text-black"
                />
                <button
                  onClick={createProject}
                  className="bg-blue-500 text-white w-full py-2 rounded-md hover:bg-blue-600"
                >
                  Next: Select Project
                </button>
              </div>
            )}

            {/* Step 2: Select Project */}
            {step === 2 && (
              <div>
                <select
                  className="border p-2 w-full mb-4 rounded-md"
                  onChange={(e) => {
                    const project = projects.find((p) => p.id === Number(e.target.value));
                    setSelectedProject(project);
                  }}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setStep(3)}
                  className="bg-green-500 text-white w-full py-2 rounded-md hover:bg-green-600"
                  disabled={!selectedProject}
                >
                  Next: Add Module
                </button>
              </div>
            )}

            {/* Step 3: Add Security Module */}
            {step === 3 && (
              <div>
                <input
                  type="text"
                  placeholder="Module Name"
                  value={newModule}
                  onChange={(e) => setNewModule(e.target.value)}
                  className="border p-2 w-full mb-4 rounded-md text-black"
                />
                <button
                  onClick={addModule}
                  className="bg-green-500 text-white w-full py-2 rounded-md hover:bg-green-600 mb-2"
                >
                  Add Module
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="bg-blue-500 text-white w-full py-2 rounded-md hover:bg-blue-600"
                >
                  Review & Confirm
                </button>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {step === 4 && (
              <div>
                <h3 className="text-lg font-semibold">Project: {selectedProject?.name}</h3>
                <p className="text-sm mb-4">{selectedProject?.description}</p>
                <h4 className="font-semibold">Modules:</h4>
                {modules.map((mod, i) => (
                  <p key={i} className="text-sm">{mod.name}</p>
                ))}
                <button
                  onClick={finalizeProject}
                  className="bg-green-500 text-white w-full py-2 rounded-md hover:bg-green-600 mt-4"
                >
                  Confirm & Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
