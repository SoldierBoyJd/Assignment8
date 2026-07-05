let transactions = [];
let startingBalance = 0;
let sessionActive = false;
let currentCurrency = "USD";

const rates = {
  USD: { symbol: "$", rate: 1.0 },
  INR: { symbol: "₹", rate: 94.4 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  JPY: { symbol: "¥", rate: 159.5 },
  CAD: { symbol: "C$", rate: 1.37 },
  AUD: { symbol: "A$", rate: 1.5 },
};

window.onload = function () {
  checkApplicationState();
  fetchLiveRates();
  document.getElementById("formDate").value = new Date()
    .toISOString()
    .split("T")[0];
};

async function fetchLiveRates() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();
    if (data && data.rates) {
      rates.USD.rate = 1.0;
      rates.INR.rate = data.rates.INR || 83.5;
      rates.EUR.rate = data.rates.EUR || 0.92;
      rates.GBP.rate = data.rates.GBP || 0.79;
      rates.JPY.rate = data.rates.JPY || 159.5;
      rates.CAD.rate = data.rates.CAD || 1.37;
      rates.AUD.rate = data.rates.AUD || 1.5;
      updateDashboardUI();
    }
  } catch (error) {
    updateDashboardUI();
  }
}

function checkApplicationState() {
  const register = document.getElementById("registerScreen");
  const login = document.getElementById("loginScreen");
  const main = document.getElementById("mainLayout");

  register.classList.add("hidden");
  login.classList.add("hidden");
  main.classList.add("hidden");

  const userCheck = localStorage.getItem("user_details");
  if (userCheck == null) {
    register.classList.remove("hidden");
  } else {
    const detailsObj = JSON.parse(userCheck);
    if (sessionActive == false) {
      document.getElementById("loginGreeting").innerText =
        "Welcome back, " + detailsObj.name + "!";
      document.getElementById("loginPassword").value = "";
      document.getElementById("loginError").classList.add("hidden");
      login.classList.remove("hidden");
    } else {
      startingBalance = Number(detailsObj.balance);
      document.getElementById("settingsName").value = detailsObj.name;
      document.getElementById("headerUserName").innerText = detailsObj.name;
      main.classList.remove("hidden");

      renderGreeting(detailsObj.name);

      const storedItems = localStorage.getItem("local_transactions");
      if (storedItems != null) {
        transactions = JSON.parse(storedItems);
      } else {
        transactions = [];
      }
      updateDashboardUI();
    }
  }
}

function registerUser(e) {
  e.preventDefault();
  const nameInput = document.getElementById("regName").value;
  let balanceInput = document.getElementById("regBalance").value;
  const passwordInput = document.getElementById("regPassword").value;

  if (balanceInput == "") {
    balanceInput = 0;
  }

  const saveObj = {
    name: nameInput,
    balance: balanceInput,
    password: passwordInput,
  };

  localStorage.setItem("user_details", JSON.stringify(saveObj));
  sessionActive = true;
  showToast("Registration successful!");
  checkApplicationState();
}

function loginUser(e) {
  e.preventDefault();
  const passInput = document.getElementById("loginPassword").value;
  const storedData = localStorage.getItem("user_details");
  const detailsObj = JSON.parse(storedData);

  if (passInput == detailsObj.password) {
    sessionActive = true;
    showToast("Welcome to your dashboard");
    checkApplicationState();
  } else {
    document.getElementById("loginError").classList.remove("hidden");
  }
}

function lockApp() {
  sessionActive = false;
  changeTab("dashboard");
  checkApplicationState();
  showToast("Logged out successfully");
}

function updateProfile(e) {
  e.preventDefault();
  const updatedName = document.getElementById("settingsName").value;
  const updatedPass = document.getElementById("settingsPassword").value;

  const storedData = localStorage.getItem("user_details");
  const detailsObj = JSON.parse(storedData);

  detailsObj.name = updatedName;
  if (updatedPass != "") {
    detailsObj.password = updatedPass;
  }

  localStorage.setItem("user_details", JSON.stringify(detailsObj));
  showToast("Profile details updated");
  checkApplicationState();
}

function changeTab(tabName) {
  const dashTab = document.getElementById("tab-dashboard");
  const setTab = document.getElementById("tab-settings");
  const dashBtn = document.getElementById("btn-dashboard");
  const setBtn = document.getElementById("btn-settings");

  if (tabName == "dashboard") {
    dashTab.classList.remove("hidden");
    setTab.classList.add("hidden");
    dashBtn.className =
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-400 font-medium text-sm border border-blue-500/20 text-left transition";
    setBtn.className =
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium text-sm text-left transition";
  } else {
    dashTab.classList.add("hidden");
    setTab.classList.remove("hidden");
    dashBtn.className =
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium text-sm text-left transition";
    setBtn.className =
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-400 font-medium text-sm border border-blue-500/20 text-left transition";
  }
}

