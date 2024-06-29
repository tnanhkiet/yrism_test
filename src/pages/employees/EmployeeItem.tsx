import { useEffect, useState } from 'react'
import Employee from '../../types/employee'
import api from '../../services/api'
import PositionResource from '../../types/positionResource'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal'

type Props = {
    employee: Employee
    getEmployees: () => void
}

const EmployeeItem = (props: Props) => {
    const { employee, getEmployees } = props
    const navigate = useNavigate()
    const [position, setPosition] = useState<PositionResource[]>([])
    const [imageError, setImageError] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const handleMouseEnter = () => {
        setIsHovered(true);
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
    }


    const handleImageError = () => {
        setImageError(true)
    }

    const handleBtnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation()
        setModalIsOpen(true)
    }

    const handleDeleteEmployee = async () => {
        try {
            await api.employees.delete(employee.id)
            await getEmployees()
            setModalIsOpen(false)
        } catch (err) {
            console.log(err)
        }
    }


    const handleEditEmployee = () => {
        navigate(`/edit/${employee.id}`)
    }

    useEffect(() => {
        const getPositionResource = async () => {
            try {
                const res = await api.positionResources.get(employee.positions[0].positionResourceId)
                setPosition(res)
            } catch (err) {
                console.log(err)
            }
        }
        getPositionResource()
    }, [employee])

    return (
        <>
            <div className="relative cursor-pointer bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 hover:shadow-blue-700 hover:shadow-md transition-shadow" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleEditEmployee}>
                {/* <img className="rounded-t-lg object-cover h-44 w-full" src={employee.positions[0].toolLanguages[0].images[0].cdnUrl} alt="image" /> */}
                {imageError ? (
                    <img className="rounded-t-lg object-cover h-44 w-full" src="/src/assets/default.jpg" alt="Default Image" />
                ) : (
                    <img
                        className="rounded-t-lg object-cover h-44 w-full"
                        src={employee.positions[0].toolLanguages[0].images[0].cdnUrl}
                        alt=""
                        onError={handleImageError}
                    />
                )}
                {isHovered && (
                    <button
                        className="absolute top-[200px] right-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                        onClick={handleBtnDelete}
                    >
                        Delete
                    </button>
                )}
                <div className="p-5">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{employee.name}</h5>
                    <div className="flex justify-between mb-3">
                        <p className="font-normal text-gray-700 dark:text-gray-400">{position[0]?.name}</p>
                        <p className="font-normal text-gray-700 dark:text-gray-400">{employee.positions[0].toolLanguages[0].to - employee.positions[0].toolLanguages[0].from} years</p>
                    </div>
                    <p className="mb-3 font-normal overflow-hidden whitespace-nowrap overflow-ellipsis text-gray-700 dark:text-gray-400">{employee.positions[0].toolLanguages[0].description}</p>
                </div>
            </div>
            <Modal isOpen={modalIsOpen} isClose={() => setModalIsOpen(false)} onConfirm={handleDeleteEmployee} description='Are you sure you want to delete this employee?' />
        </>
    )
}

export default EmployeeItem