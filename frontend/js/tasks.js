const token = localStorage.getItem("token");
const projectId = new URLSearchParams(window.location.search).get("projectId");
const draftKey = `taskDraft_${projectId}`;

let currentPage = 1;
let totalPages = 1;

// Charger les membres dans le dropdown d'assignation + filtre membre
async function loadMembers() {
  const res = await axios.get(
    `http://localhost:5000/api/projects/${projectId}/members`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const assignedToSelect = document.getElementById("assignedTo");
  const assignedToFilter = document.getElementById("assignedToFilter");

  res.data.forEach((member) => {
    const option1 = document.createElement("option");
    option1.value = member._id;
    option1.textContent = member.fullName;
    assignedToSelect.appendChild(option1);

    if (assignedToFilter) {
      const option2 = document.createElement("option");
      option2.value = member._id;
      option2.textContent = member.fullName;
      assignedToFilter.appendChild(option2);
    }
  });
}

// Charger les tâches avec filtrage, recherche et pagination
async function loadTasks() {
  const search = document.getElementById("searchInput")?.value || "";
  const status = document.getElementById("statusFilter")?.value || "";
  const priority = document.getElementById("priorityFilter")?.value || "";
  const assignedTo = document.getElementById("assignedToFilter")?.value || "";

  const params = new URLSearchParams();

  params.append("page", currentPage);
  params.append("limit", 5);

  if (search) {
    params.append("search", search);
  }

  if (status) {
    params.append("status", status);
  }

  if (priority) {
    params.append("priority", priority);
  }

  if (assignedTo) {
    params.append("assignedTo", assignedTo);
  }

  const res = await axios.get(
    `http://localhost:5000/api/projects/${projectId}/tasks?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const div = document.getElementById("tasksList");
  div.innerHTML = "";

  const tasks = res.data.data;
  totalPages = res.data.totalPages || 1;

  if (tasks.length === 0) {
    div.innerHTML = "<p>Aucune tâche trouvée.</p>";
  }

  tasks.forEach((task) => {
    div.innerHTML += `
      <div>
        <h3>${task.title}</h3>
        <p>Priorité: ${task.priority}</p>
        <p>Status: ${task.status}</p>
        <p>Assigné à: ${
          task.assignedTo ? task.assignedTo.fullName : "Non assigné"
        }</p>

        <button onclick="deleteTask('${task._id}')">Supprimer</button>

        <select onchange="updateStatus('${task._id}', this.value)">
          <option value="à faire" ${
            task.status === "à faire" ? "selected" : ""
          }>À faire</option>

          <option value="en cours" ${
            task.status === "en cours" ? "selected" : ""
          }>En cours</option>

          <option value="terminé" ${
            task.status === "terminé" ? "selected" : ""
          }>Terminé</option>
        </select>
      </div>
    `;
  });

  const pageInfo = document.getElementById("pageInfo");

  if (pageInfo) {
    pageInfo.textContent = `Page ${res.data.page} / ${totalPages}`;
  }
}
// Sauvegarder automatiquement le brouillon
function saveDraft() {
  const draft = {
    title: document.getElementById("title").value,
    priority: document.getElementById("priority").value,
    status: document.getElementById("status").value,
    assignedTo: document.getElementById("assignedTo").value,
  };

  localStorage.setItem(draftKey, JSON.stringify(draft));
}

// Restaurer le brouillon au chargement
function restoreDraft() {
  const savedDraft = localStorage.getItem(draftKey);

  if (!savedDraft) {
    return;
  }

  const shouldRestore = confirm("Un brouillon existe. Voulez-vous le restaurer ?");

  if (!shouldRestore) {
    localStorage.removeItem(draftKey);
    return;
  }

  const draft = JSON.parse(savedDraft);

  document.getElementById("title").value = draft.title || "";
  document.getElementById("priority").value = draft.priority || "";
  document.getElementById("status").value = draft.status || "";
  document.getElementById("assignedTo").value = draft.assignedTo || "";
}

document.getElementById("taskForm").addEventListener("input", () => {
  saveDraft();
});

// Créer une tâche
document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  await axios.post(
    "http://localhost:5000/api/tasks",
    {
      title: document.getElementById("title").value,
      priority: document.getElementById("priority").value,
      status: document.getElementById("status").value,
      assignedTo: document.getElementById("assignedTo").value,
      project: projectId,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  localStorage.removeItem(draftKey);
  document.getElementById("taskForm").reset();

  currentPage = 1;
  loadTasks();
});

// Supprimer une tâche
async function deleteTask(id) {
  await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  loadTasks();
}

// Changer le status
async function updateStatus(id, status) {
  await axios.patch(
    `http://localhost:5000/api/tasks/${id}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  loadTasks();
}

// Recherche
document.getElementById("searchInput")?.addEventListener("input", () => {
  currentPage = 1;
  loadTasks();
});

// Filtre statut
document.getElementById("statusFilter")?.addEventListener("change", () => {
  currentPage = 1;
  loadTasks();
});

// Filtre priorité
document.getElementById("priorityFilter")?.addEventListener("change", () => {
  currentPage = 1;
  loadTasks();
});

// Filtre membre assigné
document.getElementById("assignedToFilter")?.addEventListener("change", () => {
  currentPage = 1;
  loadTasks();
});

// Page précédente
document.getElementById("prevPage")?.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadTasks();
  }
});

// Page suivante
document.getElementById("nextPage")?.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadTasks();
  }
});

// Lancer au chargement
loadMembers();
loadTasks();
restoreDraft();