import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://jvynfvwolycspwxaiafc.supabase.co'
const supabaseAnonKey = 'sb_publishable_dTBrLVYRBAJvUAYn7yyAcA__OtK7b_o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let currentIndex = 0;
let filteredFlashcards = [];
let allFlashcards = [];

// Mapowanie ID techniki na nazwę
const techniqueNames = {
    1: 'Wiedza o Szczepie',
    2: 'Historia',
    3: 'Pionierka',
    4: 'Terenoznawstwo',
    5: 'Samarytanka',
    6: 'PiPH',
    7: 'Inne Organizacje',
    8: 'Major Ponury',
    9: '1SBS',
    10: 'Cichociemni',
    11: 'Ciotki',
    12: 'Struktura',
    13: 'Symbolika',
    14: 'Szyfry'
};

// Zapisz aktualny stan w localStorage
function saveCurrentState() {
    const state = {
        currentIndex: currentIndex,
        selectedTechniques: localStorage.getItem('selectedTechniques')
    };
    localStorage.setItem('flashcardState', JSON.stringify(state));
    console.log('Zapisano stan:', state);
}

// Wczytaj zapisany stan
function loadSavedState() {
    const savedState = localStorage.getItem('flashcardState');
    if (savedState) {
        const state = JSON.parse(savedState);
        currentIndex = state.currentIndex || 0;
        console.log('Wczytano zapisany stan, indeks:', currentIndex);
        return true;
    }
    console.log('Brak zapisanego stanu');
    return false;
}

// Pobierz wszystkie fiszki z bazy
async function loadAllFlashcards() {
    console.log('Ładowanie wszystkich fiszek...');
    
    const { data, error } = await supabase
        .from('Fiszka')
        .select('*')
        .order('id');
    
    if (error) {
        console.error('Błąd ładowania fiszek:', error);
        return [];
    }
    
    console.log(`Załadowano ${data.length} fiszek`);
    if (data.length > 0) {
        console.log('Przykładowa fiszka:', data[0]);
    }
    return data;
}

// Filtruj fiszki według wybranych technik
function filterFlashcards(flashcards, selectedTechniques) {
    if (selectedTechniques.length === 0) {
        console.log('Nie wybrano żadnej techniki - wyświetlam wszystkie fiszki');
        return flashcards;
    }
    
    const selectedIds = selectedTechniques.map(id => parseInt(id));
    
    // Sprawdź czy fiszki mają pole 'kategoria'
    if (flashcards.length > 0 && !flashcards[0].hasOwnProperty('kategoria')) {
        console.warn('Brak kolumny "kategoria" w bazie danych! Wyświetlam wszystkie fiszki.');
        console.log('Dostępne kolumny:', Object.keys(flashcards[0]));
        return flashcards;
    }
    
    const filtered = flashcards.filter(fish => {
        return selectedIds.includes(parseInt(fish.kategoria));
    });
    
    console.log(`Wybrano techniki: ${selectedIds.join(', ')}`);
    console.log(`Przefiltrowano do ${filtered.length} fiszek`);
    
    if (filtered.length === 0) {
        console.log('Brak fiszek dla wybranych technik - wyświetlam wszystkie');
        return flashcards;
    }
    
    return filtered;
}

// Wyświetl aktualną fiszkę
async function displayCurrentFlashcard() {
    const pytanieElement = document.getElementById('pytanie_fiszka');
    const odpowiedzElement = document.getElementById('odpowiedz_fiszka');
    const counterElement = document.getElementById('fiszka-counter');
    
    if (!pytanieElement || !odpowiedzElement) {
        console.error('Nie znaleziono elementów fiszki');
        return;
    }
    
    if (filteredFlashcards.length === 0) {
        pytanieElement.textContent = 'Brak fiszek dla wybranych technik';
        odpowiedzElement.textContent = 'Spróbuj wybrać inne techniki';
        if (counterElement) {
            counterElement.textContent = 'Brak fiszek';
        }
        return;
    }
    
    // Sprawdź czy currentIndex nie jest za duży
    if (currentIndex >= filteredFlashcards.length) {
        currentIndex = filteredFlashcards.length - 1;
    }
    if (currentIndex < 0) {
        currentIndex = 0;
    }
    
    const currentCard = filteredFlashcards[currentIndex];
    
    if (currentCard) {
        pytanieElement.textContent = currentCard.strona_a || 'Brak pytania';
        odpowiedzElement.textContent = currentCard.strona_b || 'Brak odpowiedzi';
        
        if (counterElement) {
            counterElement.textContent = `Fiszka ${currentIndex + 1} z ${filteredFlashcards.length}`;
        }
        
        console.log(`Wyświetlam fiszkę ${currentIndex + 1} z ${filteredFlashcards.length}`);
        
        // Zapisz stan po wyświetleniu fiszki
        saveCurrentState();
    }
}

