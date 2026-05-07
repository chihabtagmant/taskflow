const token = localStorage.getItem("token");
const projectId = new URLSearchParams(window.location.search).get("projectId");

// تحميل المembres فـ dropdown
async function loadMembers() {
  const res = await axios.get(
    `http://localhost:5000/api/projects/${projectId}/members`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const select = document.getElementById("assignedTo");
  res.data.forEach((member) => {
    const option = document.createElement("option");
    option.value = member._id;
    option.textContent = member.name;
    select.appendChild(option);
  });
}

// تحميل التاسكات
async function loadTasks() {
  const res = await axios.get(
    `http://localhost:5000/api/projects/${projectId}/tasks`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const div = document.getElementById("tasksList");
  div.innerHTML = "";
  res.data.forEach((task) => {
    div.innerHTML += `
      <div>
        <h3>${task.title}</h3>
        <p>Priorité: ${task.priority}</p>
        <p>Status: ${task.status}</p>
        <p>Assigné à: ${task.assignedTo ? task.assignedTo.name : "Non assigné"}</p>
        <button onclick="deleteTask('${task._id}')">Supprimer</button>
        <select onchange="updateStatus('${task._id}', this.value)">
          <option value="à faire">À faire</option>
          <option value="en cours">En cours</option>
          <option value="terminé">Terminé</option>
        </select>
      </div>
    `;
  });
}

// إنشاء تاسك
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
    },
  );
  loadTasks();
});

// حذف تاسك
async function deleteTask(id) {
  await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  loadTasks();
}

// تبديل status
async function updateStatus(id, status) {
  await axios.patch(
    `http://localhost:5000/api/tasks/${id}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  loadTasks();
}

// تشغيل عند تحميل الصفحة
loadMembers();
loadTasks();
