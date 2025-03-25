import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const MultiTable = ({ title, data, columns, actions }) => {
    return (
      <div className="mt-6 w-full max-w-5xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">{title}</h2>
  
        {data.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                {columns.map((column) => (
                  <th key={column.key} className="border p-2 text-black">
                    {column.label}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="border p-2 text-black">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border">
                  {columns.map((column) => (
                    <td key={column.key} className="border p-2 text-black">
                      {item[column.key]}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="border p-2 flex gap-4 justify-center">
                      {actions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => action.onClick(item)}
                          className={action.className}
                        >
                          <FontAwesomeIcon icon={action.icon} size="lg" />
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-600 text-lg mb-4">
              No data found. Start by adding a new entry!
            </p>
            <button
              onClick={() => alert("Add New Item")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add New
            </button>
          </div>
        )}
      </div>
    );
  };

  export default MultiTable;