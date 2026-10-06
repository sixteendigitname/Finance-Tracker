const STORAGE_KEY = "expenses";
let expenses = load()
const expenseForm = document.getElementById("expense-form")
const itemInput = document.getElementById("item")
const priceInput = document.getElementById("price")
const categoryInput = document.getElementById("category")
const dateInput = document.getElementById("date")
const formError = document.getElementById("form-error")
const ledgerBody = document.getElementById("ledger-body")
const emptyState = document.getElementById("empty-state")
const budgetCategoryInput = document.getElementById("budget-category")
const budgetForm = document.getElementById("budget-form")
const budgetCategory = document.getElementById("budget-category")
const budgetLimit = document.getElementById("budget-limit")
const budgetBars = document.getElementById("budget-bars")
const monthFilter = document.getElementById("month-filter")
const budgetError = document.getElementById("budget-error")
const pieChart = document.getElementById("pie-chart")
const exportjson = document.getElementById("export-json")
const exportcsv = document.getElementById("export-csv")
const chartLegend = document.getElementById("chart-legend")
const CATEGORIES = ["Food", "Transportation", "Utilities", "Entertainment"]
const CATEGORY_COLORS = {
    Food: "tomato",
    Transportation: "steelblue",
    Utilities: "gold",
    Entertainment: "mediumseagreen"
};
const BUDGET_KEY = "budgets"
let budgets = loadBudgets()

function handleSetBudget(event){
    event.preventDefault()
    const category = budgetCategoryInput.value
    const limit = Number(budgetLimit.value)
    if (!Number.isFinite(limit) || limit < 0){
        budgetError.textContent = "Budget must be greater than or equal to 0."
        return
    }
    else{
        budgetError.textContent = ""
    }


    if (category === ""){
        budgetError.textContent = "Please choose a category."
        return
    }

    budgets[category] = limit
    saveBudgets()
    render()
    budgetForm.reset()
    console.log(budgets)
}

function populateCategorySelect(){
    const selects = [categoryInput, budgetCategoryInput]
    selects.forEach((select) => {
        CATEGORIES.forEach(category => {
        const option = document.createElement("option")
        option.value = category;
        option.textContent = category
        select.appendChild(option)})
    })
}

function loadBudgets(){
    const raw = localStorage.getItem(BUDGET_KEY)
    if (raw == null){
        return{}
    }
    try{
        const parsed = JSON.parse(raw)
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)){
        return parsed
    }
    }
    catch (error){
        console.error("Could not load saved budgets:", error)
        return {}
    }
    return {}
}

function saveBudgets(){
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets))
}

function handleAddExpense(event){
    event.preventDefault()
    const item = itemInput.value.trim()
    const price = Number(priceInput.value)
    const category = categoryInput.value
    const date = dateInput.value

    if (item === ""){
        formError.textContent = "Item name cannot be empty."
        return;
    }
    else if (category === ""){
        formError.textContent = "Category cannot be empty."
        return;
    }
    else if (!Number.isFinite(price) || price <= 0){
        formError.textContent = "Price must be greater than 0."
        return
    }
    else{
        formError.textContent = ""
    }

    const expense = {
    id: Date.now(),
    item: item,
    price: price,
    category: category,
    date: date
    }

    expenses.push(expense)
    save()
    render()
    console.log(expenses)

    expenseForm.reset()
    new Date().toISOString().slice(0,10)
    dateInput.value = getTodayString()
}

function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function save(){
   localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

function load(){
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw == null){
        return []
    }
    try{
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)){
        return parsed
    }
    }
    catch (error){
        console.error("Could not load saved expenses:", error)
        return []
    }
    return []
}

function renderLedger(){
    ledgerBody.textContent = ""
    emptyState.hidden = expenses.length !== 0
    const expensesCopy = [...getMonthlyExpenses()].sort((a,b) => (b.date.localeCompare(a.date)))
    expensesCopy.forEach((expense) => {
        const row = document.createElement("tr")
        const values = [expense.date, expense.item, expense.category, expense.price.toFixed(2)]

        values.forEach((text) => {
            const cell = document.createElement("td");
            cell.textContent = text;
            row.appendChild(cell);
        })
        const actionCell = document.createElement("td")
        const deleteButton = document.createElement("button")
        deleteButton.textContent = "Delete"
        deleteButton.dataset.id = expense.id
        actionCell.appendChild(deleteButton)
        row.appendChild(actionCell)
        ledgerBody.appendChild(row)
    })
}

function render(){
    renderLedger()
    renderBudgets()
    renderChart()
}

