// Import Supabase z CDN
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://jvynfvwolycspwxaiafc.supabase.co'
const supabaseAnonKey = 'sb_publishable_dTBrLVYRBAJvUAYn7yyAcA__OtK7b_o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


async function pokaz() {
    console.log('Funkcja pokaz() została wywołana');
    const tableDiv = document.getElementById('table-container');
    
    if (!tableDiv) {
        console.error('Nie znaleziono diva o id "table"');
        return;
    }
    
    console.log('Znaleziono div table, pobieram dane...');
    tableDiv.innerHTML = '<p>Ładowanie danych...</p>';
    
    try {
        // Spróbujmy różnych nazw tabel
        let data = null;
        let error = null;
        
        console.log(`Próbuję tabeli: Fiszki`);
        const result = await supabase
            .from('Fiszka')
            .select('*');
        
        console.log(`Wynik dla tabeli Fiszki:`, result);
        
        if (result.error) {
            error = result.error;
        } else {
            data = result.data;
            error = null;
        }

        if (error || !data) {
            console.error('Nie udało się znaleźć danych w żadnej tabeli');
            tableDiv.innerHTML = '<p style="color: red;">Nie znaleziono danych. Sprawdź nazwę tabeli w Supabase.</p>';
            return;
        }
        
        console.log('Data type:', typeof data, 'Data length:', data.length, 'Data:', data);
        
        if (!Array.isArray(data) || data.length === 0) {
            console.log('Data nie jest tablicą lub jest pusta');
            tableDiv.innerHTML = '<p>Brak danych do wyświetlenia</p>';
            return;
        }
        
        console.log('Pobrano', data.length, 'rekordów, tworzę tabelę...');
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '20px';
        
        // Nagłówek tabeli
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Pobieranie nazw kolumn z pierwszego rekordu, bez id
        const columns = Object.keys(data[0]).filter(column => column !== 'id');
        console.log('Kolumny:', columns);
        columns.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText.charAt(0).toUpperCase() + headerText.slice(1); // Pierwsza litera wielka
            th.style.border = '1px solid #ddd';
            th.style.padding = '12px';
            th.style.backgroundColor = 'rgba(97, 131, 88, 0.3)';
            th.style.fontFamily = 'Museo Sans, sans-serif';
            th.style.fontWeight = '500';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Ciało tabeli
        const tbody = document.createElement('tbody');
        
        data.forEach((row, index) => {
            console.log('Tworzę wiersz', index + 1, row);
            const tr = document.createElement('tr');
            
            columns.forEach(column => {
                const td = document.createElement('td');
                td.textContent = row[column] || '';
                td.style.border = '1px solid #ddd';
                td.style.padding = '12px';
                if (column === 'id') {
                    td.style.textAlign = 'center';
                }
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        // Wyczyszczenie diva i dodanie tabeli
        tableDiv.innerHTML = '';
        tableDiv.appendChild(table);
        console.log('Tabela została dodana do strony');
        
    } catch (err) {
        console.error('Błąd:', err);
        tableDiv.innerHTML = '<p style="color: red;">Błąd połączenia z bazą danych</p>';
    }
}

async function dodajFiszke() {
    const questionInput = document.getElementById('pytanie');
    const answerInput = document.getElementById('answer');
    
    if (!questionInput.value || !answerInput.value) {
        alert('Uzupełnij oba pola.');
        return;
    }

    const { data, error } = await supabase
        .from('Fiszka')
        .insert([
            { strona_a: questionInput.value, strona_b: answerInput.value }
        ]);

    if (error) {
        console.error('Błąd dodawania:', error);
        alert('Błąd dodawania fiszki.');
        return;
    }

    questionInput.value = '';
    answerInput.value = '';
    alert('Dodano fiszkę!');

    // odśwież tabelę
    pokaz();
}

// Wywołanie funkcji po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    pokaz();

    const submit = document.getElementById('submit');
    if (submit) {
        submit.addEventListener('click', dodajFiszke);
    }

    // Ułatwienie dla inline onClick w HTML (dla starszych implementacji)
    window.dodajFiszkę = dodajFiszke;
});