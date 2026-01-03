import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import * as bcryptjs from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const storageAdapter = {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          
        }
      }
    };

    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        storage: storageAdapter,
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: false  
      }
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  
  async registerUser(email: string, password: string, nome: string = '') {
    const { data: existing, error: checkError } = await this.supabase.from('users')
      .select('id_utilizador')
      .eq('email', email)
      .maybeSingle();
    if (checkError) throw checkError;
    if (existing) throw new Error('An account with this email already exists');

    const hashedPassword = await bcryptjs.hash(password, 10);
    const rec: any = { email, password: hashedPassword, nome };
    rec.id_tipo = 5;

    const data = await this.insertOne('users', rec);
    return data;
  }

  
  async loginUser(email: string, password: string) {
    const user: any = await this.getUserByEmail(email);
    if (!user) throw new Error('User not found');
    const isValid = await bcryptjs.compare(password, user.password || '');
    if (!isValid) throw new Error('Invalid password');
    // devolver campos úteis para o frontend; não incluir a password
    return { id_utilizador: user.id_utilizador, email: user.email, nome: user.nome, id_tipo: user.id_tipo, estado: user.estado };
  }

  validatePassword(password: string): { isValid: boolean; feedback: string[] } {
    const feedback: string[] = [];
    
    if (password.length < 8) {
      feedback.push('pw_len');
    }
    if (!/[A-Z]/.test(password)) {
      feedback.push('pw_upper');
    }
    if (!/[a-z]/.test(password)) {
      feedback.push('pw_lower');
    }
    if (!/[0-9]/.test(password)) {
      feedback.push('pw_number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('pw_special');
    }
    
    return {
      isValid: feedback.length === 0,
      feedback
    };
  }

  //Crud Generico para poder adaptar a todas as tabelas(diminui codigo repetido)
  async fetchAll(table: string) {
    const { data, error } = await this.supabase.from(table).select('*');
    if (error) throw error;
    return data;
  }
    
  async fetchProfileType(id_tipo: number) {
    try {
      const { data, error } = await this.supabase.from('tipo_perfil')
        .select('*')
        .eq('id_tipo', id_tipo)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching profile type:', err);
      return null;
    }
  }

  async fetchByPk(table: string, pk: string | Record<string, any>, value?: any) {
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

  async insertOne(table: string, record: any) {
    const { data, error } = await this.supabase.from(table).insert([record]);
    if (error) throw error;
    return data;
  }

  async updateByPk(table: string, pk: string | Record<string, any>, valueOrUpdates: any) {
    if (typeof pk === 'string') {
      const { value, updates } = { value: valueOrUpdates.id ?? valueOrUpdates, updates: valueOrUpdates.updates ?? valueOrUpdates } as any;
      const { data, error } = await this.supabase.from(table).update(updates).eq(pk, value);
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.supabase.from(table).update(valueOrUpdates).match(pk);
      if (error) throw error;
      return data;
    }
  }

  async deleteByPk(table: string, pk: string | Record<string, any>, value?: any) {
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

  //Cruds específicos por tabela(usando o genérico acima para diminuir codigo usado)
  
  // dificuldade_percurso
  async getAllDificuldadePercurso() { return this.fetchAll('dificuldade_percurso'); }
  async getDificuldadePercurso(id: number) { return this.fetchByPk('dificuldade_percurso', 'id_dificuldade', id); }
  async createDificuldadePercurso(rec: any) { return this.insertOne('dificuldade_percurso', rec); }
  async updateDificuldadePercurso(id: number, updates: any) { return this.updateByPk('dificuldade_percurso', 'id_dificuldade', { id, updates }); }
  async deleteDificuldadePercurso(id: number) { return this.deleteByPk('dificuldade_percurso', 'id_dificuldade', id); }

  // empresa_transportes
  async getAllEmpresaTransportes() { return this.fetchAll('empresa_transportes'); }
  async getEmpresaTransportes(id: number) { return this.fetchByPk('empresa_transportes', 'id_empresa', id); }
  async createEmpresaTransportes(rec: any) { return this.insertOne('empresa_transportes', rec); }
  async updateEmpresaTransportes(id: number, updates: any) { return this.updateByPk('empresa_transportes', 'id_empresa', { id, updates }); }
  async deleteEmpresaTransportes(id: number) { return this.deleteByPk('empresa_transportes', 'id_empresa', id); }

  // entregas_recolhas
  async getAllEntregasRecolhas() { return this.fetchAll('entregas_recolhas'); }
  async getEntregaRecolha(id: number) { return this.fetchByPk('entregas_recolhas', 'id_entrega_recolha', id); }
  async createEntregaRecolha(rec: any) { return this.insertOne('entregas_recolhas', rec); }
  async updateEntregaRecolha(id: number, updates: any) { return this.updateByPk('entregas_recolhas', 'id_entrega_recolha', { id, updates }); }
  async deleteEntregaRecolha(id: number) { return this.deleteByPk('entregas_recolhas', 'id_entrega_recolha', id); }

  // estabelecimento
  async getAllEstabelecimento() { return this.fetchAll('estabelecimento'); }
  async getEstabelecimento(id: number) { return this.fetchByPk('estabelecimento', 'id_estabelecimento', id); }
  async createEstabelecimento(rec: any) { return this.insertOne('estabelecimento', rec); }
  async updateEstabelecimento(id: number, updates: any) { return this.updateByPk('estabelecimento', 'id_estabelecimento', { id, updates }); }
  async deleteEstabelecimento(id: number) { return this.deleteByPk('estabelecimento', 'id_estabelecimento', id); }

  // estado_entrega_recolha
  async getAllEstadoEntregaRecolha() { return this.fetchAll('estado_entrega_recolha'); }
  async getEstadoEntregaRecolha(id: number) { return this.fetchByPk('estado_entrega_recolha', 'id_estado', id); }
  async createEstadoEntregaRecolha(rec: any) { return this.insertOne('estado_entrega_recolha', rec); }
  async updateEstadoEntregaRecolha(id: number, updates: any) { return this.updateByPk('estado_entrega_recolha', 'id_estado', { id, updates }); }
  async deleteEstadoEntregaRecolha(id: number) { return this.deleteByPk('estado_entrega_recolha', 'id_estado', id); }

  // estado_grupo
  async getAllEstadoGrupo() { return this.fetchAll('estado_grupo'); }
  async getEstadoGrupo(id: number) { return this.fetchByPk('estado_grupo', 'id_estado', id); }
  async createEstadoGrupo(rec: any) { return this.insertOne('estado_grupo', rec); }
  async updateEstadoGrupo(id: number, updates: any) { return this.updateByPk('estado_grupo', 'id_estado', { id, updates }); }
  async deleteEstadoGrupo(id: number) { return this.deleteByPk('estado_grupo', 'id_estado', id); }

  // estado_percurso
  async getAllEstadoPercurso() { return this.fetchAll('estado_percurso'); }
  async getEstadoPercurso(id: number) { return this.fetchByPk('estado_percurso', 'id_estado', id); }
  async createEstadoPercurso(rec: any) { return this.insertOne('estado_percurso', rec); }
  async updateEstadoPercurso(id: number, updates: any) { return this.updateByPk('estado_percurso', 'id_estado', { id, updates }); }
  async deleteEstadoPercurso(id: number) { return this.deleteByPk('estado_percurso', 'id_estado', id); }

  // etapas
  async getAllEtapas() { return this.fetchAll('etapas'); }
  async getEtapa(id: number) { return this.fetchByPk('etapas', 'id_etapa', id); }
  async createEtapa(rec: any) { return this.insertOne('etapas', rec); }
  async updateEtapa(id: number, updates: any) { return this.updateByPk('etapas', 'id_etapa', { id, updates }); }
  async deleteEtapa(id: number) { return this.deleteByPk('etapas', 'id_etapa', id); }

  // etapas_percurso (Chave prima composta)
  async getEtapasPercurso(percursoId: number) { return this.supabase.from('etapas_percurso').select('*').eq('id_percurso', percursoId); }
  async addEtapaToPercurso(percursoId: number, etapaId: number) { return this.insertOne('etapas_percurso', { id_percurso: percursoId, id_etapa: etapaId }); }
  async removeEtapaFromPercurso(percursoId: number, etapaId: number) { return this.deleteByPk('etapas_percurso', { id_percurso: percursoId, id_etapa: etapaId }); }

  // grupo
  async getAllGrupo() { return this.fetchAll('grupo'); }
  async getGrupo(id: number) { return this.fetchByPk('grupo', 'id_grupo', id); }
  async createGrupo(rec: any) { return this.insertOne('grupo', rec); }
  async updateGrupo(id: number, updates: any) { return this.updateByPk('grupo', 'id_grupo', { id, updates }); }
  async deleteGrupo(id: number) { return this.deleteByPk('grupo', 'id_grupo', id); }

  // grupo_user (Chave prima composta)
  async getGrupoUsers(grupoId: number) { return this.supabase.from('grupo_user').select('*').eq('id_grupo', grupoId); }
  async addUserToGrupo(grupoId: number, userId: number) { return this.insertOne('grupo_user', { id_grupo: grupoId, id_user: userId }); }
  async removeUserFromGrupo(grupoId: number, userId: number) { return this.deleteByPk('grupo_user', { id_grupo: grupoId, id_user: userId }); }

  // info_percurso
  async getAllInfoPercurso() { return this.fetchAll('info_percurso'); }
  async getInfoPercurso(id: number) { return this.fetchByPk('info_percurso', 'id_info_percurso', id); }
  async createInfoPercurso(rec: any) { return this.insertOne('info_percurso', rec); }
  async updateInfoPercurso(id: number, updates: any) { return this.updateByPk('info_percurso', 'id_info_percurso', { id, updates }); }
  async deleteInfoPercurso(id: number) { return this.deleteByPk('info_percurso', 'id_info_percurso', id); }

  // mochilas
  async getAllMochilas() { return this.fetchAll('mochilas'); }
  async getMochila(id: number) { return this.fetchByPk('mochilas', 'id_mochila', id); }
  async createMochila(rec: any) { return this.insertOne('mochilas', rec); }
  async updateMochila(id: number, updates: any) { return this.updateByPk('mochilas', 'id_mochila', { id, updates }); }
  async deleteMochila(id: number) { return this.deleteByPk('mochilas', 'id_mochila', id); }

  // percurso
  async getAllPercurso() { return this.fetchAll('percurso'); }
  async getPercurso(id: number) { return this.fetchByPk('percurso', 'id_percurso', id); }
  async createPercurso(rec: any) { return this.insertOne('percurso', rec); }
  async updatePercurso(id: number, updates: any) { return this.updateByPk('percurso', 'id_percurso', { id, updates }); }
  async deletePercurso(id: number) { return this.deleteByPk('percurso', 'id_percurso', id); }

  // tipo_entrega_recolha
  async getAllTipoEntregaRecolha() { return this.fetchAll('tipo_entrega_recolha'); }
  async getTipoEntregaRecolha(id: number) { return this.fetchByPk('tipo_entrega_recolha', 'id_tipo', id); }
  async createTipoEntregaRecolha(rec: any) { return this.insertOne('tipo_entrega_recolha', rec); }
  async updateTipoEntregaRecolha(id: number, updates: any) { return this.updateByPk('tipo_entrega_recolha', 'id_tipo', { id, updates }); }
  async deleteTipoEntregaRecolha(id: number) { return this.deleteByPk('tipo_entrega_recolha', 'id_tipo', id); }

  // tipo_estabelecimento
  async getAllTipoEstabelecimento() { return this.fetchAll('tipo_estabelecimento'); }
  async getTipoEstabelecimento(id: number) { return this.fetchByPk('tipo_estabelecimento', 'id_tipo', id); }
  async createTipoEstabelecimento(rec: any) { return this.insertOne('tipo_estabelecimento', rec); }
  async updateTipoEstabelecimento(id: number, updates: any) { return this.updateByPk('tipo_estabelecimento', 'id_tipo', { id, updates }); }
  async deleteTipoEstabelecimento(id: number) { return this.deleteByPk('tipo_estabelecimento', 'id_tipo', id); }

  // localizacoes
  async getAllLocalizacoes() { return this.fetchAll('estabelecimento'); }
  async getLocalizacao(id: number) { return this.fetchByPk('estabelecimento', 'id_estabelecimento', id); }
  async createLocalizacao(rec: any) { return this.insertOne('estabelecimento', rec); }
  async updateLocalizacao(id: number, updates: any) { return this.updateByPk('estabelecimento', 'id_estabelecimento', { id, updates }); }
  async deleteLocalizacao(id: number) { return this.deleteByPk('estabelecimento', 'id_estabelecimento', id); }

  // obter localizacoes por estabelecimento
  async getLocalizacoesByEstabelecimento(estabId: number) {
    const { data, error } = await this.supabase.from('estabelecimento').select('*').eq('id_estabelecimento', estabId);
    if (error) throw error;
    return data;
  }

  // Atualizar localizacoes por id_estabelecimento (pode afetar várias linhas, normalmente 1)
  async updateLocalizacaoByEstabelecimento(estabId: number, updates: any) {
    const { data, error } = await this.supabase.from('estabelecimento').update(updates).eq('id_estabelecimento', estabId);
    if (error) throw error;
    return data;
  }

  // Verificadores de NIF exclusivos para a tabela localizacoes
  async isLocalizacaoNifTaken(nif: string) {
    if (!nif) return false;
    const cleaned = String(nif).trim();
    const { data, error } = await this.supabase.from('estabelecimento').select('id_estabelecimento').eq('nif', cleaned).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isLocalizacaoNifTakenByOther(nif: string, locId: number) {
    if (!nif) return false;
    const cleaned = String(nif).trim();
    const { data, error } = await this.supabase.from('estabelecimento').select('id_estabelecimento').eq('nif', cleaned).neq('id_estabelecimento', locId).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  // tipo_perfil
  async getAllTipoPerfil() { return this.fetchAll('tipo_perfil'); }
  async getTipoPerfil(id: number) { return this.fetchByPk('tipo_perfil', 'id_tipo', id); }
  async createTipoPerfil(rec: any) { return this.insertOne('tipo_perfil', rec); }
  async updateTipoPerfil(id: number, updates: any) { return this.updateByPk('tipo_perfil', 'id_tipo', { id, updates }); }
  async deleteTipoPerfil(id: number) { return this.deleteByPk('tipo_perfil', 'id_tipo', id); }

  // tipo_veiculo
  async getAllTipoVeiculo() { return this.fetchAll('tipo_veiculo'); }
  async getTipoVeiculo(id: number) { return this.fetchByPk('tipo_veiculo', 'id_tipo', id); }
  async createTipoVeiculo(rec: any) { return this.insertOne('tipo_veiculo', rec); }
  async updateTipoVeiculo(id: number, updates: any) { return this.updateByPk('tipo_veiculo', 'id_tipo', { id, updates }); }
  async deleteTipoVeiculo(id: number) { return this.deleteByPk('tipo_veiculo', 'id_tipo', id); }

  // users
  async getAllUsers() { return this.fetchAll('users'); }
  async getUser(id: number) { return this.fetchByPk('users', 'id_utilizador', id); }
  async createUser(rec: any) { return this.insertOne('users', rec); }
  async getUsersByTipo(id_tipo: any) {
    const { data, error } = await this.supabase.from('users').select('*').eq('id_tipo', id_tipo);
    if (error) throw error;
    return data;
  }
  async getUsersByEstabelecimento(id_estabelecimento: number) {
    // Busca os vínculos users_estabelecimento para obter os ids de user
    const { data: links, error: linkErr } = await this.supabase
      .from('users_estabelecimento')
      .select('id_utilizador')
      .eq('id_estabelecimento', id_estabelecimento);
    if (linkErr) {
      console.error('Erro ao obter links users_estabelecimento', linkErr);
      return { data: null, error: linkErr };
    }
    const userIds = (links || []).map((l: any) => l.id_utilizador).filter(Boolean);
    if (userIds.length === 0) return { data: [], error: null };
    // Busca os registos de users correspondentes 
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .in('id_utilizador', userIds);
    return { data, error };
  }
  async updateUser(id: number, updates: any) {
    if (updates.telefone) {
      const taken = await this.isTelefoneTakenByOther(updates.telefone, id);
      if (taken) throw new Error('Telefone already in use');
    }
    if (updates.nif) {
      const taken = await this.isNifTakenByOther(updates.nif, id);
      if (taken) throw new Error('NIF already in use');
    }
    if (updates.passaporte) {
      const taken = await this.isPassaporteTakenByOther(updates.passaporte, id);
      if (taken) throw new Error('Passport already in use');
    }
    return this.updateByPk('users', 'id_utilizador', { id, updates });
  }
  async deleteUser(id: number) { return this.deleteByPk('users', 'id_utilizador', id); }
  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateUserPassword(id: number, newPassword: string) {
    const hashed = await bcryptjs.hash(newPassword, 10);
    return this.updateByPk('users', 'id_utilizador', { id, updates: { password: hashed } });
  }

  //Confirmadores de telefone/nif/passaporte únicos para registo e update
  async isTelefoneTaken(telefone: string) {
    if (!telefone) return false;
    const cleaned = String(telefone).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('telefone', cleaned).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isTelefoneTakenByOther(telefone: string, userId: number) {
    if (!telefone) return false;
    const cleaned = String(telefone).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('telefone', cleaned).neq('id_utilizador', userId).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isNifTaken(nif: string) {
    if (!nif) return false;
    const cleaned = String(nif).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('nif', cleaned).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isNifTakenByOther(nif: string, userId: number) {
    if (!nif) return false;
    const cleaned = String(nif).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('nif', cleaned).neq('id_utilizador', userId).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isPassaporteTaken(passaporte: string) {
    if (!passaporte) return false;
    const cleaned = String(passaporte).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('passaporte', cleaned).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async isPassaporteTakenByOther(passaporte: string, userId: number) {
    if (!passaporte) return false;
    const cleaned = String(passaporte).trim();
    const { data, error } = await this.supabase.from('users').select('id_utilizador').eq('passaporte', cleaned).neq('id_utilizador', userId).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  // users_empresa_transportes (Chave prima composta)
  async getUserEmpresas(userId: number) { return this.supabase.from('users_empresa_transportes').select('*').eq('id_utilizador', userId); }
  async addUserEmpresa(userId: number, empresaId: number) { return this.insertOne('users_empresa_transportes', { id_utilizador: userId, id_empresa: empresaId }); }
  async removeUserEmpresa(userId: number, empresaId: number) { return this.deleteByPk('users_empresa_transportes', { id_utilizador: userId, id_empresa: empresaId }); }

  // users_estabelecimento (Chave prima composta)
  async getUserEstabelecimentos(userId: number) { return this.supabase.from('users_estabelecimento').select('*').eq('id_utilizador', userId); }
  async addUserEstabelecimento(userId: number, estabId: number) { return this.insertOne('users_estabelecimento', { id_utilizador: userId, id_estabelecimento: estabId }); }
  async removeUserEstabelecimento(userId: number, estabId: number) { return this.deleteByPk('users_estabelecimento', { id_utilizador: userId, id_estabelecimento: estabId }); }

  // veiculos
  async getAllVeiculos() { return this.fetchAll('veiculos'); }
  async getVeiculo(matricula: string) { return this.fetchByPk('veiculos', 'matricula', matricula); }
  async getVeiculosByEmpresa(empresaId: number) {
    const { data, error } = await this.supabase.from('veiculos').select('*').eq('id_empresa', empresaId);
    if (error) throw error;
    return data;
  }
  async createVeiculo(rec: any) { return this.insertOne('veiculos', rec); }
  async updateVeiculo(matricula: string, updates: any) { return this.updateByPk('veiculos', 'matricula', { id: matricula, updates }); }
  async deleteVeiculo(matricula: string) { return this.deleteByPk('veiculos', 'matricula', matricula); }

}