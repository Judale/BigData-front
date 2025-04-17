import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import DrawingView from "./pages/DrawingView";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import styles from "./styles/App.module.css";

export default function App() {
    return (
        <div className={styles.appWrapper} style={{ overflow: "hidden" }}>
            <Navbar />
            <main className={styles.mainContent} >
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game" element={<Game />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/drawings" element={<DrawingView />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}
