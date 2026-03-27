const bcryptjs = require('bcryptjs');

class ApiService {
  constructor(supabaseService) {
    this.supabase = supabaseService;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateTelefone(telefone) {
    const telefoneRegex = /^\d{9}$/;
    return telefoneRegex.test(telefone);
  }

  validateNif(nif) {
    const nifRegex = /^\d{9}$/;
    return nifRegex.test(nif);
  }

  validatePassaporte(passaporte) {
    const passaporteRegex = /^[A-Za-z0-9]{8,9}$/;
    return passaporteRegex.test(passaporte);
  }

  validateCodigoPostal(codigoPostal) {
    const codigoPostalRegex = /^\d{4}-\d{3}$/;
    return codigoPostalRegex.test(codigoPostal);
  }

  validateMatricula(matricula) {
    const matriculaRegex = /^[A-Za-z0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]{2}$/;
    return matriculaRegex.test(matricula);
  }

  validateVin(vin) {
    const vinRegex = /^[A-Za-z0-9]{17}$/;
    return vinRegex.test(vin);
  }

  validateFloat(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  trimString(value) {
    return value ? value.trim() : value;
  }

  async hashPassword(password) {
    return await bcryptjs.hash(password, 10);
  }

  validateRequiredFields(data, table, isUpdate = false) {
    const requiredFields = {
      users: ['email', 'nome', 'telefone', 'id_tipo', 'estado'],
      empresa_transportes: ['nome', 'telefone', 'email', 'estado'],
      estabelecimento: ['nome', 'telefone', 'email', 'hora_abertura', 'hora_fecho', 'link_google', 'rua', 'codigo_postal', 'id_tipo_estabelecimento', 'estado'],
      veiculos: ['matricula', 'vin', 'marca', 'modelo', 'cor', 'id_tipo', 'id_empresa', 'estado'],
      entregas_recolhas: ['id_estabelecimento_r', 'id_estabelecimento_e', 'id_veiculo', 'id_mochila', 'id_estafeta', 'id_empresa', 'data_hora'],
      mochilas: ['peso', 'cor', 'id_user'],
      percurso: ['nome', 'descricao', 'distancia', 'duracao_estimada', 'id_dificuldade', 'id_estado'],
      grupo: ['nome', 'id_estado', 'data_criacao'],
      etapas: ['nome', 'descricao', 'coordenadas'],
      grupo_user: ['id_grupo', 'id_user'],
      etapas_percurso: ['id_percurso', 'id_etapa'],
      users_empresa_transportes: ['id_utilizador', 'id_empresa'],
      users_estabelecimento: ['id_utilizador', 'id_estabelecimento'],
      tipo_perfil: ['tipo'],
      tipo_veiculo: ['tipo'],
      tipo_estabelecimento: ['tipo'],
      estado_entrega_recolha: ['estado'],
      estado_grupo: ['estado'],
      estado_percurso: ['estado'],
      estado_conta: ['estado'],
      estado_empresa: ['estado'],
      estado_estabelecimento: ['estado'],
      estado_veiculo: ['estado'],
      dificuldade_percurso: ['dificuldade'],
      info_percurso: ['titulo', 'conteudo', 'id_percurso']
    };

    const fields = requiredFields[table] || [];
    const optionalFields = ['password', 'nif', 'passaporte'];

    if (isUpdate) {
      for (const field of fields) {
        if (data[field] === undefined) {
          continue;
        }
        if (!optionalFields.includes(field) && (data[field] === null || data[field] === '')) {
          throw new Error(`Field '${field}' cannot be empty`);
        }
      }
    } else {
      for (const field of fields) {
        if (!optionalFields.includes(field) && (data[field] === undefined || data[field] === null || data[field] === '')) {
          throw new Error(`Field '${field}' is required and cannot be empty`);
        }
      }

      if (!optionalFields.includes('password') && fields.includes('password')) {
        if (data.password === undefined || data.password === null || data.password === '') {
          throw new Error(`Field 'password' is required and cannot be empty`);
        }
      }
    }
  }

  async createUser(data) {
    this.validateRequiredFields(data, 'users', false);

    if (data.email) {
      data.email = this.trimString(data.email);
      if (!this.validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      const emailTaken = await this.supabase.getUserByEmail(data.email);
      if (emailTaken) {
        throw new Error('Email already exists');
      }
    }

    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }

    if (data.telefone) {
      data.telefone = this.trimString(data.telefone);
      if (!this.validateTelefone(data.telefone)) {
        throw new Error('Telefone must be exactly 9 digits');
      }
      const telefoneTaken = await this.supabase.isTelefoneTaken(data.telefone);
      if (telefoneTaken) {
        throw new Error('Telefone already exists');
      }
    }

    if (data.nif) {
      data.nif = this.trimString(data.nif);
      if (!this.validateNif(data.nif)) {
        throw new Error('NIF must be exactly 9 digits');
      }
      const nifTaken = await this.supabase.isNifTaken(data.nif);
      if (nifTaken) {
        throw new Error('NIF already exists');
      }
    }

    if (data.passaporte) {
      data.passaporte = this.trimString(data.passaporte);
      if (!this.validatePassaporte(data.passaporte)) {
        throw new Error('Passport must be 8-9 characters, mix of letters and numbers');
      }
      const passaporteTaken = await this.supabase.isPassaporteTaken(data.passaporte);
      if (passaporteTaken) {
        throw new Error('Passport already exists');
      }
    }

    return await this.supabase.createUser(data);
  }

  async updateUser(id, data) {
    this.validateRequiredFields(data, 'users', true);

    if (data.email) {
      data.email = this.trimString(data.email);
      if (!this.validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      const emailTaken = await this.supabase.getUserByEmail(data.email);
      if (emailTaken && emailTaken.id_utilizador !== parseInt(id)) {
        throw new Error('Email already exists for another user');
      }
    }

    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }

    if (data.telefone) {
      data.telefone = this.trimString(data.telefone);
      if (!this.validateTelefone(data.telefone)) {
        throw new Error('Telefone must be exactly 9 digits');
      }
      const telefoneTaken = await this.supabase.isTelefoneTakenByOther(data.telefone, id);
      if (telefoneTaken) {
        throw new Error('Telefone already exists for another user');
      }
    }

    if (data.nif) {
      data.nif = this.trimString(data.nif);
      if (!this.validateNif(data.nif)) {
        throw new Error('NIF must be exactly 9 digits');
      }
      const nifTaken = await this.supabase.isNifTakenByOther(data.nif, id);
      if (nifTaken) {
        throw new Error('NIF already exists for another user');
      }
    }

    if (data.passaporte) {
      data.passaporte = this.trimString(data.passaporte);
      if (!this.validatePassaporte(data.passaporte)) {
        throw new Error('Passport must be 8-9 characters, mix of letters and numbers');
      }
      const passaporteTaken = await this.supabase.isPassaporteTakenByOther(data.passaporte, id);
      if (passaporteTaken) {
        throw new Error('Passport already exists for another user');
      }
    }

    return await this.supabase.updateUser(id, data);
  }

  async getAllUsers() {
    return await this.supabase.getAllUsers();
  }

  async getUser(id) {
    return await this.supabase.getUser(id);
  }

  async deleteUser(id) {
    return await this.supabase.deleteUser(id);
  }

  async registerUser(email, password, nome, additionalData = {}) {
    const data = {
      email,
      password,
      nome,
      id_tipo: additionalData.id_tipo || 5,
      telefone: additionalData.telefone || '',
      nacionalidade: additionalData.nacionalidade || null,
      nif: additionalData.nif || null,
      passaporte: additionalData.passaporte || null,
      estado: 1
    };
    return await this.createUser(data);
  }

  async loginUser(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    email = email.trim();
    console.log('Attempting login for email:', email);
    const user = await this.supabase.getUserByEmail(email);
    console.log('User found:', !!user);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.password) {
      console.error('User has no password hash stored!');
      throw new Error('Invalid user data');
    }

    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isValid);
    
    if (!isValid) {
      throw new Error('Invalid password');
    }

    const userResponse = {
      id_utilizador: user.id_utilizador,
      email: user.email,
      nome: user.nome,
      id_tipo: user.id_tipo,
      estado: user.estado,
      telefone: user.telefone,
      nacionalidade: user.nacionalidade,
      nif: user.nif,
      passaporte: user.passaporte
    };
    
    console.log('Login successful for user:', user.email, 'with id_tipo:', user.id_tipo);
    return userResponse;
  }