function renderBudgets(){
    budgetBars.textContent = ""
    const totals = getCategoryTotals(getMonthlyExpenses())
    CATEGORIES.forEach((category) => {
        const spent = totals[category] || 0
        const limit = budgets[category]
        if (limit === undefined){
            const label = document.createElement("p")
            label.textContent = `${category}: $${spent.toFixed(2)}`
            budgetBars.appendChild(label)
            return
        }
        let percentage
        if (limit === 0) {
            percentage = spent > 0 ? 100 : 0
        } else {
            percentage = spent / limit * 100
        }
        let percentText
        if (limit == 0 && spent > 0){
            percentText = "over budget"
        }
        else {
            percentText = Math.round(percentage) + "%"
        }
        const isOver = limit === 0 ? spent > 0 : percentage > 100
        const wrapper = document.createElement("div")
        const label = document.createElement("p")
        label.textContent = `${category}: $${spent.toFixed(2)} / $${limit.toFixed(2)} (${percentText})`

        const track = document.createElement("div")
        track.classList.add("bar-track")

        const fill = document.createElement("div")
        fill.classList.add("bar-fill")
        fill.style.width = Math.min(percentage, 100) + "%"
        fill.classList.add(isOver ? "over" : getBarClass(percentage))

        track.appendChild(fill)
        wrapper.appendChild(label)
        wrapper.appendChild(track)
        budgetBars.appendChild(wrapper)
    })
}

function getBarClass(percentage){
    if (percentage < 75){
        return "ok"
    }
    else if (percentage <= 100){
        return "warn"
    }
    else if (percentage>100){
        return "over"
    }
}

function renderChart(){
    chartLegend.textContent = ""
    const totals = getCategoryTotals(getMonthlyExpenses())
    const grandTotal = Object.values(totals).reduce((sum, amount) => sum + amount, 0)
    if (grandTotal === 0){
        pieChart.style.background = "#ddd"
        return
    }
    let runningTotal = 0
    const stops = []
    CATEGORIES.forEach((category)=>{
        if (totals[category]===undefined){
            return
        } 
        const share = totals[category]/grandTotal * 100
        const start = runningTotal
        const end = runningTotal + share
        const color = CATEGORY_COLORS[category]
        stops.push(`${color} ${start}% ${end}%`)
        runningTotal = end

        const swatch = document.createElement("span")
        swatch.classList.add("legend-swatch")
        swatch.style.backgroundColor = color

        const text = document.createElement("span")
        text.textContent = `${category}: ${Math.round(share)}% ($${totals[category].toFixed(2)})`

        const line = document.createElement("li")
        line.appendChild(swatch)
        line.appendChild(text)
        chartLegend.appendChild(line)
    })
    pieChart.style.background = `conic-gradient(${stops.join(", ")})`
}

function handleLedgerClick(event){
    if (event.target.dataset.id === undefined){
        return
    }
    const id = Number(event.target.dataset.id)
    expenses = expenses.filter(e => e.id !== id)
    save()
    render()
}

function getMonthlyExpenses(){
    return expenses.filter((expense) => expense.date.startsWith(monthFilter.value))
}

function getCategoryTotals(list) {
    return list.reduce((totals, expense) => {
        totals[expense.category] = (totals[expense.category] || 0) + expense.price
        return totals
    }, {})
}

function downloadFile(filename, content, mimeType){
    const blob = new Blob([content], {type: mimeType})
    const url = URL.createObjectURL(blob)
    aElement = document.createElement("a")
    aElement.href = url
    aElement.download = filename
    aElement.click()
    URL.revokeObjectURL(url)
}

function csvEscape(string){
    const escaped = String(string).replaceAll('"', '""')
    return `"${escaped}"`
}

function handleExportJson(){
    downloadFile("expenses.json", JSON.stringify(expenses, null, 2), "application/json")
}

function handleExportCsv(){
    const header = "id,item,price,category,date"
    const rows = expenses.map((expense) => {
        return[
        expense.id,
        csvEscape(expense.item),
        expense.price,
        csvEscape(expense.category),
        expense.date
        ].join(",")
    })
    const csvString = [header, ...rows].join("\n")
    downloadFile("expenses.csv", csvString, "text/csv")
}

expenseForm.addEventListener("submit", handleAddExpense)
budgetForm.addEventListener("submit", handleSetBudget)
ledgerBody.addEventListener("click", handleLedgerClick)
exportcsv.addEventListener("click", handleExportCsv)
exportjson.addEventListener("click", handleExportJson)
monthFilter.addEventListener("change", render)

dateInput.value = getTodayString()
monthFilter.value = getTodayString().slice(0, 7)
populateCategorySelect()
render()

