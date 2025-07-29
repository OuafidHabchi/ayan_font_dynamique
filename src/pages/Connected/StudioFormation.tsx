// StudioFormation.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiBook,
  FiUpload,
  FiSettings,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiInfo,
  FiX,
  FiType,
  FiBold,
  FiItalic,
  FiUnderline,
  FiCheckCircle,
  FiVideo,
  FiFileText,
  FiChevronDown,
  FiZoomIn,
  FiSave,
  // FiChevronDown
} from 'react-icons/fi';
import { categories } from '../../components/FormationData';
import axios from 'axios';
import AppURL from '../../components/AppUrl';
// import { useAuth } from "../../context/AuthContext";

import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

type FormationType = 'scolaire' | 'autre';

interface SousChapData {
  titre: string;
  video?: File | null;
  content?: string;
  fileContent?: File | null;
  images?: File[]; // Ajout pour les images
}

interface ChapData {
  titre: string;
  sousChapitres: SousChapData[];
  content?: string;
  video?: File | null;
}


const StudioFormation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const isEditing = location.state?.isEditing || false;
  const editingData = location.state?.formationData || null;
  const [chapitres, setChapitres] = useState<ChapData[]>([]);
  const [customChaps, setCustomChaps] = useState<ChapData[]>([]);
  // const [currentSousChapitre, setCurrentSousChapitre] = useState<number>(0);
  const [currentSubChap, setCurrentSubChap] = useState(0);



  const [programmes, setProgrammes] = useState<any[]>([]);

  const [step, setStep] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [type, setType] = useState<FormationType | ''>('');

  // Scolaire
  const [pays, setPays] = useState('');
  const [niveau, setNiveau] = useState('');
  const [sousNiveau, setSousNiveau] = useState('');
  const [matiere, setMatiere] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Ajoutez cet état en haut avec les autres états



  // Autre
  const [categorie, setCategorie] = useState('');
  const [titreFormation, setTitreFormation] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [expandedSubChapter, setExpandedSubChapter] = useState<string | null>(null);
  const [prix, setPrix] = useState<number | ''>('');

  // 🔁 Ajout pour les options d'investissement
  const [investmentOptions, setInvestmentOptions] = useState({
    affiliation: false,
    sponsoring: false,
    licence: false,
    codePromo: false,
    licenceMontant: 0
  });

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: '',
    content: ''
  });


  // Références et états pour l'éditeur
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRefs = useRef<Record<string, HTMLDivElement | null>>({});



  useEffect(() => {
    if (isEditing && editingData) {
      setType(editingData.type);
      setPrix(editingData.prix || '');
      setCoverImage(null); // Tu ne peux pas prévisualiser un File, sauf si tu refais le fetch du fichier d’origine

      // Pour type scolaire
      if (editingData.type === 'scolaire') {
        setPays(editingData.pays || '');
        setNiveau(editingData.niveau || '');
        setSousNiveau(editingData.sousNiveau || '');
        setMatiere(editingData.matiere || '');
        setChapitres(editingData.chapitres || []);
      } else {
        setCategorie(editingData.categorie || '');
        setTitreFormation(editingData.titreFormation || '');
        setCustomChaps(editingData.chapitres || []);
      }

      setInvestmentOptions({
        affiliation: editingData.investmentOptions?.affiliation || false,
        sponsoring: editingData.investmentOptions?.sponsoring || false,
        licence: editingData.investmentOptions?.licence || false,
        codePromo: editingData.investmentOptions?.codePromo || false,
        licenceMontant: editingData.investmentOptions?.licenceMontant || 0,


      });
    }
  }, [isEditing, editingData]);



  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await axios.get(`${AppURL}/api/programmes/getAll`);
        setProgrammes(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des programmes :", err);
      }
    };

    fetchProgrammes();
  }, []);



  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

      const tags: string[] = [];
      // const range = selection.getRangeAt(0);
      let node = selection.anchorNode as HTMLElement | null;

      while (node && node.nodeType === 1 && node.nodeName !== "BODY") {
        const tag = node.tagName.toLowerCase();
        if (['b', 'strong', 'i', 'em', 'u'].includes(tag) && !tags.includes(tag)) {
          tags.push(tag);
        }

        const style = window.getComputedStyle(node);
        if (style.fontWeight === '700' && !tags.includes('b')) tags.push('b');
        if (style.fontStyle === 'italic' && !tags.includes('i')) tags.push('i');
        if (style.textDecoration.includes('underline') && !tags.includes('u')) tags.push('u');

        node = node.parentElement;
      }

      setActiveTags(tags);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);






  useEffect(() => {
    const editorKey = `editor-${type === 'scolaire' ? 'scolaire' : 'custom'}-${currentSubChap}`;
    const editor = editorRefs.current[editorKey];

    if (!editor) return;

    // Ne pas mettre à jour si le contenu est identique
    const currentContent = type === 'scolaire'
      ? chapitres[currentChapter]?.sousChapitres?.[currentSubChap]?.content || ''
      : customChaps[currentChapter]?.sousChapitres?.[currentSubChap]?.content || '';

    // Sauvegarder la position du curseur
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const isEditorFocused = document.activeElement === editor;
    const savedRange = isEditorFocused && range ? {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset,
    } : null;

    // Mettre à jour seulement si nécessaire
    if (editor.innerHTML !== currentContent) {
      editor.innerHTML = currentContent;
    }

    // Restaurer la position du curseur
    if (savedRange && isEditorFocused) {
      try {
        const newRange = document.createRange();
        newRange.setStart(savedRange.startContainer, savedRange.startOffset);
        newRange.setEnd(savedRange.endContainer, savedRange.endOffset);

        selection?.removeAllRanges();
        selection?.addRange(newRange);

        // Forcer le scroll vers la position du curseur
        const rect = newRange.getBoundingClientRect();
        editor.scrollTop += rect.top - (editor.clientHeight / 2);
      } catch (err) {
        console.warn("Could not restore selection:", err);
      }
    }
  }, [currentChapter, currentSubChap, type, chapitres, customChaps]);




  // Ajoutez ce useEffect pour styliser les images dans l'éditeur
  useEffect(() => {
    const styleImagesInEditors = () => {
      Object.keys(editorRefs.current).forEach(key => {
        const editor = editorRefs.current[key];
        if (editor) {
          const images = editor.getElementsByTagName('img');
          Array.from(images).forEach(img => {
            img.style.maxWidth = '80%';
            img.style.height = 'auto';
            img.style.maxHeight = '12rem';
            img.style.display = 'block';
            img.style.margin = '1rem auto';
            img.style.border = '1px solid #6b7280';
            img.style.borderRadius = '0.5rem';
            img.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          });
        }
      });
    };

    // Exécuter au chargement et après chaque mise à jour du contenu
    styleImagesInEditors();
  }, [currentChapter, currentSubChap, chapitres, customChaps]);



  // Modifiez votre gestionnaire d'input comme ceci :
  const handleEditorInput = useCallback((
    e: React.FormEvent<HTMLDivElement>,
    chapIndex: number,
    subChapIndex: number,
    isCustom: boolean
  ) => {
    const content = e.currentTarget.innerHTML;

    // Utiliser requestAnimationFrame pour éviter les conflits avec React
    requestAnimationFrame(() => {
      if (isCustom) {
        setCustomChaps(prev => {
          const updated = [...prev];
          if (!updated[chapIndex]?.sousChapitres?.[subChapIndex]) return prev;

          updated[chapIndex].sousChapitres = [...updated[chapIndex].sousChapitres];
          updated[chapIndex].sousChapitres[subChapIndex] = {
            ...updated[chapIndex].sousChapitres[subChapIndex],
            content
          };
          return updated;
        });
      } else {
        setChapitres(prev => {
          const updated = [...prev];
          if (!updated[chapIndex]?.sousChapitres?.[subChapIndex]) return prev;

          updated[chapIndex].sousChapitres = [...updated[chapIndex].sousChapitres];
          updated[chapIndex].sousChapitres[subChapIndex] = {
            ...updated[chapIndex].sousChapitres[subChapIndex],
            content
          };
          return updated;
        });
      }
    });
  }, []);



  const handleSubChapChange = (
    chapIndex: number,
    subChapIndex: number,
    field: keyof SousChapData,
    value: any
  ) => {
    setCustomChaps(prev => {
      const updated = [...prev];
      const sousChaps = [...(updated[chapIndex].sousChapitres || [])];
      sousChaps[subChapIndex] = { ...sousChaps[subChapIndex], [field]: value };
      updated[chapIndex].sousChapitres = sousChaps;
      return updated;
    });
  };




  const removeSousChap = (chapIndex: number, subChapIndex: number) => {
    setCustomChaps(prev => {
      const updated = [...prev];
      const sousChaps = [...(updated[chapIndex].sousChapitres || [])];
      sousChaps.splice(subChapIndex, 1);
      updated[chapIndex].sousChapitres = sousChaps;
      return updated;
    });
  };






  // Étapes
  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  // Lorsqu'on choisit la matière
  const initChapitres = () => {
    const selected = programmes.find(p =>
      p.pays === pays &&
      p.niveau === niveau &&
      p.sousNiveau === sousNiveau &&
      p.matiere === matiere
    );

    const titres = selected?.chapitres || [];
    setChapitres(titres.map((t: any) => ({
      titre: t,
      sousChapitres: [{
        titre: 'Sous‑chapitre 1',
        content: '',
        video: null,
        fileContent: null
      }]
    })));
  };

  const handleCustomChap = (idx: number, field: keyof ChapData, value: any) => {
    setCustomChaps(prev => {
      const newChapitres = [...prev];
      newChapitres[idx] = { ...newChapitres[idx], [field]: value };
      return newChapitres;
    });
  };

  const addCustomChap = () => {
    setCustomChaps(prev => [
      ...prev,
      {
        titre: `Chapitre ${prev.length + 1}`,
        sousChapitres: [] // Retirez le sous-chapitre par défaut ici
      }
    ]);
    setCurrentChapter(customChaps.length);
  };


  const removeCustomChap = (idx: number) => {
    setCustomChaps(prev => prev.filter((_, i) => i !== idx));
    setCurrentChapter(Math.max(0, idx - 1));
  };

  const addSousChapitre = (chapIndex: number) => {
    console.log('Adding subchapter to:', type === 'scolaire' ? 'chapitres' : 'customChaps');

    const newSousChap = {
      titre: `Sous-chapitre ${type === 'scolaire'
        ? (chapitres[chapIndex]?.sousChapitres?.length || 0) + 1
        : (customChaps[chapIndex]?.sousChapitres?.length || 0) + 1}`,
      content: '',
      video: null,
      images: []
    };

    if (type === 'scolaire') {
      setChapitres(prev => {
        const updated = [...prev];
        updated[chapIndex] = {
          ...updated[chapIndex],
          sousChapitres: [...(updated[chapIndex].sousChapitres || []), newSousChap]
        };
        return updated;
      });
    } else {
      setCustomChaps(prev => {
        const updated = [...prev];
        updated[chapIndex] = {
          ...updated[chapIndex],
          sousChapitres: [...(updated[chapIndex].sousChapitres || []), newSousChap]
        };
        return updated;
      });
    }

    // Mettre à jour l'index du sous-chapitre courant
    const newSubChapIndex = type === 'scolaire'
      ? (chapitres[chapIndex]?.sousChapitres?.length || 0)
      : (customChaps[chapIndex]?.sousChapitres?.length || 0);

    setCurrentSubChap(newSubChapIndex);
  };

  const handleSousChapitreChange = (
    chapIndex: number,
    subChapIndex: number,
    field: keyof SousChapData, // remplace ceci par le bon type de ton sous-chap
    value: any
  ) => {
    setChapitres(prev => {
      const updated = [...prev];
      const sousChaps = [...(updated[chapIndex].sousChapitres || [])];
      sousChaps[subChapIndex] = { ...sousChaps[subChapIndex], [field]: value };
      updated[chapIndex].sousChapitres = sousChaps;
      return updated;
    });
  };







  // Modifications pour le point 1 (affichage immédiat du contenu uploadé)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    chapIndex: number,
    subChapIndex: number,
    isCustom: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${AppURL}/api/ebooks/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        const content = res.data.text;
        const editorId = `editor-${isCustom ? 'custom' : 'scolaire'}-${subChapIndex}`;
        const editorElement = editorRefs.current[editorId];

        if (editorElement) {
          // Focus sur l'éditeur avant d'insérer le contenu
          editorElement.focus();
          editorElement.innerHTML = content;

          // Mettre à jour le state
          if (isCustom) {
            handleSubChapChange(chapIndex, subChapIndex, 'content', content);
          } else {
            handleSousChapitreChange(chapIndex, subChapIndex, 'content', content);
          }

          // Forcer le scroll vers le bas si le contenu est long
          setTimeout(() => {
            editorElement.scrollTop = editorElement.scrollHeight;
          }, 100);
        }

        toast.success("Contenu extrait avec succès !");
      } else {
        toast.error("Erreur lors de l'extraction du texte");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur serveur lors de l'upload");
    }
  };

  // Modifier la fonction wrapSelectionWithTag
  const wrapSelectionWithTag = useCallback((
    tagName: string,
    chapIndex: number,
    subChapIndex: number,
    isCustom: boolean
  ) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const editorId = `editor-${isCustom ? 'custom' : 'scolaire'}-${subChapIndex}`;
    const editor = document.getElementById(editorId);
    if (!editor || !editor.contains(selection.anchorNode)) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    let parentElement: HTMLElement | null = container instanceof HTMLElement
      ? container
      : container.parentElement;

    let alreadyStyled = false;
    while (parentElement && parentElement !== editor) {
      const tag = parentElement.tagName.toLowerCase();
      if (tag === tagName) {
        alreadyStyled = true;
        break;
      }
      parentElement = parentElement.parentElement;
    }

    if (alreadyStyled) {
      document.execCommand(`removeFormat`);
    } else {

      if (['h1', 'h2', 'h3'].includes(tagName)) {
        const content = selection.toString();
        const range = selection.getRangeAt(0);
        const newNode = document.createElement(tagName);
        newNode.textContent = content;
        range.deleteContents();
        range.insertNode(newNode);
      } else {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand(tagName === 'b' ? 'bold' :
          tagName === 'i' ? 'italic' :
            tagName === 'u' ? 'underline' : '', false);
      }

    }

    const updatedContent = editor.innerHTML;
    if (isCustom) {
      handleSubChapChange(chapIndex, subChapIndex, 'content', updatedContent);
    } else {
      handleSousChapitreChange(chapIndex, subChapIndex, 'content', updatedContent);
    }

    setTimeout(() => {
      const evt = new Event('selectionchange');
      document.dispatchEvent(evt);
    }, 0);
  }, [handleSubChapChange, handleSousChapitreChange]);




  const applyTextColor = (
    color: string,
    chapIndex: number,
    subChapIndex: number,
    isCustom: boolean
  ) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const editorId = `editor-${isCustom ? 'custom' : 'scolaire'}-${subChapIndex}`;
    const editor = document.getElementById(editorId);
    if (!editor) return;

    // Vérifier que la sélection est bien dans l'éditeur courant
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    // Sauvegarder la sélection avant modification

    const span = document.createElement('span');
    span.style.color = color;
    span.appendChild(range.extractContents());
    range.insertNode(span);

    // Restaurer la sélection dans le nouveau span
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);

    // Mettre à jour le state
    const newContent = editor.innerHTML;
    if (isCustom) {
      handleSubChapChange(chapIndex, subChapIndex, 'content', newContent);
    } else {
      handleSousChapitreChange(chapIndex, subChapIndex, 'content', newContent);
    }
  };


  // const insertImagePlaceholder = (
  //   imageId: string,
  //   editorRef: HTMLDivElement,
  //   onUpdate: (html: string) => void
  // ) => {
  //   const selection = window.getSelection();
  //   if (!selection || !selection.rangeCount) return;

  //   const range = selection.getRangeAt(0);
  //   range.deleteContents();

  //   const node = document.createTextNode(`[image:${imageId}]`);
  //   range.insertNode(node);

  //   // Avancer le curseur après l'élément
  //   range.setStartAfter(node);
  //   range.setEndAfter(node);
  //   selection.removeAllRanges();
  //   selection.addRange(range);

  //   const updatedHtml = editorRef.innerHTML;
  //   onUpdate(updatedHtml);
  // };

  const renderContentWithImages = (
    html: string,
    images: (File | string)[],
    // chapter: number,
    // subChap: number
  ): string => {
    return html.replace(/\[image:(.*?)\]/g, (_, imageId) => {
      const parts = imageId.split('-');
      const imgIndex = Number(parts[3]); // dernier élément = index dans le tableau

      const image = images?.[imgIndex];
      if (!image) return `<div class="text-red-500">Image introuvable: ${imageId}</div>`;

      const src = image instanceof File ? URL.createObjectURL(image) : `${AppURL}${image}`;

      return `<img src="${src}" alt="illustration" class="my-4 rounded shadow w-[200px] h-[120px] object-contain mx-auto" />`;
    });
  };


  const allChaptersHaveSubChaps = () => {
    const source = type === 'scolaire' ? chapitres : customChaps;
    return source.every(chap =>
      chap.sousChapitres &&
      chap.sousChapitres.some(sub =>
        (sub.content && sub.content.trim() !== '') ||
        sub.video ||
        (sub.images && sub.images.length > 0)
      )
    );
  };




  const handleFinish = async () => {
    setIsSubmitting(true);

    try {
      const isUpdate = Boolean(editingData);

      const formationPayload = {
        auteur: user?.id,
        type,
        prix,
        investmentOptions,
        ...(type === 'scolaire'
          ? { pays, niveau, sousNiveau, matiere, chapitres }
          : { categorie, titreFormation, chapitres: customChaps }),
        ...(isUpdate && { id: editingData._id })
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(formationPayload));

      // Ajouter la cover image si présente
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      // Ajouter les vidéos et images de chaque sous-chapitre
      const chapters = type === 'scolaire' ? chapitres : customChaps;

      chapters.forEach((chap, chapIndex) => {
        chap.sousChapitres.forEach((sub, subIndex) => {
          if (sub.video && sub.video instanceof File) {
            formData.append(`video-${chapIndex}-${subIndex}`, sub.video);
          }

          if (sub.images && Array.isArray(sub.images)) {
            sub.images.forEach((img, imgIndex) => {
              if (img instanceof File) {
                formData.append(`image-${chapIndex}-${subIndex}-${imgIndex}`, img);
              }
            });
          }
        });
      });

      const endpoint = isUpdate
        ? `${AppURL}/api/StudioFormationRoutes/update`
        : `${AppURL}/api/StudioFormationRoutes/create`;

      // console.log("📦 Données envoyées au backend :");
      // console.log("Payload JSON :", formationPayload);
      // console.log("Cover image :", coverImage);
      // console.log("endpoint:", endpoint);


      // chapters.forEach((chap, chapIndex) => {
      //   chap.sousChapitres.forEach((sub, subIndex) => {
      //     console.log(`Chapitre ${chapIndex} - Sous-chapitre ${subIndex} :`);
      //     console.log("  Titre :", sub.titre);
      //     console.log("  Contenu HTML :", sub.content?.slice(0, 100) + '...');
      //     console.log("  Vidéo :", sub.video instanceof File ? sub.video.name : sub.video);
      //     if (sub.images && sub.images.length > 0) {
      //       sub.images.forEach((img, imgIdx) => {
      //         console.log(`  Image ${imgIdx} :`, img instanceof File ? img.name : img);
      //       });
      //     }
      //   });
      // });


      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(isUpdate ? "Formation mise à jour avec succès" : "Formation créée avec succès");
        navigate('/dashboard');
      } else {
        throw new Error('Erreur lors de la soumission');
      }

    } catch (error) {
      console.error('❌ Erreur lors de la soumission :', error);
      toast.error('Erreur lors de la création/mise à jour de la formation');
    } finally {
      setIsSubmitting(false);
    }
  };





  return (
    <div className="px-4 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 min-h-screen pt-24">
      <h2 className="text-3xl md:text-4xl font-bold text-orange-400 mb-8 text-center">
        🎓 {isEditing ? 'Édition de formation' : 'Création de formation'}
      </h2>

      {step === 0 && (
        <div className=" mx-auto bg-gray-800/80 p-8 rounded-xl space-y-6 shadow-xl border border-gray-700/50">
          <h3 className="text-xl text-white font-bold flex items-center gap-2">
            <FiBook className="text-orange-400" />
            Type de formation
          </h3>
          {(['scolaire', 'autre'] as FormationType[]).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`w-full text-left px-6 py-4 rounded-lg transition-all flex items-center gap-3
                ${type === t
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md'
                }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${type === t ? 'bg-white text-orange-500' : 'bg-gray-500'}`}>
                {type === t && <FiCheck size={14} />}
              </div>
              <span className="font-medium">
                {t === 'scolaire' ? 'Formation scolaire' : 'Autre type de formation'}
              </span>
            </button>
          ))}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-700/50">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-400 hover:text-white transition-all flex items-center gap-2"
            >
              <FiArrowLeft /> Annuler
            </button>
            <button
              onClick={next}
              disabled={!type}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all
                ${!type
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                }`}
            >
              Suivant <FiArrowRight />
            </button>
          </div>
        </div>
      )}


      {step === 1 && (
        <div className="mx-auto bg-gray-800/80 p-8 rounded-xl space-y-6 shadow-xl border border-gray-700/50">
          <h3 className="text-xl text-white font-bold flex items-center gap-2">
            <FiSettings className="text-orange-400" />
            Tarification et investissement
          </h3>

          <div>
            <label className="text-gray-300 text-sm">Prix de la formation ($ CAD)</label>
            <input
              type="number"
              min={0}
              placeholder="Ex: 19.99"
              value={prix}
              onChange={e => setPrix(Number(e.target.value))}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white"
            />
          </div>

          <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600/50">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <FiSettings className="text-orange-400" />
              Options d'investissement
            </h3>
            <div className="space-y-4">
              {[
                {
                  id: 'affiliation',
                  label: 'Affiliation',
                  description: 'Permet de gagner des commissions en recommandant votre formation via des liens.'
                },
                {
                  id: 'sponsoring',
                  label: 'Sponsoring',
                  description: "Permet d'accepter des sponsors pour votre formation."
                },
                {
                  id: 'licence',
                  label: 'Licence',
                  description: "Ajoute des options de licence pour l'utilisation ou revente."
                },
                {
                  id: 'codePromo',
                  label: 'Code promo',
                  description: "Permet d'appliquer des réductions personnalisées."
                },
              ].map(({ id, label, description }) => (
                <div key={id} className="space-y-2">
                  <div className="flex items-center">
                    <button
                      onClick={() => setInvestmentOptions(prev => ({ ...prev, [id]: !prev[id as keyof typeof prev] }))}
                      className={`w-5 h-5 rounded-md mr-3 flex items-center justify-center transition-all ${investmentOptions[id as keyof typeof investmentOptions]
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-600 text-transparent border border-gray-500'
                        }`}
                    >
                      <FiCheck className="text-xs" />
                    </button>
                    <span className="text-white flex-1">{label}</span>
                    <button
                      onClick={() => setModal({ isOpen: true, title: label, content: description })}
                      className="text-gray-400 hover:text-orange-400 ml-2"
                    >
                      <FiInfo />
                    </button>
                  </div>

                  {id === 'licence' && investmentOptions.licence && (
                    <div className="ml-8 mt-2">
                      <label className="text-sm text-gray-300 mb-1 block">Montant de la licence ($ CAD)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Entrez un montant"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
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


          <div className="flex justify-between pt-6 mt-4 border-t border-gray-700/50">
            <button
              onClick={prev}
              className="px-4 py-2 text-gray-400 hover:text-white transition-all flex items-center gap-2"
            >
              <FiArrowLeft /> Retour
            </button>
            <button
              onClick={next}
              disabled={prix === ''}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${prix === ''
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                }`}
            >
              Suivant <FiArrowRight />
            </button>
          </div>
        </div>
      )}


      {step === 2 && (
        <div className="mx-auto bg-gray-800/80 p-8 rounded-xl space-y-6 shadow-xl border border-gray-700/50">
          <h3 className="text-xl text-white font-bold flex items-center gap-2">
            <FiUpload className="text-orange-400" />
            Photo de couverture
          </h3>

          <div className="space-y-4 text-white">
            <p>Importez une image qui représentera la couverture de votre formation.</p>

            <div className="flex flex-col items-center gap-4">
              <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2">
                <FiUpload />
                {coverImage ? coverImage.name : "Ajouter une image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setCoverImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              {(coverImage || (isEditing && editingData?.coverImage)) && (
                <img
                  src={
                    coverImage
                      ? URL.createObjectURL(coverImage)
                      : `${AppURL}${editingData.coverImage}`
                  }
                  alt="Aperçu couverture"
                  className="max-h-64 rounded-lg border border-gray-600 shadow"
                />
              )}

            </div>
          </div>

          <div className="flex justify-between pt-6 mt-4 border-t border-gray-700/50">
            <button
              onClick={prev}
              className="px-4 py-2 text-gray-400 hover:text-white transition-all flex items-center gap-2"
            >
              <FiArrowLeft /> Retour
            </button>
            <button
              onClick={next}
              disabled={!coverImage && !editingData?.coverImage}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${!coverImage && !editingData?.coverImage
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                }`}
            >
              Suivant <FiArrowRight />
            </button>
          </div>
        </div>
      )}



      {/* SCOLAIRE */}
      {type === 'scolaire' && step === 3 && (
        <div className="mx-auto bg-gray-800/80 p-8 rounded-xl space-y-6 shadow-xl border border-gray-700/50">
          <h3 className="text-xl text-white font-bold flex items-center gap-2">
            <FiSettings className="text-orange-400" />
            Informations pédagogiques
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-gray-300 text-sm">Pays</label>
              <select
                value={pays}
                onChange={e => setPays(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white"
              >
                <option value="">Sélectionnez un pays</option>
                {[...new Set(programmes.map(p => p.pays))].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 text-sm">Niveau</label>
              {/* Sélecteur de niveau */}
              <select
                value={niveau}
                onChange={e => {
                  setNiveau(e.target.value);
                  setSousNiveau('');
                  setMatiere('');
                }}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white"

              >
                <option value="">Sélectionnez un niveau</option>
                {[...new Set(programmes.filter(p => p.pays === pays).map(p => p.niveau))].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}

              </select>

            </div>

            {niveau && (
              <div className="space-y-1">
                <label className="text-gray-300 text-sm">Sous-niveau</label>
                {/* Sélecteur de sous-niveau */}
                {niveau && (
                  <select
                    value={sousNiveau}
                    onChange={e => {
                      setSousNiveau(e.target.value);
                      setMatiere('');

                    }}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white"

                  >
                    <option value="">Sélectionnez un sous-niveau</option>
                    {[...new Set(programmes.filter(p => p.pays === pays && p.niveau === niveau).map(p => p.sousNiveau))].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}

                  </select>
                )}
              </div>
            )}

            {sousNiveau && (
              <div className="space-y-1">
                <label className="text-gray-300 text-sm">Matière</label>
                {/* Sélecteur de matière */}
                {sousNiveau && (
                  <select
                    value={matiere}
                    onChange={e => setMatiere(e.target.value)}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white"

                  >
                    <option value="">Sélectionnez une matière</option>
                    {[...new Set(programmes.filter(p => p.pays === pays && p.niveau === niveau && p.sousNiveau === sousNiveau).map(p => p.matiere))].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}

                  </select>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6 mt-4 border-t border-gray-700/50">
            <button
              onClick={prev}
              className="px-4 py-2 text-gray-400 hover:text-white transition-all flex items-center gap-2"
            >
              <FiArrowLeft /> Retour
            </button>
            <button
              onClick={() => {
                if (!isEditing) initChapitres();
                next();
              }} disabled={!matiere}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all
                ${!matiere
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                }`}
            >
              Suivant <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-5 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{modal.title}</h3>
              <button
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="text-white hover:text-gray-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto text-gray-300">
              {modal.content}
            </div>
            <div className="flex justify-end p-4 bg-gray-700 border-t border-gray-600">
              <button
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}


      {/* AUTRE */}
      {type === 'autre' && step === 3 && (
        <div className="mx-auto bg-gray-800/80 p-8 rounded-xl space-y-6 shadow-xl border border-gray-700/50">
          <h3 className="text-xl text-white font-bold flex items-center gap-2">
            <FiSettings className="text-orange-400" />
            Informations générales
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm">Catégorie</label>
              <select
                value={categorie}
                onChange={e => setCategorie(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white"
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>


            <div>
              <label className="text-gray-300 text-sm">Titre de la formation</label>
              <input
                type="text"
                placeholder="Donnez un titre accrocheur"
                value={titreFormation}
                onChange={e => setTitreFormation(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white"
              />
            </div>
          </div>


          <div className="flex justify-between pt-6 mt-4 border-t border-gray-700/50">
            <button
              onClick={prev}
              className="px-4 py-2 text-gray-400 hover:text-white transition-all flex items-center gap-2"
            >
              <FiArrowLeft /> Retour
            </button>
            <button
              onClick={next}
              disabled={!categorie || !titreFormation}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all
                ${!categorie || !titreFormation
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                }`}
            >
              Suivant <FiArrowRight />
            </button>
          </div>
        </div>
      )}


      {step === 4 && (
        <div className="mx-auto bg-gray-800/80 p-6 rounded-xl shadow-xl border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-white font-bold flex items-center gap-2">
              <FiBook className="text-orange-400" />
              {type === 'scolaire' ? `Chapitres de ${matiere}` : 'Plan de cours personnalisé'}
            </h3>
            {type === 'autre' && (
              <button
                onClick={addCustomChap}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2"
              >
                <FiPlus /> Ajouter un chapitre
              </button>
            )}
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3 max-h-[500px] overflow-y-auto">
            {(type === 'scolaire' ? chapitres : customChaps).map((chap, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentChapter(idx)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-all flex justify-between items-center ${currentChapter === idx
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
              >
                {type === 'scolaire' ? (
                  <div className="truncate flex-1">{chap.titre}</div>
                ) : (
                  <input
                    type="text"
                    value={chap.titre}
                    onChange={(e) => handleCustomChap(idx, 'titre', e.target.value)}
                    className="flex-1 bg-transparent text-white focus:outline-none border-b border-gray-500 focus:border-orange-500 text-sm"
                    placeholder={`Chapitre ${idx + 1}`}
                  />
                )}
                {type === 'autre' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCustomChap(idx); }}
                    className="text-red-400 hover:text-red-300 ml-2"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-6 mt-6 border-t border-gray-700/50">
            <button
              onClick={prev}
              className="px-4 py-2 text-gray-400 hover:text-white flex items-center gap-2"
            >
              <FiArrowLeft /> Retour
            </button>
            <button
              onClick={next}
              disabled={
                (type === 'autre' && customChaps.length === 0) ||
                currentChapter === null || currentChapter < 0
              }
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${(type === 'autre' && customChaps.length === 0) ||
                currentChapter === null || currentChapter < 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                }`}
            >
              Suivant <FiArrowRight />
            </button>
          </div>
        </div>
      )}




      {step === 5 && (
        <div className="mx-auto bg-gray-800/80 p-6 rounded-xl shadow-xl border border-gray-700/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-white font-bold flex items-center gap-2">
              <FiBook className="text-orange-400" />
              {type === 'scolaire'
                ? `Contenu de ${chapitres[currentChapter]?.titre}`
                : `Plan de cours personnalisé pour ${customChaps[currentChapter]?.titre}`}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                addSousChapitre(currentChapter);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2"
            >
              <FiPlus /> Ajouter un sous-chapitre
            </button>
          </div>

          {(() => {
            const currentChap =
              type === 'scolaire' ? chapitres[currentChapter] : customChaps[currentChapter];
            const currentSousChaps = currentChap?.sousChapitres || [];
            const handleSubChange =
              type === 'scolaire' ? handleSousChapitreChange : handleSubChapChange;

            return currentSousChaps.length > 0 ? (
              <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-300px)]">
                {/* Colonne de gauche - Sous-chapitres et Images */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                  {/* Liste des sous-chapitres */}
                  <div className="bg-gray-700/50 rounded-lg p-3 flex-1 overflow-y-auto">
                    <h4 className="text-white font-medium mb-3">Sous-chapitres</h4>
                    {currentSousChaps.map((sub, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentSubChap(idx)}
                        className={`p-3 mb-2 rounded-lg cursor-pointer transition-all flex justify-between items-center ${currentSubChap === idx
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                      >
                        <div className="truncate flex-1 flex items-center gap-2">
                          <span>{sub.titre || `Sous-chapitre ${idx + 1}`}</span>
                          <div className="flex gap-1 text-sm">
                            {sub.content && <span title="Texte">📄</span>}
                            {sub.images && sub.images.length > 0 && <span title="Image(s)">🖼️</span>}
                            {sub.video && <span title="Vidéo">🎥</span>}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (type === 'scolaire') {
                              const newChap = [...chapitres];
                              newChap[currentChapter].sousChapitres.splice(idx, 1);
                              setChapitres(newChap);
                            } else {
                              removeSousChap(currentChapter, idx);
                            }
                            setCurrentSubChap(0);
                          }}
                          className="text-red-400 hover:text-red-300 ml-2"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Zone des images */}
                  <div className="bg-gray-700/50 rounded-lg p-3 h-64 lg:h-1/3 overflow-y-auto">
                    <h4 className="text-white font-medium mb-3">Images</h4>

                    {/* Upload images */}
                    <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 w-full mb-3">
                      <FiUpload />
                      Ajouter des images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const allImages = [
                            ...(currentSousChaps[currentSubChap]?.images || []),
                            ...files,
                          ];
                          handleSubChange(currentChapter, currentSubChap, 'images', allImages);
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Grid des images */}
                    <div className="grid grid-cols-2 gap-2">
                      {(currentSousChaps[currentSubChap]?.images || []).map((img, imgIdx) => {
                        // const imageId = `image-${currentChapter}-${currentSubChap}-${imgIdx}`;
                        return (
                          <div key={imgIdx} className="relative group border border-gray-600 rounded overflow-hidden">
                            <img
                              src={img instanceof File ? URL.createObjectURL(img) : `${AppURL}${img}`}
                              className="w-full h-24 object-cover"
                            />

                            {/* Bouton supprimer */}
                            <button
                              onClick={() => {
                                const updated = [...(currentSousChaps[currentSubChap]?.images || [])];
                                updated.splice(imgIdx, 1);
                                handleSubChange(currentChapter, currentSubChap, 'images', updated);
                              }}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <FiTrash2 size={12} />
                            </button>



                            {/* Bouton insérer */}
                            <button
                              onClick={() => {
                                const editorKey = `editor-${type === 'scolaire' ? 'scolaire' : 'custom'}-${currentSubChap}`;
                                const editor = editorRefs.current[editorKey];
                                if (!editor) return;

                                const selection = window.getSelection();
                                if (!selection || !selection.rangeCount) return;

                                const range = selection.getRangeAt(0);
                                range.deleteContents();

                                // ➕ Créer un placeholder texte unique
                                const imageId = `image-${currentChapter}-${currentSubChap}-${imgIdx}`;
                                const placeholder = document.createTextNode(`[image:${imageId}]`);

                                range.insertNode(placeholder);

                                // Repositionner le curseur après l’image
                                range.setStartAfter(placeholder);
                                range.setEndAfter(placeholder);
                                selection.removeAllRanges();
                                selection.addRange(range);

                                editor.focus();
                                placeholder.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

                                // Mettre à jour le contenu
                                const updatedHtml = editor.innerHTML;
                                if (type === 'scolaire') {
                                  handleSousChapitreChange(currentChapter, currentSubChap, 'content', updatedHtml);
                                } else {
                                  handleSubChapChange(currentChapter, currentSubChap, 'content', updatedHtml);
                                }
                              }}

                              className="absolute bottom-1 left-1 bg-orange-600 text-white text-xs px-2 py-1 rounded hover:bg-orange-700 shadow"
                            >
                              ➕ Insérer
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Colonne de droite - Contenu du sous-chapitre (pleine largeur sur mobile) */}
                <div className="w-full lg:w-2/3 bg-gray-700/30 rounded-lg p-6 overflow-y-auto">
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-2">Titre du sous-chapitre</label>
                    <input
                      type="text"
                      placeholder="Titre du sous-chapitre"
                      value={currentSousChaps[currentSubChap]?.titre || ''}
                      onChange={(e) =>
                        handleSubChange(currentChapter, currentSubChap, 'titre', e.target.value)
                      }
                      className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white mb-4"
                    />
                  </div>

                  {/* Vidéo */}
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm mb-2">Vidéo du sous-chapitre</label>
                    <div className="flex flex-col gap-3 w-full">
                      <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 w-fit">
                        <FiUpload />
                        {currentSousChaps[currentSubChap]?.video instanceof File
                          ? currentSousChaps[currentSubChap]?.video?.name
                          : currentSousChaps[currentSubChap]?.video
                            ? "Modifier la vidéo"
                            : "Ajouter une vidéo"}
                        <input
                          type="file"
                          accept="video/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const video = document.createElement('video');
                            video.preload = 'metadata';

                            video.onloadedmetadata = () => {
                              window.URL.revokeObjectURL(video.src);
                              if (video.duration > 900) {
                                toast.error("La vidéo dépasse 15 minutes.");
                              } else {
                                handleSubChange(currentChapter, currentSubChap, 'video', file);
                              }
                            };

                            video.src = URL.createObjectURL(file);
                          }}
                          className="hidden"
                        />
                      </label>

                      {currentSousChaps[currentSubChap]?.video && (
                        <video
                          controls
                          className="w-full h-auto max-h-96 rounded-lg border border-gray-600 object-contain mx-auto"
                          src={
                            currentSousChaps[currentSubChap]?.video instanceof File
                              ? URL.createObjectURL(currentSousChaps[currentSubChap]?.video)
                              : `${AppURL}${currentSousChaps[currentSubChap]?.video}`
                          }
                        />
                      )}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-2">Contenu du sous-chapitre</label>

                    {/* Barre d'outils éditeur */}
                    <div className="flex flex-wrap gap-2 mb-3 bg-gray-700/50 p-3 rounded-lg">
                      {[
                        { tag: 'h1', label: 'H1', icon: <FiType className="mr-1" /> },
                        { tag: 'h2', label: 'H2', icon: <FiType className="mr-1" /> },
                        { tag: 'h3', label: 'H3', icon: <FiType className="mr-1" /> },
                        { tag: 'b', label: 'Gras', icon: <FiBold className="mr-1" /> },
                        { tag: 'i', label: 'Italique', icon: <FiItalic className="mr-1" /> },
                        { tag: 'u', label: 'Souligné', icon: <FiUnderline className="mr-1" /> },
                      ].map(({ tag, label, icon }) => {
                        const isActive = activeTags.includes(tag) || (
                          tag === 'b' && activeTags.includes('strong')
                        ) || (
                            tag === 'i' && activeTags.includes('em')
                          );

                        return (
                          <button
                            key={tag}
                            onClick={() => wrapSelectionWithTag(tag, currentChapter, currentSubChap, type !== 'scolaire')}
                            className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-all ${isActive
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white'
                              }`}
                          >
                            {icon}
                            {label}
                          </button>
                        );
                      })}

                      <input
                        type="color"
                        onChange={(e) => applyTextColor(
                          e.target.value,
                          currentChapter,
                          currentSubChap,
                          type !== 'scolaire'
                        )}
                        title="Couleur du texte"
                        className="w-8 h-8 border-none rounded cursor-pointer bg-transparent"
                      />

                      <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-1 ml-auto">
                        <FiUpload />
                        Importer
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          ref={fileInputRef}
                          onChange={(e) => handleFileUpload(
                            e,
                            currentChapter,
                            currentSubChap,
                            type !== 'scolaire'
                          )}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Zone d'édition (pleine largeur) */}
                    <div
                      id={`editor-${type === 'scolaire' ? 'scolaire' : 'custom'}-${currentSubChap}`}
                      ref={(el) => {
                        editorRefs.current[
                          `editor-${type === 'scolaire' ? 'scolaire' : 'custom'}-${currentSubChap}`
                        ] = el;
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => handleEditorInput(
                        e,
                        currentChapter,
                        currentSubChap,
                        type !== 'scolaire'
                      )}
                      onBlur={(e) => handleEditorInput(
                        e,
                        currentChapter,
                        currentSubChap,
                        type !== 'scolaire'
                      )}
                      onKeyDown={(e) => {
                        // Empêcher l'effacement accidentel de l'éditeur
                        if (e.key === 'Backspace' && !e.currentTarget.textContent?.trim()) {
                          e.preventDefault();
                        }

                        // Gérer les sauts de ligne avec Shift+Enter
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          document.execCommand('insertHTML', false, '<br><br>');
                        }
                      }}
                      className="w-full h-full px-4 py-3 rounded-lg border border-gray-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all min-h-[300px] max-h-[500px] overflow-y-auto outline-none bg-gray-700 text-white whitespace-pre-wrap text-justify"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-700/30 rounded-lg">
                <FiBook className="mx-auto text-4xl text-gray-500 mb-4" />
                <p className="text-gray-400">Aucun sous-chapitre pour ce chapitre</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    addSousChapitre(currentChapter);
                  }}
                  className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 mx-auto"
                >
                  <FiPlus /> Ajouter un sous-chapitre
                </button>
              </div>
            );
          })()}

          <div className="flex justify-between pt-6 mt-6 border-t border-gray-700/50">
            <button
              onClick={prev}
              className="px-4 py-2 text-gray-400 hover:text-white transition-all flex items-center gap-2"
            >
              <FiArrowLeft /> Retour
            </button>
            <button
              onClick={() => {
                next();
              }}
              disabled={!allChaptersHaveSubChaps()}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${!allChaptersHaveSubChaps()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                }`}
            >
              Suivant <FiArrowRight />
            </button>
          </div>
        </div>
      )}


      {/* RÉSUMÉ */}
      {step === 6 && (
        <div className="mx-auto bg-gray-800/80 p-8 rounded-xl space-y-6 shadow-xl border border-gray-700/50">
          <h3 className="text-xl text-white font-bold flex items-center gap-2">
            <FiCheckCircle className="text-green-400" />
            Récapitulatif de la formation
          </h3>

          <div className="bg-gray-700/50 p-4 rounded-xl">
            <h4 className="text-lg font-bold text-orange-400 mb-3">🎯 Informations principales</h4>
            <div className="bg-gray-700/50 p-4 rounded-xl">
              <h4 className="text-lg font-bold text-orange-400 mb-3">🎯 Informations principales</h4>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-white text-base">
                  {type === 'scolaire' ? (
                    <>
                      <p><span className="text-orange-400 font-semibold">Type:</span> Scolaire</p>
                      <p><span className="text-orange-400 font-semibold">Pays:</span> {pays}</p>
                      <p><span className="text-orange-400 font-semibold">Niveau:</span> {niveau}</p>
                      <p><span className="text-orange-400 font-semibold">Sous-niveau:</span> {sousNiveau}</p>
                      <p><span className="text-orange-400 font-semibold">Matière:</span> {matiere}</p>
                      <p><span className="text-orange-400 font-semibold">Chapitres:</span> {chapitres.length}</p>
                    </>
                  ) : (
                    <>
                      <p><span className="text-orange-400 font-semibold">Type:</span> Autre</p>
                      <p><span className="text-orange-400 font-semibold">Catégorie:</span> {categorie}</p>
                      <p><span className="text-orange-400 font-semibold">Titre:</span> {titreFormation}</p>
                      <p><span className="text-orange-400 font-semibold">Chapitres:</span> {customChaps.length}</p>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <p><span className="text-orange-400 font-semibold">Prix:</span> {prix ? `${prix} $CAD` : 'Gratuit'}</p>
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <p className="text-orange-400 font-semibold mb-1">Options d'investissement :</p>
                    <p className="text-white">
                      {[
                        investmentOptions.affiliation && "Affiliation",
                        investmentOptions.sponsoring && "Sponsoring",
                        investmentOptions.licence && `Licence (${investmentOptions.licenceMontant}$)`,
                        investmentOptions.codePromo && "Code Promo"
                      ].filter(Boolean).join(", ") || <span className="text-gray-400 italic">Aucune</span>}
                    </p>
                  </div>
                </div>

                {(coverImage || (isEditing && editingData?.coverImage)) && (
                  <div className="w-32 md:ml-4 mt-4 md:mt-0">
                    <img
                      src={coverImage ? URL.createObjectURL(coverImage) : `${AppURL}${editingData.coverImage}`}
                      alt="Cover"
                      className="w-full rounded-lg border border-gray-600 shadow"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h4 className="text-lg font-bold text-orange-400 mb-4">Contenu détaillé</h4>
            <div className="space-y-4">
              {(type === 'scolaire' ? chapitres : customChaps).map((chap, chapIdx) => (
                <div
                  key={chapIdx}
                  className={`bg-gray-700 rounded-lg overflow-hidden transition-all duration-200 ${expandedChapter === chapIdx ? 'ring-2 ring-orange-400' : ''}`}
                >
                  <div
                    className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-600/50"
                    onClick={() => setExpandedChapter(expandedChapter === chapIdx ? null : chapIdx)}
                  >
                    <div>
                      <p className="font-medium text-white">{chap.titre}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-400">
                        <span>{chap.sousChapitres?.length || 0} sous-chapitres</span>
                      </div>
                    </div>
                    <FiChevronDown
                      className={`text-gray-400 transition-transform duration-200 ${expandedChapter === chapIdx ? 'transform rotate-180' : ''}`}
                    />
                  </div>

                  {expandedChapter === chapIdx && (
                    <div className="p-4 pt-0 space-y-2 animate-fadeIn">
                      {chap.sousChapitres?.map((subChap, subChapIdx) => (
                        <div
                          key={subChapIdx}
                          className={`bg-gray-800/30 rounded-lg border ${expandedSubChapter === `${chapIdx}-${subChapIdx}` ? 'border-orange-500' : 'border-gray-600/50'}`}
                        >
                          <div
                            className="p-3 cursor-pointer flex justify-between items-center hover:bg-gray-700/50"
                            onClick={() => setExpandedSubChapter(expandedSubChapter === `${chapIdx}-${subChapIdx}` ? null : `${chapIdx}-${subChapIdx}`)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${expandedSubChapter === `${chapIdx}-${subChapIdx}` ? 'bg-orange-500' : 'bg-gray-600'}`}>
                                {expandedSubChapter === `${chapIdx}-${subChapIdx}` && <FiCheck size={10} />}
                              </div>
                              <span className="text-white">{subChap.titre}</span>
                            </div>
                            <div className="flex gap-2">
                              {subChap.video && <FiVideo className="text-blue-400" />}
                              {subChap.content && <FiFileText className="text-green-400" />}
                              {(subChap.images?.length ?? 0) > 0 && <span className="text-yellow-400 text-sm">🖼️ {subChap.images?.length ?? 0}</span>}
                            </div>
                          </div>

                          {expandedSubChapter === `${chapIdx}-${subChapIdx}` && (
                            <div className="p-4 pt-2 space-y-4 animate-fadeIn">
                              {subChap.video && (
                                <div className="mt-2">
                                  <h6 className="text-sm text-gray-400 mb-1">Vidéo :</h6>
                                  <video
                                    controls
                                    className="w-full rounded-lg border border-gray-600"
                                    src={
                                      subChap.video instanceof File
                                        ? URL.createObjectURL(subChap.video)
                                        : `${AppURL}${subChap.video}`
                                    }
                                  />
                                </div>
                              )}

                              {subChap.content && (
                                <div className="mt-2">
                                  <h6 className="text-sm text-gray-400 mb-1">Contenu :</h6>
                                  <div
                                    className="text-white bg-gray-900/50 p-4 rounded-lg border border-gray-700 prose prose-invert max-w-full"
                                    dangerouslySetInnerHTML={{
                                      __html: renderContentWithImages(
                                        subChap.content,
                                        subChap.images ?? [],

                                      )
                                    }}
                                  />

                                </div>
                              )}

                              {(subChap.images?.length ?? 0) > 0 && (
                                <div className="mt-2">
                                  <h6 className="text-sm text-gray-400 mb-1">Images :</h6>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {(subChap.images ?? []).map((img, imgIdx) => (
                                      <div key={imgIdx} className="relative group">
                                        <img
                                          src={
                                            img instanceof File
                                              ? URL.createObjectURL(img)
                                              : `${AppURL}${img}`
                                          }
                                          className="w-full h-24 object-cover rounded border border-gray-600 group-hover:opacity-80 transition-opacity"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                          <FiZoomIn className="text-white text-xl" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-6 mt-6 border-t border-gray-700/50 gap-4">
            <button
              onClick={prev}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-600 hover:border-orange-400 text-gray-300 hover:text-white transition-all duration-200 group"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>

            <button
              onClick={handleFinish}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-green-500/30 transition-all duration-200 group"
            >
              <FiSave className="group-hover:animate-bounce" />
              <span className="font-medium">
                {isEditing ? 'Mettre à jour' : 'Envoyer pour approbation'}
              </span>
            </button>
          </div>
        </div>
      )}




      {isSubmitting && (
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

export default StudioFormation;