  async createEmpresaTransportes(data) {
    this.validateRequiredFields(data, 'empresa_transportes', false);

    if (data.telefone) {
      data.telefone = this.trimString(data.telefone);
      if (!this.validateTelefone(data.telefone)) {
        throw new Error('Telefone must be exactly 9 digits');
      }
      const telefoneTaken = await this.supabase.isTelefoneTaken(data.telefone);
      if (telefoneTaken) {
        throw new Error('Telefone already exists');
      }
    }

    if (data.email) {
      data.email = this.trimString(data.email);
      if (!this.validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      const emailTaken = await this.supabase.getUserByEmail(data.email);
      if (emailTaken) {
        throw new Error('Email already exists');
      }
    }

    if (data.nif) {
      data.nif = this.trimString(data.nif);
      if (!this.validateNif(data.nif)) {
        throw new Error('NIF must be exactly 9 digits');
      }
      const nifTaken = await this.supabase.isNifTaken(data.nif);
      if (nifTaken) {
        throw new Error('NIF already exists');
      }
    }

    return await this.supabase.createEmpresaTransportes(data);
  }

  async updateEmpresaTransportes(id, data) {
    this.validateRequiredFields(data, 'empresa_transportes', true);

    if (data.telefone) {
      data.telefone = this.trimString(data.telefone);
      if (!this.validateTelefone(data.telefone)) {
        throw new Error('Telefone must be exactly 9 digits');
      }
      const existing = await this.supabase.fetchByPk('empresa_transportes', 'telefone', data.telefone);
      if (existing && String(existing.id_empresa) !== String(id)) {
        throw new Error('Telefone already exists for another empresa');
      }
    }

    if (data.email) {
      data.email = this.trimString(data.email);
      if (!this.validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      const existing = await this.supabase.fetchByPk('empresa_transportes', 'email', data.email);
      if (existing && String(existing.id_empresa) !== String(id)) {
        throw new Error('Email already exists for another empresa');
      }
    }

    if (data.nif) {
      data.nif = this.trimString(data.nif);
      if (!this.validateNif(data.nif)) {
        throw new Error('NIF must be exactly 9 digits');
      }
      const existing = await this.supabase.fetchByPk('empresa_transportes', 'nif', data.nif);
      if (existing && String(existing.id_empresa) !== String(id)) {
        throw new Error('NIF already exists for another empresa');
      }
    }

    return await this.supabase.updateEmpresaTransportes(id, data);
  }

  async getAllEmpresaTransportes() {
    return await this.supabase.getAllEmpresaTransportes();
  }

  async getEmpresaTransportes(id) {
    return await this.supabase.getEmpresaTransportes(id);
  }

  async deleteEmpresaTransportes(id) {
    return await this.supabase.deleteEmpresaTransportes(id);
  }

  async createEstabelecimento(data) {
    this.validateRequiredFields(data, 'estabelecimento', false);

    if (data.telefone) {
      data.telefone = this.trimString(data.telefone);
      if (!this.validateTelefone(data.telefone)) {
        throw new Error('Telefone must be exactly 9 digits');
      }
      const telefoneTaken = await this.supabase.isTelefoneTaken(data.telefone);
      if (telefoneTaken) {
        throw new Error('Telefone already exists');
      }
    }

    if (data.email) {
      data.email = this.trimString(data.email);
      if (!this.validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      const emailTaken = await this.supabase.getUserByEmail(data.email);
      if (emailTaken) {
        throw new Error('Email already exists');
      }
    }

    if (data.nif) {
      data.nif = this.trimString(data.nif);
      if (!this.validateNif(data.nif)) {
        throw new Error('NIF must be exactly 9 digits');
      }
      const nifTaken = await this.supabase.isLocalizacaoNifTaken(data.nif);
      if (nifTaken) {
        throw new Error('NIF already exists');
      }
    }

    if (data.codigo_postal) {
      data.codigo_postal = this.trimString(data.codigo_postal);
      if (!this.validateCodigoPostal(data.codigo_postal)) {
        throw new Error('Código postal must be in 0000-000 format');
      }
    }

    return await this.supabase.createEstabelecimento(data);
  }

  async updateEstabelecimento(id, data) {
    this.validateRequiredFields(data, 'estabelecimento', true);

    if (data.telefone) {
      data.telefone = this.trimString(data.telefone);
      if (!this.validateTelefone(data.telefone)) {
        throw new Error('Telefone must be exactly 9 digits');
      }
      const telefoneTaken = await this.supabase.isTelefoneTaken(data.telefone);
      if (telefoneTaken) {
        throw new Error('Telefone already exists');
      }
    }

    if (data.email) {
      data.email = this.trimString(data.email);
      if (!this.validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      const emailTaken = await this.supabase.getUserByEmail(data.email);
      if (emailTaken) {
        throw new Error('Email already exists');
      }
    }

    if (data.nif) {
      data.nif = this.trimString(data.nif);
      if (!this.validateNif(data.nif)) {
        throw new Error('NIF must be exactly 9 digits');
      }
      const nifTaken = await this.supabase.isLocalizacaoNifTakenByOther(data.nif, id);
      if (nifTaken) {
        throw new Error('NIF already exists for another estabelecimento');
      }
    }

    if (data.codigo_postal) {
      data.codigo_postal = this.trimString(data.codigo_postal);
      if (!this.validateCodigoPostal(data.codigo_postal)) {
        throw new Error('Código postal must be in 0000-000 format');
      }
    }

    return await this.supabase.updateEstabelecimento(id, data);
  }

  async getAllEstabelecimento() {
    return await this.supabase.getAllEstabelecimento();
  }

  async getEstabelecimento(id) {
    return await this.supabase.getEstabelecimento(id);
  }

  async deleteEstabelecimento(id) {
    return await this.supabase.deleteEstabelecimento(id);
  }

  async createVeiculo(data) {
    this.validateRequiredFields(data, 'veiculos', false);

    if (data.matricula) {
      data.matricula = this.trimString(data.matricula).toUpperCase();
      if (!this.validateMatricula(data.matricula)) {
        throw new Error('Matrícula must be in aa-aa-aa format (pairs of letters or numbers)');
      }
      const existing = await this.supabase.getVeiculo(data.matricula);
      if (existing) {
        throw new Error('Matrícula already exists');
      }
    }

    if (data.vin) {
      data.vin = this.trimString(data.vin).toUpperCase();
      if (!this.validateVin(data.vin)) {
        throw new Error('VIN must be exactly 17 characters, mix of letters and numbers');
      }
      const vinTaken = await this.supabase.isVinTaken(data.vin);
      if (vinTaken) {
        throw new Error('VIN already exists');
      }
    }

    return await this.supabase.createVeiculo(data);
  }

  async updateVeiculo(matricula, data) {
    this.validateRequiredFields(data, 'veiculos', true);

    if (data.matricula) {
      data.matricula = this.trimString(data.matricula).toUpperCase();
      if (!this.validateMatricula(data.matricula)) {
        throw new Error('Matrícula must be in aa-aa-aa format (pairs of letters or numbers)');
      }
      if (data.matricula !== matricula) {
        const existing = await this.supabase.getVeiculo(data.matricula);
        if (existing) {
          throw new Error('Matrícula already exists');
        }
      }
    }

    if (data.vin) {
      data.vin = this.trimString(data.vin).toUpperCase();
      if (!this.validateVin(data.vin)) {
        throw new Error('VIN must be exactly 17 characters, mix of letters and numbers');
      }
      const vinTaken = await this.supabase.isVinTakenByOther(data.vin, matricula);
      if (vinTaken) {
        throw new Error('VIN already exists for another vehicle');
      }
    }

    return await this.supabase.updateVeiculo(matricula, data);
  }

  async getAllVeiculos() {
    return await this.supabase.getAllVeiculos();
  }

  async getVeiculo(matricula) {
    return await this.supabase.getVeiculo(matricula);
  }

  async deleteVeiculo(matricula) {
    return await this.supabase.deleteVeiculo(matricula);
  }

  async createEntregaRecolha(data) {
    this.validateRequiredFields(data, 'entregas_recolhas', false);
    return await this.supabase.createEntregaRecolha(data);
  }

  async updateEntregaRecolha(id, data) {
    this.validateRequiredFields(data, 'entregas_recolhas', true);
    return await this.supabase.updateEntregaRecolha(id, data);
  }

  async getAllEntregasRecolhas() {
    return await this.supabase.getAllEntregasRecolhas();
  }

  async getEntregaRecolha(id) {
    return await this.supabase.getEntregaRecolha(id);
  }

  async deleteEntregaRecolha(id) {
    return await this.supabase.deleteEntregaRecolha(id);
  }

  async createMochila(data) {
    this.validateRequiredFields(data, 'mochilas', false);

    if (data.peso !== undefined && data.peso !== null) {
      if (!this.validateFloat(data.peso)) {
        throw new Error('Peso must be a valid number');
      }
      data.peso = parseFloat(data.peso);
    }

    return await this.supabase.createMochila(data);
  }

  async updateMochila(id, data) {
    this.validateRequiredFields(data, 'mochilas', true);

    if (data.peso !== undefined && data.peso !== null) {
      if (!this.validateFloat(data.peso)) {
        throw new Error('Peso must be a valid number');
      }
      data.peso = parseFloat(data.peso);
    }

    return await this.supabase.updateMochila(id, data);
  }

  async getAllMochilas() {
    return await this.supabase.getAllMochilas();
  }

  async getMochila(id) {
    return await this.supabase.getMochila(id);
  }

  async deleteMochila(id) {
    return await this.supabase.deleteMochila(id);
  }

  async createPercurso(data) {
    this.validateRequiredFields(data, 'percurso', false);

    if (data.distancia !== undefined && data.distancia !== null) {
      if (!this.validateFloat(data.distancia)) {
        throw new Error('Distancia must be a valid number');
      }
      data.distancia = parseFloat(data.distancia);
    }

    return await this.supabase.createPercurso(data);
  }

  async updatePercurso(id, data) {
    this.validateRequiredFields(data, 'percurso', true);

    if (data.distancia !== undefined && data.distancia !== null) {
      if (!this.validateFloat(data.distancia)) {
        throw new Error('Distancia must be a valid number');
      }
      data.distancia = parseFloat(data.distancia);
    }

    return await this.supabase.updatePercurso(id, data);
  }

  async getAllPercurso() {
    return await this.supabase.getAllPercurso();
  }

  async getPercurso(id) {
    return await this.supabase.getPercurso(id);
  }

  async deletePercurso(id) {
    return await this.supabase.deletePercurso(id);
  }

  async createGrupo(data) {
    this.validateRequiredFields(data, 'grupo', false);
    return await this.supabase.createGrupo(data);
  }

  async updateGrupo(id, data) {
    this.validateRequiredFields(data, 'grupo', true);
    return await this.supabase.updateGrupo(id, data);
  }

  async getAllGrupo() {
    return await this.supabase.getAllGrupo();
  }

  async getGrupo(id) {
    return await this.supabase.getGrupo(id);
  }

  async deleteGrupo(id) {
    return await this.supabase.deleteGrupo(id);
  }

  async createEtapa(data) {
    this.validateRequiredFields(data, 'etapas', false);
    return await this.supabase.createEtapa(data);
  }

  async updateEtapa(id, data) {
    this.validateRequiredFields(data, 'etapas', true);
    return await this.supabase.updateEtapa(id, data);
  }

  async getAllEtapas() {
    return await this.supabase.getAllEtapas();
  }

  async getEtapa(id) {
    return await this.supabase.getEtapa(id);
  }

  async deleteEtapa(id) {
    return await this.supabase.deleteEtapa(id);
  }

  async createGrupoUser(data) {
    this.validateRequiredFields(data, 'grupo_user', false);
    return await this.supabase.insertOne('grupo_user', data);
  }

  async updateGrupoUser(id_grupo, id_user, data) {
    this.validateRequiredFields(data, 'grupo_user', true);
    return await this.supabase.updateOne('grupo_user', { id_grupo, id_user }, data);
  }

  async deleteGrupoUser(id_grupo, id_user) {
    return await this.supabase.deleteByPk('grupo_user', { id_grupo, id_user });
  }

  async createEtapasPercurso(data) {
    this.validateRequiredFields(data, 'etapas_percurso', false);
    return await this.supabase.insertOne('etapas_percurso', data);
  }

  async updateEtapasPercurso(id_percurso, id_etapa, data) {
    this.validateRequiredFields(data, 'etapas_percurso', true);
    return await this.supabase.updateOne('etapas_percurso', { id_percurso, id_etapa }, data);
  }

  async deleteEtapasPercurso(id_percurso, id_etapa) {
    return await this.supabase.deleteByPk('etapas_percurso', { id_percurso, id_etapa });
  }

  async createUsersEmpresaTransportes(data) {
    this.validateRequiredFields(data, 'users_empresa_transportes', false);
    return await this.supabase.insertOne('users_empresa_transportes', data);
  }

  async updateUsersEmpresaTransportes(id_utilizador, id_empresa, data) {
    this.validateRequiredFields(data, 'users_empresa_transportes', true);
    return await this.supabase.updateOne('users_empresa_transportes', { id_utilizador, id_empresa }, data);
  }

  async deleteUsersEmpresaTransportes(id_utilizador, id_empresa) {
    return await this.supabase.deleteByPk('users_empresa_transportes', { id_utilizador, id_empresa });
  }

  async createUsersEstabelecimento(data) {
    this.validateRequiredFields(data, 'users_estabelecimento', false);
    return await this.supabase.insertOne('users_estabelecimento', data);
  }

  async updateUsersEstabelecimento(id_utilizador, id_estabelecimento, data) {
    this.validateRequiredFields(data, 'users_estabelecimento', true);
    return await this.supabase.updateOne('users_estabelecimento', { id_utilizador, id_estabelecimento }, data);
  }

  async deleteUsersEstabelecimento(id_utilizador, id_estabelecimento) {
    return await this.supabase.deleteByPk('users_estabelecimento', { id_utilizador, id_estabelecimento });
  }

  async createTipoPerfil(data) {
    this.validateRequiredFields(data, 'tipo_perfil', false);
    return await this.supabase.createTipoPerfil(data);
  }

  async updateTipoPerfil(id, data) {
    this.validateRequiredFields(data, 'tipo_perfil', true);
    return await this.supabase.updateTipoPerfil(id, data);
  }

  async getAllTipoPerfil() {
    return await this.supabase.getAllTipoPerfil();
  }

  async deleteTipoPerfil(id) {
    return await this.supabase.deleteTipoPerfil(id);
  }

  async createTipoVeiculo(data) {
    this.validateRequiredFields(data, 'tipo_veiculo', false);
    return await this.supabase.createTipoVeiculo(data);
  }

  async updateTipoVeiculo(id, data) {
    this.validateRequiredFields(data, 'tipo_veiculo', true);
    return await this.supabase.updateTipoVeiculo(id, data);
  }

  async getAllTipoVeiculo() {
    return await this.supabase.getAllTipoVeiculo();
  }

  async deleteTipoVeiculo(id) {
    return await this.supabase.deleteTipoVeiculo(id);
  }

  async createTipoEstabelecimento(data) {
    this.validateRequiredFields(data, 'tipo_estabelecimento', false);
    return await this.supabase.createTipoEstabelecimento(data);
  }

  async updateTipoEstabelecimento(id, data) {
    this.validateRequiredFields(data, 'tipo_estabelecimento', true);
    return await this.supabase.updateTipoEstabelecimento(id, data);
  }

  async getAllTipoEstabelecimento() {
    return await this.supabase.getAllTipoEstabelecimento();
  }

  async deleteTipoEstabelecimento(id) {
    return await this.supabase.deleteTipoEstabelecimento(id);
  }

  async createEstadoEntregaRecolha(data) {
    this.validateRequiredFields(data, 'estado_entrega_recolha', false);
    return await this.supabase.createEstadoEntregaRecolha(data);
  }

  async updateEstadoEntregaRecolha(id, data) {
    this.validateRequiredFields(data, 'estado_entrega_recolha', true);
    return await this.supabase.updateEstadoEntregaRecolha(id, data);
  }

  async getAllEstadoEntregaRecolha() {
    return await this.supabase.getAllEstadoEntregaRecolha();
  }

  async deleteEstadoEntregaRecolha(id) {
    return await this.supabase.deleteEstadoEntregaRecolha(id);
  }

  async createEstadoGrupo(data) {
    this.validateRequiredFields(data, 'estado_grupo', false);
    return await this.supabase.createEstadoGrupo(data);
  }

  async updateEstadoGrupo(id, data) {
    this.validateRequiredFields(data, 'estado_grupo', true);
    return await this.supabase.updateEstadoGrupo(id, data);
  }

  async getAllEstadoGrupo() {
    return await this.supabase.getAllEstadoGrupo();
  }

  async deleteEstadoGrupo(id) {
    return await this.supabase.deleteEstadoGrupo(id);
  }

  async createEstadoPercurso(data) {
    this.validateRequiredFields(data, 'estado_percurso', false);
    return await this.supabase.createEstadoPercurso(data);
  }

  async updateEstadoPercurso(id, data) {
    this.validateRequiredFields(data, 'estado_percurso', true);
    return await this.supabase.updateEstadoPercurso(id, data);
  }

  async getAllEstadoPercurso() {
    return await this.supabase.getAllEstadoPercurso();
  }

  async deleteEstadoPercurso(id) {
    return await this.supabase.deleteEstadoPercurso(id);
  }

  async createEstadoConta(data) {
    this.validateRequiredFields(data, 'estado_conta', false);
    return await this.supabase.createEstadoConta(data);
  }

  async updateEstadoConta(id, data) {
    this.validateRequiredFields(data, 'estado_conta', true);
    return await this.supabase.updateEstadoConta(id, data);
  }

  async getAllEstadoConta() {
    return await this.supabase.getAllEstadoConta();
  }

  async deleteEstadoConta(id) {
    return await this.supabase.deleteEstadoConta(id);
  }

  async createEstadoEmpresa(data) {
    this.validateRequiredFields(data, 'estado_empresa', false);
    return await this.supabase.createEstadoEmpresa(data);
  }

  async updateEstadoEmpresa(id, data) {
    this.validateRequiredFields(data, 'estado_empresa', true);
    return await this.supabase.updateEstadoEmpresa(id, data);
  }

  async getAllEstadoEmpresa() {
    return await this.supabase.getAllEstadoEmpresa();
  }

  async deleteEstadoEmpresa(id) {
    return await this.supabase.deleteEstadoEmpresa(id);
  }

  async createEstadoEstabelecimento(data) {
    this.validateRequiredFields(data, 'estado_estabelecimento', false);
    return await this.supabase.createEstadoEstabelecimento(data);
  }

  async updateEstadoEstabelecimento(id, data) {
    this.validateRequiredFields(data, 'estado_estabelecimento', true);
    return await this.supabase.updateEstadoEstabelecimento(id, data);
  }

  async getAllEstadoEstabelecimento() {
    return await this.supabase.getAllEstadoEstabelecimento();
  }

  async deleteEstadoEstabelecimento(id) {
    return await this.supabase.deleteEstadoEstabelecimento(id);
  }

  async createEstadoVeiculo(data) {
    this.validateRequiredFields(data, 'estado_veiculo', false);
    return await this.supabase.createEstadoVeiculo(data);
  }

  async updateEstadoVeiculo(id, data) {
    this.validateRequiredFields(data, 'estado_veiculo', true);
    return await this.supabase.updateEstadoVeiculo(id, data);
  }

  async getAllEstadoVeiculo() {
    return await this.supabase.getAllEstadoVeiculo();
  }

  async deleteEstadoVeiculo(id) {
    return await this.supabase.deleteEstadoVeiculo(id);
  }

  async createDificuldadePercurso(data) {
    this.validateRequiredFields(data, 'dificuldade_percurso', false);
    return await this.supabase.createDificuldadePercurso(data);
  }

  async updateDificuldadePercurso(id, data) {
    this.validateRequiredFields(data, 'dificuldade_percurso', true);
    return await this.supabase.updateDificuldadePercurso(id, data);
  }

  async getAllDificuldadePercurso() {
    return await this.supabase.getAllDificuldadePercurso();
  }

  async deleteDificuldadePercurso(id) {
    return await this.supabase.deleteDificuldadePercurso(id);
  }

  async createInfoPercurso(data) {
    this.validateRequiredFields(data, 'info_percurso', false);
    return await this.supabase.createInfoPercurso(data);
  }

  async updateInfoPercurso(id, data) {
    this.validateRequiredFields(data, 'info_percurso', true);
    return await this.supabase.updateInfoPercurso(id, data);
  }

  async getAllInfoPercurso() {
    return await this.supabase.getAllInfoPercurso();
  }

  async deleteInfoPercurso(id) {
    return await this.supabase.deleteInfoPercurso(id);
  }
}

module.exports = ApiService;