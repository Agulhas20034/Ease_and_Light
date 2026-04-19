const express = require('express');
const cors = require('cors');
const SupabaseService = require('./supabase-service');
const ApiService = require('./api-service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const supabaseService = new SupabaseService();
const apiService = new ApiService(supabaseService);

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    req.url = req.url.replace(/_/g, '-');
  }
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nome, ...additionalData } = req.body;
    const result = await apiService.registerUser(email, password, nome, additionalData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    const result = await apiService.loginUser(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Users endpoints
app.post('/api/users', async (req, res) => {
  try {
    const result = await apiService.createUser(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const result = await apiService.updateUser(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await apiService.getAllUsers();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await apiService.getUser(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await apiService.deleteUser(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Empresa Transportes endpoints
app.post('/api/empresa-transportes', async (req, res) => {
  try {
    const result = await apiService.createEmpresaTransportes(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/empresa-transportes/:id', async (req, res) => {
  try {
    const result = await apiService.updateEmpresaTransportes(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating empresa-transportes:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/empresa-transportes', async (req, res) => {
  try {
    const result = await apiService.getAllEmpresaTransportes();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/empresa-transportes/:id', async (req, res) => {
  try {
    const result = await apiService.getEmpresaTransportes(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Empresa Transportes not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/empresa-transportes/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEmpresaTransportes(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Estabelecimento endpoints
app.post('/api/estabelecimento', async (req, res) => {
  try {
    const result = await apiService.createEstabelecimento(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/estabelecimento/:id', async (req, res) => {
  try {
    const result = await apiService.updateEstabelecimento(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/estabelecimento', async (req, res) => {
  try {
    const result = await apiService.getAllEstabelecimento();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/estabelecimento/:id', async (req, res) => {
  try {
    const result = await apiService.getEstabelecimento(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Estabelecimento not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/estabelecimento/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEstabelecimento(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Veiculos endpoints
app.post('/api/veiculos', async (req, res) => {
  try {
    const result = await apiService.createVeiculo(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/veiculos/:matricula', async (req, res) => {
  try {
    const result = await apiService.updateVeiculo(req.params.matricula, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/veiculos', async (req, res) => {
  try {
    const result = await apiService.getAllVeiculos();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/veiculos/:matricula', async (req, res) => {
  try {
    const result = await apiService.getVeiculo(req.params.matricula);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Veiculo not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/veiculos/:matricula', async (req, res) => {
  try {
    const result = await apiService.deleteVeiculo(req.params.matricula);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Entregas Recolhas endpoints
app.post('/api/entregas-recolhas', async (req, res) => {
  try {
    const result = await apiService.createEntregaRecolha(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/entregas-recolhas/:id', async (req, res) => {
  try {
    const result = await apiService.updateEntregaRecolha(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/entregas-recolhas', async (req, res) => {
  try {
    const result = await apiService.getAllEntregasRecolhas();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/entregas_recolhas', async (req, res) => {
  try {
    const result = await apiService.getAllEntregasRecolhas();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/entregas-recolhas/:id', async (req, res) => {
  try {
    const result = await apiService.getEntregaRecolha(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Entrega Recolha not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/entregas-recolhas/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEntregaRecolha(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mochilas endpoints
app.post('/api/mochilas', async (req, res) => {
  try {
    const result = await apiService.createMochila(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/mochilas/:id', async (req, res) => {
  try {
    const result = await apiService.updateMochila(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/mochilas', async (req, res) => {
  try {
    const result = await apiService.getAllMochilas();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/mochilas/:id', async (req, res) => {
  try {
    const result = await apiService.getMochila(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Mochila not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/mochilas/:id', async (req, res) => {
  try {
    const result = await apiService.deleteMochila(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Percurso endpoints
app.post('/api/percurso', async (req, res) => {
  try {
    const result = await apiService.createPercurso(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/percurso/:id', async (req, res) => {
  try {
    const result = await apiService.updatePercurso(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/percurso', async (req, res) => {
  try {
    const result = await apiService.getAllPercurso();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/percurso/:id', async (req, res) => {
  try {
    const result = await apiService.getPercurso(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Percurso not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/percurso/:id', async (req, res) => {
  try {
    const result = await apiService.deletePercurso(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Grupo endpoints
app.post('/api/grupo', async (req, res) => {
  try {
    const result = await apiService.createGrupo(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/grupo/:id', async (req, res) => {
  try {
    const result = await apiService.updateGrupo(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/grupo', async (req, res) => {
  try {
    const result = await apiService.getAllGrupo();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/grupo/:id', async (req, res) => {
  try {
    const result = await apiService.getGrupo(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Grupo not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/grupo/:id', async (req, res) => {
  try {
    const result = await apiService.deleteGrupo(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Etapas endpoints
app.post('/api/etapas', async (req, res) => {
  try {
    const result = await apiService.createEtapa(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/etapas/:id', async (req, res) => {
  try {
    const result = await apiService.updateEtapa(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/etapas', async (req, res) => {
  try {
    const result = await apiService.getAllEtapas();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/etapas/:id', async (req, res) => {
  try {
    const result = await apiService.getEtapa(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Etapa not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/etapas/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEtapa(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/grupo-user', async (req, res) => {
  try {
    const result = await apiService.createGrupoUser(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/grupo-user', async (req, res) => {
  try {
    const result = await supabaseService.fetchAll('grupo_user');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/grupo-user/:id_grupo/:id_user', async (req, res) => {
  try {
    const result = await apiService.updateGrupoUser(req.params.id_grupo, req.params.id_user, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/grupo-user/:id_grupo/:id_user', async (req, res) => {
  try {
    const result = await apiService.deleteGrupoUser(req.params.id_grupo, req.params.id_user);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/etapas-percurso', async (req, res) => {
  try {
    const result = await apiService.createEtapasPercurso(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/etapas-percurso', async (req, res) => {
  try {
    const result = await supabaseService.fetchAll('etapas_percurso');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/etapas-percurso/:id_percurso/:id_etapa', async (req, res) => {
  try {
    const result = await apiService.updateEtapasPercurso(req.params.id_percurso, req.params.id_etapa, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/etapas-percurso/:id_percurso/:id_etapa', async (req, res) => {
  try {
    const result = await apiService.deleteEtapasPercurso(req.params.id_percurso, req.params.id_etapa);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users-empresa-transportes', async (req, res) => {
  try {
    const result = await apiService.createUsersEmpresaTransportes(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/users-empresa-transportes', async (req, res) => {
  try {
    const result = await supabaseService.fetchAll('users_empresa_transportes');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/users-empresa-transportes/:id_utilizador/:id_empresa', async (req, res) => {
  try {
    const result = await apiService.updateUsersEmpresaTransportes(req.params.id_utilizador, req.params.id_empresa, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/users-empresa-transportes/:id_utilizador/:id_empresa', async (req, res) => {
  try {
    const result = await apiService.deleteUsersEmpresaTransportes(req.params.id_utilizador, req.params.id_empresa);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users-estabelecimento', async (req, res) => {
  try {
    const result = await apiService.createUsersEstabelecimento(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/users-estabelecimento', async (req, res) => {
  try {
    const result = await supabaseService.fetchAll('users_estabelecimento');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/users-estabelecimento/:id_utilizador/:id_estabelecimento', async (req, res) => {
  try {
    const result = await apiService.updateUsersEstabelecimento(req.params.id_utilizador, req.params.id_estabelecimento, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/users-estabelecimento/:id_utilizador/:id_estabelecimento', async (req, res) => {
  try {
    const result = await apiService.deleteUsersEstabelecimento(req.params.id_utilizador, req.params.id_estabelecimento);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/tipo-perfil', async (req, res) => {
  try {
    const result = await apiService.createTipoPerfil(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/tipo-perfil/:id', async (req, res) => {
  try {
    const result = await apiService.updateTipoPerfil(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/tipo-perfil', async (req, res) => {
  try {
    const result = await apiService.getAllTipoPerfil();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/tipo-perfil/:id', async (req, res) => {
  try {
    const result = await apiService.deleteTipoPerfil(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/tipo-veiculo', async (req, res) => {
  try {
    const result = await apiService.createTipoVeiculo(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/tipo-veiculo/:id', async (req, res) => {
  try {
    const result = await apiService.updateTipoVeiculo(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/tipo-veiculo', async (req, res) => {
  try {
    const result = await apiService.getAllTipoVeiculo();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/tipo-veiculo/:id', async (req, res) => {
  try {
    const result = await apiService.deleteTipoVeiculo(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/tipo-estabelecimento', async (req, res) => {
  try {
    const result = await apiService.createTipoEstabelecimento(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/tipo-estabelecimento/:id', async (req, res) => {
  try {
    const result = await apiService.updateTipoEstabelecimento(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/tipo-estabelecimento', async (req, res) => {
  try {
    const result = await apiService.getAllTipoEstabelecimento();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/tipo-estabelecimento/:id', async (req, res) => {
  try {
    const result = await apiService.deleteTipoEstabelecimento(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Estado endpoints
app.post('/api/estado-entrega-recolha', async (req, res) => {
  try {
    const result = await apiService.createEstadoEntregaRecolha(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/estado-entrega-recolha/:id', async (req, res) => {
  try {
    const result = await apiService.updateEstadoEntregaRecolha(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/estado-entrega-recolha', async (req, res) => {
  try {
    const result = await apiService.getAllEstadoEntregaRecolha();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/estado-entrega-recolha/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEstadoEntregaRecolha(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/estado-grupo', async (req, res) => {
  try {
    const result = await apiService.createEstadoGrupo(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/estado-grupo/:id', async (req, res) => {
  try {
    const result = await apiService.updateEstadoGrupo(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/estado-grupo', async (req, res) => {
  try {
    const result = await apiService.getAllEstadoGrupo();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/estado-grupo/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEstadoGrupo(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/estado-percurso', async (req, res) => {
  try {
    const result = await apiService.createEstadoPercurso(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/estado-percurso/:id', async (req, res) => {
  try {
    const result = await apiService.updateEstadoPercurso(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/estado-percurso', async (req, res) => {
  try {
    const result = await apiService.getAllEstadoPercurso();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/estado-percurso/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEstadoPercurso(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/estado-conta', async (req, res) => {
  try {
    const result = await apiService.createEstadoConta(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/estado-conta/:id', async (req, res) => {
  try {
    const result = await apiService.updateEstadoConta(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/estado-conta', async (req, res) => {
  try {
    const result = await apiService.getAllEstadoConta();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/estado-conta/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEstadoConta(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/estado-empresa', async (req, res) => {
  try {
    const result = await apiService.createEstadoEmpresa(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/estado-empresa/:id', async (req, res) => {
  try {
    const result = await apiService.updateEstadoEmpresa(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/estado-empresa', async (req, res) => {
  try {
    const result = await apiService.getAllEstadoEmpresa();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/estado-empresa/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEstadoEmpresa(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/estado-estabelecimento', async (req, res) => {
  try {
    const result = await apiService.createEstadoEstabelecimento(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/estado-estabelecimento/:id', async (req, res) => {
  try {
    const result = await apiService.updateEstadoEstabelecimento(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/estado-estabelecimento', async (req, res) => {
  try {
    const result = await apiService.getAllEstadoEstabelecimento();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/estado-estabelecimento/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEstadoEstabelecimento(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/estado-veiculo', async (req, res) => {
  try {
    const result = await apiService.createEstadoVeiculo(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/estado-veiculo/:id', async (req, res) => {
  try {
    const result = await apiService.updateEstadoVeiculo(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/estado-veiculo', async (req, res) => {
  try {
    const result = await apiService.getAllEstadoVeiculo();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/estado-veiculo/:id', async (req, res) => {
  try {
    const result = await apiService.deleteEstadoVeiculo(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/dificuldade-percurso', async (req, res) => {
  try {
    const result = await apiService.createDificuldadePercurso(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/dificuldade-percurso/:id', async (req, res) => {
  try {
    const result = await apiService.updateDificuldadePercurso(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/dificuldade-percurso', async (req, res) => {
  try {
    const result = await apiService.getAllDificuldadePercurso();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/dificuldade-percurso/:id', async (req, res) => {
  try {
    const result = await apiService.deleteDificuldadePercurso(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/info-percurso', async (req, res) => {
  try {
    const result = await apiService.createInfoPercurso(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/info-percurso/:id', async (req, res) => {
  try {
    const result = await apiService.updateInfoPercurso(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/info-percurso', async (req, res) => {
  try {
    const result = await apiService.getAllInfoPercurso();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/info-percurso/:id', async (req, res) => {
  try {
    const result = await apiService.deleteInfoPercurso(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;