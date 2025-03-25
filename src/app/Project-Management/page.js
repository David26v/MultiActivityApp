"use client";
import { useState ,useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../utils/supabaseClient";


const ProjectManagement = () => {
  const [step, setStep] = useState(1);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newModule, setNewModule] = useState("");
  const [modules, setModules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

 // Create new project
const createProject = async () => {
  if (newProject.name.trim() === "") return;

  // Create new project in Supabase
  const { data, error } = await supabase.from("projects").insert([
    {
      name: newProject.name,
      description: newProject.description,
    },
  ]);

  if (error) {
    console.error("Error creating project: ", error.message);
    return;
  }

  // Update local state with the new project
  setProjects((prevProjects) => [data[0], ...prevProjects]);
  setSelectedProject(data[0]);
  setNewProject({ name: "", description: "" });
  setStep(2);
};


  // Add new module to the selected project
  const addModule = () => {
    if (!selectedProject || newModule.trim() === "") return;
    setModules([...modules, { name: newModule }]);
    setNewModule("");
  };

  // Finalize and save project
  const finalizeProject = () => {
    const updatedProjects = projects.map((p) =>
      p.id === selectedProject.id ? { ...p, modules } : p
    );
    setProjects(updatedProjects);
    setModules([]);
    setSelectedProject(null);
    setStep(1);
    setIsModalOpen(false);
  };

  // Delete project
  const deleteProject = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  // Edit project
  const editProject = (project) => {
    setSelectedProject(project);
    setModules(project.modules);
    setStep(4);
    setIsModalOpen(true);
  };


  // Load projects data from Supabase
  const handleLoadData = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select('*')
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error loading projects: ", error.message);
      return;
    }
  
    // Ensure that modules is always an array
    const projectsWithModules = data.map((project) => ({
      ...project,
      modules: Array.isArray(project.modules) ? project.modules : []
    }));
  
    setProjects(projectsWithModules);
  };
  


  
  useEffect(() => {
    handleLoadData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Navigation Buttons */}
      <button
        onClick={() => router.push("/")}
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
      >
        Back to Homepage
      </button>
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
                <th className="border p-2 text-black">Project Name</th>
                <th className="border p-2 text-black">Description</th>
                <th className="border p-2 text-black">Modules</th>
                <th className="border p-2 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border">
                  <td className="border p-2 text-black">{project.name}</td>
                  <td className="border p-2 text-black ">{project.description}</td>
                  <td className="border p-2 text-black">
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
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                ✖
              </button>
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
                <h3 className="text-lg font-semibold text-black">Project: {selectedProject?.name}</h3>
                <input
                  type="text"
                  value={selectedProject?.name}
                  onChange={(e) => setSelectedProject({ ...selectedProject, name: e.target.value })}
                  className="border p-2 w-full mb-2 rounded-md text-black"
                />
                <textarea
                  value={selectedProject?.description}
                  onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })}
                  className="border p-2 w-full mb-4 rounded-md text-black"
                />
                <h4 className="font-semibold text-black">Modules:</h4>
                {modules.map((mod, i) => (
                  <div key={i} className="flex items-center">
                    <input
                      type="text"
                      value={mod.name}
                      onChange={(e) => {
                        const updatedModules = [...modules];
                        updatedModules[i].name = e.target.value;
                        setModules(updatedModules);
                      }}
                      className="border p-2 w-full mb-2 rounded-md text-black"
                    />
                  </div>
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
