This is a browser-based personal finance tracker with budgets and a Python analysis script.
No backend, no accounts, data stays in the browser.

<img width="2045" height="940" alt="image" src="https://github.com/user-attachments/assets/fb3a0236-0906-4e87-8e9d-5141aa946c47" />
<img width="415" height="278" alt="image" src="https://github.com/user-attachments/assets/797a08ef-b302-48a4-b9ca-b2bc128cd4c0" />

Features:
1. Add expenses
2. Data persists in localStorage
3. Per-category budgets with color coded progress bars
4. Month filter
5. Pie chart with legend
6. Ledger with delete and automatic recalculation
7. JSON and CSV export
8. (unfinished) analyse.py for summary stats

Open index.html in a browser. No install needed.
It required pandas, python 3.9+ and eventually matplotlib:

python -m pip install pandas
python analyse.py                 
python analyse.py path/to/file.json

Exporting data:

Click export JSON, the file will be downloaded to your downloads folder, move it next o analyse.py, then run the script.

index.html   markup
style.css    styling
app.js       all app logic
analyse.py   pandas summary statistics

Budgets aren't yet per-month, data is per-browser and lost if site data is cleared, and no edit feature

The expenses array is used to store all the expenses and their details, same with the budgets array. 
Listeners are used for a change data -> save -> render loop, used in all the features. The pie chart is a CSS conic-gradient built from category totals.

Future work:
1. make it look decent, ie styling
2. import JSON
3. custom categories
4. per-month budgets

  

