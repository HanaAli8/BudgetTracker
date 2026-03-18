const form = document.getElementById("expense-form");//document is the whole file. get it from html as var
const List = document.getElementById("expense-list");
const totalSpan = document.getElementById("total");

let expenses=[];
let categories = [];//holds objects of type category
let categoryStatus = {}; // Track notification state per category


const navButtons = document.querySelectorAll(".nav-btn");//get all the navigation buttons from html, we will add event listeners to them to switch between pages
const pages = document.querySelectorAll("#main-content > div");

navButtons.forEach(btn => {//for each button, we add a click event listener that will switch the pages and activate the button
  btn.addEventListener("click", () => {

    // Remove active class from all buttons
    navButtons.forEach(b => b.classList.remove("active"));//deactivate all buttons

    // Hide all pages
    pages.forEach(page => page.style.display = "none");//hide all pages

    // Show selected page
    const pageId = btn.getAttribute("data-page");//get the page id from the button's data attribute, this is the id of the page we want to show
    document.getElementById(pageId).style.display = "block";

    // Activate button
    btn.classList.add("active");
  });
});

let usdToLbpRate = 0;// this will hold the exchange rate, we will fetch it from an API later
let previousRate = 0;
async function getDollarRate() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");//we fetch the latest exchange rates for USD from this API,
    //  it returns a JSON with a "rates" object that contains the exchange rates for different currencies
    const data = await response.json();//we parse the response as JSON to get the data object

    // store previous then update
    previousRate = usdToLbpRate;
    usdToLbpRate = data.rates.LBP;

    const rateElt = document.getElementById("usd-rate");
    rateElt.textContent = `1 USD = ${usdToLbpRate.toLocaleString()} LBP`;

    // Change color based on rate movement (visual hint)
    if (previousRate !== 0) {
      if (usdToLbpRate > previousRate) {
        rateElt.style.color = "#059669"; // up -> green
      } else if (usdToLbpRate < previousRate) {
        rateElt.style.color = "#b91c1c"; // down -> red
      } else {
        rateElt.style.color = "var(--green-700)";
      }
    }



  } catch (error) {//if there is an error during the fetch or parsing, we catch it and log it, and also update the text to show an error message
    console.error("Error fetching rate:", error);
    document.getElementById("usd-rate").textContent =
      "Failed to load rate";
  }
}

document.getElementById("usd-to-lbp").addEventListener("click", function() {//get the button for usd to lbp
  const usdAmount = parseFloat(document.getElementById("usd-input").value);//get input

  if (!isNaN(usdAmount)) {//if the input is a valid number, we calculate the result 
    const result = usdAmount * usdToLbpRate;//we multiply the usd amount by the exchange rate to get the equivalent amount in lbp
    document.getElementById("lbp-input").value = result.toFixed(2);//we update the lbp input with the result, we use toFixed(2) to round it to 2 decimal places for better readability since lbp amounts can be large
;}
});

document.getElementById("lbp-to-usd").addEventListener("click", function() {//same thing for lbp to usd, we get the button and add a click event listener
  const lbpAmount = parseFloat(document.getElementById("lbp-input").value);//get the lbp amount from the input

  if (!isNaN(lbpAmount)) {//if valid
    const result = lbpAmount / usdToLbpRate;//we divide the lbp amount by the exchange rate to get the equivalent amount in usd
    document.getElementById("usd-input").value = result.toFixed(2);//we update the usd input with the result, we use toFixed(2) to round it to 2 decimal places since usd is usually used with cents
  }
});


























// Set default date to today
document.getElementById("expense-date").value =
  new Date().toISOString().split("T")[0];




