import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import BottomNav from './BottomNav';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden w-full">
      
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <div className="pt-16 pb-20 md:pb-0 w-full mx-auto">
        
        <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 overflow-y-auto hide-scrollbar border-r border-dark-800/50 bg-dark-950 z-40">
           <div className="py-6">
             <Sidebar />
           </div>
        </div>

        <main className="min-w-0 min-h-screen md:ml-64 xl:mr-80 border-r border-dark-800 transition-all duration-200 max-w-full">
          <div className="w-full">
             <Outlet />
             <Footer />
          </div>
        </main>

        <aside className="hidden xl:block fixed right-0 top-16 bottom-0 w-80 overflow-y-auto hide-scrollbar p-4 bg-dark-950 z-40 border-l border-dark-800/50">
           <RightSidebar />
        </aside>

      </div>

      <BottomNav />
    </div>
  );
};

export default Layout;