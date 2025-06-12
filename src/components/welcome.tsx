import { useNavigate } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center text-gray-800 text-center p-6">
            <header className="w-full py-6 bg-blue-950 text-white text-3xl font-bold shadow-md">
                Opex Logistics
            </header>
            
            <main className="flex flex-col items-center mt-12 max-w-3xl">
                <h1 className="text-5xl font-bold text-blue-950 mb-4">Revolutionize Your Delivery Management</h1>
                <p className="text-lg text-gray-600 max-w-2xl mb-6">
                    Opex Logistics is an AI-powered smart solution designed to help logistics companies efficiently manage their delivery teams. 
                    Optimize your workflow, track performance, and improve efficiency seamlessly.
                </p>
                <button 
                    className="bg-blue-950 text-white px-8 py-3 rounded-full shadow-lg text-xl hover:bg-blue-800 transition"
                    onClick={() => navigate('/signup')}
                >
                    Get Started
                </button>
            </main>
            
            <footer className="mt-16 text-gray-500">
                &copy; {new Date().getFullYear()} Opex Logistics. All rights reserved.
            </footer>
        </div>
    );
};

export default Welcome;