function showNotification(message, type = "info") {//a function to show notifications, takes a message and a type (info, error, warning)

  const container = document.getElementById("notification-container");

  const div = document.createElement("div");
  div.textContent = message;//set the text of the notification to the message passed in

  div.style.padding = "12px 16px";//some basic styling for the notification
  div.style.marginBottom = "10px";
  div.style.borderRadius = "10px";
  div.style.color = "white";
  div.style.fontWeight = "bold";
  div.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
  div.style.transition = "opacity 0.3s ease";

  let bgColor = "#10b981"; // default green

  if (type === "error") {//if the type is error, we set the background color to red
    div.style.backgroundColor = "#ef4444"; // red
    bgColor = "#ef4444";
  } else if (type === "warning") {
    div.style.backgroundColor = "#f59e0b"; // orange
    bgColor = "#f59e0b";
  } else {
    div.style.backgroundColor = bgColor; // green for info
  }

  container.appendChild(div);

 
  // Play soft, musical notification sound
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    if (type === "error") {
      // Sad, soft descending tones
      playTone(audioContext, 280, 0.15, 0.3); // lower tone
      setTimeout(() => playTone(audioContext, 220, 0.12, 0.4), 150);
    } else if (type === "warning") {
      // Alert but softer - two mid tones
      playTone(audioContext, 420, 0.14, 0.25);
      setTimeout(() => playTone(audioContext, 500, 0.14, 0.25), 100);
    } else {
      // Success - pleasant ascending chord
      playTone(audioContext, 330, 0.12, 0.2); // C
      setTimeout(() => playTone(audioContext, 415, 0.12, 0.2), 80); // E
      setTimeout(() => playTone(audioContext, 495, 0.12, 0.25), 160); // G
    }
  } catch (e) {
    // silently fail if audio not supported
  }

  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 300);
  }, 4000);
}

function playTone(audioContext, frequency, gain, duration) {//a helper function to play a tone with given frequency, gain and duration
  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const now = audioContext.currentTime;

  osc.type = "triangle"; // softer than sine
  osc.frequency.value = frequency;

  gainNode.gain.setValueAtTime(0, now); // start silent
  gainNode.gain.linearRampToValueAtTime(gain, now + 0.05); // attack
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // decay

  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);

  osc.start(now);
  osc.stop(now + duration);
}


class Category{
     constructor(name,limit=0,goal=0){
        this.name=name;
        this.limit=limit;//limit is the max amount we want to spend on this category, default is 0 which means no limit
        this.goal=goal;//goal is the amount we want to save in this category, default is 0 which means no goal
     }
}
const savedCategories = localStorage.getItem("categories");//get the categories from local storage, if they exist

if (savedCategories) {
  categories = JSON.parse(savedCategories);
} else {//default
  categories = [
    new Category("Food",500),
    new Category("Transport",200),
    new Category("savings",0,1000)
  ];
}
function renderCategoryOptions() {//to fill the dropdown with the categories from the array
  const categorySelect = document.getElementById("expense-category");
  categorySelect.innerHTML = "";

  categories.forEach(cat => {//for each category in the array, we create an option element and add it to the dropdown
    const option = document.createElement("option");
    option.value = cat.name;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });

  // Also update the "Update Category" dropdown
  const updateSelect = document.getElementById("category-to-update");//this is the dropdown in the update category section, we also need to fill it with the categories so the user can select which one to update
  if (updateSelect) {//if this dropdown exists in the html (it won't exist in the AI page, so we check first), we fill it with the categories
    updateSelect.innerHTML = "";
    categories.forEach(cat => {//for each category, we create an option element and add it to the update dropdown
      const option = document.createElement("option");
      option.value = cat.name;
      option.textContent = cat.name;
      updateSelect.appendChild(option);
    });
  }
}
const addCategoryBtn = document.getElementById("add-category-btn");//get the button from html
const newCategoryInput = document.getElementById("new-category-name");//get the input from html

addCategoryBtn.addEventListener("click", function() {//when the button is clicked, we get the value from the input and add it to the categories array
  const newName = newCategoryInput.value.trim();//we trim it to remove any extra spaces

  if (!newName) return;//if the input is empty, we do nothing

  
  const exists = categories.some(cat => cat.name === newName);
  if (exists) {
    alert("Category already exists");
    return;
  }
  const limitInput = document.getElementById("category-limit");
    const goalInput = document.getElementById("category-goal");

    const limit = parseFloat(limitInput.value) || 0;
    const goal = parseFloat(goalInput.value) || 0;

    // Validate that both limit and goal cannot be set at the same time
    if (limit > 0 && goal > 0) {
      alert("A category cannot have both a limit and a goal. Please set one to 0.");
      return;
    }

    const newCategory = new Category(newName, limit, goal);

  // Create new Category object
 
  categories.push(newCategory);//add it to the array

  // Save categories
  localStorage.setItem("categories", JSON.stringify(categories));

  // Update dropdown
  renderCategoryOptions();

  // Clear inputs
  newCategoryInput.value = "";
  limitInput.value = "";
  goalInput.value = "";
});
// Update Category limits and goals
const updateBtn = document.getElementById("update-category-btn");

