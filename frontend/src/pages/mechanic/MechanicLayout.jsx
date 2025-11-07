import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';

export default function MechanicLayout() {
  return (
    <div>
      <Navbar userType="mechanic" />
      <Outlet />
    </div>
  );
}