function renderGreeting(userName) {
  const hour = new Date().getHours();
  let greetingText = "Good morning";
  let iconStr = "ri-sun-line text-yellow-500";

  if (hour >= 12 && hour < 17) {
    greetingText = "Good afternoon";
    iconStr = "ri-sun-fill text-amber-500";
  } else if (hour >= 17 && hour < 21) {
    greetingText = "Good evening";
    iconStr = "ri-moon-clear-line text-blue-400";
  } else if (hour >= 21 || hour < 5) {
    greetingText = "Good night";
    iconStr = "ri-moon-fill text-indigo-400";
  }

  document.getElementById("headerGreeting").innerHTML =
    '<i class="' +
    iconStr +
    '"></i> ' +
    greetingText +
    ', <strong class="text-white">' +
    userName +
    "</strong>!";
}

function changeCurrency() {
  currentCurrency = document.getElementById("currencySelect").value;
  updateDashboardUI();
  showToast("Switched currency to " + currentCurrency);
}

function updateDashboardUI() {
  localStorage.setItem("local_transactions", JSON.stringify(transactions));

  const symbol = rates[currentCurrency].symbol;
  const rate = rates[currentCurrency].rate;

  let totalInc = 0;
  let totalExp = 0;

  for (let i = 0; i < transactions.length; i++) {
    const item = transactions[i];
    if (item.type == "income") {
      totalInc = totalInc + Number(item.amount);
    } else {
      totalExp = totalExp + Number(item.amount);
    }
  }

  const finalBalance = (startingBalance + totalInc - totalExp) * rate;
  const convertedInc = totalInc * rate;
  const convertedExp = totalExp * rate;

  document.getElementById("statBalance").innerText =
    symbol + finalBalance.toFixed(2);
  document.getElementById("statIncome").innerText =
    symbol + convertedInc.toFixed(2);
  document.getElementById("statExpense").innerText =
    symbol + convertedExp.toFixed(2);
  document.getElementById("statCount").innerText = transactions.length;

  const searchText = document.getElementById("searchBox").value.toLowerCase();
  const filterType = document.getElementById("filterSelect").value;
  const table = document.getElementById("tableBody");
  const placeholder = document.getElementById("noDataPlaceholder");

  table.innerHTML = "";

  let matchCount = 0;

  for (let j = 0; j < transactions.length; j++) {
    const t = transactions[j];
    const descMatch = t.description.toLowerCase().indexOf(searchText) != -1;
    const catMatch = t.category.toLowerCase().indexOf(searchText) != -1;
    const typeMatch = filterType == "all" || t.type == filterType;

    if ((descMatch || catMatch) && typeMatch) {
      matchCount = matchCount + 1;

      const row = document.createElement("tr");
      row.className = "hover:bg-navy-bg/30 transition-colors";

      let sign = "-";
      let styleClass = "text-rose-400 font-semibold";
      if (t.type == "income") {
        sign = "+";
        styleClass = "text-emerald-400 font-semibold";
      }

      const d = new Date(t.date);
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const itemVal = Number(t.amount) * rate;

      row.innerHTML =
        ' \
        <td class="py-2.5 px-3 text-slate-400 whitespace-nowrap">' +
        dateStr +
        '</td> \
        <td class="py-2.5 px-3 font-medium text-slate-100">' +
        t.description +
        '</td> \
        <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[9px] bg-navy-input border border-navy-border text-slate-400 font-medium">' +
        t.category +
        '</span></td> \
        <td class="py-2.5 px-3 text-right ' +
        styleClass +
        '">' +
        sign +
        symbol +
        itemVal.toFixed(2) +
        '</td> \
        <td class="py-2.5 px-3 text-center"> \
          <button onclick="removeTransaction(' +
        t.id +
        ')" class="p-1 text-rose-400 hover:text-rose-300 transition"> \
            <i class="ri-delete-bin-line"></i> \
          </button> \
        </td> \
      ';
      table.appendChild(row);
    }
  }

  document.getElementById("entriesCount").innerText =
    "Showing " + matchCount + " of " + transactions.length + " entries";

  if (matchCount == 0) {
    placeholder.classList.remove("hidden");
  } else {
    placeholder.classList.add("hidden");
  }

  renderCustomChart(convertedInc, convertedExp);
}
function renderCustomChart(inc, exp) {
  const container = document.getElementById("chartContainer");
  const symbol = rates[currentCurrency].symbol;
  container.innerHTML = "";

  let largest = inc;
  if (exp > largest) {
    largest = exp;
  }
  if (largest == 0) {
    largest = 100;
  }

  let incPct = (inc / largest) * 90;
  let expPct = (exp / largest) * 90;

  if (incPct < 8 && inc > 0) {
    incPct = 8;
  }
  if (expPct < 8 && exp > 0) {
    expPct = 8;
  }

  container.innerHTML =
    ' \
    <div class="flex flex-col items-center justify-end h-full"> \
      <div class="bg-emerald-500 w-12 sm:w-16 rounded-t transition-all duration-300 relative group cursor-pointer" style="height: ' +
    incPct +
    '%"> \
        <span class="absolute bottom-full left-1/2 -translate-x-1/2 bg-navy-sidebar border border-navy-border text-[9px] px-2 py-0.5 rounded shadow-xl hidden group-hover:block whitespace-nowrap text-emerald-400 mb-1">' +
    symbol +
    inc.toFixed(2) +
    '</span> \
      </div> \
      <span class="text-[10px] font-semibold text-slate-400 mt-2">Income</span> \
    </div> \
    <div class="flex flex-col items-center justify-end h-full"> \
      <div class="bg-rose-500 w-12 sm:w-16 rounded-t transition-all duration-300 relative group cursor-pointer" style="height: ' +
    expPct +
    '%"> \
        <span class="absolute bottom-full left-1/2 -translate-x-1/2 bg-navy-sidebar border border-navy-border text-[9px] px-2 py-0.5 rounded shadow-xl hidden group-hover:block whitespace-nowrap text-rose-400 mb-1">' +
    symbol +
    exp.toFixed(2) +
    '</span> \
      </div> \
      <span class="text-[10px] font-semibold text-slate-400 mt-2">Expenses</span> \
    </div> \
  ';
}
function showModal() {
  document.getElementById("formDesc").value = "";
  document.getElementById("formAmount").value = "";
  document.getElementById("amountLabel").innerText =
    "Amount (" + rates[currentCurrency].symbol + ")";
  setFormType("income");
  document.getElementById("modalContainer").classList.remove("hidden");
}

