import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const EstimationModal = ({ language, isOpen, onClose }: { language: string; isOpen: boolean; onClose: () => void }) => {
    const location = useLocation();
    const [type, setType] = useState("Mécanique");
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        brand: "",
        model: "",
        trim: "",
        year: "",
        description: "",
        images: [] as File[],
    });
    const [error, setError] = useState("");

    // Déterminer le type de modal (Mécanique ou Carrosserie)
    useEffect(() => {
        if (location.pathname.includes("services-mecanique")) {
            setType("Mécanique");
        } else if (location.pathname.includes("services-carrosserie")) {
            setType("Carrosserie");
        }
    }, [location.pathname]);

    // Définition explicite du type pour éviter l'erreur TypeScript
    const vehicleBrands: Record<string, string[]> = {
        Toyota: ["Corolla", "Camry", "RAV4", "Highlander"],
        Honda: ["Civic", "Accord", "CR-V", "Pilot"],
        BMW: ["3 Series", "5 Series", "X5", "X6"],
        Mercedes: ["C-Class", "E-Class", "GLC", "GLE"],
        Audi: ["A4", "A6", "Q5", "Q7"],
    };

    // Gérer les champs texte
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    // Gérer les listes déroulantes
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    // Gérer les images uploadées
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files).slice(0, 3); // Limite à 3 images
            setFormData((prev) => ({ ...prev, images: filesArray }));
        }
    };

    const validateForm = () => {
        if (
            !formData.email ||
            !formData.phone ||
            !formData.brand ||
            !formData.model ||
            !formData.trim ||
            !formData.year ||
            !formData.description ||
            (type === "Carrosserie" && formData.images.length === 0)
        ) {
            setError(language === "fr" ? "Tous les champs sont obligatoires." : "All fields are required.");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const data = {
                type,
                ...formData,
            };
            console.log(data);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="mt-20 fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white w-full max-w-3xl mx-4 p-6 rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
                <h2 className="text-3xl font-extrabold text-yellow-500 mb-4">
                    {language === "fr"
                        ? type === "Mécanique"
                            ? "Estimation Mécanique"
                            : "Estimation Carrosserie"
                        : type === "Mécanique"
                            ? "Mechanical Estimate"
                            : "Bodywork Estimate"}
                </h2>

                <form>
                    <div className="mb-4">
                        <label className="block text-yellow-500">{language === "fr" ? "Email" : "Email"}</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded bg-gray-800 text-white"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-yellow-500">{language === "fr" ? "Numéro de Téléphone" : "Phone Number"}</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded bg-gray-800 text-white"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-yellow-500">{language === "fr" ? "Marque du Véhicule" : "Vehicle Brand"}</label>
                        <select
                            name="brand"
                            value={formData.brand}
                            onChange={handleSelectChange}
                            className="w-full p-2 border rounded bg-gray-800 text-white"
                            required
                        >
                            <option value="">{language === "fr" ? "Sélectionnez une marque" : "Select a brand"}</option>
                            {Object.keys(vehicleBrands).map((brand) => (
                                <option key={brand} value={brand}>
                                    {brand}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.brand && (
                        <div className="mb-4">
                            <label className="block text-yellow-500">{language === "fr" ? "Modèle du Véhicule" : "Vehicle Model"}</label>
                            <select
                                name="model"
                                value={formData.model}
                                onChange={handleSelectChange}
                                className="w-full p-2 border rounded bg-gray-800 text-white"
                                required
                            >
                                <option value="">{language === "fr" ? "Sélectionnez un modèle" : "Select a model"}</option>
                                {vehicleBrands[formData.brand].map((model) => (
                                    <option key={model} value={model}>
                                        {model}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* AJOUTER LE CHAMP TRIM ICI */}
                    <div className="mb-4">
                        <label className="block text-yellow-500">{language === "fr" ? "Finition du Véhicule" : "Vehicle Trim"}</label>
                        <input
                            type="text"
                            name="trim"
                            value={formData.trim}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded bg-gray-800 text-white"
                            placeholder={language === "fr" ? "Entrez la finition" : "Enter the trim"}
                            required
                        />
                    </div>




                    <div className="mb-4">
                        <label className="block text-yellow-500">{language === "fr" ? "Année du Véhicule" : "Vehicle Year"}</label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleSelectChange}
                            className="w-full p-2 border rounded bg-gray-800 text-white"
                            required
                        >
                            <option value="">{language === "fr" ? "Sélectionnez une année" : "Select a year"}</option>
                            {Array.from({ length: 26 }, (_, index) => 2000 + index).map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-yellow-500">{language === "fr" ? "Description du Problème" : "Problem Description"}</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded bg-gray-800 text-white"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-yellow-500">{language === "fr" ? "Télécharger des Images" : "Upload Images"}</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="w-full p-2 border rounded bg-gray-800 text-white"
                        />
                        {formData.images.length > 0 && (
                            <div className="mt-2 flex space-x-2">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt="Uploaded"
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>



                    {error && <p className="text-red-500">{error}</p>}

                    <div className="flex justify-end space-x-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition duration-300"
                        >
                            {language === "fr" ? "Annuler" : "Cancel"}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-600 transition duration-300"
                        >
                            {language === "fr" ? "Soumettre" : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EstimationModal;
