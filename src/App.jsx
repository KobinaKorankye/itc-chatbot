import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import AppContext from "./contexts/AppContext";
import { useContext, useState } from "react";
import Chat from "./pages/Chat";
import authService from "./storage";
import Landing from "./pages/Landing";

function PrivateRoute() {
  const { user } = useContext(AppContext);
  return user ? <Outlet /> : <Navigate to="/" />;
}

export default function App() {
  const [user, setUser] = useState('')
  
  // useEffect(() => {
  //   try {
  //     const token = authService.getCurrentUser();
  //     if (token) {
  //       const u = jwtDecode(token)

  //       if (((u.exp * 1000) - Date.now()) < 0) {
  //         authService.removeCurrentUser()
  //         toast.info("Session Expired", {
  //           position: toast.POSITION.TOP_CENTER,
  //           autoClose: (1000)
  //         });
  //       } else {
  //         setUser(u);
  //       }
  //     } else {
  //       toast.info("No user logged in", {
  //         position: toast.POSITION.TOP_CENTER,
  //         autoClose: (1000)
  //       });
  //     }
  //   } catch (e) {
  //     console.warn(e);
  //     toast.error(e, {
  //       position: toast.POSITION.TOP_CENTER,
  //       autoClose: (1000)
  //     });
  //   }
  //   setLoading(false)
  // }, [])

  return (
    <AppContext.Provider value={{user, setUser}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
