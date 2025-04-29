// Seleziona gli elementi del DOM
const welcomeScreen = document.getElementById('welcome-screen');
const appContainer = document.getElementById('app-container');
const enterAppBtn = document.getElementById('enter-app');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income-total');
const expenseEl = document.getElementById('expense-total');
const transactionForm = document.getElementById('transaction-form');
const toggleFormBtn = document.getElementById('toggle-form');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const transactionTypeInput = document.getElementById('transaction-type');
const recurringCheckbox = document.getElementById('recurring');
const recurringOptions = document.getElementById('recurring-options');
const recurringFrequency = document.getElementById('recurring-frequency');
const transactionList = document.getElementById('transaction-list');
const setInitialBalanceBtn = document.getElementById('set-initial-balance');
const amountBtns = document.querySelectorAll('.amount-btn');
const balanceChartContainer = document.getElementById('balance-chart');
const chartsSection = document.getElementById('charts-section');
const viewChartsBtn = document.getElementById('view-charts-btn');
const closeChartsBtn = document.getElementById('close-charts-btn');
const searchInput = document.getElementById('search-input');

// Inizializza le transazioni dal localStorage o crea un array vuoto
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Inizializza il bilancio iniziale dal localStorage o imposta a 0
let initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;

// Funzione per aggiornare il localStorage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('initialBalance', initialBalance.toString());
    // Salva la data dell'ultimo aggiornamento
    localStorage.setItem('lastUpdate', new Date().toISOString());
}

// Funzione per formattare i numeri come valuta
function formatCurrency(amount) {
    return '€' + amount.toFixed(2);
}

// Funzione per generare un ID univoco
function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// Funzione per aggiornare i totali e i grafici
function updateTotals() {
    // Calcola i totali delle entrate e delle spese
    const amounts = transactions.map(transaction => {
        if (transaction.type === 'income') {
            return transaction.amount;
        } else {
            return -transaction.amount;
        }
    });

    // Calcola il bilancio totale (iniziale + transazioni)
    const total = initialBalance + amounts.reduce((acc, item) => (acc += item), 0);

    // Calcola le entrate totali
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0);

    // Calcola le spese totali
    const expense = amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1;

    // Aggiorna gli elementi del DOM
    balanceEl.textContent = formatCurrency(total);
    incomeEl.textContent = formatCurrency(income);
    expenseEl.textContent = formatCurrency(expense);
    
    // Aggiorna i grafici
    updateCharts(income, expense);
}

// Funzione per aggiungere una transazione alla lista
function addTransactionToDOM(transaction) {
    // Determina il segno della transazione
    const sign = transaction.type === 'income' ? '+' : '-';

    // Crea un elemento li
    const item = document.createElement('li');
    item.classList.add(transaction.type);
    item.setAttribute('data-id', transaction.id);

    // Crea il contenuto HTML dell'elemento
    item.innerHTML = `
        <div class="transaction-details">
            <div class="transaction-title">${transaction.title}</div>
            <div class="transaction-description">${transaction.description || ''}</div>
            ${transaction.recurring ? `<div class="transaction-recurring">Ricorrente: ${getRecurringText(transaction.recurringFrequency)}</div>` : ''}
        </div>
        <span class="transaction-amount">${sign}${formatCurrency(transaction.amount)}</span>
        <button class="delete-btn">X</button>
    `;

    // Aggiungi l'elemento alla lista
    transactionList.appendChild(item);
}

// Funzione per ottenere il testo della frequenza ricorrente
function getRecurringText(frequency) {
    switch (frequency) {
        case 'daily':
            return 'Giornaliera';
        case 'weekly':
            return 'Settimanale';
        case 'monthly':
            return 'Mensile';
        default:
            return '';
    }
}

// Funzione per aggiungere una transazione
function addTransaction(e) {
    e.preventDefault();

    // Validazione del form
    if (titleInput.value.trim() === '' || amountInput.value.trim() === '') {
        alert('Per favore, inserisci un titolo e un ammontare');
        return;
    }

    // Crea l'oggetto transazione
    const transaction = {
        id: generateID(),
        title: titleInput.value,
        description: descriptionInput.value,
        amount: parseFloat(amountInput.value),
        type: transactionTypeInput.value,
        category: document.getElementById('transaction-category').value,
        date: new Date().toISOString(),
        recurring: recurringCheckbox.checked,
        recurringFrequency: recurringCheckbox.checked ? recurringFrequency.value : null
    };

    // Aggiungi la transazione all'array
    transactions.push(transaction);

    // Aggiungi la transazione al DOM
    addTransactionToDOM(transaction);

    // Aggiorna il localStorage
    updateLocalStorage();

    // Aggiorna i totali
    updateTotals();

    // Resetta il form
    resetForm();
}

