import Employee from "../types/employee"
import config from "./config"
import Axios from 'axios'

const { baseApi } = config

async function getPositionResources(positionResourceId?: number) {
    let response = null
    try {
        response = await Axios.get(`${baseApi}/positionResources`, { params: { positionResourceId } })
    } catch (err) {
        throw new Error(err.message)
    }

    return response?.data
}

async function getEmployee(id: string) {

    const response = []
    try {
        const res = await Axios.get(`${baseApi}/employees/${id}`)
        response.push(res.data)
    } catch (err) {
        throw new Error(err.message)
    }

    return response
}

async function getEmployees(search?: string) {
    let response = null
    try {
        response = await Axios.get(`${baseApi}/employees`, { params: { name: search } })
    } catch (err) {
        throw new Error(err.message)
    }

    return response?.data
}

async function createEmployee(employee: Employee) {
    try {
        await Axios.post(`${baseApi}/employees`, employee)
    } catch (err) {
        throw new Error(err.message)
    }
}

async function updateEmployee(id: string, employee: Employee) {
    try {
        await Axios.put(`${baseApi}/employees/${id}`, employee)

    } catch (err) {
        throw new Error(err.message)
    }
}

async function deleteEmployee(id: string) {
    try {
        await Axios.delete(`${baseApi}/employees/${id}`)
    } catch (err) {
        throw new Error(err.message)
    }
}

export default Object.freeze({
    employees: Object.freeze({
        get: getEmployee,
        getAll: getEmployees,
        post: createEmployee,
        put: updateEmployee,
        delete: deleteEmployee
    }),
    positionResources: Object.freeze({
        get: getPositionResources
    })
})