import { useEffect, useState } from "react"
import EmployeesList from "./EmployeesList"
import Employee from "../../types/employee"
import api from "../../services/api"
import EmployeesTopBar from "./EmployeesTopBar"

const Employees = () => {
    const [search, setSearch] = useState<string>("")
    const [employees, setEmployees] = useState<Employee[]>([])

    const getEmployees = async (search?: string) => {
        try {
            const res = await api.employees.getAll(search)
            setEmployees(res)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getEmployees(search)
    }, [search])

    return (
        <div className="pb-6">
            <div className="py-6">
                <EmployeesTopBar setSearch={setSearch} />
            </div>
            <EmployeesList employees={employees} getEmployees={getEmployees} />
        </div>
    )
}

export default Employees