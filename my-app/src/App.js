import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AnnouncementsProvider } from "./context/AnnouncementsContext";
import { AdminRecordsProvider } from "./context/AdminRecordsContext";
import Navbar from "./components/Navbar/Navber";
import AnnouncementBanner from "./components/AnnouncementBanner/AnnouncementBanner";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import CenterBooking from "./pages/CenterBooking/CenterBooking";
import BooksReservation from "./pages/BooksReservation/BooksReservation";
import Materials from "./pages/Materials/Materials";
import Announcements from "./pages/Announcements/Announcements";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminLog from "./pages/AdminLog/AdminLog";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRpoute"
import Footer from "./components/Footer/Footer"
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <AnnouncementsProvider>
        <AdminRecordsProvider>
          <div className="app">
            <Navbar />
            <AnnouncementBanner />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile"element={
                  <ProtectedRoute>
                    <Profile/>
                  </ProtectedRoute>
                }></Route>
                <Route path="/centers" element={<CenterBooking />} />
                <Route path="/books" element={<BooksReservation />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/announcements" element={<Announcements />} />
                
                <Route path="/admin" element={<ProtectedRoute adminOnly>
                  <AdminDashboard></AdminDashboard>
                </ProtectedRoute>}></Route>

                <Route path="/admin/log" element={
                  <ProtectedRoute adminOnly>
                    <AdminLog></AdminLog>
                  </ProtectedRoute>
                }>

                </Route>
              </Routes>
            </main>
            <Footer></Footer>
          </div>
        </AdminRecordsProvider>
      </AnnouncementsProvider>
    </AuthProvider>
  );
}

export default App;