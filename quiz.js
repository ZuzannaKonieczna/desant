// KONFIGURACJA SUPABASE
const SUPABASE_URL = 'https://jvynfvwolycspwxaiafc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dTBrLVYRBAJvUAYn7yyAcA__OtK7b_o';

// INICJALIZACJA
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let aktualnePytanie = null;
let poprawnaOdpowiedz = null;

// FUNKCJA WCZYTAJ PYTANIE
async function wczytajPytanie() {
    try {
        document.getElementById('pytanie').innerHTML = '⏳ Ładowanie pytania...';
        
        const { data, error } = await supabase
            .from('Pytania')
            .select('*');
        
        if (error) {
            throw error;
        }
        
        if (!data || data.length === 0) {
            document.getElementById('pytanie').innerHTML = '❌ Brak pytań w bazie!';
            document.getElementById('wynik').innerHTML = 'Dodaj pytania do tabeli "Pytania" w Supabase';
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * data.length);
        const pytanie = data[randomIndex];
        aktualnePytanie = pytanie;
        
        console.log('Wczytane pytanie:', pytanie);
        
        document.getElementById('pytanie').innerHTML = pytanie.tresc || pytanie.pytanie || 'Brak treści';
        document.getElementById('pytanie1').innerHTML = `1. ${pytanie.odpowiedz1 || 'Brak odpowiedzi'}`;
        document.getElementById('pytanie2').innerHTML = `2. ${pytanie.odpowiedz2 || 'Brak odpowiedzi'}`;
        document.getElementById('pytanie3').innerHTML = `3. ${pytanie.odpowiedz3 || 'Brak odpowiedzi'}`;
        document.getElementById('pytanie4').innerHTML = `4. ${pytanie.odpowiedz4 || 'Brak odpowiedzi'}`;
        
        poprawnaOdpowiedz = (pytanie.poprawna || 1) - 1;
        
        wlaczPrzyciski(true);
        document.getElementById('wynik').innerHTML = '';
        
    } catch (error) {
        console.error('Błąd:', error);
        document.getElementById('pytanie').innerHTML = '❌ Błąd: ' + error.message;
        document.getElementById('wynik').innerHTML = 'Sprawdź konsolę (F12)';
    }
}

// FUNKCJA SPRAWDZANIA
function sprawdzOdpowiedz(wybranyIndeks) {
    if (aktualnePytanie === null) {
        document.getElementById('wynik').innerHTML = '⚠️ Załaduj pytanie najpierw';
        return;
    }
    
    wlaczPrzyciski(false);
    
    const czyDobrze = (wybranyIndeks === poprawnaOdpowiedz);
    
    if (czyDobrze) {
        document.getElementById('wynik').innerHTML = '✅ DOBRZE! ✅';
        document.getElementById('wynik').style.color = 'green';
    } else {
        const poprawnyTekst = document.getElementById(`pytanie${poprawnaOdpowiedz + 1}`).innerHTML;
        document.getElementById('wynik').innerHTML = `❌ ŹLE! ❌<br>Poprawna: ${poprawnyTekst}`;
        document.getElementById('wynik').style.color = 'red';
    }
    
    setTimeout(() => {
        wczytajPytanie();
    }, 2000);
}

// FUNKCJA WŁĄCZ/WYŁĄCZ PRZYCISKI
function wlaczPrzyciski(wlacz) {
    for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById(`pytanie${i}`);
        if (btn) {
            btn.disabled = !wlacz;
        }
    }
}

// PRZYPISANIE PRZYCISKÓW PO ZAŁADOWANIU STRONY
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('pytanie1').onclick = () => sprawdzOdpowiedz(0);
    document.getElementById('pytanie2').onclick = () => sprawdzOdpowiedz(1);
    document.getElementById('pytanie3').onclick = () => sprawdzOdpowiedz(2);
    document.getElementById('pytanie4').onclick = () => sprawdzOdpowiedz(3);
    
    wczytajPytanie();
});