updateBtn.addEventListener("click", function () {//when the update button is clicked, we get the selected category and the new limit and goal values, then we update the category object in the array

  const selectedName = document.getElementById("category-to-update").value;
  const newLimit = parseFloat(document.getElementById("update-category-limit").value);
 const newGoal = parseFloat(document.getElementById("update-category-goal").value);

  // Validate that both limit and goal cannot be set at the same time
  if (!isNaN(newLimit) && !isNaN(newGoal) && newLimit > 0 && newGoal > 0) {//if the user entered valid numbers for both limit and goal, we show an alert and do nothing
    alert("A category cannot have both a limit and a goal. Please set one to 0.");
    return;
  }

  // Find the category object
  const category = categories.find(cat => cat.name === selectedName);

  if (!category) return;

  // Update values (only if user entered something)
  if (!isNaN(newLimit)) {//if the user entered a valid number for the limit, we update it
    category.limit = newLimit;
  }

  if (!isNaN(newGoal)) {
    category.goal = newGoal;
  }

  
  localStorage.setItem("categories", JSON.stringify(categories));//save the updated categories array to local storage

  
  updateCategoryTotals();

  // Clear update inputs
  document.getElementById("update-category-limit").value = "";
  document.getElementById("update-category-goal").value = "";

  alert("Category updated!");
});
//initial rendering of category options in the dropdown
renderCategoryOptions(); //call it once to fill the dropdown

  function updateTotal(){
  // Calculate total of ALL expenses
  const overallTotal = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  totalSpan.textContent = overallTotal.toFixed(2);
  
  // Group expenses by month AND category
  const monthlyTotals = {};
  
  expenses.forEach(exp => {
    if (!exp.date) return; // skip if no date
    try {
      const dateObj = new Date(exp.date + "T00:00:00");// we add "T00:00:00" to ensure it's treated as local date without timezone issues
      if (isNaN(dateObj.getTime())) return; // skip if invalid
      const monthKey = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long" });
      
      // Initialize month if not exists
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { total: 0, byCategory: {} };
      }
      
      monthlyTotals[monthKey].total += (exp.amount || 0);// add to month total
      monthlyTotals[monthKey].byCategory[exp.category] = (monthlyTotals[monthKey].byCategory[exp.category] || 0) + (exp.amount || 0);// add to category total for this month
    } catch (e) {
      console.error("Error parsing date:", exp.date, e);
    }
  });
  
  // Display monthly totals with category breakdown
  const monthlyContainer = document.getElementById("monthly-totals");
  if (monthlyContainer) {//if the container exists in the html, we render the monthly totals, this check is important because this function is also called on the AI page where there is no monthly breakdown
    monthlyContainer.innerHTML = "";
    
    // Sort months chronologically
    const sortedMonths = Object.entries(monthlyTotals).sort((a, b) => {//sort by date, we convert the month keys back to date objects for accurate sorting
      return new Date(a[0]) - new Date(b[0]);
    });
    
    if (sortedMonths.length === 0) {//if there are no expenses with valid dates, we show a message
      monthlyContainer.innerHTML = "<p style='color: var(--muted);'>No expenses yet</p>";
    } else {//for each month, we create a container that shows the total for that month and a breakdown by category
      sortedMonths.forEach(([month, data]) => {
        // Month container
        const monthDiv = document.createElement("div");
        monthDiv.style.marginBottom = "16px";
        monthDiv.style.padding = "14px";
        monthDiv.style.background = "#ffffff";
        monthDiv.style.borderRadius = "10px";
        monthDiv.style.border = "1px solid rgba(16,185,129,0.12)";
        monthDiv.style.boxShadow = "0 4px 12px rgba(4,120,87,0.06)";
        
        // Month header with total (CLICKABLE)
        const monthHeader = document.createElement("div");
        monthHeader.style.display = "flex";
        monthHeader.style.justifyContent = "space-between";
        monthHeader.style.alignItems = "center";
        monthHeader.style.marginBottom = "12px";
        monthHeader.style.paddingBottom = "10px";
        monthHeader.style.borderBottom = "2px solid rgba(16,185,129,0.1)";
        monthHeader.style.cursor = "pointer";
        monthHeader.style.userSelect = "none";
        
        const monthTitle = document.createElement("div");
        monthTitle.style.display = "flex";
        monthTitle.style.alignItems = "center";
        monthTitle.style.gap = "10px";
        
        const toggle = document.createElement("span");
        toggle.style.fontSize = "1rem";
        toggle.style.color = "var(--green-700)";
        toggle.style.transition = "transform 0.3s ease";
        toggle.textContent = "▼";
        
        const monthName = document.createElement("span");
        monthName.style.color = "var(--green-700)";
        monthName.style.fontWeight = "700";
        monthName.style.fontSize = "1.05rem";
        monthName.textContent = month;
        
        monthTitle.appendChild(toggle);
        monthTitle.appendChild(monthName);
        
        const monthTotal = document.createElement("span");
        monthTotal.style.fontWeight = "800";
        monthTotal.style.color = "var(--green-700)";
        monthTotal.style.fontSize = "1.1rem";
        monthTotal.textContent = data.total.toFixed(2);
        
        monthHeader.appendChild(monthTitle);
        monthHeader.appendChild(monthTotal);
        monthDiv.appendChild(monthHeader);
        
        // Category breakdown for this month (COLLAPSIBLE)
        const categoriesDiv = document.createElement("div");
        categoriesDiv.style.display = "flex";
        categoriesDiv.style.flexDirection = "column";
        categoriesDiv.style.gap = "8px";
        categoriesDiv.style.maxHeight = "0";
        categoriesDiv.style.opacity = "0";
        categoriesDiv.style.overflow = "hidden";
        categoriesDiv.style.transition = "max-height 0.3s ease, opacity 0.3s ease";
        
        Object.entries(data.byCategory).forEach(([catName, catTotal]) => {
          const catDiv = document.createElement("div");
          catDiv.style.display = "flex";
          catDiv.style.justifyContent = "space-between";
          catDiv.style.alignItems = "center";
          catDiv.style.padding = "8px 10px";
          catDiv.style.background = "#f0fdf4";
          catDiv.style.borderRadius = "6px";
          catDiv.style.fontSize = "0.95rem";
          catDiv.innerHTML = `<span style="color: #047857; font-weight: 500;">${catName}</span><span style="color: #047857; font-weight: 700;">${catTotal.toFixed(2)}</span>`;
          categoriesDiv.appendChild(catDiv);
        });
        
        monthDiv.appendChild(categoriesDiv);
        monthlyContainer.appendChild(monthDiv);
        
        // Toggle functionality
        monthHeader.addEventListener("click", function() {
          if (categoriesDiv.style.maxHeight === "0px" || categoriesDiv.style.maxHeight === "0") {
            categoriesDiv.style.maxHeight = "500px";
            categoriesDiv.style.opacity = "1";
            toggle.style.transform = "rotate(0deg)";
          } else {
            categoriesDiv.style.maxHeight = "0";
            categoriesDiv.style.opacity = "0";
            toggle.style.transform = "rotate(-90deg)";
          }
        });
      });
    }
  }
}