function hideModal() {
  document.getElementById("modalContainer").classList.add("hidden");
}

function setFormType(type) {
  document.getElementById("formType").value = type;
  const btnInc = document.getElementById("btnIncome");
  const btnExp = document.getElementById("btnExpense");

  if (type == "income") {
    btnInc.className =
      "py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 bg-emerald-500/10 border-emerald-500 text-emerald-400";
    btnExp.className =
      "py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 border-navy-border text-slate-400";
  } else {
    btnInc.className =
      "py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 border-navy-border text-slate-400";
    btnExp.className =
      "py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 bg-rose-500/10 border-rose-500 text-rose-400";
  }
}

function addTransaction(e) {
  e.preventDefault();

  const type = document.getElementById("formType").value;
  const desc = document.getElementById("formDesc").value;
  const inputAmt = document.getElementById("formAmount").value;
  const dte = document.getElementById("formDate").value;
  const cat = document.getElementById("formCategory").value;

  const baseAmt = Number(inputAmt) / rates[currentCurrency].rate;

  const itemObj = {
    id: Date.now(),
    type: type,
    description: desc,
    amount: baseAmt,
    date: dte,
    category: cat,
  };

  transactions.push(itemObj);
  hideModal();
  updateDashboardUI();
  showToast("Transaction added successfully");
}

function removeTransaction(id) {
  const tempArr = [];
  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].id != id) {
      tempArr.push(transactions[i]);
    }
  }
  transactions = tempArr;
  updateDashboardUI();
  showToast("Entry deleted successfully");
}

function loadSampleData() {
  transactions = [
    {
      id: 1,
      type: "income",
      description: "Enterprise Project Delivery",
      amount: 5500.0,
      date: "2026-06-12",
      category: "Salary",
    },
    {
      id: 2,
      type: "expense",
      description: "Cloud Services Subscription",
      amount: 480.0,
      date: "2026-06-14",
      category: "Utilities",
    },
    {
      id: 3,
      type: "expense",
      description: "Workspace Hub Rent",
      amount: 350.0,
      date: "2026-06-15",
      category: "Rent",
    },
    {
      id: 4,
      type: "income",
      description: "Investment Dividends",
      amount: 1450.0,
      date: "2026-06-20",
      category: "Investments",
    },
  ];
  updateDashboardUI();
  showToast("Sample data loaded successfully");
}

function resetData() {
  localStorage.removeItem("user_details");
  localStorage.removeItem("local_transactions");
  transactions = [];
  startingBalance = 0;
  sessionActive = false;
  currentCurrency = "USD";
  document.getElementById("currencySelect").value = "USD";
  changeTab("dashboard");
  checkApplicationState();
  showToast("All data cleared completely");
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  document.getElementById("toastText").innerText = msg;
  toast.classList.remove("hidden");
  setTimeout(function () {
    toast.classList.add("hidden");
  }, 3000);
}
