const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: window.DashboardView },
    { path: '/projects', component: window.ProjectListView },
    { path: '/projects/:id', component: window.ProjectDetailView },
    { path: '/purchases', component: window.PurchaseListView },
    { path: '/purchases/new', component: window.PurchaseListView },
    { path: '/purchases/:id', component: window.PurchaseDetailView },
    { path: '/tasks', component: window.TaskBoardView },
    { path: '/portfolio', component: window.PortfolioView },
    { path: '/procurement', component: window.ProcurementView },
    { path: '/rateio', component: window.RateioView },
    { path: '/obras', component: window.ObrasView },
    { path: '/orientacoes', component: window.OrientacoesView },
    { path: '/settings', component: window.SettingsView },
  ]
});

const AppShell = {
  data() { return { toasts: [] }; },
  computed: {
    currentPath() { return this.$route?.path || '/'; }
  },
  methods: {
    navActive(path) {
      if (path === '/') return this.currentPath === '/';
      return this.currentPath.startsWith(path);
    },
    showToast(msg, type = 'success') {
      const t = { msg, type, id: Date.now() };
      this.toasts.push(t);
      setTimeout(() => { this.toasts = this.toasts.filter(x => x.id !== t.id); }, 3000);
    }
  },
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <img src="assets/logo.png" alt="CMPC" class="brand-logo">
        </div>
        <nav class="sidebar-nav">
          <a href="#/" class="nav-item" :class="{ active: navActive('/') && currentPath === '/' }">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a href="#/portfolio" class="nav-item" :class="{ active: navActive('/portfolio') }">
            <span class="nav-icon">📈</span> Portfólio
          </a>
          <a href="#/projects" class="nav-item" :class="{ active: navActive('/projects') }">
            <span class="nav-icon">📁</span> Projetos
          </a>
          <a href="#/purchases" class="nav-item" :class="{ active: navActive('/purchases') }">
            <span class="nav-icon">🛒</span> Compras
          </a>
          <a href="#/procurement" class="nav-item" :class="{ active: navActive('/procurement') }">
            <span class="nav-icon">📋</span> Suprimentos
          </a>
          <a href="#/rateio" class="nav-item" :class="{ active: navActive('/rateio') }">
            <span class="nav-icon">⚖️</span> Rateio
          </a>
          <a href="#/obras" class="nav-item" :class="{ active: navActive('/obras') }">
            <span class="nav-icon">🏗️</span> Obras
          </a>
          <a href="#/tasks" class="nav-item" :class="{ active: navActive('/tasks') }">
            <span class="nav-icon">✅</span> Tarefas
          </a>
          <a href="#/orientacoes" class="nav-item" :class="{ active: navActive('/orientacoes') }">
            <span class="nav-icon">📌</span> Orientações
          </a>
          <a href="#/settings" class="nav-item" :class="{ active: navActive('/settings') }">
            <span class="nav-icon">⚙️</span> Configurações
          </a>
        </nav>
        <div class="sidebar-footer">v1.0 · {{ today }}</div>
      </aside>
      <main class="main-content">
        <router-view />
      </main>
      <div class="toast-wrap">
        <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">{{ t.msg }}</div>
      </div>
    </div>
  `,
  computed: {
    today() { return new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }); },
    currentPath() { return this.$route?.path || '/'; }
  }
};

Store.init().finally(() => {
  const app = createApp(AppShell);
  app.use(router);
  app.mount('#app');
  document.getElementById('loading-screen').style.display = 'none';
});
