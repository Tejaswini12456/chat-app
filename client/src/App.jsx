import React ,{ useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Loginpage from './pages/Loginpage';
import Profilepage from './pages/Profilepage';
import { Toaster } from 'react-hot-toast';
import { Authcontext } from '../context/Authcontext';


const App = () => {
  const {authUser}=useContext(Authcontext)

  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
      <Toaster />
      <Routes>

        {/* Home */}
        <Route 
          path="/" 
          element={authUser ? <Homepage /> : <Navigate to="/login" />} 
        />

        {/* Login */}
        <Route 
          path="/login" 
          element={!authUser ? <Loginpage /> : <Navigate to="/" />} 
        />

        {/* Profile */}
        <Route 
          path="/profile" 
          element={authUser ? <Profilepage /> : <Navigate to="/login" />} 
        />

      </Routes>
    </div>
  );
};

export default App;
