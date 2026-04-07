import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://jvynfvwolycspwxaiafc.supabase.co'
const supabaseAnonKey = 'sb_publishable_dTBrLVYRBAJvUAYn7yyAcA__OtK7b_o'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

document.addEventListener('DOMContentLoaded', async function() {
    const selectedTechniques = JSON.parse(localStorage.getItem('selectedQuizTechniques') || '[]')
    
    if (selectedTechniques.length === 0) {
        // Jeśli nie wybrano technik, policz wszystkie pytania
        const { count, error } = await supabase
            .from('Pytania')
            .select('*', { count: 'exact', head: true })
        
        if (error) {
            console.error('Błąd:', error)
            document.getElementById('maxQuestions').textContent = 'Błąd ładowania danych'
            return
        }
        
        document.getElementById('maxQuestions').textContent = `Maksymalna liczba pytań: ${count}`
        document.getElementById('questionCount').max = count
        document.getElementById('questionCount').value = Math.min(10, count)
    } else {
        // Filtruj pytania według wybranych technik
        const { data, error } = await supabase
            .from('Pytania')
            .select('id')
            .in('kategoria', selectedTechniques)
        
        if (error) {
            console.error('Błąd:', error)
            document.getElementById('maxQuestions').textContent = 'Błąd ładowania danych'
            return
        }
        
        const maxQuestions = data.length
        document.getElementById('maxQuestions').textContent = `Maksymalna liczba pytań: ${maxQuestions}`
        document.getElementById('questionCount').max = maxQuestions
        document.getElementById('questionCount').value = Math.min(10, maxQuestions)
    }
    
    // Przycisk "Rozpocznij quiz"
    document.getElementById('StartQuiz').addEventListener('click', function() {
        const questionCount = parseInt(document.getElementById('questionCount').value)
        localStorage.setItem('quizQuestionCount', questionCount)
        window.location.href = 'quiz.html'
    })
    
    // Przycisk wstecz
    document.getElementById('backBtn').addEventListener('click', function() {
        window.location.href = 'quiz_techniki.html'
    })
})