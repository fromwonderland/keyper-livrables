// État de l'application
let currentFileIndex = -1;
let files = [];
let currentChapter = null;
let isHomeViewActive = true; // La vue d'accueil est active par défaut

// Éléments du DOM
const chaptersDropdown = document.querySelector('.dropdown-content');
const filesDropdown = document.getElementById('files-dropdown');
const fileContent = document.getElementById('file-content');

// Données des chapitres et fichiers
const appData = {
    '📂Analyse des besoins': ['Cahier des charges.pdf','Etude de faisabilité.pdf'],
    '📂SFD SFG': ['SFG - SFD.pdf'],
    '📂Conception': ['Maquettes et prototypes.pdf'],
    '📂Développement': ['Dossier technique.pdf','Plan de gestion de projet.pdf'],
    '📂Tests et validation': ['Plan de tests - Rapport de validation.pdf'],
    '📂Déploiement et maintenance': ['Documentation développeur.pdf','Manuel utilisation.pdf'],

};

// Gestion du mode plein écran
function setupFullscreen() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenIcon = fullscreenBtn.querySelector('.fullscreen-icon');
    
    // Ajouter l'icône de réduction (sera affichée en mode plein écran)
    const minimizeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    minimizeIcon.setAttribute('class', 'minimize-icon');
    minimizeIcon.setAttribute('viewBox', '0 0 24 24');
    minimizeIcon.setAttribute('fill', 'none');
    minimizeIcon.setAttribute('stroke', 'currentColor');
    minimizeIcon.setAttribute('stroke-width', '2');
    minimizeIcon.setAttribute('stroke-linecap', 'round');
    minimizeIcon.setAttribute('stroke-linejoin', 'round');
    
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3');
    
    minimizeIcon.appendChild(path1);
    fullscreenBtn.appendChild(minimizeIcon);
    
    // Basculer le mode plein écran
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Erreur lors de l'activation du mode plein écran: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
    
    // Mettre à jour l'icône lors des changements de mode plein écran
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullscreenIcon.style.display = 'none';
            minimizeIcon.style.display = 'block';
        } else {
            fullscreenIcon.style.display = 'block';
            minimizeIcon.style.display = 'none';
        }
    });
}

// Gestion de la modale du guide
function setupGuideModal() {
    const modal = document.getElementById('guide-modal');
    const btn = document.getElementById('guide-btn');
    const span = document.getElementsByClassName('close-guide')[0];
    
    // Ouvrir la modale quand on clique sur le bouton
    btn.onclick = function() {
        modal.style.display = 'flex';
    }
    
    // Fermer quand on clique sur la croix
    span.onclick = function() {
        modal.style.display = 'none';
    }
    
    // Fermer quand on clique en dehors de la modale
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

// Afficher la vue d'accueil
function showHomeView() {
    const homeView = document.getElementById('home-view');
    const mainContent = document.getElementById('main-content');
    const mobileHomeBtn = document.getElementById('home-btn');
    const desktopHomeBtn = document.getElementById('home-btn-desktop');
    
    homeView.classList.add('active');
    mainContent.classList.add('hidden');
    
    // Mettre à jour les deux boutons d'accueil
    if (mobileHomeBtn) mobileHomeBtn.classList.add('active');
    if (desktopHomeBtn) desktopHomeBtn.classList.add('active');
    
    isHomeViewActive = true;
    
    // Remplir la vue d'accueil avec les chapitres et fichiers
    const chaptersContainer = document.getElementById('chapters-container');
    chaptersContainer.innerHTML = '';
    
    let chapterNumber = 1;
    Object.entries(appData).forEach(([chapter, chapterFiles]) => {
        if (chapterFiles.length === 0) return;
        
        const chapterSection = document.createElement('div');
        chapterSection.className = 'chapter-section';
        
        const chapterTitle = document.createElement('h2');
        chapterTitle.className = 'chapter-title';
        chapterTitle.innerHTML = `<span class="chapter-number">${chapterNumber}.</span> ${chapter}`;
        
        const filesList = document.createElement('div');
        filesList.className = 'files-list';
        
        chapterFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            // Créer un nom de fichier plus lisible pour l'affichage
            const displayName = file.replace(/\.(pdf|docx?|xlsx?|pptx?)$/i, '')
                                 .replace(/_/g, ' ')
                                 .replace(/\b\w/g, l => l.toUpperCase());
            
            const icon = getFileIcon(file);
            fileItem.innerHTML = `
                <span class="file-icon">${icon}</span>
                <span class="file-name">${chapterNumber}.${index + 1} - ${displayName}</span>
            `;
            
            fileItem.addEventListener('click', () => {
                loadChapter(chapter);
                openFile(index);
                showFileView();
            });
            
            filesList.appendChild(fileItem);
        });
        
        chapterSection.appendChild(chapterTitle);
        chapterSection.appendChild(filesList);
        chaptersContainer.appendChild(chapterSection);
        chapterNumber++;
    });
}

