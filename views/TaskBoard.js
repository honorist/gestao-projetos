window.TaskBoardView = {
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Tarefas</h1></div>
        <button class="btn btn-primary" @click="openNewTask('todo')">+ Nova Tarefa</button>
      </div>

      <div v-if="showForm" class="form-panel">
        <div class="form-panel-title">{{ editingTask ? 'Editar Tarefa' : 'Nova Tarefa' }}</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Título *</label>
            <input class="form-control" v-model="form.title" placeholder="Descrição da tarefa">
          </div>
          <div class="form-group">
            <label class="form-label">Projeto</label>
            <select class="form-control" v-model="form.project_id">
              <option value="">— Sem projeto —</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-control" v-model="form.status">
              <option value="todo">A Fazer</option>
              <option value="in_progress">Em Andamento</option>
              <option value="blocked">Bloqueado</option>
              <option value="done">Concluído</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Prioridade</label>
            <select class="form-control" v-model="form.priority">
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Data Limite</label>
            <input class="form-control" type="date" v-model="form.due_date">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Responsável</label>
            <input class="form-control" v-model="form.responsible">
          </div>
          <div class="form-group">
            <label class="form-label">Descrição</label>
            <input class="form-control" v-model="form.description" placeholder="Detalhes adicionais">
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="saveTask">{{ editingTask ? 'Salvar' : 'Criar' }}</button>
          <button class="btn btn-secondary" @click="showForm = false">Cancelar</button>
          <button v-if="editingTask" class="btn btn-danger" style="margin-left:auto" @click="deleteTask(editingTask)">Excluir</button>
        </div>
      </div>

      <div class="filter-bar" style="margin-bottom:16px">
        <input class="form-control search-input" v-model="search" placeholder="🔍 Buscar tarefa...">
        <select class="form-control" v-model="filterProject">
          <option value="">Todos os projetos</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select class="form-control" v-model="filterPriority">
          <option value="">Todas as prioridades</option>
          <option value="critical">Crítica</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </div>

      <div class="kanban">
        <div v-for="col in columns" :key="col.status"
          :class="'kanban-col col-' + col.status"
          @dragover.prevent="onDragOver($event, col.status)"
          @dragleave="onDragLeave($event)"
          @drop.prevent="onDrop($event, col.status)">
          <div class="kanban-col-header">
            <span>{{ col.label }}</span>
            <span class="count-badge">{{ tasksForCol(col.status).length }}</span>
          </div>
          <div class="kanban-col-body" :id="'col-' + col.status">
            <div v-for="task in tasksForCol(col.status)" :key="task.id"
              class="task-card"
              draggable="true"
              :class="{ dragging: draggingId === task.id }"
              @dragstart="onDragStart($event, task.id)"
              @dragend="onDragEnd">
              <div class="task-card-title">{{ task.title }}</div>
              <div v-if="task.description" class="text-sm text-muted" style="margin-bottom:4px">{{ task.description }}</div>
              <div class="task-card-meta">
                <span :class="'badge badge-' + statusColor(task.priority)">{{ statusLabel(task.priority) }}</span>
                <span v-if="task.due_date" class="text-sm" :style="isOverdue(task.due_date) && task.status !== 'done' ? 'color:var(--danger);font-weight:600' : 'color:var(--text-muted)'">
                  📅 {{ formatDate(task.due_date) }}
                </span>
              </div>
              <div v-if="task.project_id" class="task-card-project">📁 {{ projectName(task.project_id) }}</div>
              <div v-if="task.responsible" class="text-sm text-muted">👤 {{ task.responsible }}</div>
              <div class="task-card-actions">
                <button class="btn-icon btn-sm" @click="editTask(task)">✏️</button>
                <button class="btn-icon btn-sm" @click="deleteTask(task.id)">🗑️</button>
              </div>
            </div>
            <div v-if="tasksForCol(col.status).length === 0" class="text-sm text-muted" style="padding:12px 8px">
              Arraste tarefas para cá
            </div>
            <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:4px" @click="openNewTask(col.status)">+ Adicionar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      showForm: false, editingTask: null, search: '', filterProject: '', filterPriority: '',
      draggingId: null, dragOverCol: null,
      columns: [
        { status: 'todo', label: 'A Fazer' },
        { status: 'in_progress', label: 'Em Andamento' },
        { status: 'blocked', label: 'Bloqueado' },
        { status: 'done', label: 'Concluído' },
      ],
      form: this.emptyForm()
    };
  },
  computed: {
    projects() { return Store.state.projects; },
    filteredTasks() {
      return Store.state.tasks.filter(t => {
        const q = this.search.toLowerCase();
        const ms = !q || t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
        const mp = !this.filterProject || t.project_id === this.filterProject;
        const mpr = !this.filterPriority || t.priority === this.filterPriority;
        return ms && mp && mpr;
      });
    }
  },
  methods: {
    emptyForm() { return { title: '', description: '', project_id: '', status: 'todo', priority: 'medium', responsible: '', due_date: '' }; },
    tasksForCol(status) { return this.filteredTasks.filter(t => t.status === status); },
    projectName(id) { return Store.getProject(id)?.name || ''; },

    openNewTask(status) { this.editingTask = null; this.form = { ...this.emptyForm(), status }; this.showForm = true; },
    editTask(task) { this.editingTask = task.id; this.form = { ...task }; this.showForm = true; },

    saveTask() {
      if (!this.form.title.trim()) { alert('Título obrigatório'); return; }
      if (this.editingTask) Store.updateTask(this.editingTask, this.form);
      else Store.addTask(this.form);
      this.showForm = false; this.editingTask = null;
    },

    deleteTask(id) {
      if (!confirm('Excluir esta tarefa?')) return;
      Store.deleteTask(id); this.showForm = false; this.editingTask = null;
    },

    // Drag and drop
    onDragStart(e, id) {
      this.draggingId = id;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    },
    onDragEnd() { this.draggingId = null; this.dragOverCol = null; document.querySelectorAll('.kanban-col-body').forEach(el => el.classList.remove('drag-over')); },
    onDragOver(e, status) {
      const el = document.getElementById('col-' + status);
      if (el && this.dragOverCol !== status) {
        document.querySelectorAll('.kanban-col-body').forEach(el => el.classList.remove('drag-over'));
        el.classList.add('drag-over'); this.dragOverCol = status;
      }
    },
    onDragLeave(e) { if (!e.currentTarget.contains(e.relatedTarget)) { this.dragOverCol = null; } },
    onDrop(e, status) {
      const id = e.dataTransfer.getData('text/plain') || this.draggingId;
      if (id && id !== status) Store.updateTask(id, { status });
      document.querySelectorAll('.kanban-col-body').forEach(el => el.classList.remove('drag-over'));
      this.draggingId = null; this.dragOverCol = null;
    },

    statusLabel, statusColor, formatDate, isOverdue
  }
};
