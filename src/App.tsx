import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import GamePage from "./pages/GamePage";
import MyDrawings from "./pages/MyDrawings";
import Home from "./pages/Home";
import Layout from "./components/Layout";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/game" element={<PrivateRoute><GamePage /></PrivateRoute>}/>
                        <Route path="/my-drawings" element={<PrivateRoute><MyDrawings /></PrivateRoute>}/>
                        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>}/>
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
