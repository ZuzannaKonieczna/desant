// CZEKAMY NA ZAŁADOWANIE STRONY
document.addEventListener('DOMContentLoaded', function() {
    
    // Sprawdzamy czy Supabase jest dostępny
    const supabaseClient = window.supabase;
    if (!supabaseClient) {
        document.getElementById('pytanie').innerHTML = '❌ Błąd: Supabase nie jest dostępny. Sprawdź połączenie z internetem.';
        return;
    }
    
    // ==================== KONFIGURACJA SUPABASE ====================
    const SUPABASE_URL = 'https://jvynfvwolycspwxaiafc.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_dTBrLVYRBAJvUAYn7yyAcA__OtK7b_o';
    
    // Inicjalizacja klienta Supabase
    const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // ==================== GLOBALNE ZMIENNE ====================
    let currentQuestion = null;
    let currentCorrectAnswer = null;
    let currentQuestionId = null;
    
    // ==================== FUNKCJA WCZYTAJ PYTANIE ====================
    async function loadRandomQuestion() {
        try {
            document.getElementById('pytanie').innerHTML = '⏳ Ładowanie pytania z bazy...';
            
            // Pobierz wszystkie pytania
            const { data: allQuestions, error: fetchError } = await supabase
                .from('pytania')
                .select('*');
            
            if (fetchError) {
                throw fetchError;
            }
            
            if (!allQuestions || allQuestions.length === 0) {
                document.getElementById('pytanie').innerHTML = '❌ Brak pytań w bazie danych!';
                document.getElementById('wynik').innerHTML = 'Dodaj pytania do tabeli "pytania" w Supabase';
                return;
            }
            
            // Losujemy pytanie
            const randomIndex = Math.floor(Math.random() * allQuestions.length);
            const data = allQuestions[randomIndex];
            
            currentQuestion = data;
            currentQuestionId = data.id;
            
            // Wyświetlamy pytanie
            const pytanieText = data.tresc || data.pytanie || data.question || 'Brak treści pytania';
            document.getElementById('pytanie').innerHTML = pytanieText;
            
            // Wyświetlamy odpowiedzi
            document.getElementById('pytanie1').innerHTML = `A. ${data.odpowiedz1 || data.answer1 || 'Brak odpowiedzi 1'}`;
            document.getElementById('pytanie2').innerHTML = `B. ${data.odpowiedz2 || data.answer2 || 'Brak odpowiedzi 2'}`;
            document.getElementById('pytanie3').innerHTML = `C. ${data.odpowiedz3 || data.answer3 || 'Brak odpowiedzi 3'}`;
            document.getElementById('pytanie4').innerHTML = `D. ${data.odpowiedz4 || data.answer4 || 'Brak odpowiedzi 4'}`;
            
            // Poprawna odpowiedź
            let correctNum = data.poprawna || data.correct || 1;
            currentCorrectAnswer = correctNum - 1;
            
            // Czyścimy wynik
            document.getElementById('wynik').innerHTML = '';
            
            // Odblokowujemy przyciski
            enableButtons(true);
            
        } catch (error) {
            console.error('Błąd:', error);
            document.getElementById('pytanie').innerHTML = '❌ Błąd połączenia z bazą danych';
            document.getElementById('wynik').innerHTML = 'Błąd: ' + error.message;
        }
    }
    
    // ==================== SPRAWDZANIE ODPOWIEDZI ====================
    function checkAnswer(selectedIndex) {
        if (!currentQuestion || currentCorrectAnswer === null) {
            document.getElementById('wynik').innerHTML = '⚠️ Najpierw wczytaj pytanie!';
            return;
        }
        
        // Blokujemy przyciski
        enableButtons(false);
        
        const isCorrect = (selectedIndex === currentCorrectAnswer);
        
        if (isCorrect) {
            document.getElementById('wynik').innerHTML = '✅ Dobra odpowiedź! ✅<br>Zaraz pojawi się kolejne pytanie...';
            document.getElementById('wynik').style.color = 'green';
        } else {
            let correctAnswerText = '';
            if (currentCorrectAnswer === 0) correctAnswerText = document.getElementById('pytanie1').innerText;
            else if (currentCorrectAnswer === 1) correctAnswerText = document.getElementById('pytanie2').innerText;
            else if (currentCorrectAnswer === 2) correctAnswerText = document.getElementById('pytanie3').innerText;
            else if (currentCorrectAnswer === 3) correctAnswerText = document.getElementById('pytanie4').innerText;
            
            document.getElementById('wynik').innerHTML = `❌ Zła odpowiedź! ❌<br>Poprawna odpowiedź to: ${correctAnswerText}<br>Za 2 sekundy nowe pytanie...`;
            document.getElementById('wynik').style.color = 'red';
        }
        
        // Po 2 sekundach nowe pytanie
        setTimeout(() => {
            loadRandomQuestion();
        }, 2000);
    }
    
    // ==================== WŁĄCZ/WYŁĄCZ PRZYCISKI ====================
    function enableButtons(enabled) {
        const buttons = ['pytanie1', 'pytanie2', 'pytanie3', 'pytanie4'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = !enabled;
            }
        });
    }
    
    // ==================== PRZYPISANIE PRZYCISKÓW ====================
    document.getElementById('pytanie1').onclick = () => checkAnswer(0);
    document.getElementById('pytanie2').onclick = () => checkAnswer(1);
    document.getElementById('pytanie3').onclick = () => checkAnswer(2);
    document.getElementById('pytanie4').onclick = () => checkAnswer(3);
    
    // Start
    loadRandomQuestion();
});