function renderList() {// a function that renders the list
  List.innerHTML = "";
  
  // Create collapsible header
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.padding = "12px 14px";
  header.style.background = "#f0fdf4";
  header.style.borderRadius = "10px";
  header.style.marginBottom = "12px";
  header.style.cursor = "pointer";
  header.style.userSelect = "none";
  
  const title = document.createElement("span");
  title.style.fontWeight = "600";
  title.style.color = "var(--green-700)";
  title.textContent = `Expenses (${expenses.length})`;
  
  const toggle = document.createElement("span");
  toggle.style.fontSize = "1.2rem";
  toggle.style.color = "var(--green-700)";
  toggle.textContent = "▼";
  toggle.id = "expense-list-toggle";
  
  header.appendChild(title);
  header.appendChild(toggle);
  List.appendChild(header);
  
  // Create list container
  const listContainer = document.createElement("div");
  listContainer.id = "expense-list-items";
  listContainer.style.maxHeight = "1000px";
  listContainer.style.overflowY = "auto";
  listContainer.style.transition = "max-height 0.3s ease, opacity 0.3s ease";
  listContainer.style.opacity = "1";
  
  expenses.forEach((exp, index) => {
    const li = document.createElement("li");
    li.style.listStyle = "none";
    const formattedDate = exp.date ? new Date(exp.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
    li.textContent = `${exp.name} - ${exp.amount} (${exp.category}) · ${formattedDate}`;
    const button = document.createElement("button");
    button.textContent = "❌";

    button.addEventListener("click", function() {//when deleting, has to be inside the each loop tp get the exp
      expenses.splice(index, 1); // remove from array
      renderList();              // rebuild list
      updateTotal();             // recalc total
      updateCategoryTotals();
      localStorage.setItem("expenses", JSON.stringify(expenses)); // save
    });

    li.appendChild(button);
    li.style.background = "linear-gradient(180deg, rgba(16,185,129,0.02), rgba(6,120,87,0.01))";
    li.style.marginBottom = "12px";
    li.style.padding = "12px 14px";
    li.style.borderRadius = "12px";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.boxShadow = "0 8px 22px rgba(2,6,23,0.04)";
    li.style.borderLeft = "6px solid rgba(16,185,129,0.12)";
    
    listContainer.appendChild(li);
  });
  
  List.appendChild(listContainer);
  
  // Toggle functionality
  header.addEventListener("click", function() {
    const items = document.getElementById("expense-list-items");
    const toggleBtn = document.getElementById("expense-list-toggle");
    
    if (items.style.maxHeight === "0px" || items.style.maxHeight === "0") {
      items.style.maxHeight = "1000px";
      items.style.opacity = "1";
      toggleBtn.textContent = "▼";
    } else {
      items.style.maxHeight = "0";
      items.style.opacity = "0";
      items.style.overflow = "hidden";
      toggleBtn.textContent = "▶";
    }
  });
}

function updateCategoryTotals() {//a function that updates the category totals and checks for warnings and goals
  const categoryList = document.getElementById("category-totals");
  categoryList.innerHTML = "";

  // Get current month key
  const now = new Date();
  const currentMonthKey = now.toLocaleDateString("en-US", { year: "numeric", month: "long" });

  // Filter expenses to only current month
  const currentMonthExpenses = expenses.filter(exp => {
    if (!exp.date) return false;// skip if no date
    try {
      const dateObj = new Date(exp.date + "T00:00:00");
      if (isNaN(dateObj.getTime())) return false;// invalid date
      const monthKey = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long" });
      return monthKey === currentMonthKey;// only include expenses from the current month
    } catch (e) {
      return false;
    }
  });

  const total = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0); //get total for current month only

  // Calculate totals per category
  categories.forEach(cat => {

    // Calculate spending for this specific category in CURRENT MONTH ONLY
    const spent = currentMonthExpenses
      .filter(exp => exp.category === cat.name)//filter the expenses to get only those that belong to the current category in current month
      .reduce((sum, exp) => sum + exp.amount, 0);//then we sum them up to get the total spent in this category this month

    const percentOfTotal = total > 0 ? (spent / total) * 100 : 0;
    const percentOfLimit = cat.limit > 0 ? (spent / cat.limit) * 100 : 0;

    // Initialize status tracking for this category if not exists
    if (!categoryStatus[cat.name]) {
      categoryStatus[cat.name] = {
        exceeded: false,
        warning80: false,
        goalReached: false
      };
    }

    // === CREATE CARD CONTAINER ===
    const card = document.createElement("div");

    // Styling the card visually with different colors for goals vs limits
    card.style.marginBottom = "18px";
    card.style.padding = "16px";
    card.style.borderRadius = "14px";
    card.style.transition = "all 0.3s ease";

    // Set background and shadow based on category type
    if (cat.goal > 0) {
      // Blue theme for goal categories
      card.style.background = "linear-gradient(135deg, #ffffff 0%, rgba(59,130,246,0.04) 100%)";
      card.style.boxShadow = "0 8px 24px rgba(59,130,246,0.08)";
      card.style.borderLeft = "4px solid #3b82f6";
    } else if (cat.limit > 0) {
      // Green theme for limit categories
      card.style.background = "linear-gradient(135deg, #ffffff 0%, rgba(16,185,129,0.04) 100%)";
      card.style.boxShadow = "0 8px 24px rgba(4,120,87,0.08)";
      card.style.borderLeft = "4px solid #10b981";
    } else {
      // Default gray for categories with neither
      card.style.background = "linear-gradient(135deg, #ffffff 0%, rgba(107,114,128,0.04) 100%)";
      card.style.boxShadow = "0 6px 20px rgba(0,0,0,0.05)";
    }

    // Small hover animation
    card.addEventListener("mouseenter", () => {
      card.style.transform = "scale(1.02)";
      if (cat.goal > 0) {
        card.style.boxShadow = "0 16px 40px rgba(59,130,246,0.12)";
      } else if (cat.limit > 0) {
        card.style.boxShadow = "0 16px 40px rgba(4,120,87,0.12)";
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "scale(1)";
      if (cat.goal > 0) {
        card.style.boxShadow = "0 8px 24px rgba(59,130,246,0.08)";
      } else if (cat.limit > 0) {
        card.style.boxShadow = "0 8px 24px rgba(4,120,87,0.08)";
      } else {
        card.style.boxShadow = "0 6px 20px rgba(0,0,0,0.05)";
      }
    });

    // === TITLE TEXT ===
    const title = document.createElement("div");
    title.style.marginBottom = "8px";
    title.style.fontWeight = "600";
    title.style.color = "#0f172a";

    if ((cat.name === "savings" && cat.goal>0 )|| cat.goal > 0) {//if it's the savings category with a goal, or any category with a goal, we show the goal progress in the title
      const percentOfGoal = (spent / cat.goal) * 100;
      title.textContent =
        `${cat.name}: ${spent.toFixed(2)} / ${cat.goal} (${percentOfGoal.toFixed(0)}% of goal)`;
    } else if (cat.limit > 0) {
      title.textContent =
        `${cat.name}: ${spent.toFixed(2)} / ${cat.limit} (${percentOfLimit.toFixed(0)}% of limit) - ${currentMonthKey}`;
    } else {
      title.textContent =
        `${cat.name}: ${spent.toFixed(2)} `;
    }//if there's a limit, we show the spent amount, the limit and the percentage of the limit for THIS MONTH. If it's savings with a goal, we show the spent amount, the goal and the percentage of the goal. Otherwise, we just show the spent amount.

    card.appendChild(title);//add the title to the card

    if (cat.limit > 0) {//if there's a limit, we show the progress bar for the limit
      // === PROGRESS BAR BACKGROUND (for limit) ===
      const progressContainer = document.createElement("div");
      progressContainer.style.height = "12px";
      progressContainer.style.background = "#e5e7eb";
      progressContainer.style.borderRadius = "999px";
      progressContainer.style.overflow = "hidden";

      // === PROGRESS FILL ===
      const progressBar = document.createElement("div");
      progressBar.style.height = "100%";
      progressBar.style.width = "0%"; // start at 0 for animation
      progressBar.style.borderRadius = "999px";
      progressBar.style.transition = "width 0.8s ease";

      // 🎨 Color logic - apply warning/error colors to progress bar
      if (percentOfLimit >= 100) {
        progressBar.style.background = "#ef4444"; // red
        title.style.color = "#b91c1c"; // dark red text
      } else if (percentOfLimit >= 80) {
        progressBar.style.background = "#f59e0b"; // orange
        title.style.color = "#d97706"; // dark orange text
      } else {
        progressBar.style.background = "#10b981"; // green
      }

      progressContainer.appendChild(progressBar);//add the progress bar to the container
      card.appendChild(progressContainer);//add the container to the card

      // 🎬 Animate after render
      setTimeout(() => {
        progressBar.style.width = `${Math.min(percentOfLimit, 100)}%`;
      }, 50);

      // 🔴 Overspending warning (only show once) - based on CURRENT MONTH only
      if (spent > cat.limit) {
        if (!categoryStatus[cat.name].exceeded) {
          showNotification(`⚠ You exceeded the limit for ${cat.name} this month!`, "error");
          categoryStatus[cat.name].exceeded = true;
          categoryStatus[cat.name].warning80 = false;
        }
      } else if (percentOfLimit >= 80 && percentOfLimit < 100) {
        // ⚠ Warning at 80% of limit (only show once)
        if (!categoryStatus[cat.name].warning80 && !categoryStatus[cat.name].exceeded) {
          showNotification(`⚠ ${cat.name} is at ${percentOfLimit.toFixed(0)}% of this month's limit`, "warning");
          categoryStatus[cat.name].warning80 = true;
        }
      } else {
        // Back under 80%, reset warnings
        categoryStatus[cat.name].warning80 = false;
        categoryStatus[cat.name].exceeded = false;
      }
    } else if (cat.goal > 0) {
      // === PROGRESS BAR FOR GOAL (any category with a goal) ===
      const percentOfGoal = (spent / cat.goal) * 100;
      
      const progressContainer = document.createElement("div");
      progressContainer.style.height = "12px";
      progressContainer.style.background = "#e5e7eb";
      progressContainer.style.borderRadius = "999px";
      progressContainer.style.overflow = "hidden";

      const progressBar = document.createElement("div");
      progressBar.style.height = "100%";
      progressBar.style.width = "0%";
      progressBar.style.borderRadius = "999px";
      progressBar.style.transition = "width 0.8s ease";
      progressBar.style.background = "#10b981"; // green for goal progress

      progressContainer.appendChild(progressBar);
      card.appendChild(progressContainer);

      // 🎬 Animate after render
      setTimeout(() => {
        progressBar.style.width = `${Math.min(percentOfGoal, 100)}%`;
      }, 50);
    }

    // Goal reached (only show once)
    if (cat.goal > 0 && spent >= cat.goal) {
      if (!categoryStatus[cat.name].goalReached) {
        showNotification(`🎉 You reached your savings goal for ${cat.name}!`, "info");
        categoryStatus[cat.name].goalReached = true;
      }
    } else {
      categoryStatus[cat.name].goalReached = false; // reset if below goal
    }

    categoryList.appendChild(card);
  });
}

const savedExpenses = localStorage.getItem("expenses");
if (savedExpenses) {
  expenses = JSON.parse(savedExpenses); // now expenses array is restored

  // rebuild UI from the array

 updateTotal();

    

renderList();
updateCategoryTotals();
}

form.addEventListener("submit", function(e) {//when submit act, e helps me get info about submission
  e.preventDefault();//page deosnt refresh after submitting
  
  const name = document.getElementById("expense-name").value;//get the input values
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;
  const date = document.getElementById("expense-date").value;

  const expense={
    name:name, amount:amount,category:category, date:date
  }
  
expenses.push(expense);

  updateTotal();
  renderList();
  updateCategoryTotals();

  localStorage.setItem("expenses", JSON.stringify(expenses));//save expenses as strings
  form.reset();//clears input after submission
  
  // Reset date to today
  document.getElementById("expense-date").value = new Date().toISOString().split("T")[0];
});
getDollarRate();
setInterval(getDollarRate, 30000);


function buildReport(selectedMonth = null) { //optional parameter to specify month, if not provided it will use the value from the month selector or default to current month
  //builds a report for selected month

  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  const tableBody = document.getElementById("reportTableBody");
  const totalText = document.getElementById("totalSpent");
  const monthText = document.getElementById("reportMonth");

  tableBody.innerHTML = "";

  // Get the month to filter by - either from parameter or from selector
  let monthToShow = selectedMonth;//if someone used the parameter it would be in monthToShow
  if (!monthToShow) { //if no parameter, we check the selector
    const selector = document.getElementById("report-month-selector");
    monthToShow = selector ? selector.value : null;// if the selector exists, we get the value, otherwise we leave it as null and will default to current month
  }

  // If no month selected, use current month
  if (!monthToShow) {
    const now = new Date();
    monthToShow = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
  }

  // Parse the selected month (format: YYYY-MM)
  const [selectedYear, selectedMonthNum] = monthToShow.split("-").map(Number);

  // Filter expenses for the selected month We only keep expenses that match the selected month.
  const filteredExpenses = expenses.filter(expense => {
    if (!expense.date) return false;// skip if no date
    try {
      const dateObj = new Date(expense.date + "T00:00:00");
      if (isNaN(dateObj.getTime())) return false;
      return dateObj.getFullYear() === selectedYear && (dateObj.getMonth() + 1) === selectedMonthNum;
    } catch (e) {
      return false;
    }
  });

  let total = 0;

  filteredExpenses.forEach(expense => {//for each expense, we create a row in the table and add it to the table body, we also calculate the total amount spent
    total += Number(expense.amount);

    const row = `
      <tr>
        <td>${expense.date}</td>
        <td>${expense.category}</td>
        <td>${expense.name}</td>
        <td>$${expense.amount}</td>
      </tr>
    `;

    tableBody.innerHTML += row;
  });

  // Format the month display
  const date = new Date(selectedYear, selectedMonthNum - 1);//months names
  const monthDisplay = date.toLocaleString('default', { month: 'long', year: 'numeric' });

  monthText.textContent = "Month: " + monthDisplay;
  totalText.textContent = "Total Spent: $" + total.toFixed(2);

  // Calculate and display category totals
  const categoryBreakdown = document.getElementById("category-breakdown");
  if (categoryBreakdown) {
    categoryBreakdown.innerHTML = "";
    
    // Group expenses by category
    const categoryTotals = {};
    filteredExpenses.forEach(exp => {
      if (!categoryTotals[exp.category]) {// if this category hasn't been seen before, initialize it in the totals object
        categoryTotals[exp.category] = 0;
      }
      categoryTotals[exp.category] += exp.amount;// add the expense amount to the total for this category
    });

    // Create category breakdown section
    const heading = document.createElement("h3");
    heading.textContent = "Category Breakdown";
    heading.style.marginTop = "24px";
    heading.style.color = "var(--green-700)";
    categoryBreakdown.appendChild(heading);

    // Display each category
    categories.forEach(cat => {
      const spent = categoryTotals[cat.name] || 0;
      
      const categoryDiv = document.createElement("div");
      categoryDiv.style.marginBottom = "16px";
      categoryDiv.style.padding = "14px";
      categoryDiv.style.background = "#f0fdf4";
      categoryDiv.style.borderRadius = "10px";
      categoryDiv.style.borderLeft = "4px solid #10b981";

      let categoryInfo = `<strong>${cat.name}</strong><br/>`;
      categoryInfo += `Spent: $${spent.toFixed(2)}<br/>`;
        // If there's a limit, show remaining and percentage of limit. If there's a goal, show progress towards goal. This gives more context to the user about how they're doing in each category for the selected month.
      if (cat.limit > 0) {
        const remaining = cat.limit - spent;
        const percentOfLimit = (spent / cat.limit) * 100;
        categoryInfo += `Limit: $${cat.limit}<br/>`;
        categoryInfo += `Remaining: $${remaining.toFixed(2)} (${percentOfLimit.toFixed(0)}% used)`;
      } else if (cat.goal > 0) {
        const percentOfGoal = (spent / cat.goal) * 100;
        categoryInfo += `Goal: $${cat.goal}<br/>`;
        categoryInfo += `Progress: ${percentOfGoal.toFixed(0)}% of goal`;
      }

      categoryDiv.innerHTML = categoryInfo;
      categoryBreakdown.appendChild(categoryDiv);
    });
  }
}

function generatePDF() {
  buildReport(); // make sure it's updated before exporting

  const element = document.querySelector(".pdf-container"); // Use pdf-container instead of report-page
  
  // Hide elements with no-print class before generating PDF
  const noPrintElements = document.querySelectorAll(".no-print");
  noPrintElements.forEach(el => el.style.display = "none");

  // Add print-safe styles to remove all colors
  const style = document.createElement('style');
  style.innerHTML = `
    /* Force black text and white backgrounds for the exported PDF */
    .pdf-container, .pdf-container * {
      color: #000 !important;
      background: #fff !important;
      background-color: #fff !important;
      background-image: none !important;
      border-color: #000 !important;
      box-shadow: none !important;
      -webkit-text-fill-color: #000 !important;
      filter: none !important;
    }

    .pdf-container h1, .pdf-container h2, .pdf-container h3 {
      color: #000 !important;
      -webkit-background-clip: unset !important;
      -webkit-text-fill-color: #000 !important;
      background: transparent !important;
    }

    .pdf-container table, .pdf-container th, .pdf-container td {
      color: #000 !important;
      background: #fff !important;
      border-color: #000 !important;
    }
  `;
  document.head.appendChild(style);

  // Configure html2pdf options
  const opt = {
    margin: [10, 10, 10, 10], // 10mm margins (top, left, bottom, right)
    filename: 'expense-report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  // Generate PDF
  html2pdf().set(opt).from(element).save().then(() => {
    // Show the elements again after PDF is generated
    noPrintElements.forEach(el => el.style.display = "");
    // Remove the temporary style
    document.head.removeChild(style);//style has the all black and white rules we added, we remove it after generating the PDF to restore the colors in the app
  });
}

// Initialize report when report page is navigated to or month selector changes
document.addEventListener("DOMContentLoaded", function() {
  const monthSelector = document.getElementById("report-month-selector");
  if (monthSelector) {
    // Set default to current month
    const now = new Date();
    monthSelector.value = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
    
    // Listen for month changes
    monthSelector.addEventListener("change", function() {
      buildReport();
    });
    
    // Build report on initial load
    buildReport();
  }
});

