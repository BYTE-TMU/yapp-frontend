import Sidebar from '@/components/sidebar/Sidebar';
import Header from '@/components/header/Header';
import { Outlet } from 'react-router-dom';
import AnimatedBackground from '../common/AnimatedBackground';

function AuthRoutesLayout() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <Sidebar />
      <Header />
      <div className="h-screen overflow-y-auto md:ml-64">
        <AnimatedBackground />
        <Outlet />
      </div>
    </div>
  );
}

export default AuthRoutesLayout;