// Afficher la vue de fichier
function showFileView() {
    const homeView = document.getElementById('home-view');
    const mainContent = document.getElementById('main-content');
    const homeBtn = document.getElementById('home-btn');
    
    homeView.classList.remove('active');
    mainContent.classList.remove('hidden');
    homeBtn.classList.remove('active');
    isHomeViewActive = false;
    
    // Si aucun fichier n'est chargé, on charge le premier chapitre
    if (files.length === 0 && currentChapter) {
        loadChapter(currentChapter);
    }
}

// Initialisation de l'application
function initApp() {
    // Initialiser la modale du guide
    setupGuideModal();
    // Initialiser le mode plein écran
    setupFullscreen();
    
    // Initialiser le bouton d'accueil
    document.getElementById('home-btn').addEventListener('click', () => {
        if (isHomeViewActive) {
            showFileView();
        } else {
            showHomeView();
        }
    });
    
    // Charger automatiquement la vue d'accueil
    showHomeView();
    
    // Remplir le menu des chapitres
    const chaptersDropdown = document.querySelector('.dropdown-content');
    Object.keys(appData).forEach(chapter => {
        const chapterElement = document.createElement('a');
        chapterElement.href = '#';
        chapterElement.textContent = chapter;
        chapterElement.addEventListener('click', (e) => {
            e.preventDefault();
            loadChapter(chapter);
        });
        chaptersDropdown.appendChild(chapterElement);
    });

    // Gestion des boutons de navigation
    document.getElementById('prev-file').addEventListener('click', navigateToPreviousFile);
    document.getElementById('next-file').addEventListener('click', navigateToNextFile);
}

// Fonction utilitaire pour obtenir l'icône appropriée selon l'extension du fichier
function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const excelExtensions = ['xls', 'xlsx'];
    
    if (extension === 'pdf') return '📝';
    if (imageExtensions.includes(extension)) return '🖼️';
    if (excelExtensions.includes(extension)) return '📋';
    if (extension === 'doc' || extension === 'docx') return '📄';
    if (extension === 'ppt' || extension === 'pptx') return '📊';
    if (extension === 'zip' || extension === 'rar' || extension === '7z') return '📦';
    if (extension === 'txt') return '📄';
    
    return '📄'; // Icône par défaut
}