// Funkcja DALEJ (następna fiszka)
window.dodaj = async function() {
    console.log('=== Przycisk DALEJ ===');
    
    if (filteredFlashcards.length === 0) return;
    
    if (currentIndex < filteredFlashcards.length - 1) {
        currentIndex++;
        await displayCurrentFlashcard();
        
        // Odwróć fiszkę z powrotem na pytanie
        const toggleCheckbox = document.getElementById('fiszka-toggle');
        if (toggleCheckbox && toggleCheckbox.checked) {
            toggleCheckbox.checked = false;
        }
    } else {
        console.log('To już ostatnia fiszka');
        const pytanieElement = document.getElementById('pytanie_fiszka');
        if (pytanieElement) {
            pytanieElement.textContent = '🎉 Gratulacje! 🎉';
            const odpowiedzElement = document.getElementById('odpowiedz_fiszka');
            if (odpowiedzElement) {
                odpowiedzElement.textContent = 'Ukończyłeś wszystkie fiszki!';
            }
        }
    }
};

// Funkcja WSTECZ (poprzednia fiszka)
window.odejmij = async function() {
    console.log('=== Przycisk WSTECZ ===');
    
    if (filteredFlashcards.length === 0) return;
    
    if (currentIndex > 0) {
        currentIndex--;
        await displayCurrentFlashcard();
        
        // Odwróć fiszkę z powrotem na pytanie
        const toggleCheckbox = document.getElementById('fiszka-toggle');
        if (toggleCheckbox && toggleCheckbox.checked) {
            toggleCheckbox.checked = false;
        }
    } else {
        console.log('To już pierwsza fiszka');
        const pytanieElement = document.getElementById('pytanie_fiszka');
        if (pytanieElement) {
            pytanieElement.textContent = '📖 To już pierwsza fiszka!';
            setTimeout(() => {
                displayCurrentFlashcard();
            }, 1500);
        }
    }
};

// Pokaż informację o wybranych technikach
function displayTechniquesInfo(selectedTechniques) {
    const labelElement = document.getElementById('techniki-label');
    if (!labelElement) return;
    
    if (selectedTechniques.length === 0) {
        labelElement.textContent = '📚 Wszystkie techniki';
        labelElement.style.backgroundColor = '#4CAF50';
    } else {
        const techniqueNamesList = selectedTechniques
            .map(id => techniqueNames[parseInt(id)] || `Technika ${id}`)
            .join(', ');
        labelElement.textContent = `📖 Powtarzane techniki: ${techniqueNamesList}`;
        labelElement.style.backgroundColor = '#2196F3';
    }
}

// Wyczyść zapisany stan (opcjonalne - można dodać przycisk)
window.clearSavedState = function() {
    localStorage.removeItem('flashcardState');
    console.log('Wyczyszczono zapisany stan');
    location.reload();
};

// Inicjalizacja aplikacji
async function init() {
    console.log('=== INICJALIZACJA APLIKACJI FISZEK ===');
    
    // Pobierz wybrane techniki z localStorage
    const savedTechniques = localStorage.getItem('selectedTechniques');
    let selectedTechniques = [];
    
    if (savedTechniques) {
        selectedTechniques = JSON.parse(savedTechniques);
        console.log('Wczytano wybrane techniki:', selectedTechniques);
    } else {
        console.log('Brak zapisanych technik - wyświetlę wszystkie fiszki');
    }
    
    // Wyświetl informację o technikach
    displayTechniquesInfo(selectedTechniques);
    
    // Załaduj wszystkie fiszki z bazy
    allFlashcards = await loadAllFlashcards();
    
    if (allFlashcards.length === 0) {
        console.error('Nie udało się załadować fiszek z bazy');
        const pytanieElement = document.getElementById('pytanie_fiszka');
        if (pytanieElement) {
            pytanieElement.textContent = 'Błąd ładowania fiszek';
        }
        return;
    }
    
    // Filtruj fiszki według wybranych technik
    filteredFlashcards = filterFlashcards(allFlashcards, selectedTechniques);
    
    // Wczytaj zapisany indeks
    const hadSavedState = loadSavedState();
    
    // Sprawdź czy zapisany indeks jest prawidłowy
    if (hadSavedState && currentIndex >= filteredFlashcards.length) {
        console.log('Zapisany indeks poza zakresem, resetuję do 0');
        currentIndex = 0;
    }
    
    // Wyświetl pierwszą fiszkę
    await displayCurrentFlashcard();
    
    console.log('=== INICJALIZACJA ZAKOŃCZONA ===');
}

// Uruchom inicjalizację po załadowaniu strony
document.addEventListener('DOMContentLoaded', init);