// Funzione per resettare il form
function resetForm() {
    titleInput.value = '';
    descriptionInput.value = '';
    amountInput.value = '';
    transactionTypeInput.value = 'income';
    recurringCheckbox.checked = false;
    recurringOptions.classList.add('hidden');
}

// Funzione per creare una finestra di dialogo personalizzata
function createCustomDialog(message, onConfirm, onCancel) {
    // Crea l'overlay per oscurare lo sfondo
    const overlay = document.createElement('div');
    overlay.classList.add('dialog-overlay');
    
    // Crea la finestra di dialogo
    const dialog = document.createElement('div');
    dialog.classList.add('custom-dialog');
    
    // Aggiungi il titolo
    const title = document.createElement('h3');
    title.textContent = 'Conferma';
    dialog.appendChild(title);
    
    // Aggiungi il messaggio
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    dialog.appendChild(messageEl);
    
    // Crea i pulsanti
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('dialog-buttons');
    
    // Pulsante di conferma
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Conferma';
    confirmBtn.classList.add('dialog-btn', 'confirm-btn');
    confirmBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (onConfirm) onConfirm();
    });
    
    // Pulsante di annullamento
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annulla';
    cancelBtn.classList.add('dialog-btn', 'cancel-btn');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    });
    
    // Aggiungi i pulsanti al container
    buttonsContainer.appendChild(cancelBtn);
    buttonsContainer.appendChild(confirmBtn);
    dialog.appendChild(buttonsContainer);
    
    // Aggiungi la finestra di dialogo all'overlay
    overlay.appendChild(dialog);
    
    // Aggiungi l'overlay al body
    document.body.appendChild(overlay);
    
    // Aggiungi effetto di animazione
    setTimeout(() => {
        dialog.style.transform = 'translateY(0)';
        dialog.style.opacity = '1';
    }, 10);
}

// Funzione per rimuovere una transazione
function removeTransaction(id) {
    // Chiedi conferma prima di eliminare con la finestra di dialogo personalizzata
    createCustomDialog('Sei sicuro di voler eliminare questa transazione?', () => {
        // Filtra l'array per rimuovere la transazione
        transactions = transactions.filter(transaction => transaction.id !== id);

        // Aggiorna il localStorage
        updateLocalStorage();

        // Inizializza l'interfaccia utente
        init();
    });
}

// Funzione per impostare il bilancio iniziale
function setInitialBalance() {
    // Crea l'overlay per oscurare lo sfondo
    const overlay = document.createElement('div');
    overlay.classList.add('dialog-overlay');
    
    // Crea la finestra di dialogo
    const dialog = document.createElement('div');
    dialog.classList.add('custom-dialog');
    
    // Aggiungi il titolo
    const title = document.createElement('h3');
    title.textContent = 'Imposta Bilancio Iniziale';
    dialog.appendChild(title);
    
    // Aggiungi il campo di input
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('dialog-input-container');
    
    const input = document.createElement('input');
    input.type = 'number';
    input.value = initialBalance;
    input.step = '0.01';
    input.placeholder = 'Inserisci il bilancio iniziale';
    input.classList.add('dialog-input');
    inputContainer.appendChild(input);
    dialog.appendChild(inputContainer);
    
    // Crea i pulsanti
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('dialog-buttons');
    
    // Pulsante di conferma
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Conferma';
    confirmBtn.classList.add('dialog-btn', 'confirm-btn');
    confirmBtn.addEventListener('click', () => {
        const newBalance = input.value;
        // Verifica che l'input sia un numero valido
        if (newBalance !== '' && !isNaN(newBalance)) {
            initialBalance = parseFloat(newBalance);
            updateLocalStorage();
            updateTotals();
        }
        document.body.removeChild(overlay);
    });
    
    // Pulsante di annullamento
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annulla';
    cancelBtn.classList.add('dialog-btn', 'cancel-btn');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    // Aggiungi i pulsanti al container
    buttonsContainer.appendChild(cancelBtn);
    buttonsContainer.appendChild(confirmBtn);
    dialog.appendChild(buttonsContainer);
    
    // Aggiungi la finestra di dialogo all'overlay
    overlay.appendChild(dialog);
    
    // Aggiungi l'overlay al body
    document.body.appendChild(overlay);
    
    // Focus sull'input
    input.focus();
}

// Funzione per gestire i pulsanti di incremento/decremento dell'ammontare
function handleAmountButton(e) {
    if (e.target.classList.contains('amount-btn')) {
        const value = e.target.getAttribute('data-value');
        const currentAmount = amountInput.value === '' ? 0 : parseFloat(amountInput.value);
        
        // Calcola il nuovo valore
        let newAmount;
        if (value === '+1') {
            newAmount = currentAmount + 1;
        } else if (value === '-1') {
            newAmount = currentAmount - 1;
        } else {
            newAmount = currentAmount + parseFloat(value);
        }
        
        // Imposta il nuovo valore (minimo 0)
        amountInput.value = Math.max(0, newAmount).toFixed(2);
    }
}

