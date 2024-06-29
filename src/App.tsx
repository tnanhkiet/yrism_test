import { Route, Routes } from 'react-router-dom';
import Employees from './pages/employees/Employees.tsx';
import EditEmployee from './pages/editEmployee/EditEmployee.tsx';

function App() {
  return (
    <div className='bg-slate-900 min-h-screen'>
      <div className="container mx-auto px-3 sm:px-0">
        <Routes>
          <Route path="/" element={<Employees />} />
          <Route path="/create" element={<EditEmployee />} />
          <Route path="/edit/:id" element={<EditEmployee />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
