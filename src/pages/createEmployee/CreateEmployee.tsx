import React, { useEffect, useState } from "react";
import PositionResource from "../../types/positionResource";
import api from "../../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import Employee, { Image } from "../../types/employee";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";

interface ToolLanguageGroup {
  toolLanguage: string;
  from: number;
  to: number;
  description: string;
  images: Image[];
}

interface PositionGroup {
  positionId: string;
  toolLanguageGroups: ToolLanguageGroup[];
}

const CreateEmployee = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [positions, setPositions] = useState<PositionResource[]>([]);
  const [name, setName] = useState<string>('');
  const [positionGroups, setPositionGroups] = useState<PositionGroup[]>([]);
  const [tilePage, setTilePage] = useState<string>('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'danger'>('success');

  useEffect(() => {
    const { pathname } = location

    if (pathname === '/create') {
      setTilePage('Create Employee Profile');
    } else if (pathname.startsWith('/edit/')) {
      setTilePage('Edit Employee Profile');
    }
  }, [location]);

  useEffect(() => {
    getPositionResource();
    if (location.pathname.startsWith('/edit/')) {
      const employeeId = location.pathname.split('/edit/')[1];
      fetchDataForEdit(employeeId);
    }
  }, []);

  const fetchDataForEdit = async (employeeId: string) => {
    try {
      const data: Employee[] = await api.employees.get(employeeId);
  
      if (data.length > 0) {
        const employeeData = data[0];
        setName(employeeData.name);
  
        const formattedPositionGroups = employeeData.positions.map((pos) => {
          const formattedToolLanguageGroups = pos.toolLanguages.map((tl) => ({
            toolLanguage: tl.toolLanguageResourceId.toString(),
            from: tl.from,
            to: tl.to,
            description: tl.description,
            images: tl.images
          }));
  
          return {
            positionId: pos.positionResourceId.toString(),
            toolLanguageGroups: formattedToolLanguageGroups
          };
        });
  
        setPositionGroups(formattedPositionGroups);
      } else {
        console.error(`No employee found with ID ${employeeId}`);
      }
    } catch (err) {
      console.error('Error fetching employee data:', err);
    }
  };

  const getPositionResource = async () => {
    try {
      const res = await api.positionResources.get();
      setPositions(res);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddPositionGroup = () => {
    setPositionGroups([...positionGroups, { positionId: '', toolLanguageGroups: [] }]);
  };

  const handleRemovePositionGroup = (index: number) => {
    const newPositionGroups = [...positionGroups];
    newPositionGroups.splice(index, 1);
    setPositionGroups(newPositionGroups);
  };

  const handlePositionChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPositionGroups = [...positionGroups];
    newPositionGroups[index].positionId = event.target.value;
    setPositionGroups(newPositionGroups);
  };

  const handleAddToolLanguageGroup = (positionIndex: number) => {
    const newPositionGroups = [...positionGroups];
    newPositionGroups[positionIndex].toolLanguageGroups.push({
      toolLanguage: '',
      to: new Date().getFullYear(),
      from: new Date().getFullYear(),
      description: '',
      images: []
    });
    setPositionGroups(newPositionGroups);
  };

  const handleRemoveToolLanguageGroup = (positionIndex: number, toolLanguageIndex: number) => {
    const newPositionGroups = [...positionGroups];
    newPositionGroups[positionIndex].toolLanguageGroups.splice(toolLanguageIndex, 1);
    setPositionGroups(newPositionGroups);
  };

  const handleToolLanguageChange = (positionIndex: number, toolLanguageIndex: number, event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPositionGroups = [...positionGroups];
    newPositionGroups[positionIndex].toolLanguageGroups[toolLanguageIndex].toolLanguage = event.target.value;
    setPositionGroups(newPositionGroups);
  };

  const handleInputChange = (positionIndex: number, toolLanguageIndex: number, field: string, value: string | number | File | null) => {
    const newPositionGroups = [...positionGroups];

    if (field === 'image' && value instanceof File) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageBase64 = event.target?.result as string;
        newPositionGroups[positionIndex].toolLanguageGroups[toolLanguageIndex].images.push({
          id: newPositionGroups[positionIndex].toolLanguageGroups[toolLanguageIndex].images.length + 1,
          cdnUrl: imageBase64,
          displayOrder: 0
        });
        setPositionGroups(newPositionGroups);
      };
      reader.readAsDataURL(value);
    } else {
      newPositionGroups[positionIndex].toolLanguageGroups[toolLanguageIndex][field] = value;
      setPositionGroups(newPositionGroups);
    }
  };

  const handleShowToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleDeleteEmployee = async () => {
    try {
      const employeeId = location.pathname.split('/edit/')[1];
      await api.employees.delete(employeeId)
      setModalIsOpen(false)
    } catch (err) {
      console.log(err)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const employeeId = location.pathname.split('/edit/')[1];
    // Check if any tool/language group has invalid from-to range
    const isValid = positionGroups.every((positionGroup) =>
      positionGroup.toolLanguageGroups.every((tlGroup) =>
        validateFromTo(tlGroup.from, tlGroup.to)
      )
    );

    if (!isValid) {
      console.log("Invalid date range detected. Cannot submit.");
      return;
    }

    // Format data to match the desired structure
    const formattedData: Employee = {
      name,
      positions: positionGroups.map((positionGroup, index: number) => ({
        id: index,
        positionResourceId: +positionGroup.positionId,
        displayOrder: 2,
        toolLanguages: positionGroup.toolLanguageGroups.map((tlGroup, index) => ({
          id: index,
          toolLanguageResourceId: +tlGroup.toolLanguage,
          displayOrder: 4,
          from: tlGroup.from,
          to: tlGroup.to,
          description: tlGroup.description,
          images: tlGroup.images.map((img: Image) => ({
            id: img.id,
            cdnUrl: img.cdnUrl,
            displayOrder: img.displayOrder
          }))
        }))
      }))
    };
    if (tilePage === 'Edit Employee Profile') {
      try {
        await api.employees.put(employeeId, formattedData)
        setToastType("success")
      } catch {
        setToastType("danger")
      }
    } else if (tilePage === 'Create Employee Profile') {
      try {
        await api.employees.post(formattedData)
        setToastType("success")
        navigate('/')
      } catch {
        setToastType("danger")
      }
    }
    handleShowToast()
  };

  const validateFromTo = (from: number, to: number) => {
    return from <= to;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="py-8 px-3">
        <h1 className="mb-10 text-white text-3xl">{tilePage}</h1>
        <div className="mb-6">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter name"
            required
          />
        </div>
        {positionGroups.map((positionGroup, positionIndex) => (
          <div key={positionIndex} className="mb-6">
            <div className="flex items-center justify-between">
              <label htmlFor={`position-${positionIndex}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Position</label>
              <button
                type="button"
                onClick={() => handleRemovePositionGroup(positionIndex)}
                className="text-red-500 hover:text-red-400"
              >
                Delete position
              </button>
            </div>
            <select
              id={`position-${positionIndex}`}
              value={positionGroup.positionId}
              onChange={(event) => handlePositionChange(positionIndex, event)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="" disabled>Select a position</option>
              {positions.map((position) => (
                <option key={position.positionResourceId} value={position.positionResourceId}>{position.name}</option>
              ))}
            </select>
            {positionGroup.toolLanguageGroups.map((toolLanguageGroup, toolLanguageIndex) => (
              <div key={toolLanguageIndex} className="mt-4 p-4 border rounded-lg">
                <div className="float-end">
                  {/* <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tool/Language</label> */}
                  <button
                    type="button"
                    onClick={() => handleRemoveToolLanguageGroup(positionIndex, toolLanguageIndex)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Delete Tool/Language
                  </button>
                </div>
                <div className="grid gap-6 mb-6 md:grid-cols-4 w-full">
                  <div className="mt-4 col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tool/Language</label>
                    <select
                      id={`toolLanguage-${positionIndex}-${toolLanguageIndex}`}
                      value={toolLanguageGroup.toolLanguage}
                      onChange={(event) => handleToolLanguageChange(positionIndex, toolLanguageIndex, event)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value="" disabled>Select a tool/language</option>
                      {positions.find(pos => pos.positionResourceId === +positionGroup.positionId)?.toolLanguageResources.map((tl) => (
                        <option key={tl.toolLanguageResourceId} value={tl.toolLanguageResourceId}>{tl.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-4">
                    <label htmlFor={`from-${positionIndex}-${toolLanguageIndex}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">From</label>
                    <input
                      type="number"
                      id={`from-${positionIndex}-${toolLanguageIndex}`}
                      value={toolLanguageGroup.from}
                      onChange={(e) => handleInputChange(positionIndex, toolLanguageIndex, 'from', e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="From"
                      min="1900" // Example minimum year (adjust as needed)
                      max={new Date().getFullYear()} // Current year as maximum
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <label htmlFor={`to-${positionIndex}-${toolLanguageIndex}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">To</label>
                    <input
                      type="number"
                      id={`to-${positionIndex}-${toolLanguageIndex}`}
                      value={toolLanguageGroup.to}
                      onChange={(e) => handleInputChange(positionIndex, toolLanguageIndex, 'to', e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="To"
                      min="1900"
                      max={new Date().getFullYear()}
                      required
                    />
                    {/* {!validateFromTo(toolLanguageGroup.from, toolLanguageGroup.to) && (
                    <p className="text-red-500 text-sm mt-1">From must be less than or equal to To</p>
                  )} */}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor={`description-${positionIndex}-${toolLanguageIndex}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                  <textarea
                    id={`description-${positionIndex}-${toolLanguageIndex}`}
                    value={toolLanguageGroup.description}
                    onChange={(e) => handleInputChange(positionIndex, toolLanguageIndex, 'description', e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Enter description"
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor={`images-${positionIndex}-${toolLanguageIndex}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Upload Image</label>
                  <input
                    type="file"
                    id={`images-${positionIndex}-${toolLanguageIndex}`}
                    accept="image/*"
                    onChange={(e) => handleInputChange(positionIndex, toolLanguageIndex, 'image', e.target.files ? e.target.files[0] : null)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                  <div className="flex flex-wrap gap-2">
                    {toolLanguageGroup.images.map((image, imgIndex) => (
                      <img key={imgIndex} src={image.cdnUrl} alt={`Image ${imgIndex}`} className="mt-2 rounded-lg w-28 h-auto" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddToolLanguageGroup(positionIndex)}
              className="mt-4 text-blue-700 hover:text-blue-600 border border-blue-700 hover:border-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500"
            >
              Add Tool/Language
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddPositionGroup}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Add Position
        </button>
        {tilePage === 'Create Employee Profile' && <div className="mt-16 flex justify-end">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
          >
            Save
          </button>
        </div>}
        {tilePage === 'Edit Employee Profile' &&
          (<>
            <div className="mt-16 flex justify-between">
              <div>
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                  onClick={() => setModalIsOpen(true)}
                >
                  Delete
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="text-green-600 border border-green-600 hover:text-green-500 hover:border-green-500 focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
                >
                  Save
                </button>
              </div>
            </div>
            <Modal isOpen={modalIsOpen} isClose={() => setModalIsOpen(false)} onConfirm={handleDeleteEmployee} description='Are you sure you want to delete this employee?' />
          </>
          )}
      </form>
      {showToast && <Toast
        message={toastType === 'success' ? 'Employee update successful' : 'Employee update failed'}
        type={toastType}
        onClose={() => setShowToast(false)}
      />}
    </>
  );
};

export default CreateEmployee;