// Funzione per mostrare/nascondere le opzioni ricorrenti
function toggleRecurringOptions() {
    if (recurringCheckbox.checked) {
        recurringOptions.classList.remove('hidden');
    } else {
        recurringOptions.classList.add('hidden');
    }
}

// Funzione per inizializzare l'interfaccia utente
function init() {
    // Svuota la lista delle transazioni
    transactionList.innerHTML = '';
    
    // Aggiungi ogni transazione al DOM
    transactions.forEach(addTransactionToDOM);
    
    // Aggiorna i totali
    updateTotals();
    
    // Carica le preferenze dell'utente dal localStorage
    loadUserPreferences();
}

// Funzione per caricare le preferenze dell'utente dal localStorage
function loadUserPreferences() {
    // Carica lo stato del form di transazione
    const formVisible = localStorage.getItem('formVisible') === 'true';
    if (formVisible) {
        transactionForm.classList.remove('hidden');
        toggleFormBtn.textContent = 'Nascondi Form';
    } else {
        transactionForm.classList.add('hidden');
        toggleFormBtn.textContent = 'Aggiungi Transazione';
    }
    
    // Carica lo stato della sezione grafici
    const chartsVisible = localStorage.getItem('chartsVisible') === 'true';
    if (chartsVisible) {
        chartsSection.classList.remove('hidden');
        chartsSection.classList.add('active');
    } else {
        chartsSection.classList.add('hidden');
        chartsSection.classList.remove('active');
    }
}

// Funzione per mostrare/nascondere il form di aggiunta transazione
function toggleTransactionForm() {
    transactionForm.classList.toggle('hidden');
    const isHidden = transactionForm.classList.contains('hidden');
    toggleFormBtn.textContent = isHidden ? 'Aggiungi Transazione' : 'Nascondi Form';
    
    // Salva lo stato del form nel localStorage
    localStorage.setItem('formVisible', (!isHidden).toString());
}

// Funzione per entrare nell'applicazione
function enterApp() {
    welcomeScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
}

