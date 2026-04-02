import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://jvynfvwolycspwxaiafc.supabase.co'
const supabaseAnonKey = 'sb_publishable_dTBrLVYRBAJvUAYn7yyAcA__OtK7b_o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let number = 1; // Przenosimy zmienną na zewnątrz funkcji, aby była dostępna globalnie

async function pokazPytanie(){
    console.log('Funkcja pokazPytanie() została wywołana');
    const pytanie_fiszka = document.getElementById('pytanie_fiszka');

    if (!pytanie_fiszka) {
        console.error('Nie znaleziono diva o id "pytanie_fiszka"');
        return;
    }

    const result = await supabase
        .from('Fiszka')
        .select('strona_a')
        .eq('id', number); // Używamy zmiennej number
    
    console.log(`Wynik dla tabeli Fiszka (pytanie, id=${number}):`, result);
    
    if (result.data && result.data.length > 0) {
        pytanie_fiszka.textContent = result.data[0].strona_a;
    } else {
        pytanie_fiszka.textContent = 'Koniec fiszek';
        console.log(`Nie znaleziono fiszki o id ${number}`);
    }
}

async function pokazOdpowiedz(){
    console.log('Funkcja pokazOdpowiedz() została wywołana');
    const odpowiedz_fiszka = document.getElementById('odpowiedz_fiszka');

    if (!odpowiedz_fiszka) {
        console.error('Nie znaleziono diva o id "odpowiedz_fiszka"');
        return;
    }

    const result = await supabase
        .from('Fiszka')
        .select('strona_b')
        .eq('id', number); // Używamy zmiennej number
    
    console.log(`Wynik dla tabeli Fiszka (odpowiedź, id=${number}):`, result);
    
    if (result.data && result.data.length > 0) {
        odpowiedz_fiszka.textContent = result.data[0].strona_b;
    } else {
        odpowiedz_fiszka.textContent = 'Brak odpowiedzi dla tej fiszki';
        console.log(`Nie znaleziono fiszki o id ${number}`);
    }
}

async function dodaj() {
    number++; // Zwiększamy liczbę number o 1
    console.log(`Przejście do następnej fiszki (id: ${number})`);
    
    // Aktualizujemy wyświetlane pytanie i odpowiedź
    await pokazPytanie();
    await pokazOdpowiedz();
}

async function odejmij() {
    if (number > 1) { // Zapobiegamy przejściu poniżej 1
        number--;
        console.log(`Przejście do poprzedniej fiszki (id: ${number})`);
        
        await pokazPytanie();
        await pokazOdpowiedz();
    } else {
        console.log('Jesteś już na pierwszej fiszce');
        // Opcjonalnie: pokaż użytkownikowi komunikat
        const pytanie_fiszka = document.getElementById('pytanie_fiszka');
        if (pytanie_fiszka) {
            pytanie_fiszka.textContent = 'To już pierwsza fiszka!';
            setTimeout(() => {
                pokazPytanie();
            }, 1500);
        }
    }
}

// DODAJEMY FUNKCJE DO GLOBALNEGO OBIEKTU WINDOW
window.dodaj = dodaj;
window.odejmij = odejmij;

// Uruchamiamy po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    pokazPytanie();
    pokazOdpowiedz();
});