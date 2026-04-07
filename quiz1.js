import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://jvynfvwolycspwxaiafc.supabase.co'
const supabaseAnonKey = 'sb_publishable_dTBrLVYRBAJvUAYn7yyAcA__OtK7b_o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let pytania = []
let aktualnyIndex = 0
let wynik = 0

// Pobierz pytania z bazy danych
async function pobierzPytania() {
    try {
        console.log('Pobieranie pytań z bazy danych...')
        const { data, error } = await supabase
            .from('Pytania')
            .select('id, tresc, odpowiedz1, odpowiedz2, odpowiedz3, odpowiedz4, poprawna, kategoria')

        if (error) {
            console.error('Błąd przy pobieraniu pytań:', error)
            return
        }

        let pytania = data

        // Pobierz wybrane techniki i liczbę pytań
        const selectedTechniques = JSON.parse(localStorage.getItem('selectedQuizTechniques') || '[]')
        const questionCount = parseInt(localStorage.getItem('quizQuestionCount') || '10')

        // Filtruj pytania według technik
        if (selectedTechniques.length > 0) {
            pytania = pytania.filter(pytanie => selectedTechniques.includes(pytanie.kategoria.toString()))
        }

        // Przetasuj pytania
        pytania = pytania.sort(() => Math.random() - 0.5)

        // Ogranicz liczbę pytań
        pytania = pytania.slice(0, questionCount)

        console.log('Pobrano pytania:', pytania)
        
        if (pytania.length > 0) {
            wyswietlPytanie()
        } else {
            document.getElementById('pytanie').textContent = 'Brak pytań dla wybranych ustawień.'
        }
    } catch (err) {
        console.error('Błąd:', err)
    }
}

// Wyświetl bieżące pytanie
function wyswietlPytanie() {
    if (aktualnyIndex >= pytania.length) {
        koniec()
        return
    }

    const pytanie = pytania[aktualnyIndex]
    
    // Wyświetl treść pytania
    document.getElementById('pytanie').textContent = `${pytanie.tresc} (${aktualnyIndex + 1}/${pytania.length})`
    
    // Wyświetl odpowiedzi
    document.getElementById('pytanie1').textContent = pytanie.odpowiedz1
    document.getElementById('pytanie2').textContent = pytanie.odpowiedz2
    document.getElementById('pytanie3').textContent = pytanie.odpowiedz3
    document.getElementById('pytanie4').textContent = pytanie.odpowiedz4

    // Resetuj style przycisków
    document.querySelectorAll('.odp').forEach(btn => {
        btn.style.backgroundColor = ''
        btn.style.pointerEvents = 'auto'
        btn.classList.remove('selected', 'correct', 'incorrect')
    })
}

// Obsługa klikania odpowiedzi
function sprawdzOdpowiedz(nrOdpowiedzi) {
    const pytanie = pytania[aktualnyIndex]
    const przycisk = document.getElementById('pytanie' + nrOdpowiedzi)

    // Wyłącz klikanie
    document.querySelectorAll('.odp').forEach(btn => {
        btn.style.pointerEvents = 'none'
    })

    if (nrOdpowiedzi === pytanie.poprawna) {
        // Poprawna odpowiedź
        przycisk.style.backgroundColor = '#4CAF50'
        przycisk.classList.add('correct')
        wynik++
    } else {
        // Błędna odpowiedź
        przycisk.style.backgroundColor = '#f44336'
        przycisk.classList.add('incorrect')
        
        // Pokaż poprawną odpowiedź
        const prawidlowyPrzycisk = document.getElementById('pytanie' + pytanie.poprawna)
        prawidlowyPrzycisk.style.backgroundColor = '#4CAF50'
        prawidlowyPrzycisk.classList.add('correct')
    }

    // Przejdź do następnego pytania po 2 sekundach
    setTimeout(() => {
        aktualnyIndex++
        wyswietlPytanie()
    }, 2000)
}

// Koniec quizu
function koniec() {
    const procent = Math.round((wynik / pytania.length) * 100)
    document.getElementById('pytanie').textContent = `Quiz skończony! Wynik: ${wynik}/${pytania.length} (${procent}%)`
    document.querySelectorAll('.odp').forEach(btn => {
        btn.style.display = 'none'
    })
}

// Inicjalizacja
async function init() {
    console.log('Inicjalizacja quizu...')
    
    // Dodaj event listenery do przycisków
    document.getElementById('pytanie1').addEventListener('click', () => sprawdzOdpowiedz(1))
    document.getElementById('pytanie2').addEventListener('click', () => sprawdzOdpowiedz(2))
    document.getElementById('pytanie3').addEventListener('click', () => sprawdzOdpowiedz(3))
    document.getElementById('pytanie4').addEventListener('click', () => sprawdzOdpowiedz(4))

    // Pobierz pytania
    await pobierzPytania()
}

document.addEventListener('DOMContentLoaded', init)