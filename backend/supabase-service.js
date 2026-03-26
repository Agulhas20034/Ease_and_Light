const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SupabaseService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  get client() {
    return this.supabase;
  }

  async fetchAll(table) {
    const { data, error } = await this.supabase.from(table).select('*');
    if (error) throw error;
    return data;
  }

  async fetchByPk(table, pk, value) {
    if (typeof pk === 'string') {
      const { data, error } = await this.supabase.from(table).select('*').eq(pk, value).maybeSingle();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.supabase.from(table).select('*').match(pk).maybeSingle();
      if (error) throw error;
      return data;
    }
  }

  async insertOne(table, record) {
    const { data, error } = await this.supabase.from(table).insert([record]);
    if (error) throw error;
    return data;
  }

  async updateByPk(table, pk, valueOrUpdates) {
    if (typeof pk === 'string') {
      const { value, updates } = { value: valueOrUpdates.id ?? valueOrUpdates, updates: valueOrUpdates.updates ?? valueOrUpdates };
      const { data, error } = await this.supabase.from(table).update(updates).eq(pk, value);
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.supabase.from(table).update(valueOrUpdates).match(pk);
      if (error) throw error;
      return data;
    }
  }

  async updateOne(table, pk, updates) {
    const { data, error } = await this.supabase.from(table).update(updates).match(pk);
    if (error) throw error;
    return data;
  }

  async deleteByPk(table, pk, value) {
    if (typeof pk === 'string') {
      const { data, error } = await this.supabase.from(table).delete().eq(pk, value);
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.supabase.from(table).delete().match(pk);
      if (error) throw error;
      return data;
    }
  }

  async getUserByEmail(email) {
    const { data, error } = await this.supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (error) throw error;
    return data;
  }

  async isTelefoneTaken(telefone) {
    if (!telefone) return false;
    const cleaned = String(telefone).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('telefone', cleaned).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isTelefoneTakenByOther(telefone, userId) {
    if (!telefone) return false;
    const cleaned = String(telefone).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('telefone', cleaned).neq('id_utilizador', userId).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isNifTaken(nif) {
    if (!nif) return false;
    const cleaned = String(nif).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('nif', cleaned).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isNifTakenByOther(nif, userId) {
    if (!nif) return false;
    const cleaned = String(nif).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('nif', cleaned).neq('id_utilizador', userId).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isPassaporteTaken(passaporte) {
    if (!passaporte) return false;
    const cleaned = String(passaporte).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('passaporte', cleaned).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isPassaporteTakenByOther(passaporte, userId) {
    if (!passaporte) return false;
    const cleaned = String(passaporte).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('passaporte', cleaned).neq('id_utilizador', userId).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isVinTaken(vin) {
    if (!vin) return false;
    const cleaned = String(vin).trim().toUpperCase();
    const { data, error } = await this.supabase.from('veiculos').select('matricula').eq('vin', cleaned).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isVinTakenByOther(vin, matricula) {
    if (!vin) return false;
    const cleaned = String(vin).trim().toUpperCase();
    const { data, error } = await this.supabase.from('veiculos').select('matricula').eq('vin', cleaned).neq('matricula', matricula).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isLocalizacaoNifTaken(nif) {
    if (!nif) return false;
    const cleaned = String(nif).trim();
    const { data, error } = await this.supabase.from('estabelecimento').select('id_estabelecimento').eq('nif', cleaned).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isLocalizacaoNifTakenByOther(nif, locId) {
    if (!nif) return false;
    const cleaned = String(nif).trim();
    const { data, error } = await this.supabase.from('estabelecimento').select('id_estabelecimento').eq('nif', cleaned).neq('id_estabelecimento', locId).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async getAllUsers() { return this.fetchAll('users'); }
  async getUser(id) { return this.fetchByPk('users', 'id_utilizador', id); }
  async createUser(rec) { return this.insertOne('users', rec); }
  async updateUser(id, updates) { return this.updateByPk('users', 'id_utilizador', { id, updates }); }
  async deleteUser(id) { return this.deleteByPk('users', 'id_utilizador', id); }

  async getAllEmpresaTransportes() { return this.fetchAll('empresa_transportes'); }
  async getEmpresaTransportes(id) { return this.fetchByPk('empresa_transportes', 'id_empresa', id); }
  async createEmpresaTransportes(rec) { return this.insertOne('empresa_transportes', rec); }
  async updateEmpresaTransportes(id, updates) { return this.updateByPk('empresa_transportes', 'id_empresa', { id, updates }); }
  async deleteEmpresaTransportes(id) { return this.deleteByPk('empresa_transportes', 'id_empresa', id); }

  async getAllEntregasRecolhas() { return this.fetchAll('entregas_recolhas'); }
  async getEntregaRecolha(id) { return this.fetchByPk('entregas_recolhas', 'id_entrega_recolha', id); }
  async createEntregaRecolha(rec) { return this.insertOne('entregas_recolhas', rec); }
  async updateEntregaRecolha(id, updates) { return this.updateByPk('entregas_recolhas', 'id_entrega_recolha', { id, updates }); }
  async deleteEntregaRecolha(id) { return this.deleteByPk('entregas_recolhas', 'id_entrega_recolha', id); }

  async getAllEstabelecimento() { return this.fetchAll('estabelecimento'); }
  async getEstabelecimento(id) { return this.fetchByPk('estabelecimento', 'id_estabelecimento', id); }
  async createEstabelecimento(rec) { return this.insertOne('estabelecimento', rec); }
  async updateEstabelecimento(id, updates) { return this.updateByPk('estabelecimento', 'id_estabelecimento', { id, updates }); }
  async deleteEstabelecimento(id) { return this.deleteByPk('estabelecimento', 'id_estabelecimento', id); }

  async getAllEstadoEntregaRecolha() { return this.fetchAll('estado_entrega_recolha'); }
  async getEstadoEntregaRecolha(id) { return this.fetchByPk('estado_entrega_recolha', 'id_estado', id); }
  async createEstadoEntregaRecolha(rec) { return this.insertOne('estado_entrega_recolha', rec); }
  async updateEstadoEntregaRecolha(id, updates) { return this.updateByPk('estado_entrega_recolha', 'id_estado', { id, updates }); }
  async deleteEstadoEntregaRecolha(id) { return this.deleteByPk('estado_entrega_recolha', 'id_estado', id); }

  async getAllEstadoGrupo() { return this.fetchAll('estado_grupo'); }
  async getEstadoGrupo(id) { return this.fetchByPk('estado_grupo', 'id_estado', id); }
  async createEstadoGrupo(rec) { return this.insertOne('estado_grupo', rec); }
  async updateEstadoGrupo(id, updates) { return this.updateByPk('estado_grupo', 'id_estado', { id, updates }); }
  async deleteEstadoGrupo(id) { return this.deleteByPk('estado_grupo', 'id_estado', id); }

  async getAllEstadoPercurso() { return this.fetchAll('estado_percurso'); }
  async getEstadoPercurso(id) { return this.fetchByPk('estado_percurso', 'id_estado', id); }
  async createEstadoPercurso(rec) { return this.insertOne('estado_percurso', rec); }
  async updateEstadoPercurso(id, updates) { return this.updateByPk('estado_percurso', 'id_estado', { id, updates }); }
  async deleteEstadoPercurso(id) { return this.deleteByPk('estado_percurso', 'id_estado', id); }

  async getAllEstadoConta() { return this.fetchAll('estado_conta'); }
  async getEstadoConta(id) { return this.fetchByPk('estado_conta', 'id_estado', id); }
  async createEstadoConta(rec) { return this.insertOne('estado_conta', rec); }
  async updateEstadoConta(id, updates) { return this.updateByPk('estado_conta', 'id_estado', { id, updates }); }
  async deleteEstadoConta(id) { return this.deleteByPk('estado_conta', 'id_estado', id); }

  async getAllEstadoEmpresa() { return this.fetchAll('estado_empresa'); }
  async getEstadoEmpresa(id) { return this.fetchByPk('estado_empresa', 'id_estado', id); }
  async createEstadoEmpresa(rec) { return this.insertOne('estado_empresa', rec); }
  async updateEstadoEmpresa(id, updates) { return this.updateByPk('estado_empresa', 'id_estado', { id, updates }); }
  async deleteEstadoEmpresa(id) { return this.deleteByPk('estado_empresa', 'id_estado', id); }

  async getAllEstadoEstabelecimento() { return this.fetchAll('estado_estabelecimento'); }
  async getEstadoEstabelecimento(id) { return this.fetchByPk('estado_estabelecimento', 'id_estado', id); }
  async createEstadoEstabelecimento(rec) { return this.insertOne('estado_estabelecimento', rec); }
  async updateEstadoEstabelecimento(id, updates) { return this.updateByPk('estado_estabelecimento', 'id_estado', { id, updates }); }
  async deleteEstadoEstabelecimento(id) { return this.deleteByPk('estado_estabelecimento', 'id_estado', id); }

  async getAllEstadoVeiculo() { return this.fetchAll('estado_veiculo'); }
  async getEstadoVeiculo(id) { return this.fetchByPk('estado_veiculo', 'id_estado', id); }
  async createEstadoVeiculo(rec) { return this.insertOne('estado_veiculo', rec); }
  async updateEstadoVeiculo(id, updates) { return this.updateByPk('estado_veiculo', 'id_estado', { id, updates }); }
  async deleteEstadoVeiculo(id) { return this.deleteByPk('estado_veiculo', 'id_estado', id); }

  async getAllEtapas() { return this.fetchAll('etapas'); }
  async getEtapa(id) { return this.fetchByPk('etapas', 'id_etapa', id); }
  async createEtapa(rec) { return this.insertOne('etapas', rec); }
  async updateEtapa(id, updates) { return this.updateByPk('etapas', 'id_etapa', { id, updates }); }
  async deleteEtapa(id) { return this.deleteByPk('etapas', 'id_etapa', id); }

  async getAllGrupo() { return this.fetchAll('grupo'); }
  async getGrupo(id) { return this.fetchByPk('grupo', 'id_grupo', id); }
  async createGrupo(rec) { return this.insertOne('grupo', rec); }
  async updateGrupo(id, updates) { return this.updateByPk('grupo', 'id_grupo', { id, updates }); }
  async deleteGrupo(id) { return this.deleteByPk('grupo', 'id_grupo', id); }

  async getAllInfoPercurso() { return this.fetchAll('info_percurso'); }
  async getInfoPercurso(id) { return this.fetchByPk('info_percurso', 'id_info_percurso', id); }
  async createInfoPercurso(rec) { return this.insertOne('info_percurso', rec); }
  async updateInfoPercurso(id, updates) { return this.updateByPk('info_percurso', 'id_info_percurso', { id, updates }); }
  async deleteInfoPercurso(id) { return this.deleteByPk('info_percurso', 'id_info_percurso', id); }

  async getAllMochilas() { return this.fetchAll('mochilas'); }
  async getMochila(id) { return this.fetchByPk('mochilas', 'id_mochila', id); }
  async createMochila(rec) { return this.insertOne('mochilas', rec); }
  async updateMochila(id, updates) { return this.updateByPk('mochilas', 'id_mochila', { id, updates }); }
  async deleteMochila(id) { return this.deleteByPk('mochilas', 'id_mochila', id); }

  async getAllPercurso() { return this.fetchAll('percurso'); }
  async getPercurso(id) { return this.fetchByPk('percurso', 'id_percurso', id); }
  async createPercurso(rec) { return this.insertOne('percurso', rec); }
  async updatePercurso(id, updates) { return this.updateByPk('percurso', 'id_percurso', { id, updates }); }
  async deletePercurso(id) { return this.deleteByPk('percurso', 'id_percurso', id); }

  async getAllTipoEntregaRecolha() { return this.fetchAll('tipo_entrega_recolha'); }
  async getTipoEntregaRecolha(id) { return this.fetchByPk('tipo_entrega_recolha', 'id_tipo', id); }
  async createTipoEntregaRecolha(rec) { return this.insertOne('tipo_entrega_recolha', rec); }
  async updateTipoEntregaRecolha(id, updates) { return this.updateByPk('tipo_entrega_recolha', 'id_tipo', { id, updates }); }
  async deleteTipoEntregaRecolha(id) { return this.deleteByPk('tipo_entrega_recolha', 'id_tipo', id); }

  async getAllTipoEstabelecimento() { return this.fetchAll('tipo_estabelecimento'); }
  async getTipoEstabelecimento(id) { return this.fetchByPk('tipo_estabelecimento', 'id_tipo', id); }
  async createTipoEstabelecimento(rec) { return this.insertOne('tipo_estabelecimento', rec); }
  async updateTipoEstabelecimento(id, updates) { return this.updateByPk('tipo_estabelecimento', 'id_tipo', { id, updates }); }
  async deleteTipoEstabelecimento(id) { return this.deleteByPk('tipo_estabelecimento', 'id_tipo', id); }

  async getAllTipoPerfil() { return this.fetchAll('tipo_perfil'); }
  async getTipoPerfil(id) { return this.fetchByPk('tipo_perfil', 'id_tipo', id); }
  async createTipoPerfil(rec) { return this.insertOne('tipo_perfil', rec); }
  async updateTipoPerfil(id, updates) { return this.updateByPk('tipo_perfil', 'id_tipo', { id, updates }); }
  async deleteTipoPerfil(id) { return this.deleteByPk('tipo_perfil', 'id_tipo', id); }

  async getAllTipoVeiculo() { return this.fetchAll('tipo_veiculo'); }
  async getTipoVeiculo(id) { return this.fetchByPk('tipo_veiculo', 'id_tipo', id); }
  async createTipoVeiculo(rec) { return this.insertOne('tipo_veiculo', rec); }
  async updateTipoVeiculo(id, updates) { return this.updateByPk('tipo_veiculo', 'id_tipo', { id, updates }); }
  async deleteTipoVeiculo(id) { return this.deleteByPk('tipo_veiculo', 'id_tipo', id); }

  async getAllDificuldadePercurso() { return this.fetchAll('dificuldade_percurso'); }
  async getDificuldadePercurso(id) { return this.fetchByPk('dificuldade_percurso', 'id_dificuldade', id); }
  async createDificuldadePercurso(rec) { return this.insertOne('dificuldade_percurso', rec); }
  async updateDificuldadePercurso(id, updates) { return this.updateByPk('dificuldade_percurso', 'id_dificuldade', { id, updates }); }
  async deleteDificuldadePercurso(id) { return this.deleteByPk('dificuldade_percurso', 'id_dificuldade', id); }

  async getAllVeiculos() { return this.fetchAll('veiculos'); }
  async getVeiculo(matricula) { return this.fetchByPk('veiculos', 'matricula', matricula); }
  async createVeiculo(rec) { return this.insertOne('veiculos', rec); }
  async updateVeiculo(matricula, updates) { return this.updateByPk('veiculos', 'matricula', { id: matricula, updates }); }
  async deleteVeiculo(matricula) { return this.deleteByPk('veiculos', 'matricula', matricula); }
}

module.exports = SupabaseService;