// Charger les fichiers d'un chapitre
function loadChapter(chapterName) {
    currentChapter = chapterName;
    files = appData[chapterName] || [];
    
    // Mettre à jour le menu déroulant des fichiers
    filesDropdown.innerHTML = '';
    
    if (files.length > 0) {
        files.forEach((file, index) => {
            const fileElement = document.createElement('a');
            fileElement.href = '#';
            const icon = getFileIcon(file);
            fileElement.innerHTML = `<span class="file-icon" style="margin-right: 8px;">${icon}</span>${file}`;
            fileElement.addEventListener('click', (e) => {
                e.preventDefault();
                openFile(index);
                showFileView(); // S'assurer qu'on passe en mode fichier
            });
            filesDropdown.appendChild(fileElement);
        });
    } else {
        const noFilesElement = document.createElement('a');
        noFilesElement.href = '#';
        noFilesElement.textContent = 'Aucun fichier disponible';
        noFilesElement.style.pointerEvents = 'none';
        filesDropdown.appendChild(noFilesElement);
    }
    
    // Afficher le premier fichier du chapitre si disponible
    if (files.length > 0) {
        openFile(0);
        showFileView(); // S'assurer qu'on passe en mode fichier
    } else {
        showNoFilesMessage();
    }
}
function openFile(index) {
    // Mettre à jour l'index du fichier courant
    currentFileIndex = index;
    if (index >= 0 && index < files.length) {
        currentFileIndex = index;
        const fileName = files[index];
        const fileExt = fileName.split('.').pop().toLowerCase();
        
        // Trouver le numéro du chapitre et formater le nom
        let chapterNumber = 0;
        let fileNumber = index + 1;
        let chapterDisplayName = currentChapter;
        
        // Parcourir les chapitres pour trouver le numéro du chapitre actuel
        for (const [chapter, chapterFiles] of Object.entries(appData)) {
            if (chapterFiles.length > 0) {
                chapterNumber++;
                if (chapter === currentChapter) {
                    chapterDisplayName = chapter.replace(/_/g, ' ')
                                            .replace(/\b\w/g, l => l.toUpperCase());
                    break;
                }
            }
        }
        
        // Créer le nom de fichier affiché
        const displayName = fileName.replace(/\.(pdf|docx?|xlsx?|pptx?|png|jpg|jpeg|gif|txt|zip|rar|7z|svg|webp)$/i, '')
                                 .replace(/_/g, ' ')
                                 .replace(/\b\w/g, l => l.toUpperCase());
        
        // Créer l'en-tête commun à tous les fichiers
        const fileHeader = `
            <div class="file-container">
                <div class="file-header">
                    <div class="file-path">
                        <span class="chapter-path">${chapterNumber}. ${chapterDisplayName}</span>
                        <span class="path-separator"> → </span>
                        <span class="file-path-name">${chapterNumber}.${fileNumber} ${displayName}</span>
                    </div>
                    <div class="file-actions">
                        <a href="${fileName}" class="download-btn" download>
                            <span class="download-icon">⬇️</span> Télécharger
                        </a>
                    </div>
                </div>
                <div class="file-preview">`;
        
        const fileFooter = `
                    <p class="file-info">
                        <span>Fichier ${fileNumber} sur ${files.length}</span>
                    </p>
                </div>
            </div>`;
        
        let fileContentHTML = '';
        
        // Gestion des différents types de fichiers
        if (fileExt === 'pdf') {
            // Afficher le PDF dans un iframe
            fileContentHTML = fileHeader + `
                <iframe 
                    src="${fileName}" 
                    width="100%" 
                    height="600px"
                    style="border: 1px solid #444; border-radius: 4px;"
                >
                    Votre navigateur ne supporte pas les PDF. 
                    <a href="${fileName}">Télécharger le fichier</a>
                </iframe>` + fileFooter;
                
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)) {
            // Afficher les images
            fileContentHTML = fileHeader + `
                <div class="image-container" style="text-align: center; margin: 20px 0;">
                    <img src="${fileName}" alt="${displayName}" style="max-width: 100%; max-height: 80vh; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                </div>` + fileFooter;
                
        } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt)) {
            // Afficher un aperçu des documents Office avec un lien de téléchargement
            const fileType = fileExt.startsWith('doc') ? 'Word' : 
                            fileExt.startsWith('xls') ? 'Excel' : 'PowerPoint';
            
            fileContentHTML = fileHeader + `
                <div class="office-preview" style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 72px; margin-bottom: 20px;">
                        ${fileType === 'Word' ? '📄' : fileType === 'Excel' ? '📊' : '📑'}
                    </div>
                    <h3>Fichier ${fileType}</h3>
                    <p>Ce navigateur ne peut pas afficher un aperçu de ce fichier ${fileType}.</p>
                    <p>Veuillez le télécharger pour le visualiser.</p>
                    <a href="${fileName}" class="download-btn" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4a6fa5; color: white; text-decoration: none; border-radius: 4px;">
                        Télécharger le fichier ${fileType}
                    </a>
                </div>` + fileFooter;
                
        } else if (fileExt === 'txt') {
            // Afficher le contenu des fichiers texte
            fileContentHTML = fileHeader + `
                <div class="text-file-container" style="background: #1e1e1e; padding: 20px; border-radius: 4px; font-family: 'Courier New', monospace; white-space: pre-wrap; overflow-x: auto;">
                    Chargement du contenu du fichier...
                </div>` + fileFooter;
            
            // Charger le contenu du fichier texte via AJAX
            fetch(fileName)
                .then(response => response.text())
                .then(text => {
                    const container = fileContent.querySelector('.text-file-container');
                    if (container) {
                        container.textContent = text;
                    }
                })
                .catch(error => {
                    console.error('Erreur lors du chargement du fichier texte:', error);
                    const container = fileContent.querySelector('.text-file-container');
                    if (container) {
                        container.innerHTML = 'Impossible de charger le contenu du fichier. <a href="' + fileName + '" download>Télécharger le fichier</a>';
                    }
                });
                
        } else if (['zip', 'rar', '7z'].includes(fileExt)) {
            // Afficher un message pour les fichiers compressés
            fileContentHTML = fileHeader + `
                <div class="archive-preview" style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 72px; margin-bottom: 20px;">🗜️</div>
                    <h3>Fichier d'archive (${fileExt.toUpperCase()})</h3>
                    <p>Ce fichier est une archive compressée.</p>
                    <p>Veuillez le télécharger et l'extraire pour accéder à son contenu.</p>
                    <a href="${fileName}" class="download-btn" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4a6fa5; color: white; text-decoration: none; border-radius: 4px;">
                        Télécharger l'archive (${fileExt.toUpperCase()})
                    </a>
                </div>` + fileFooter;
                
        } else {
            // Pour les autres types de fichiers non pris en charge
            fileContentHTML = fileHeader + `
                <div class="unsupported-file" style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 72px; margin-bottom: 20px;">❓</div>
                    <h3>Type de fichier non pris en charge</h3>
                    <p>Ce type de fichier (${fileExt}) ne peut pas être affiché directement dans le navigateur.</p>
                    <a href="${fileName}" class="download-btn" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4a6fa5; color: white; text-decoration: none; border-radius: 4px;">
                        Télécharger le fichier
                    </a>
                </div>` + fileFooter;
        }
        
        // Mettre à jour le contenu
        fileContent.innerHTML = fileContentHTML;
    }
    
}

