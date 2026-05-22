import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ApiProvider, useApi } from './context/ApiContext';
import PixelLoadingScreen from './components/PixelLoadingScreen';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TunisiaMap from './components/TunisiaMap';
import InventorySystem from './components/InventorySystem';
import LogSystem from './components/LogSystem';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import ProfilePage from './components/ProfilePage';
import GovGuess from './components/GovGuess';

function AppContent() {
    const { loading, isAuthenticated } = useApi();
    const [activeSection, setActiveSection] = useState('home');
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showLoadingScreen, setShowLoadingScreen] = useState(true);

    const homeRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const inventoryRef = useRef<HTMLDivElement>(null);
    const logsRef = useRef<HTMLDivElement>(null);

    const sectionRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
        home: homeRef,
        map: mapRef,
        inventory: inventoryRef,
        logs: logsRef,
    };

    const handleNavigate = (section: string) => {
        setActiveSection(section);

        const ref = sectionRefs[section];
        if (ref?.current) {
            const top = ref.current.offsetTop - 56;
            window.scrollTo({ top, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (showLoadingScreen) return;

        const handleScroll = () => {
            const scrollableSections = ['home', 'map', 'inventory', 'logs'];
            if (!scrollableSections.includes(activeSection)) return;

            const scrollY = window.scrollY + 100;
            const entries = Object.entries(sectionRefs);
            for (let i = entries.length - 1; i >= 0; i--) {
                const [key, ref] = entries[i];
                if (ref.current && ref.current.offsetTop <= scrollY) {
                    setActiveSection(key);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showLoadingScreen, activeSection]);

    const handleAdminClick = () => {
        if (isAuthenticated) {
            setShowAdminPanel(true);
        } else {
            setShowAdminLogin(true);
        }
    };

    const isFullscreenPage = ['profile', 'govguess'].includes(activeSection);

    return (
        <div className="bg-pixel-dark min-h-screen text-pixel-white relative">
            <AnimatePresence>
                {showLoadingScreen && (
                    <PixelLoadingScreen 
                        key="loading" 
                        isApiLoading={loading} 
                        onComplete={() => setShowLoadingScreen(false)} 
                    />
                )}
            </AnimatePresence>

            {!showLoadingScreen && (
                <>
                    <Navbar
                        activeSection={activeSection}
                        onNavigate={handleNavigate}
                    />

                    <main className="relative z-10 min-h-[calc(100vh-120px)] pt-14">
                        <AnimatePresence mode="wait">
                            {isFullscreenPage ? (
                                <div key={activeSection} className="w-full">
                                    {activeSection === 'profile' && <ProfilePage />}
                                    {activeSection === 'govguess' && <GovGuess />}
                                </div>
                            ) : (
                                <div key="main-landing" className="w-full">
                                    <div ref={homeRef}>
                                        <HeroSection onNavigate={handleNavigate} />
                                    </div>

                                    <SectionDivider />

                                    <div ref={mapRef}>
                                        <TunisiaMap />
                                    </div>

                                    <SectionDivider />

                                    <div ref={inventoryRef}>
                                        <InventorySystem />
                                    </div>

                                    <SectionDivider />

                                    <div ref={logsRef}>
                                        <LogSystem />
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </main>

                    <Footer onAdminClick={handleAdminClick} />

                    <AnimatePresence>
                        {showAdminLogin && (
                            <AdminLogin onClose={() => setShowAdminLogin(false)} />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showAdminPanel && isAuthenticated && (
                            <AdminPanel onClose={() => setShowAdminPanel(false)} />
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}

function SectionDivider() {
    return (
        <div className="flex justify-center py-6">
            <div className="flex items-center gap-2">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-pixel-yellow/20" />
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-pixel-yellow/20 rotate-45" />
                    ))}
                </div>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-pixel-yellow/20" />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <ApiProvider>
            <AppContent />
        </ApiProvider>
    );
}
