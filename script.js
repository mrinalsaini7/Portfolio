console.log("Portfolio JavaScript connected");

document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle
  const themeButton = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "dark") document.body.classList.add("dark-mode");
  updateThemeButton();

  themeButton?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("portfolio-theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    updateThemeButton();
  });

  function updateThemeButton() {
    if (!themeButton) return;
    const dark = document.body.classList.contains("dark-mode");
    themeButton.innerHTML = dark ? "☀ <span>Light mode</span>" : "☾ <span>Dark mode</span>";
    themeButton.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  // Skill-to-project filtering. Project skills are defined on each .project-card.
  const skillButtons = [...document.querySelectorAll(".skill-card[data-skill]")];
  const projectCards = [...document.querySelectorAll(".project-card[data-project-skills]")];
  const projectNotFound = document.getElementById("projectNotFound");
  const projectFilterStatus = document.getElementById("projectFilterStatus");
  const clearFilterButton = document.getElementById("clearSkillFilter");

  skillButtons.forEach(button => {
    button.addEventListener("click", () => {
      const skill = button.dataset.skill;
      const matches = projectCards.filter(card =>
        (card.dataset.projectSkills || "")
          .split(",")
          .map(value => value.trim().toLowerCase())
          .includes(skill.toLowerCase())
      );

      skillButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      projectCards.forEach(card => { card.hidden = !matches.includes(card); });
      projectNotFound.hidden = matches.length > 0;
      clearFilterButton.hidden = false;
      projectFilterStatus.textContent = matches.length
        ? `${matches.length} project${matches.length === 1 ? "" : "s"} related to ${skill}.`
        : `No project found for ${skill}.`;
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    button.setAttribute("aria-pressed", "false");
  });

  clearFilterButton?.addEventListener("click", resetProjectFilter);
  function resetProjectFilter() {
    skillButtons.forEach(button => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });
    projectCards.forEach(card => { card.hidden = false; });
    projectNotFound.hidden = true;
    clearFilterButton.hidden = true;
    projectFilterStatus.textContent = "Showing all projects.";
  }

  // Current weather. Replace the key with your own OpenWeatherMap API key if needed.
  const weatherForm = document.getElementById("weatherForm");
  const cityInput = document.getElementById("cityInput");
  const weatherButton = document.getElementById("weatherButton");
  const weatherResult = document.getElementById("weatherResult");
  const apiKey = "7107f5bd3a4ab8c914911f1a6f43c27a";

  weatherForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (!city) {
      weatherResult.textContent = "Please enter a city name.";
      cityInput.focus();
      return;
    }

    weatherButton.disabled = true;
    weatherButton.textContent = "Loading…";
    weatherResult.textContent = "Fetching current weather…";

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${encodeURIComponent(apiKey)}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) throw new Error("City not found. Check the spelling and try again.");
        if (response.status === 401) throw new Error("Weather API key is not valid. Add a working OpenWeatherMap API key in script.js.");
        throw new Error(data.message || "Weather service is temporarily unavailable.");
      }

      const description = data.weather?.[0]?.description || "Conditions unavailable";
      const icon = data.weather?.[0]?.icon;
      const iconHtml = icon ? `<img width="52" height="52" alt="" src="https://openweathermap.org/img/wn/${encodeURIComponent(icon)}@2x.png">` : "";
      weatherResult.innerHTML = `
        <h3>${escapeHtml(data.name)}, ${escapeHtml(data.sys?.country || "")}</h3>
        <div class="weather-data">
          <span class="temperature">${Math.round(data.main.temp)}°C</span>
          ${iconHtml}
          <p><strong>${escapeHtml(capitalize(description))}</strong><br>
          Feels like ${Math.round(data.main.feels_like)}°C · Humidity ${Math.round(data.main.humidity)}%</p>
        </div>`;
    } catch (error) {
      weatherResult.replaceChildren();
      const message = document.createElement("p");
      message.className = "weather-error";
      message.textContent = error.message || "Unable to fetch weather. Please try again.";
      weatherResult.appendChild(message);
    } finally {
      weatherButton.disabled = false;
      weatherButton.innerHTML = 'Get weather <span>→</span>';
    }
  });

  // Built-in portfolio FAQ assistant. It does not call an external AI service.
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chatMessages");
  const chatStatus = document.getElementById("chatStatus");

  chatForm?.addEventListener("submit", event => {
    event.preventDefault();
    const question = userInput.value.trim();
    if (!question) return;
    addMessage(question, "user");
    userInput.value = "";
    const answer = getAssistantAnswer(question);
    window.setTimeout(() => addMessage(answer, "assistant"), 180);
    chatStatus.textContent = "Answered using the portfolio's built-in information.";
  });

  function addMessage(text, role) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${role === "user" ? "user-message" : "assistant-message"}`;
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getAssistantAnswer(rawQuestion) {
    const q = rawQuestion.toLowerCase();
    if (/(skill|know|technology|tech stack|language)/.test(q)) return "The skills currently listed are C, C++, HTML, and CSS. Click a skill card to see matching projects.";
    if (/(project|work|portfolio|github)/.test(q)) return "The listed projects are Python Program Collection, Code with AI Quiz, and Book Reading List Application. You can open each project using its View project link.";
    if (/(python|factorial|fibonacci)/.test(q)) return "The Python Program Collection contains beginner-friendly programming exercises, including Factorial and Fibonacci Series.";
    if (/(quiz|ai quiz)/.test(q)) return "Code with AI Quiz is described as an interactive quiz website designed to make knowledge practice engaging.";
    if (/(book|reading|list application)/.test(q)) return "The Book Reading List Application helps organize books and track statuses such as Want to Read, Reading, and Finished.";
    if (/(contact|email|reach|message)/.test(q)) return "You can contact Mrinal at mrinalsaini216613@gmail.com or visit GitHub: github.com/mrinalsaini7.";
    if (/(about|who is|mrinal|student)/.test(q)) return "Mrinal Saini is a B.Tech Computer Science Engineering student interested in software development, web technologies, and problem-solving.";
    if (/(weather|temperature)/.test(q)) return "Use the Weather section: enter a city name and select Get weather to see current conditions.";
    if (/(hello|hi|hey|namaste)/.test(q)) return "Hello! You can ask me about the skills, projects, weather tool, or contact details shown on this portfolio.";
    return "I can answer questions about the portfolio's listed skills, projects, weather tool, and contact information. Try asking: “What projects are available?” or “How can I contact Mrinal?”";
  }

  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