// Navigation entre les fichiers et les chapitres
function navigateToPreviousFile() {
    if (files.length === 0) return;
    
    // Si on est au premier fichier du chapitre actuel
    if (currentFileIndex <= 0) {
        // Récupérer tous les noms de chapitres
        const chapterNames = Object.keys(appData);
        const currentChapterIndex = chapterNames.indexOf(currentChapter);
        
        // Aller au dernier fichier du chapitre précédent
        if (currentChapterIndex > 0) {
            const prevChapter = chapterNames[currentChapterIndex - 1];
            const prevChapterFiles = appData[prevChapter];
            
            if (prevChapterFiles && prevChapterFiles.length > 0) {
                loadChapter(prevChapter);
                openFile(prevChapterFiles.length - 1); // Dernier fichier du chapitre précédent
            } else {
                // Si le chapitre précédent n'a pas de fichiers, on essaie avec le chapitre d'avant
                currentChapter = prevChapter;
                navigateToPreviousFile();
            }
        } else {
            // Si on est au premier chapitre, on reste sur le premier fichier
            openFile(0);
        }
    } else {
        // Aller au fichier précédent dans le chapitre actuel
        openFile(currentFileIndex - 1);
    }
}

function navigateToNextFile() {
    if (files.length === 0) return;
    
    // Si on est au dernier fichier du chapitre actuel
    if (currentFileIndex >= files.length - 1) {
        // Récupérer tous les noms de chapitres
        const chapterNames = Object.keys(appData);
        const currentChapterIndex = chapterNames.indexOf(currentChapter);
        
        // Aller au premier fichier du chapitre suivant
        if (currentChapterIndex < chapterNames.length - 1) {
            const nextChapter = chapterNames[currentChapterIndex + 1];
            const nextChapterFiles = appData[nextChapter];
            
            if (nextChapterFiles && nextChapterFiles.length > 0) {
                loadChapter(nextChapter);
                openFile(0); // Premier fichier du chapitre suivant
            } else {
                // Si le chapitre suivant n'a pas de fichiers, on essaie avec le prochain
                currentChapter = nextChapter;
                navigateToNextFile();
            }
        } else {
            // Si on est au dernier chapitre, on reste sur le dernier fichier
            openFile(files.length - 1);
        }
    } else {
        // Aller au fichier suivant dans le chapitre actuel
        openFile(currentFileIndex + 1);
    }
}

// Afficher un message quand aucun fichier n'est disponible
function showNoFilesMessage() {
    fileContent.innerHTML = `
        <div class="welcome-message">
            <h1>Aucun fichier disponible</h1>
            <p>Le chapitre sélectionné ne contient aucun fichier.</p>
        </div>
    `;
}

// Gestion du clic sur le bouton Accueil (mobile et desktop)
function setupHomeButtons() {
    const homeButtons = document.querySelectorAll('.home-btn');
    homeButtons.forEach(button => {
        button.addEventListener('click', () => {
            showHomeView();
        });
    });
}

// Désactiver le clic sur le logo et le texte
function setupLogoClickHandler() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        // Désactiver également le clic sur l'image et le texte individuellement
        const logoImg = document.querySelector('.logo-img');
        const logoSpan = document.querySelector('.logo span');
        
        [logoImg, logoSpan].forEach(element => {
            if (element) {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        });
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupHomeButtons();
    setupFullscreen();
    setupGuideModal();
    setupLogoClickHandler();
    
    // Ajouter un écouteur d'événement pour le clic sur les fichiers dans la vue d'accueil
    document.addEventListener('click', (e) => {
        const fileItem = e.target.closest('.file-item');
        if (fileItem) {
            const chapter = fileItem.dataset.chapter;
            const fileIndex = parseInt(fileItem.dataset.index);
            if (chapter && !isNaN(fileIndex)) {
                loadChapter(chapter);
                openFile(fileIndex);
                showFileView();
            }
        }
    });
});