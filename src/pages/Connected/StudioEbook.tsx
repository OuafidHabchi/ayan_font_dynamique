import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilePdf, FaFileWord, FaPenFancy, FaKeyboard, FaMagic, FaBookOpen, FaHome, FaExpand, FaTimes, FaChevronLeft, FaChevronRight, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { FiAlignLeft, FiArrowLeft, FiArrowRight, FiBold, FiBook, FiCheck, FiCheckCircle, FiDollarSign, FiDroplet, FiGlobe, FiHelpCircle, FiInfo, FiItalic, FiLayout, FiMove, FiRefreshCw, FiSave, FiSettings, FiTag, FiTrash2, FiType, FiUnderline, FiUpload, FiUploadCloud, FiX } from 'react-icons/fi';
import { colorPalettes } from '../../components/templates'; // 💡 Crée ce fichier pour tes templates
import { useRef } from 'react';
import axios from 'axios';
import AppURL from '../../components/AppUrl';
import { useAuth } from "../../context/AuthContext";
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';


interface Template {
  _id: string;
  titre: string;
  imageUrl: string;
}
type WritingStyle = {
  id: string;
  label: string;
  fontStyle: string;
  fontFamily: string;
};


const StudioEbook: React.FC = () => {
  const navigate = useNavigate();
  const writingStyles: WritingStyle[] = [
    { id: 'professionnel', label: 'Professionnel', fontStyle: 'normal', fontFamily: 'Arial, sans-serif' },
    { id: 'conversationnel', label: 'Conversationnel', fontStyle: 'normal', fontFamily: 'Comic Sans MS, cursive' },
    { id: 'academique', label: 'Académique', fontStyle: 'italic', fontFamily: 'Times New Roman, serif' },
    { id: 'creatif', label: 'Créatif', fontStyle: 'normal', fontFamily: 'Georgia, serif' },
    { id: 'technique', label: 'Technique', fontStyle: 'normal', fontFamily: 'Courier New, monospace' },
    { id: 'simple', label: 'Simple', fontStyle: 'normal', fontFamily: 'Verdana, sans-serif' },
    { id: 'persuasif', label: 'Persuasif', fontStyle: 'normal', fontFamily: 'Impact, sans-serif' },
    { id: 'narratif', label: 'Narratif', fontStyle: 'italic', fontFamily: 'Palatino, serif' }
  ];


  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [investmentOptions, setInvestmentOptions] = useState({
    affiliation: false,
    sponsoring: false,
    licence: false,
    commande: false,
    codePromo: false
  });


  // Infos générales
  const [titre, setTitre] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [categorie, setCategorie] = useState('');
  const [prix, setPrix] = useState(0);
  const [description, setDescription] = useState('');
  const [langue, setLangue] = useState('fr');

  // Personnalisation
  const [coverId, setCoverId] = useState<string | null>(null);
  const [paletteId, setPaletteId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [fontSize, setFontSize] = useState<number>(20);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [textBox, setTextBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [selectedWritingStyle, setSelectedWritingStyle] = useState<WritingStyle>(writingStyles[0]);
  const [textWeight, setTextWeight] = useState<'normal' | 'bold'>('bold');
  const [, setActiveTag] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  // AI spécifique
  const [aiPageCount, setAiPageCount] = useState<number>(20);
  const [aiExtraDetails, setAiExtraDetails] = useState<string>('');
  // juste après les autres useState
  const [generatedBookId, setGeneratedBookId] = useState<string | null>(null);



  // Manuel spécifique
  const [manualOption, setManualOption] = useState<'pdf' | 'word' | 'text' | 'ai' | null>(null);
  const [manualText, setManualText] = useState('');

  // États nécessaires
  const [showFullscreenViewer, setShowFullscreenViewer] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [, setTouchEnd] = useState(0);

  const [, setIsSwiping] = useState(false);
  const [, setSwipeOffset] = useState(0);


  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: '',
    content: ''
  });




  useEffect(() => {
    if (manualOption === 'text' && manualText && editorRef.current) {
      editorRef.current.innerHTML = manualText;
    }
  }, [manualOption]);

  useEffect(() => {
    const checkActiveTags = () => {
      const selection = window.getSelection();
      if (!selection || !selection.focusNode) {
        setActiveTags([]);
        return;
      }

      let parentElement = selection.focusNode.parentElement;
      const tagsFound: string[] = [];

      while (parentElement && parentElement.id !== 'manualTextEditor') {
        const tag = parentElement.tagName.toLowerCase();
        if (['h1', 'h2', 'h3', 'b', 'i', 'u'].includes(tag)) {
          tagsFound.push(tag);
        }
        parentElement = parentElement.parentElement;
      }

      // ✅ Ne setState que si différent
      setActiveTags(prev => {
        const areSame = prev.length === tagsFound.length && prev.every(t => tagsFound.includes(t));
        if (areSame) return prev;
        return tagsFound;
      });
    };

    document.addEventListener('selectionchange', checkActiveTags);
    return () => document.removeEventListener('selectionchange', checkActiveTags);
  }, []);


  // ✅ Gestion tactile pour dessiner la zone sur tablette
  const handleTouchStartCanvas = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    setStartPoint({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    setIsDrawing(true);
  };

  const handleTouchMoveCanvas = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;
    e.preventDefault(); // ⛔ Empêche le scroll pendant le dessin

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const touch = e.touches[0];
    const x = startPoint.x * scaleX;
    const y = startPoint.y * scaleY;
    const width = (touch.clientX - rect.left) * scaleX - x;
    const height = (touch.clientY - rect.top) * scaleY - y;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  };

  const handleTouchEndCanvas = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const touch = e.changedTouches[0];
    const x = startPoint.x * scaleX;
    const y = startPoint.y * scaleY;
    const width = (touch.clientX - rect.left) * scaleX - x;
    const height = (touch.clientY - rect.top) * scaleY - y;

    setTextBox({ x, y, width, height });
    setIsDrawing(false);
    setStartPoint(null);

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  };









  // Gestion du swipe tactile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(false);
    setSwipeOffset(0);
  };


  const handleTouchMove = (e: React.TouchEvent) => {
    const touchX = e.targetTouches[0].clientX;
    setTouchEnd(touchX);

    // Calcul du décalage pour l'effet de glissement
    const offset = touchX - touchStart;
    setSwipeOffset(offset);
    setIsSwiping(Math.abs(offset) > 10);
  };


  // Step handler
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);


  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${AppURL}/api/templates`);
      setTemplates(res.data.templates);
    } catch (err) {
      console.error("Erreur fetch templates", err);
    } finally {

    }
  };
  useEffect(() => {
    fetchTemplates();
  }, []);


  const wrapSelectionWithTag = (tagName: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // rien de sélectionné

    const editor = document.getElementById('manualTextEditor');
    if (!editor) return;

    let parentElement = selection.focusNode?.parentElement;
    let foundTagParent: HTMLElement | null = null;

    // ✅ Recherche si un des parents correspond déjà à la balise
    while (parentElement && parentElement !== editor) {
      if (parentElement.tagName.toLowerCase() === tagName) {
        foundTagParent = parentElement;
        break;
      }
      parentElement = parentElement.parentElement;
    }

    if (foundTagParent) {
      // ✅ Si trouvé ➔ unwrap la balise
      const fragment = document.createDocumentFragment();
      while (foundTagParent.firstChild) {
        fragment.appendChild(foundTagParent.firstChild);
      }
      foundTagParent.replaceWith(fragment);

      // Met à jour la sélection
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(fragment);
      selection.addRange(newRange);

      setActiveTag(null);
    } else {
      // ✅ Sinon ➔ wrap normalement
      const newNode = document.createElement(tagName);
      newNode.appendChild(range.extractContents());

      range.insertNode(newNode);

      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(newNode);
      selection.addRange(newRange);

      setActiveTag(tagName);
    }

    // ✅ Met à jour ton state manualText
    setManualText(editor.innerHTML);
  };


  const handleAIGeneration = async () => {
    if (!titre || !description || !categorie || !langue) {
      toast.error("❌ Veuillez remplir les détails du livre avant de générer.");
      return;
    }

    try {
      toast.info("⏳ Génération IA en cours...");

      const prompt = `Tu es un écrivain professionnel. Rédige un ebook en ${langue} intitulé "${titre}". 
            Il doit contenir environ ${aiPageCount} pages. 
            Catégorie : ${categorie}
            Description : ${description}
            Détails supplémentaires : ${aiExtraDetails}
            lagnue:${langue}
            Rédige-le avec un style fluide, structuré et engageant.`;

      console.log("propmt " + prompt)
      setManualOption('text');
      setManualText(prompt);

      // const res = await axios.post(
      //   'https://api.openai.com/v1/chat/completions',
      //   {
      //     model: 'gpt-4',
      //     messages: [{ role: 'user', content: prompt }],
      //     temperature: 0.7,
      //     max_tokens: 2000
      //   },
      //   {
      //     headers: {
      //       'Authorization': `Bearer TA_CLE_API_OPENAI`, // ⚠️ Jamais en clair dans un vrai projet
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );

      // const texteGenere = res.data.choices?.[0]?.message?.content;

      // if (texteGenere) {
      //   setManualOption('text');
      //   setManualText(texteGenere);
      //   toast.success("✅ Texte généré !");
      // } else {
      //   toast.error("❌ Réponse invalide.");
      // }
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur pendant la génération.");
    }
  };






  const handleDeleteBook = async (bookId: any) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet ebook ?");
    if (!confirmed) return;

    try {
      console.log(bookId);

      const res = await axios.delete(`${AppURL}/api/Collectionebooks/delete/${bookId}`);
      if (res.data.success) {
        toast.success("✅ Ebook supprimé avec succès !");
        // 👉 Optionnel : réinitialiser l’état ou revenir à l'accueil
        setStep(0);
      } else {
        toast.error("❌ Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur serveur lors de la suppression.");
    }
  };



  const handleSubmit = async () => {

    if ((!manualText || manualText.length < 200)) {
      alert("❌ Veuillez entrer au moins 200 caractères dans la zone de texte avant de continuer.");
      return;
    }

    if (!coverId || !paletteId || !textBox) {
      alert("❌ Veuillez choisir une couverture, une couleur et dessiner la zone de texte avant de continuer.");
      return;
    }
    try {

      setIsGenerating(true);


      // 💡 Récupérer la couleur principale choisie
      const palette = colorPalettes.find(p => p.id === paletteId);
      const paletteColor = palette ? palette.colors[0] : '#000000';

      const data = {
        auteur: user?.id,
        coverPath,
        titre,
        categorie,
        prix,
        description,
        langue,
        selectedWritingStyle,
        textWeight,
        investmentOptions,
        templateId: coverId,
        paletteColor, // ✅ envoyer directement la couleur ici
        fontSize,
        manualOption,
        content: manualText || undefined,
        textBox: {
          x: textBox.x,
          y: textBox.y,
          width: textBox.width,
          height: textBox.height,
        },
      };


      const res = await axios.post(`${AppURL}/api/ebooks/generate`, data);

      if (res.data.success) {
        const ebookId = res.data.ebookId;
        setGeneratedBookId(ebookId);
        // ➡️ Affiche un preview du livre
        setGeneratedFiles(res.data.files); // ajoute un state pour ça
        setStep(4); // par exemple un step pour la preview
      } else {
        alert("❌ Erreur lors de la génération.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Erreur serveur lors de la génération.");
    }
    finally {
      setIsGenerating(false);
    }
  };



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${AppURL}/api/ebooks/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setManualText(res.data.text); // ✅ Affiche le texte extrait dans la zone de texte
        setManualOption('text'); // ✅ Force l’affichage de la zone de texte
      } else {
        alert('❌ Erreur lors de l\'extraction du texte');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Erreur serveur lors de l\'upload');
    }
  };






  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setStartPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = startPoint.x * scaleX;
    const y = startPoint.y * scaleY;
    const width = (e.clientX - rect.left) * scaleX - x;
    const height = (e.clientY - rect.top) * scaleY - y;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  };


  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = startPoint.x * scaleX;
    const y = startPoint.y * scaleY;
    const width = (e.clientX - rect.left) * scaleX - x;
    const height = (e.clientY - rect.top) * scaleY - y;

    setTextBox({ x, y, width, height });
    setIsDrawing(false);
    setStartPoint(null);

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  };








  return (
    <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 min-h-screen pt-24 px-4">
      <h2 className="text-4xl font-bold text-orange-400 mb-10 text-center">📚 Studio Ebook</h2>



      {step === 0 && (
        <div className="w-full mx-auto px-4 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Créez votre chef-d'œuvre numérique</h2>
            <p className="text-xl text-gray-300">Commencez par nous en dire plus sur votre livre</p>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-orange-400 to-pink-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche - Prévisualisation */}
            <div className="lg:col-span-2">
              <div className="sticky top-4">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 h-[600px]">
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-orange-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="text-3xl font-bold text-white mb-3">
                        {titre || "Votre titre inspirant"}
                      </h3>
                      <p className="text-orange-400 mb-4 font-medium">
                        {categorie || "Catégorie"}
                      </p>
                      <p className="text-gray-400 line-clamp-3 max-w-lg mx-auto">
                        {description || "Une description captivante qui donne envie d'en savoir plus..."}
                      </p>
                      <div className="mt-8">
                        <span className="inline-block bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                          {prix ? `$${prix.toFixed(2)}` : "$--.--"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Colonne de droite - Formulaire */}
            <div className="space-y-6">
              {/* Section Titre */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiBook className="text-orange-400" />
                  Titre du livre
                </h3>
                <input
                  type="text"
                  placeholder="Donnez un titre percutant"
                  value={titre}
                  onChange={e => setTitre(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Section Catégorie & Langue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FiTag className="text-orange-400" />
                    Catégorie
                  </h3>
                  <select
                    value={categorie}
                    onChange={e => setCategorie(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Choisissez une catégorie</option>
                    <option value="Business">Business</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Développement personnel">Développement personnel</option>
                    <option value="Science">Science</option>
                    <option value="Technologie">Technologie</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Psychologie">Psychologie</option>
                    <option value="Philosophie">Philosophie</option>
                    <option value="Éducation">Éducation</option>
                    <option value="Histoire">Histoire</option>
                    <option value="Biographie">Biographie</option>
                    <option value="Autobiographie">Autobiographie</option>
                    <option value="Santé">Santé</option>
                    <option value="Bien-être">Bien-être</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Voyage">Voyage</option>
                    <option value="Arts">Arts</option>
                    <option value="Musique">Musique</option>
                    <option value="Poésie">Poésie</option>
                    <option value="Religion">Religion</option>
                    <option value="Spiritualité">Spiritualité</option>
                    <option value="Politique">Politique</option>
                    <option value="Économie">Économie</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Romans policiers">Romans policiers</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Science-fiction">Science-fiction</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Romance">Romance</option>
                    <option value="Jeunesse">Jeunesse</option>
                    <option value="Enfants">Enfants</option>
                    <option value="BD/Manga">BD/Manga</option>
                    <option value="Humour">Humour</option>
                    <option value="Sports">Sports</option>
                    <option value="Animaux">Animaux</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FiGlobe className="text-orange-400" />
                    Langue
                  </h3>
                  <select
                    value={langue}
                    onChange={e => setLangue(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>

              {/* Section Description */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiAlignLeft className="text-orange-400" />
                  Description
                </h3>
                <textarea
                  placeholder="Décrivez l'essence de votre livre..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Section Prix */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiDollarSign className="text-orange-400" />
                  Prix
                </h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">$</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={prix}
                    onChange={e => setPrix(parseFloat(e.target.value))}
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-8 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Section Options */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiSettings className="text-orange-400" />
                  Options supplémentaires
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      id: 'option-affiliation',
                      label: 'Affiliation',
                      checked: investmentOptions.affiliation,
                      key: 'affiliation',
                      description: 'Permet de gagner des commissions en recommandant votre ebook via des liens d\'affiliation'
                    },
                    {
                      id: 'option-sponsoring',
                      label: 'Sponsoring',
                      checked: investmentOptions.sponsoring,
                      key: 'sponsoring',
                      description: 'Permet d\'accepter des sponsors pour votre ebook'
                    },
                    {
                      id: 'option-licence',
                      label: 'Licence',
                      checked: investmentOptions.licence,
                      key: 'licence',
                      description: 'Ajoute des options de licence pour l\'utilisation de votre ebook'
                    },
                    {
                      id: 'option-codePromo',
                      label: 'Code promo',
                      checked: investmentOptions.codePromo,
                      key: 'codePromo',
                      description: 'Permet de créer et gérer des codes promo pour votre ebook'
                    }

                  ].map((option) => (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center">
                        <button
                          onClick={() => setInvestmentOptions({ ...investmentOptions, [option.key]: !option.checked })}
                          className={`w-5 h-5 rounded-md mr-3 flex items-center justify-center transition-all ${option.checked ? 'bg-orange-500 text-white' : 'bg-gray-600 text-transparent border border-gray-500'}`}
                        >
                          <FiCheck className="text-xs" />
                        </button>
                        <label htmlFor={option.id} className="text-gray-300 cursor-pointer flex-1">
                          {option.label}
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({
                              isOpen: true,
                              title: option.label,
                              content: option.description
                            });
                          }}
                          className="text-gray-500 hover:text-orange-400 ml-2"
                        >
                          <FiInfo className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Montant de licence si activé */}
                      {option.key === 'licence' && investmentOptions.licence && (
                        <div className="ml-8">
                          <label className="block text-sm text-gray-300 mb-1">Montant de la licence ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Entrez un montant"
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            onChange={(e) =>
                              setInvestmentOptions(prev => ({
                                ...prev,
                                licenceMontant: parseFloat(e.target.value)
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>

                  ))}
                </div>

              </div>

              {/* Modal d'information */}
              {modal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                  <div className="relative bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-5 text-white">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">{modal.title}</h3>
                        <button
                          onClick={() => setModal({ ...modal, isOpen: false })}
                          className="text-white hover:text-gray-200 focus:outline-none"
                        >
                          <FiX className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                      <p className="text-gray-300 leading-relaxed">{modal.content}</p>
                    </div>
                    <div className="flex justify-end p-4 bg-gray-700/50 border-t border-gray-700">
                      <button
                        onClick={() => setModal({ ...modal, isOpen: false })}
                        className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg hover:from-orange-600 hover:to-pink-700 transition-all shadow-md"
                      >
                        Compris
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons navigation */}
              <div className="flex justify-between gap-4 pt-4 mb-5">
                <button
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-300"
                >
                  <FiArrowLeft />
                  Retour
                </button>
                <button
                  onClick={nextStep}
                  disabled={!titre || !categorie || !prix || !description}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-bold transition-all duration-300 ${!titre || !categorie || !prix || !description ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02]'}`}
                >
                  Continuer
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {step === 1 && (
        <div className="w-full mx-auto px-4 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ajoutez une couverture attrayante</h2>
            <p className="text-xl text-gray-300">Une belle image augmentera l'attractivité de votre ebook</p>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-orange-400 to-pink-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche - Prévisualisation */}
            <div className="lg:col-span-2">
              <div className="sticky top-4">
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                  <div className="flex flex-col items-center justify-center">
                    {/* Zone de drag & drop premium */}
                    <label
                      htmlFor="cover-upload"
                      className={`w-full rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all mb-6
                  ${coverPreview ? 'border-0' : 'border-2 border-dashed border-gray-600 hover:border-orange-400 hover:bg-gray-700/50 h-64'}`}
                    >
                      {coverPreview ? (
                        <div className=" w-full group">
                          <img
                            src={coverPreview}
                            alt="Preview"
                            className="w-full max-h-[500px] object-contain rounded-lg border border-gray-700 shadow-lg"
                          />
                          <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all rounded-lg">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium bg-black/70 px-4 py-2 rounded-full flex items-center gap-2">
                              <FiRefreshCw className="w-4 h-4" />
                              Changer l'image
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <FiUploadCloud className="h-16 w-16 text-gray-500 mb-4" />
                          <p className="text-gray-400 text-center px-4">
                            <span className="font-medium text-orange-400">Cliquez pour uploader</span> ou glissez-déposez une image
                          </p>
                          <p className="text-sm text-gray-500 mt-2">Formats supportés: JPG, PNG (Max. 5MB)</p>
                          <p className="text-xs text-gray-600 mt-1">Format recommandé : 1200×1800 px</p>
                        </>
                      )}
                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert("❌ Le fichier est trop volumineux (max 5MB)");
                              return;
                            }
                            setCoverFile(file);
                            setCoverPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne de droite - Options */}
            <div className="space-y-6">
              {/* Section Instructions */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiInfo className="text-orange-400" />
                  Conseils pour votre couverture
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Utilisez une image haute résolution (min. 1200×1800 px)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Choisissez une image avec un contraste élevé pour le texte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Évitez les images trop chargées qui distraient du titre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Assurez-vous d'avoir les droits d'utilisation de l'image</span>
                  </li>
                </ul>
              </div>

              {/* Section Actions */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiUpload className="text-orange-400" />
                  Actions
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={async () => {
                      if (!coverFile) return alert("❌ Veuillez sélectionner une image d'abord.");

                      const formData = new FormData();
                      formData.append('file', coverFile);

                      try {
                        const res = await axios.post(`${AppURL}/api/ebooks/uploadCover`, formData, {
                          headers: { 'Content-Type': 'multipart/form-data' },
                        });

                        if (res.data.success) {
                          setCoverPath(res.data.path);
                          toast.success("✅ Couverture uploadée avec succès!");
                        } else {
                          toast.error("❌ Erreur lors de l'upload");
                        }
                      } catch (error) {
                        console.error(error);
                        toast.error("❌ Erreur serveur lors de l'upload");
                      }
                    }}
                    disabled={!coverFile}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${coverFile
                      ? 'bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white shadow-lg hover:shadow-orange-500/30'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                  >
                    <FiSave className="w-5 h-5" />
                    Sauvegarder la couverture
                  </button>

                  <button
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                      setCoverPath(null);
                    }}
                    disabled={!coverPreview}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${coverPreview
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                  >
                    <FiTrash2 className="w-5 h-5" />
                    Supprimer l'image
                  </button>
                </div>
              </div>



              {/* Boutons navigation */}
              <div className="flex justify-between gap-4 pt-4">
                <button
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-300"
                >
                  <FiArrowLeft />
                  Retour
                </button>
                <button
                  onClick={nextStep}
                  disabled={!coverPath}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-bold transition-all duration-300 ${coverPath
                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02]'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                  Continuer
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Step 2 - Personnalisation - Version premium full width */}
      {step === 2 && (
        <div className="w-full  mx-auto px-4 lg:px-8 ">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Personnalisez votre couverture</h2>
            <p className="text-xl text-gray-300">Choisissez le style parfait pour votre ebook</p>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-orange-400 to-pink-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche - Prévisualisation */}
            <div className="lg:col-span-2">
              <div className="sticky top-4">
                {coverId && (
                  <div className="mb-8 text-center">
                    <div className="relative inline-block w-full max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden border-4 border-white/10 transition-all duration-500 hover:shadow-orange-500/30">
                      <div className="relative aspect-[2/3] w-full">
                        <img
                          src={`${AppURL}${templates.find(t => t._id === coverId)?.imageUrl}`}
                          alt="Preview"
                          className="w-full h-full"
                        />
                        {/* Zone de texte interactive */}
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={900}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onTouchStart={handleTouchStartCanvas}   // ✅ Ajout
                          onTouchMove={handleTouchMoveCanvas}     // ✅ Ajout
                          onTouchEnd={handleTouchEndCanvas}       // ✅ Ajout
                          className="absolute top-0 left-0 w-full h-full cursor-move"
                          style={{ backgroundColor: 'transparent', touchAction: 'none' }} // ⛔ Empêche scroll/zoom natif
                        />
                        {textBox && canvasRef.current && (() => {
                          const rect = canvasRef.current.getBoundingClientRect();
                          const scaleX = canvasRef.current.width / rect.width;
                          const scaleY = canvasRef.current.height / rect.height;



                          const currentStyle = selectedWritingStyle || writingStyles[0];

                          return (
                            <div
                              className="absolute bg-black/30 backdrop-blur-sm rounded-xl p-4 overflow-hidden transition-all duration-200 border-2 border-white/20 hover:border-orange-400"
                              style={{
                                left: textBox.x / scaleX,
                                top: textBox.y / scaleY,
                                width: textBox.width / scaleX,
                                height: textBox.height / scaleY,
                                color: paletteId ? colorPalettes.find(p => p.id === paletteId)?.colors[0] : '#ffffff',
                                fontSize: `${fontSize}px`,
                                fontFamily: currentStyle.fontFamily,
                                fontStyle: currentStyle.fontStyle,
                                fontWeight: textWeight,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                wordWrap: 'break-word',
                                whiteSpace: 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                lineHeight: 1.2,
                              }}
                            >
                              {titre || "Votre texte ici"}
                            </div>
                          );
                        })()}


                      </div>
                    </div>
                    <p className="text-gray-400 mt-3 text-sm flex items-center justify-center gap-2">
                      <FiMove className="text-orange-400" />
                      Glissez-déposez pour positionner le texte
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne de droite - Options */}
            <div className="space-y-6">
              {/* Section Templates */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiLayout className="text-orange-400" />
                  Modèles de couverture
                </h3>
                <div className="max-h-96 overflow-y-auto"> {/* ⬅️ Conteneur scrollable avec hauteur max */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {templates.map(t => (
                      <div
                        key={t._id}
                        onClick={() => setCoverId(t._id)}
                        className={`aspect-[3/4] rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${coverId === t._id ? 'ring-2 ring-orange-400 scale-105' : 'hover:scale-105'} cursor-pointer relative`}
                      >
                        <img
                          src={`${AppURL}${t.imageUrl}`}
                          alt={t.titre}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {coverId === t._id && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <FiCheckCircle className="text-orange-400 text-3xl" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Section Couleurs */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiDroplet className="text-orange-400" />
                  Couleur du texte
                </h3>
                <div className="max-h-96 overflow-y-auto"> {/* ✅ Conteneur scrollable avec hauteur max */}
                  <div className="grid grid-cols-5 gap-3">
                    {colorPalettes.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setPaletteId(p.id)}
                        className={`aspect-square rounded-full transition-all duration-300 ${paletteId === p.id ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-gray-800 scale-110' : 'hover:scale-105'} shadow-md`}
                        style={{
                          background: p.colors.length > 1
                            ? `linear-gradient(135deg, ${p.colors.join(', ')})`
                            : p.colors[0]
                        }}
                        title={p.name}
                      >
                        {paletteId === p.id && (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            <FiCheck className="text-xs" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Section Taille police */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiType className="text-orange-400" />
                  Taille du texte
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400"
                  />
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Petit</span>
                    <span>Moyen</span>
                    <span>Grand</span>
                  </div>
                  <div className="text-center py-2 bg-gray-700/50 rounded-lg">
                    <span
                      className="font-bold"
                      style={{
                        fontSize: `${fontSize}px`,
                        color: paletteId ? colorPalettes.find(p => p.id === paletteId)?.colors[0] : '#ffffff'
                      }}
                    >
                      Exemple: {fontSize}px
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Style d'écriture */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaPenFancy className="text-orange-400" />
                  Style d'écriture
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'professionnel', label: 'Professionnel' },
                    { id: 'conversationnel', label: 'Conversationnel' },
                    { id: 'academique', label: 'Académique' },
                    { id: 'creatif', label: 'Créatif' },
                    { id: 'technique', label: 'Technique' },
                    { id: 'simple', label: 'Simple' },
                    { id: 'persuasif', label: 'Persuasif' },
                    { id: 'narratif', label: 'Narratif' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        const foundStyle = writingStyles.find(w => w.id === style.id);
                        if (foundStyle) setSelectedWritingStyle(foundStyle);
                      }}

                      className={`px-3 py-2 rounded-lg text-sm transition-all ${selectedWritingStyle.id === style.id
                        ? 'bg-orange-400 text-white font-bold'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Poids du texte */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiType className="text-orange-400" />
                  Apparence du texte
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTextWeight('normal')}
                    className={`flex-1 py-2 rounded-lg transition-all ${textWeight === 'normal'
                      ? 'bg-orange-400 text-white font-bold'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setTextWeight('bold')}
                    className={`flex-1 py-2 rounded-lg transition-all ${textWeight === 'bold'
                      ? 'bg-orange-400 text-white font-bold'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    Gras
                  </button>
                </div>
              </div>
              {/* Boutons navigation */}
              <div className="flex justify-between gap-4 pt-4 mb-8">
                <button
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-300"
                >
                  <FiArrowLeft />
                  Retour
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-400 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                >
                  Continuer
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}





      {step === 3 && (
        <div className="w-full mx-auto px-4 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Création Manuelle</h2>
            <p className="text-xl text-gray-300">Importez votre fichier ou écrivez directement votre contenu</p>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-orange-400 to-pink-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche - Options */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Option Fichier (PDF/Word combiné) */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center ${(manualOption === 'pdf' || manualOption === 'word')
                      ? 'border-orange-400 bg-gray-700 scale-105'
                      : 'border-gray-600 hover:border-orange-400 hover:bg-gray-700/50'
                      }`}
                  >
                    <div className="bg-gray-700 p-4 rounded-full mb-4">
                      <div className="flex gap-2">
                        <FaFilePdf className="text-red-400 text-2xl" />
                        <FaFileWord className="text-blue-400 text-2xl" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Importer un fichier</h3>
                    <p className="text-gray-400 text-sm text-center">PDF ou Word (max. 20MB)</p>
                    {(manualOption === 'pdf' || manualOption === 'word') && (
                      <div className="mt-3 text-orange-400 font-medium flex items-center gap-1">
                        <FiCheckCircle /> Sélectionné
                      </div>
                    )}
                  </button>

                  {/* Option Texte */}
                  <button
                    onClick={() => setManualOption('text')}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center ${manualOption === 'text'
                      ? 'border-orange-400 bg-gray-700 scale-105'
                      : 'border-gray-600 hover:border-orange-400 hover:bg-gray-700/50'
                      }`}
                  >
                    <div className="bg-gray-700 p-4 rounded-full mb-4">
                      <FaKeyboard className="text-white text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Écrire manuellement</h3>
                    <p className="text-gray-400 text-sm text-center">Créez votre contenu directement</p>
                    {manualOption === 'text' && (
                      <div className="mt-3 text-orange-400 font-medium flex items-center gap-1">
                        <FiCheckCircle /> Sélectionné
                      </div>
                    )}
                  </button>

                  {/* Option Génération IA (Affiche formulaire) */}
                  <div className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center ${manualOption === 'ai'
                    ? 'border-orange-400 bg-gray-700 scale-105'
                    : 'border-gray-600 hover:border-orange-400 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setManualOption('ai')}
                  >
                    <div className="bg-gray-700 p-4 rounded-full mb-4">
                      <FaMagic className="text-purple-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Générer avec l’IA</h3>
                    <p className="text-gray-400 text-sm text-center">Laissez l’IA écrire pour vous</p>
                    {manualOption === 'ai' && (
                      <div className="mt-3 text-orange-400 font-medium flex items-center gap-1">
                        <FiCheckCircle /> Paramètres visibles
                      </div>
                    )}
                  </div>

                </div>

                {manualOption === 'ai' && (
                  <div className="mt-8 space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-1">Nombre de pages</label>
                      <input
                        type="number"
                        min="5"
                        max="500"
                        value={aiPageCount}
                        onChange={(e) => setAiPageCount(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-1">Détail complémentaire</label>
                      <textarea
                        rows={4}
                        placeholder="Ex : je veux un ton motivant, divisé en chapitres, etc."
                        value={aiExtraDetails}
                        onChange={(e) => setAiExtraDetails(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <button
                      onClick={handleAIGeneration}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-pink-700 transition-all"
                    >
                      <FaMagic className="animate-pulse" />
                      Lancer la génération avec l'IA
                    </button>
                  </div>
                )}


                {manualOption === 'text' && (
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-white font-medium">Votre texte</label>
                      <div className={`text-sm ${manualText.length < 200 ? 'text-orange-400' : 'text-gray-300'}`}>
                        {manualText.length} / 200 caractères minimum
                      </div>
                    </div>

                    {/* Barre d'outils markdown améliorée */}
                    <div className="flex flex-wrap gap-2 mb-3 bg-gray-700/50 p-3 rounded-lg">
                      {[
                        { tag: 'h1', label: 'Titre 1', icon: <FiType className="mr-1" /> },
                        { tag: 'h2', label: 'Titre 2', icon: <FiType className="mr-1" /> },
                        { tag: 'h3', label: 'Titre 3', icon: <FiType className="mr-1" /> },
                        { tag: 'b', label: 'Gras', icon: <FiBold className="mr-1" /> },
                        { tag: 'i', label: 'Italique', icon: <FiItalic className="mr-1" /> },
                        { tag: 'u', label: 'Souligné', icon: <FiUnderline className="mr-1" /> },

                      ].map(({ tag, label, icon }) => (
                        <button
                          key={tag}
                          onClick={() => wrapSelectionWithTag(tag)}
                          className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-all ${activeTags.includes(tag)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white'
                            }`}
                        >
                          {icon}
                          {label}
                        </button>
                      ))}

                      <input
                        type="color"
                        onChange={(e) => document.execCommand('foreColor', false, e.target.value)}
                        className="w-8 h-8 p-0 border-none bg-gray-600 rounded cursor-pointer"
                      />
                    </div>

                    {/* Zone de texte contenteditable */}
                    <div
                      id="manualTextEditor"
                      ref={editorRef}
                      contentEditable
                      onInput={(e) => setManualText(e.currentTarget.innerHTML)}
                      className="w-full px-5 py-4 rounded-xl border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all min-h-[200px] outline-none bg-gray-700 text-white"
                    >
                    </div>


                    <div className="mt-2 text-sm text-gray-400">
                      Astuce : Sélectionnez un texte puis cliquez sur les boutons pour styliser.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne de droite - Aide et Prévisualisation */}
            <div className="space-y-6">
              {/* Section Aide */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiHelpCircle className="text-orange-400" />
                  Conseils de rédaction
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Structurez votre contenu avec des titres (H1, H2, H3)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Utilisez des listes pour les points importants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Mettez en valeur les termes clés en gras</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                    <span>200 caractères minimum pour une bonne qualité</span>
                  </li>
                </ul>
              </div>



              {/* Bouton de génération */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <button
                  onClick={handleSubmit}
                  disabled={manualOption === 'text' && (!manualText || manualText.length < 200)}
                  className={`w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${(manualOption === 'text' && (!manualText || manualText.length < 200))
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-[1.02]'
                    }`}
                >
                  <FaMagic className="animate-pulse" />
                  Générer mon ebook
                </button>

                {manualOption === 'text' && manualText.length < 200 && (
                  <div className="mt-3 text-center text-orange-400 text-sm">
                    Le texte doit contenir au moins 200 caractères
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Boutons navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-300"
            >
              <FiArrowLeft />
              Retour
            </button>
          </div>

          {/* Input file caché */}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            ref={fileInputRef}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.type === 'application/pdf') {
                  setManualOption('pdf');
                } else if (
                  file.type === 'application/msword' ||
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ) {
                  setManualOption('word');
                }
              }
              await handleFileUpload(e);
            }}
            className="hidden"
          />
        </div>
      )}

      {step === 4 && (
        <div className="w-full mx-auto px-4 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-600 p-3 rounded-full shadow-lg mb-6">
              <FaBookOpen className="text-white text-3xl" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Votre ebook est prêt !</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Félicitations ! Visualisez votre création en plein écran ou explorez les pages ci-dessous.
            </p>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-orange-400 to-pink-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche - Aperçu et actions */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                {/* Bouton de visionnage */}
                <div className="flex justify-center mb-8">
                  <button
                    onClick={() => setShowFullscreenViewer(true)}
                    className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2 animate-bounce"
                  >
                    <FaExpand className="text-lg" />
                    Voir en plein écran
                  </button>
                </div>

                {/* Galerie d'aperçu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {generatedFiles.slice(0, 4).map((file, index) => (
                    <div
                      key={index}
                      className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-700 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                      onClick={() => {
                        setShowFullscreenViewer(true);
                        setCurrentPage(index);
                      }}
                    >
                      <img
                        src={`${AppURL}${file}`}
                        alt={`Page ${index + 1}`}
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <span className="text-white font-medium">Page {index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Colonne de droite - Options */}
            <div className="space-y-6">

              {/* Section Actions */}
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiSettings className="text-orange-400" />
                  Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setStep(0)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <FaEdit />
                    Modifier
                  </button>

                  <button
                    onClick={() => handleDeleteBook(generatedBookId)}
                    disabled={!generatedBookId}
                    className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <FaTrash />
                    Supprimer
                  </button>


                  <button
                    onClick={() => {
                      const confirmed = window.confirm("⚠️ Une fois cette page quittée, vous ne pourrez plus modifier votre livre. Voulez-vous vraiment retourner à l'accueil ?");
                      if (confirmed) {
                        navigate('/dashboard')
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-pink-700 transition-all"
                  >
                    <FaHome />
                    Retour à l'accueil
                  </button>

                </div>
              </div>
            </div>
          </div>

          {/* Visionneuse plein écran */}
          {showFullscreenViewer && (
            <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
              {/* Bouton fermer */}
              <button
                onClick={() => setShowFullscreenViewer(false)}
                className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-orange-400 transition-all"
              >
                <FaTimes />
              </button>

              {/* Contrôles de navigation */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl z-10 hover:text-orange-400 transition-all"
                disabled={currentPage === 0}
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.min(generatedFiles.length - 1, prev + 1))}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl z-10 hover:text-orange-400 transition-all"
                disabled={currentPage === generatedFiles.length - 1}
              >
                <FaChevronRight />
              </button>

              {/* Affichage de la page actuelle */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={`${AppURL}${generatedFiles[currentPage]}`}
                  alt={`Page ${currentPage + 1}`}
                  className="max-w-full max-h-full object-contain"
                  draggable="false"
                />

                {/* Indicateur de page */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
                  Page {currentPage + 1} / {generatedFiles.length}
                </div>
              </div>

              {/* Navigation tactile (swipe) */}
              <div
                className="absolute inset-0"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
              ></div>
            </div>
          )}
        </div>
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-blue-900 to-blue-950 p-8 rounded-xl shadow-2xl border border-blue-700 max-w-md mx-4 text-center"
          >
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 flex items-center justify-center">
                <FaSpinner className="text-orange-400 text-xl" />
              </div>
            </div>
            <h3 className="text-white mt-6 text-xl font-bold">
              Traitement en cours...
            </h3>
            <p className="text-blue-200 mt-3">
              Votre demande est en cours de traitement. Merci de patienter quelques instants.
            </p>
            <div className="mt-6 h-1 w-full bg-blue-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </motion.div>
        </div>
      )}







    </div>




  );


};

export default StudioEbook;
