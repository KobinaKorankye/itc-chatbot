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
import "react-tooltip/dist/react-tooltip.css";
import authService from "./storage";
import Landing from "./pages/Landing";

function PrivateRoute() {
  const { user } = useContext(AppContext);
  return user ? <Outlet /> : <Navigate to="/" />;
}

export default function App() {
  const [user, setUser] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("toast");
  const [toastClass, setToastClass] = useState("");

  const toastShow = (text, className, goBack=true)=>{
    setToastText(text)
    setToastClass(className)
    setShowToast(true)
    if(goBack){
      setTimeout(()=>{setShowToast(false)}, 4000)
    }
  }

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
    <AppContext.Provider value={{ user, setUser, toastShow }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<PrivateRoute />}>
            <Route path="" element={<Chat />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <div style={{fontFamily: 'ShareTech'}} className={`absolute z-[1000] flex w-full justify-center duration-[1000ms] ${showToast ? "top-0" : "-top-32"}`}>
        <div className={`px-5 py-2 text-sm rounded-b-lg ${toastClass?toastClass:'bg-red-600 text-white'}`}>{toastText}</div>
      </div>
    </AppContext.Provider>
  );
}
