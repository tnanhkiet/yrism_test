import { Route, Routes } from 'react-router-dom';
import Employees from './pages/employees/Employees.tsx';
import CreateEmployee from './pages/createEmployee/CreateEmployee.tsx';

function App() {
  return (
    <div className='bg-slate-900 min-h-screen'>
      <div className="container mx-auto px-3 sm:px-0">
        <Routes>
          <Route path="/" element={<Employees />} />
          <Route path="/create" element={<CreateEmployee />} />
          <Route path="/edit/:id" element={<CreateEmployee />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
