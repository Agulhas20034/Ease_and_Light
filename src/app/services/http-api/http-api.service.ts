import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpApiService {
  private apiUrl = environment.backendApiUrl;

  constructor(private http: HttpClient) {}

  async getAll(table: string): Promise<any[]> {
    const response = await this.http.get(`${this.apiUrl}/api/${table}`).toPromise() as any;
    const data = response?.data || response;
    return Array.isArray(data) ? data : [];
  }

  async create(table: string, data: any): Promise<any> {
    const response = await this.http.post(`${this.apiUrl}/api/${table}`, data).toPromise() as any;
    return response?.data;
  }

  async update(table: string, id: any, data: any): Promise<any> {
    const response = await this.http.put(`${this.apiUrl}/api/${table}/${id}`, data).toPromise() as any;
    return response?.data;
  }

  async delete(table: string, id: any): Promise<any> {
    const response = await this.http.delete(`${this.apiUrl}/api/${table}/${id}`).toPromise() as any;
    return response?.data;
  }

  // Authentication
  async login(email: string, password: string): Promise<any> {
    const response = await this.http.post(`${this.apiUrl}/api/auth/login`, { email, password }).toPromise() as any;
    return response?.data;
  }

  async register(email: string, password: string, nome: string, additionalData?: any): Promise<any> {
    const response = await this.http.post(`${this.apiUrl}/api/auth/register`, { email, password, nome, ...additionalData }).toPromise() as any;
    return response?.data;
  }

  async getAllUsers(): Promise<any> {
    return this.getAll('users');
  }

  async createUser(data: any): Promise<any> {
    return this.create('users', data);
  }

  async updateUser(id: number, data: any): Promise<any> {
    return this.update('users', id, data);
  }

  async deleteUser(id: number): Promise<any> {
    return this.delete('users', id);
  }

  // Empresa Transportes
  async getAllEmpresaTransportes(): Promise<any> {
    return this.getAll('empresa_transportes');
  }

  async createEmpresaTransportes(data: any): Promise<any> {
    return this.create('empresa_transportes', data);
  }

  async updateEmpresaTransportes(id: number, data: any): Promise<any> {
    return this.update('empresa_transportes', id, data);
  }

  async deleteEmpresaTransportes(id: number): Promise<any> {
    return this.delete('empresa_transportes', id);
  }

  // Estabelecimento
  async getAllEstabelecimento(): Promise<any> {
    return this.getAll('estabelecimento');
  }

  async createEstabelecimento(data: any): Promise<any> {
    return this.create('estabelecimento', data);
  }

  async updateEstabelecimento(id: number, data: any): Promise<any> {
    return this.update('estabelecimento', id, data);
  }

  async deleteEstabelecimento(id: number): Promise<any> {
    return this.delete('estabelecimento', id);
  }

  // Veiculos
  async getAllVeiculos(): Promise<any> {
    return this.getAll('veiculos');
  }

  async createVeiculo(data: any): Promise<any> {
    return this.create('veiculos', data);
  }

  async updateVeiculo(matricula: string, data: any): Promise<any> {
    return this.update('veiculos', matricula, data);
  }

  async deleteVeiculo(matricula: string): Promise<any> {
    return this.delete('veiculos', matricula);
  }

  // Entregas Recolhas
  async getAllEntregasRecolhas(): Promise<any> {
    return this.getAll('entregas_recolhas');
  }

  async getEntregaRecolha(id: number): Promise<any> {
    const response = await this.http.get(`${this.apiUrl}/api/entregas_recolhas/${id}`).toPromise() as any;
    return response?.data;
  }

  async createEntregaRecolha(data: any): Promise<any> {
    return this.create('entregas_recolhas', data);
  }

  async updateEntregaRecolha(id: number, data: any): Promise<any> {
    return this.update('entregas_recolhas', id, data);
  }

  async deleteEntregaRecolha(id: number): Promise<any> {
    return this.delete('entregas_recolhas', id);
  }

  // Mochilas
  async getAllMochilas(): Promise<any> {
    return this.getAll('mochilas');
  }

  async createMochila(data: any): Promise<any> {
    return this.create('mochilas', data);
  }

  async updateMochila(id: number, data: any): Promise<any> {
    return this.update('mochilas', id, data);
  }

  async deleteMochila(id: number): Promise<any> {
    return this.delete('mochilas', id);
  }

  // Percurso
  async getAllPercurso(): Promise<any> {
    return this.getAll('percurso');
  }

  async createPercurso(data: any): Promise<any> {
    return this.create('percurso', data);
  }

  async updatePercurso(id: number, data: any): Promise<any> {
    return this.update('percurso', id, data);
  }

  async deletePercurso(id: number): Promise<any> {
    return this.delete('percurso', id);
  }

  // Grupo
  async getAllGrupo(): Promise<any> {
    return this.getAll('grupo');
  }

  async createGrupo(data: any): Promise<any> {
    return this.create('grupo', data);
  }

  async updateGrupo(id: number, data: any): Promise<any> {
    return this.update('grupo', id, data);
  }

  async deleteGrupo(id: number): Promise<any> {
    return this.delete('grupo', id);
  }

  // Etapas
  async getAllEtapas(): Promise<any> {
    return this.getAll('etapas');
  }

  async createEtapa(data: any): Promise<any> {
    return this.create('etapas', data);
  }

  async updateEtapa(id: number, data: any): Promise<any> {
    return this.update('etapas', id, data);
  }

  async deleteEtapa(id: number): Promise<any> {
    return this.delete('etapas', id);
  }

  // Tabelas tipo e estado
  async getAllTipoPerfil(): Promise<any> {
    return this.getAll('tipo_perfil');
  }

  async createTipoPerfil(data: any): Promise<any> {
    return this.create('tipo_perfil', data);
  }

  async updateTipoPerfil(id: number, data: any): Promise<any> {
    return this.update('tipo_perfil', id, data);
  }

  async deleteTipoPerfil(id: number): Promise<any> {
    return this.delete('tipo_perfil', id);
  }

  async getAllTipoVeiculo(): Promise<any> {
    return this.getAll('tipo_veiculo');
  }

  async createTipoVeiculo(data: any): Promise<any> {
    return this.create('tipo_veiculo', data);
  }

  async updateTipoVeiculo(id: number, data: any): Promise<any> {
    return this.update('tipo_veiculo', id, data);
  }

  async deleteTipoVeiculo(id: number): Promise<any> {
    return this.delete('tipo_veiculo', id);
  }

  async getAllTipoEstabelecimento(): Promise<any> {
    return this.getAll('tipo_estabelecimento');
  }

  async createTipoEstabelecimento(data: any): Promise<any> {
    return this.create('tipo_estabelecimento', data);
  }

  async updateTipoEstabelecimento(id: number, data: any): Promise<any> {
    return this.update('tipo_estabelecimento', id, data);
  }

  async deleteTipoEstabelecimento(id: number): Promise<any> {
    return this.delete('tipo_estabelecimento', id);
  }

  async getAllEstadoEntregaRecolha(): Promise<any> {
    return this.getAll('estado_entrega_recolha');
  }

  async createEstadoEntregaRecolha(data: any): Promise<any> {
    return this.create('estado_entrega_recolha', data);
  }

  async updateEstadoEntregaRecolha(id: number, data: any): Promise<any> {
    return this.update('estado_entrega_recolha', id, data);
  }

  async deleteEstadoEntregaRecolha(id: number): Promise<any> {
    return this.delete('estado_entrega_recolha', id);
  }

  async getAllEstadoGrupo(): Promise<any> {
    return this.getAll('estado_grupo');
  }

  async createEstadoGrupo(data: any): Promise<any> {
    return this.create('estado_grupo', data);
  }

  async updateEstadoGrupo(id: number, data: any): Promise<any> {
    return this.update('estado_grupo', id, data);
  }

  async deleteEstadoGrupo(id: number): Promise<any> {
    return this.delete('estado_grupo', id);
  }

  async getAllEstadoPercurso(): Promise<any> {
    return this.getAll('estado_percurso');
  }

  async createEstadoPercurso(data: any): Promise<any> {
    return this.create('estado_percurso', data);
  }

  async updateEstadoPercurso(id: number, data: any): Promise<any> {
    return this.update('estado_percurso', id, data);
  }

  async deleteEstadoPercurso(id: number): Promise<any> {
    return this.delete('estado_percurso', id);
  }

  async getAllEstadoConta(): Promise<any> {
    return this.getAll('estado_conta');
  }

  async createEstadoConta(data: any): Promise<any> {
    return this.create('estado_conta', data);
  }

  async updateEstadoConta(id: number, data: any): Promise<any> {
    return this.update('estado_conta', id, data);
  }

  async deleteEstadoConta(id: number): Promise<any> {
    return this.delete('estado_conta', id);
  }

  async getAllEstadoEmpresa(): Promise<any> {
    return this.getAll('estado_empresa');
  }

  async createEstadoEmpresa(data: any): Promise<any> {
    return this.create('estado_empresa', data);
  }

  async updateEstadoEmpresa(id: number, data: any): Promise<any> {
    return this.update('estado_empresa', id, data);
  }

  async deleteEstadoEmpresa(id: number): Promise<any> {
    return this.delete('estado_empresa', id);
  }

  async getAllEstadoEstabelecimento(): Promise<any> {
    return this.getAll('estado_estabelecimento');
  }

  async createEstadoEstabelecimento(data: any): Promise<any> {
    return this.create('estado_estabelecimento', data);
  }

  async updateEstadoEstabelecimento(id: number, data: any): Promise<any> {
    return this.update('estado_estabelecimento', id, data);
  }

  async deleteEstadoEstabelecimento(id: number): Promise<any> {
    return this.delete('estado_estabelecimento', id);
  }

  async getAllEstadoVeiculo(): Promise<any> {
    return this.getAll('estado_veiculo');
  }

  async createEstadoVeiculo(data: any): Promise<any> {
    return this.create('estado_veiculo', data);
  }

  async updateEstadoVeiculo(id: number, data: any): Promise<any> {
    return this.update('estado_veiculo', id, data);
  }

  async deleteEstadoVeiculo(id: number): Promise<any> {
    return this.delete('estado_veiculo', id);
  }

  async getAllDificuldadePercurso(): Promise<any> {
    return this.getAll('dificuldade_percurso');
  }

  async createDificuldadePercurso(data: any): Promise<any> {
    return this.create('dificuldade_percurso', data);
  }

  async updateDificuldadePercurso(id: number, data: any): Promise<any> {
    return this.update('dificuldade_percurso', id, data);
  }

  async deleteDificuldadePercurso(id: number): Promise<any> {
    return this.delete('dificuldade_percurso', id);
  }

  async getAllInfoPercurso(): Promise<any> {
    return this.getAll('info_percurso');
  }

  async createInfoPercurso(data: any): Promise<any> {
    return this.create('info_percurso', data);
  }

  async updateInfoPercurso(id: number, data: any): Promise<any> {
    return this.update('info_percurso', id, data);
  }

  async deleteInfoPercurso(id: number): Promise<any> {
    return this.delete('info_percurso', id);
  }

  async fetchAll(table: string): Promise<any> {
    return this.getAll(table);
  }

  async fetchByPk(table: string, pk: string, value: any): Promise<any> {
    const response = await this.http.get(`${this.apiUrl}/api/${table}?${pk}=${value}`).toPromise() as any;
    return Array.isArray(response?.data) ? response.data[0] : response?.data;
  }

  async getUser(id: number): Promise<any> {
    const response = await this.http.get(`${this.apiUrl}/api/users/${id}`).toPromise() as any;
    return response?.data;
  }

  async getUsersByTipo(tipoId: number): Promise<any[]> {
    try {
      const response = await this.http.get(`${this.apiUrl}/api/users?id_tipo=${tipoId}`).toPromise() as any;
      const data = response?.data || [];
      return Array.isArray(data) ? data : [data];
    } catch (err) {
      console.error('Error fetching users by tipo:', err);
      return [];
    }
  }

  async getUsersByEstabelecimento(estabId: number): Promise<any[]> {
    try {
      const response = await this.http.get(`${this.apiUrl}/api/users_estabelecimento?id_estabelecimento=${estabId}`).toPromise() as any;
      const relations = response?.data || [];
      const relationArray = Array.isArray(relations) ? relations : [];
      
      const allUsers = await this.getAllUsers();
      const userIds = relationArray.map((r: any) => r.id_utilizador);
      
      return allUsers.filter((u: any) => userIds.includes(u.id_utilizador));
    } catch (err) {
      console.error('Error fetching users by estabelecimento:', err);
      return [];
    }
  }

  async updateUserPassword(id: number, password: string): Promise<any> {
    return this.updateUser(id, { password });
  }

  async getEmpresaTransportes(id: number): Promise<any> {
    const response = await this.http.get(`${this.apiUrl}/api/empresa_transportes/${id}`).toPromise() as any;
    return response?.data;
  }

  async getUserEmpresas(userId: number): Promise<any[]> {
    const response = await this.http.get(`${this.apiUrl}/api/users_empresa_transportes?id_utilizador=${userId}`).toPromise() as any;
    const data = response?.data || [];
    return Array.isArray(data) ? data : [];
  }

  async addUserEmpresa(userId: number, empresaId: number): Promise<any> {
    return this.create('users_empresa_transportes', { id_utilizador: userId, id_empresa: empresaId });
  }

  async getVeiculo(matricula: string): Promise<any> {
    const response = await this.http.get(`${this.apiUrl}/api/veiculos/${matricula}`).toPromise() as any;
    return response?.data;
  }

  async getVeiculosByEmpresa(empresaId: number): Promise<any[]> {
    const response = await this.http.get(`${this.apiUrl}/api/veiculos?id_empresa=${empresaId}`).toPromise() as any;
    const data = response?.data || [];
    return Array.isArray(data) ? data : [];
  }

  async checkVehicleVinUniqueness(table: string, vin: string): Promise<any> {
    try {
      const vehicles = await this.getAllVeiculos();
      const found = vehicles.find((v: any) => String(v.vin) === String(vin));
      return { data: found, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  }

  async getAllLocalizacoes(): Promise<any> {
    return this.getAllEstabelecimento();
  }

  async getLocalizacao(id: number): Promise<any> {
    const response = await this.http.get(`${this.apiUrl}/api/estabelecimento/${id}`).toPromise() as any;
    return response?.data;
  }

  async getLocalizacoesByEstabelecimento(estabId: number): Promise<any[]> {
    const response = await this.http.get(`${this.apiUrl}/api/estabelecimento/${estabId}`).toPromise() as any;
    const data = response?.data;
    return data ? [data] : [];
  }

  async createLocalizacao(data: any): Promise<any> {
    return this.createEstabelecimento(data);
  }

  async updateLocalizacao(id: number, data: any): Promise<any> {
    return this.updateEstabelecimento(id, data);
  }

  async updateLocalizacaoByEstabelecimento(estabId: number, data: any): Promise<any> {
    return this.updateEstabelecimento(estabId, data);
  }

  
  
  async getUserEstabelecimentos(userId: number): Promise<any[]> {
    const response = await this.http.get(`${this.apiUrl}/api/users_estabelecimento?id_utilizador=${userId}`).toPromise() as any;
    const data = response?.data || [];
    return Array.isArray(data) ? data : [];
  }

  async addUserEstabelecimento(userId: number, estabId: number): Promise<any> {
    return this.create('users_estabelecimento', { id_utilizador: userId, id_estabelecimento: estabId });
  }

  async isTelefoneTaken(telefone: string): Promise<boolean> {
    if (!telefone) return false;
    try {
      const users = await this.getAllUsers();
      return users.some((u: any) => String(u.telefone) === String(telefone));
    } catch (e) {
      return false;
    }
  }

  async isNifTaken(nif: string): Promise<boolean> {
    if (!nif) return false;
    try {
      const users = await this.getAllUsers();
      return users.some((u: any) => String(u.nif) === String(nif));
    } catch (e) {
      return false;
    }
  }

  async isPassaporteTaken(passaporte: string): Promise<boolean> {
    if (!passaporte) return false;
    try {
      const users = await this.getAllUsers();
      return users.some((u: any) => String(u.passaporte) === String(passaporte));
    } catch (e) {
      return false;
    }
  }

  async isNifTakenByOther(nif: string, userId: number): Promise<boolean> {
    if (!nif) return false;
    try {
      const records: any = await this.getAllUsers();
      const data = Array.isArray(records) ? records : records?.data || [];
      return data.some((r: any) => String(r.nif) === String(nif) && r.id_utilizador !== userId);
    } catch (e) {
      return false;
    }
  }

  async isLocalizacaoNifTaken(nif: string): Promise<boolean> {
    if (!nif) return false;
    try {
      const estabelecimentos = await this.getAllEstabelecimento();
      return estabelecimentos.some((e: any) => String(e.nif) === String(nif));
    } catch (e) {
      return false;
    }
  }

  async isLocalizacaoNifTakenByOther(nif: string, locId: number): Promise<boolean> {
    if (!nif) return false;
    try {
      const records: any = await this.getAllEstabelecimento();
      const data = Array.isArray(records) ? records : records?.data || [];
      return data.some((r: any) => String(r.nif) === String(nif) && r.id_estabelecimento !== locId);
    } catch (e) {
      return false;
    }
  }

  validatePassword(password: string): { feedback: string[]; isValid: boolean } {
    const feedback: string[] = [];
    
    if (!password) {
      return { feedback: ['Password is required'], isValid: false };
    }

    if (password.length < 8) {
      feedback.push('At least 8 characters');
    } else {
      feedback.push('✓ At least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('At least one uppercase letter');
    } else {
      feedback.push('✓ At least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('At least one lowercase letter');
    } else {
      feedback.push('✓ At least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('At least one number');
    } else {
      feedback.push('✓ At least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('At least one special character');
    } else {
      feedback.push('✓ At least one special character');
    }

    const isValid = password.length >= 8 && 
                    /[A-Z]/.test(password) && 
                    /[a-z]/.test(password) && 
                    /[0-9]/.test(password) && 
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return { feedback, isValid };
  }

  
}
