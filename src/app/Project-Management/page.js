"use client";
import { useState ,useEffect } from "react";
import supabase from "../utils/supabaseClient";
import BackButton from "../component/BackButton";
import { insertData ,deleteData ,fetchData} from "../helper/supabaseHelper";


const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  // Create new project
  const handleSave = async () => {
    try {
      if (!selectedProject?.name || !selectedProject?.description) {
        console.error("Project name and description are required.");
        return;
      }
  
      setLoading(true);
  
      const newProject = await insertData("projects", {
        name: selectedProject.name,
        description: selectedProject.description,
      });
  
      setProjects([...projects, newProject]);
      setSelectedProject({ name: "", description: "" });
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error saving project:", e.message);
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };
  
  
  

// Edit project
const editProject = (project) => {
  setSelectedProject({
    ...project,
    name: project.name || '', 
    description: project.description || '', 
  });
  setIsModalOpen(true);
};

  // Delete project
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const success = await deleteData("projects", id);
  
      if (success) {
        setProjects(projects.filter((project) => project.id !== id));
      }
    } catch (e) {
      console.error("Error deleting project:", e.message);
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };
  

  // Load projects data from Supabase
  const handleLoadData = async () => {
    try {
      setLoading(true);
  
      const projectsData = await fetchData("projects", {
        orderBy: "created_at",
        ascending: false,
      });
  
      setProjects(projectsData);
    } 
    catch (error) {
      console.error("Error loading projects:", error.message);
    } finally {
      setLoading(false);
    }
  };
  


  
  useEffect(() => {
    handleLoadData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Navigation Buttons */}
      <BackButton /> 
     
      <button
        onClick={() => {
          setIsModalOpen(true);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition"
      >
        Create New Project
      </button>


      {/* Projects Table */}
      <div className="mt-6 w-full max-w-3xl bg-white shadow-md rounded-md p-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Project List</h2>

        {projects.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-black">Project Name</th>
                <th className="border p-2 text-black">Description</th>
                <th className="border p-2 text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border">
                  <td className="border p-2 text-black">{project.name}</td>
                  <td className="border p-2 text-black">{project.description}</td>
                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={() => editProject(project)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-600 text-lg mb-4">No projects found. Start by creating a new project!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Create New Project
            </button>
          </div>
        )}
      </div>



      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-[600px] p-8 rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Project Details</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl">
                ✖
              </button>
            </div>

            {/* Input Fields for Project */}
            <div>
              <input
                type="text"
                placeholder="Project Name"
                value={selectedProject?.name || ""}
                onChange={(e) => setSelectedProject({ ...selectedProject, name: e.target.value })}
                className="border p-3 w-full mb-3 rounded-md text-black text-lg"
              />
              <textarea
                placeholder="Project Description"
                value={selectedProject?.description || ""}
                onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })}
                className="border p-3 w-full mb-6 rounded-md text-black text-lg h-32"
              />

              {/* Save and Cancel Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white flex-1 py-3 rounded-md hover:bg-green-600 flex items-center justify-center text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    "Save"
                  )}
                </button>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 text-white flex-1 py-3 rounded-md hover:bg-red-600 text-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default ProjectManagement;
