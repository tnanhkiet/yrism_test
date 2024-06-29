import { useEffect, useState } from 'react'
import Employee from '../../types/employee'
import EmployeeItem from './EmployeeItem'
import InfiniteScroll from 'react-infinite-scroll-component'

type Props = {
    employees: Employee[]
    getEmployees: () => Promise<void>
}

const EmployeesList = (props: Props) => {
    const { employees, getEmployees } = props
    const [displayedEmployees, setDisplayedEmployees] = useState<Employee[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const limit = 8;

    useEffect(() => {
        setDisplayedEmployees(employees.slice(0, limit))
    }, [employees, limit])

    const getMoreData = () => {
        const nextPage = page + 1
        const newEmployees = employees.slice(page * limit, nextPage * limit)

        if (newEmployees.length === 0) {
            setHasMore(false)
            return;
        }

        setDisplayedEmployees(prevEmployees => [...prevEmployees, ...newEmployees])
        setPage(nextPage);
    }

    if (!displayedEmployees.length) {
        return (
            <div className='flex justify-center items-center'>
                <h1 className='text-white'>Employee Not Found</h1>
            </div>
        )
    }

    return (
        <InfiniteScroll
            dataLength={displayedEmployees.length}
            next={getMoreData}
            hasMore={hasMore}
            loader={<h4 className='align-middle text-white'>Loading...</h4>}
            // endMessage={<p>No more data to load</p>}
            className='!overflow-visible'
        >
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-auto'>
                {displayedEmployees.map((employee) => <EmployeeItem key={employee.id} employee={employee} getEmployees={getEmployees} />)}
            </div>
        </InfiniteScroll>
    )
}

export default EmployeesList