// Funzione per creare e aggiornare i grafici
function updateCharts(income, expense) {
    // Svuota il contenitore dei grafici
    balanceChartContainer.innerHTML = '';
    
    // Crea i contenitori per i diversi grafici
    const donutChartContainer = document.createElement('div');
    donutChartContainer.classList.add('chart-item');
    donutChartContainer.innerHTML = '<h3>Distribuzione Entrate/Spese</h3>';
    
    const trendChartContainer = document.createElement('div');
    trendChartContainer.classList.add('chart-item');
    trendChartContainer.innerHTML = '<h3>Andamento Mensile</h3>';
    
    const categoryChartContainer = document.createElement('div');
    categoryChartContainer.classList.add('chart-item');
    categoryChartContainer.innerHTML = '<h3>Spese per Categoria</h3>';
    
    // Crea i canvas per i grafici
    const donutCanvas = document.createElement('canvas');
    donutChartContainer.appendChild(donutCanvas);
    
    const trendCanvas = document.createElement('canvas');
    trendChartContainer.appendChild(trendCanvas);
    
    const categoryCanvas = document.createElement('canvas');
    categoryChartContainer.appendChild(categoryCanvas);
    
    // Aggiungi i contenitori al contenitore principale
    balanceChartContainer.appendChild(donutChartContainer);
    balanceChartContainer.appendChild(trendChartContainer);
    balanceChartContainer.appendChild(categoryChartContainer);
    
    // Crea il grafico a ciambella per la distribuzione entrate/spese
    new Chart(donutCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Entrate', 'Spese'],
            datasets: [{
                data: [income, expense],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(244, 67, 54, 0.8)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(244, 67, 54, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Crea il grafico a linee per l'andamento mensile
    // Ottieni gli ultimi 6 mesi di dati
    const months = getLastMonths(6);
    const monthlyData = getMonthlyData(months);
    
    new Chart(trendCanvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Entrate',
                    data: monthlyData.incomes,
                    borderColor: 'rgba(76, 175, 80, 1)',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Spese',
                    data: monthlyData.expenses,
                    borderColor: 'rgba(244, 67, 54, 1)',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
    
    // Crea il grafico a barre per le spese per categoria
    const categories = getCategoryData();
    
    new Chart(categoryCanvas, {
        type: 'bar',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                label: 'Spese per Categoria',
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Funzione per ottenere gli ultimi n mesi
function getLastMonths(n) {
    const months = [];
    const date = new Date();
    
    for (let i = 0; i < n; i++) {
        const month = date.getMonth() - i;
        const year = date.getFullYear();
        const newDate = new Date(year, month, 1);
        const monthName = newDate.toLocaleString('it-IT', { month: 'short' });
        const yearName = newDate.getFullYear();
        months.unshift(`${monthName} ${yearName}`);
    }
    
    return months;
}

// Funzione per ottenere i dati mensili
function getMonthlyData(months) {
    const incomes = [];
    const expenses = [];
    
    // Per ogni mese, calcola entrate e spese
    months.forEach(monthLabel => {
        const [month, year] = monthLabel.split(' ');
        const monthIndex = new Date(Date.parse(`${month} 1, ${year}`)).getMonth();
        const yearNum = parseInt(year);
        
        let monthlyIncome = 0;
        let monthlyExpense = 0;
        
        // Filtra le transazioni per mese e anno
        transactions.forEach(transaction => {
            const transDate = new Date(transaction.date);
            if (transDate.getMonth() === monthIndex && transDate.getFullYear() === yearNum) {
                if (transaction.type === 'income') {
                    monthlyIncome += transaction.amount;
                } else {
                    monthlyExpense += transaction.amount;
                }
            }
        });
        
        incomes.push(monthlyIncome);
        expenses.push(monthlyExpense);
    });
    
    return { incomes, expenses };
}

// Funzione per ottenere i dati delle categorie
function getCategoryData() {
    const categories = {
        'Alimentari': 0,
        'Trasporti': 0,
        'Bollette': 0,
        'Intrattenimento': 0,
        'Salute': 0,
        'Shopping': 0,
        'Altro': 0
    };
    
    // Mappa delle categorie
    const categoryMap = {
        'food': 'Alimentari',
        'transport': 'Trasporti',
        'utilities': 'Bollette',
        'entertainment': 'Intrattenimento',
        'health': 'Salute',
        'shopping': 'Shopping',
        'other-expense': 'Altro'
    };
    
    // Calcola le spese per categoria
    transactions.forEach(transaction => {
        if (transaction.type === 'expense' && transaction.category) {
            const category = categoryMap[transaction.category] || 'Altro';
            categories[category] += transaction.amount;
        }
    });
    
    return categories;
}

// Funzione per mostrare la sezione grafici
function showChartsSection() {
    // Rimuovo la classe hidden e aggiungo active per mostrare la sezione
    chartsSection.classList.remove('hidden');
    chartsSection.classList.add('active');
    
    // Salva lo stato nel localStorage
    localStorage.setItem('chartsVisible', 'true');
    
    // Aggiorno i grafici per assicurarmi che siano visualizzati correttamente
    const amounts = transactions.map(transaction => {
        if (transaction.type === 'income') {
            return transaction.amount;
        } else {
            return -transaction.amount;
        }
    });
    
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0);
    
    const expense = amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1;
    
    updateCharts(income, expense);
}

// Funzione per nascondere la sezione grafici
function hideChartsSection() {
    chartsSection.classList.add('hidden');
    chartsSection.classList.remove('active');
    
    // Salva lo stato nel localStorage
    localStorage.setItem('chartsVisible', 'false');
}

// Funzione per filtrare le transazioni
function filterTransactions() {
    const searchTerm = searchInput.value.toLowerCase();
    const transactionItems = transactionList.querySelectorAll('li');
    
    transactionItems.forEach(item => {
        const title = item.querySelector('.transaction-title').textContent.toLowerCase();
        const description = item.querySelector('.transaction-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            item.style.display = 'flex';
            // Aggiungi animazione quando l'elemento viene mostrato
            item.style.animation = 'fadeIn 0.3s ease-out';
        } else {
            item.style.display = 'none';
        }
    });
}

// Event listeners
enterAppBtn.addEventListener('click', enterApp);
toggleFormBtn.addEventListener('click', toggleTransactionForm);
transactionForm.addEventListener('submit', addTransaction);
transactionList.addEventListener('click', e => {
    if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.parentElement.getAttribute('data-id'));
        removeTransaction(id);
    }
});

document.addEventListener('click', e => {
    if (e.target.classList.contains('amount-btn')) {
        handleAmountButton(e);
    }
});

// Aggiungi l'event listener per il checkbox della transazione periodica
recurringCheckbox.addEventListener('change', toggleRecurringOptions);

setInitialBalanceBtn.addEventListener('click', setInitialBalance);
viewChartsBtn.addEventListener('click', showChartsSection);
closeChartsBtn.addEventListener('click', hideChartsSection);

// Aggiungi l'event listener per la ricerca
searchInput.addEventListener('input', filterTransactions);

// Aggiungi classe CSS per animazioni
document.body.classList.add('loaded');

// Inizializza l'interfaccia utente
init();