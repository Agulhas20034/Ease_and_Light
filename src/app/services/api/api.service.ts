import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';
import * as bcryptjs from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private supabase: SupabaseService) {}

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateTelefone(telefone: string): boolean {
    const telefoneRegex = /^\d{9}$/;
    return telefoneRegex.test(telefone);
  }

  private validateNif(nif: string): boolean {
    const nifRegex = /^\d{9}$/;
    return nifRegex.test(nif);
  }

  private validatePassaporte(passaporte: string): boolean {
    const passaporteRegex = /^[A-Za-z0-9]{8,9}$/;
    return passaporteRegex.test(passaporte);
  }

  private validateCodigoPostal(codigoPostal: string): boolean {
    const codigoPostalRegex = /^\d{4}-\d{3}$/;
    return codigoPostalRegex.test(codigoPostal);
  }

  private validateMatricula(matricula: string): boolean {
    const matriculaRegex = /^[A-Za-z0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]{2}$/;
    return matriculaRegex.test(matricula);
  }

  private validateVin(vin: string): boolean {
    const vinRegex = /^[A-Za-z0-9]{17}$/;
    return vinRegex.test(vin);
  }

  private validateFloat(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  private trimString(value: string): string {
    return value ? value.trim() : value;
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcryptjs.hash(password, 10);
  }

  private validateRequiredFields(data: any, table: string, isUpdate: boolean = false) {
    const requiredFields: { [key: string]: string[] } = {
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
    const optionalFields = ['password', 'nif', 'passaporte']; // These can be empty

    for (const field of fields) {
      if (!optionalFields.includes(field) && (data[field] === undefined || data[field] === null || data[field] === '')) {
        throw new Error(`Field '${field}' is required and cannot be empty`);
      }
    }

    if (isUpdate && (data.password === undefined || data.password === null || data.password === '')) {
    } else if (!isUpdate && !optionalFields.includes('password') && fields.includes('password')) {
      if (data.password === undefined || data.password === null || data.password === '') {
        throw new Error(`Field 'password' is required and cannot be empty`);
      }
    }
  }

  async createUser(data: any) {
    this.validateRequiredFields(data, 'users', false);

    if (data.email) {
      data.email = this.trimString(data.email).toLowerCase();
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

  async updateUser(id: number, data: any) {
    this.validateRequiredFields(data, 'users', true);

    if (data.email) {
      data.email = this.trimString(data.email).toLowerCase();
      if (!this.validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      const emailTaken = await this.supabase.getUserByEmail(data.email);
      if (emailTaken && emailTaken.id_utilizador !== id) {
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

  async getUser(id: number) {
    return await this.supabase.getUser(id);
  }

  async deleteUser(id: number) {
    return await this.supabase.deleteUser(id);
  }

  async createEmpresaTransportes(data: any) {
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
      data.email = this.trimString(data.email).toLowerCase();
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

  async updateEmpresaTransportes(id: number, data: any) {
    this.validateRequiredFields(data, 'empresa_transportes', true);

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
      data.email = this.trimString(data.email).toLowerCase();
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

    return await this.supabase.updateEmpresaTransportes(id, data);
  }

  async getAllEmpresaTransportes() {
    return await this.supabase.getAllEmpresaTransportes();
  }

  async getEmpresaTransportes(id: number) {
    return await this.supabase.getEmpresaTransportes(id);
  }

  async deleteEmpresaTransportes(id: number) {
    return await this.supabase.deleteEmpresaTransportes(id);
  }

  async createEstabelecimento(data: any) {
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
      data.email = this.trimString(data.email).toLowerCase();
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

  async updateEstabelecimento(id: number, data: any) {
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
      data.email = this.trimString(data.email).toLowerCase();
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

  async getEstabelecimento(id: number) {
    return await this.supabase.getEstabelecimento(id);
  }

  async deleteEstabelecimento(id: number) {
    return await this.supabase.deleteEstabelecimento(id);
  }

  async createVeiculo(data: any) {
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

  async updateVeiculo(matricula: string, data: any) {
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

  async getVeiculo(matricula: string) {
    return await this.supabase.getVeiculo(matricula);
  }

  async deleteVeiculo(matricula: string) {
    return await this.supabase.deleteVeiculo(matricula);
  }

  async createEntregaRecolha(data: any) {

    this.validateRequiredFields(data, 'entregas_recolhas', false);

    return await this.supabase.createEntregaRecolha(data);
  }

  async updateEntregaRecolha(id: number, data: any) {
    this.validateRequiredFields(data, 'entregas_recolhas', true);

    return await this.supabase.updateEntregaRecolha(id, data);
  }

  async getAllEntregasRecolhas() {
    return await this.supabase.getAllEntregasRecolhas();
  }

  async getEntregaRecolha(id: number) {
    return await this.supabase.getEntregaRecolha(id);
  }

  async deleteEntregaRecolha(id: number) {
    return await this.supabase.deleteEntregaRecolha(id);
  }

  async createMochila(data: any) {
    this.validateRequiredFields(data, 'mochilas', false);

    if (data.peso !== undefined && data.peso !== null) {
      if (!this.validateFloat(data.peso)) {
        throw new Error('Peso must be a valid number');
      }
      data.peso = parseFloat(data.peso);
    }

    return await this.supabase.createMochila(data);
  }

  async updateMochila(id: number, data: any) {
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

  async getMochila(id: number) {
    return await this.supabase.getMochila(id);
  }

  async deleteMochila(id: number) {
    return await this.supabase.deleteMochila(id);
  }

  async createPercurso(data: any) {
    this.validateRequiredFields(data, 'percurso', false);

    if (data.distancia !== undefined && data.distancia !== null) {
      if (!this.validateFloat(data.distancia)) {
        throw new Error('Distancia must be a valid number');
      }
      data.distancia = parseFloat(data.distancia);
    }

    return await this.supabase.createPercurso(data);
  }

  async updatePercurso(id: number, data: any) {
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

  async getPercurso(id: number) {
    return await this.supabase.getPercurso(id);
  }

  async deletePercurso(id: number) {
    return await this.supabase.deletePercurso(id);
  }

  async createGrupo(data: any) {
    this.validateRequiredFields(data, 'grupo', false);

    return await this.supabase.createGrupo(data);
  }

  async updateGrupo(id: number, data: any) {
    this.validateRequiredFields(data, 'grupo', true);

    return await this.supabase.updateGrupo(id, data);
  }

  async getAllGrupo() {
    return await this.supabase.getAllGrupo();
  }

  async getGrupo(id: number) {
    return await this.supabase.getGrupo(id);
  }

  async deleteGrupo(id: number) {
    return await this.supabase.deleteGrupo(id);
  }

  async createEtapa(data: any) {
    this.validateRequiredFields(data, 'etapas', false);

    return await this.supabase.createEtapa(data);
  }

  async updateEtapa(id: number, data: any) {
    this.validateRequiredFields(data, 'etapas', true);

    return await this.supabase.updateEtapa(id, data);
  }

  async getAllEtapas() {
    return await this.supabase.getAllEtapas();
  }

  async getEtapa(id: number) {
    return await this.supabase.getEtapa(id);
  }

  async deleteEtapa(id: number) {
    return await this.supabase.deleteEtapa(id);
  }

  async createGrupoUser(data: any) {
    this.validateRequiredFields(data, 'grupo_user', false);

    return await this.supabase.insertOne('grupo_user', data);
  }

  async updateGrupoUser(id_grupo: number, id_user: number, data: any) {
    this.validateRequiredFields(data, 'grupo_user', true);

    return await this.supabase.updateOne('grupo_user', { id_grupo, id_user }, data);
  }

  async deleteGrupoUser(id_grupo: number, id_user: number) {
    return await this.supabase.deleteByPk('grupo_user', { id_grupo, id_user });
  }

  async createEtapasPercurso(data: any) {
    this.validateRequiredFields(data, 'etapas_percurso', false);

    return await this.supabase.insertOne('etapas_percurso', data);
  }

  async updateEtapasPercurso(id_percurso: number, id_etapa: number, data: any) {
    this.validateRequiredFields(data, 'etapas_percurso', true);

    return await this.supabase.updateOne('etapas_percurso', { id_percurso, id_etapa }, data);
  }

  async deleteEtapasPercurso(id_percurso: number, id_etapa: number) {
    return await this.supabase.deleteByPk('etapas_percurso', { id_percurso, id_etapa });
  }

  async createUsersEmpresaTransportes(data: any) {
    this.validateRequiredFields(data, 'users_empresa_transportes', false);

    return await this.supabase.insertOne('users_empresa_transportes', data);
  }

  async updateUsersEmpresaTransportes(id_utilizador: number, id_empresa: number, data: any) {
    this.validateRequiredFields(data, 'users_empresa_transportes', true);

    return await this.supabase.updateOne('users_empresa_transportes', { id_utilizador, id_empresa }, data);
  }

  async deleteUsersEmpresaTransportes(id_utilizador: number, id_empresa: number) {
    return await this.supabase.deleteByPk('users_empresa_transportes', { id_utilizador, id_empresa });
  }

  async createUsersEstabelecimento(data: any) {
    this.validateRequiredFields(data, 'users_estabelecimento', false);

    return await this.supabase.insertOne('users_estabelecimento', data);
  }

  async updateUsersEstabelecimento(id_utilizador: number, id_estabelecimento: number, data: any) {
    this.validateRequiredFields(data, 'users_estabelecimento', true);

    return await this.supabase.updateOne('users_estabelecimento', { id_utilizador, id_estabelecimento }, data);
  }

  async deleteUsersEstabelecimento(id_utilizador: number, id_estabelecimento: number) {
    return await this.supabase.deleteByPk('users_estabelecimento', { id_utilizador, id_estabelecimento });
  }

  async createTipoPerfil(data: any) {
    this.validateRequiredFields(data, 'tipo_perfil', false);

    return await this.supabase.createTipoPerfil(data);
  }

  async updateTipoPerfil(id: number, data: any) {
    this.validateRequiredFields(data, 'tipo_perfil', true);

    return await this.supabase.updateTipoPerfil(id, data);
  }

  async getAllTipoPerfil() {
    return await this.supabase.getAllTipoPerfil();
  }

  async deleteTipoPerfil(id: number) {
    return await this.supabase.deleteTipoPerfil(id);
  }

  async createTipoVeiculo(data: any) {
    return await this.supabase.createTipoVeiculo(data);
  }

  async updateTipoVeiculo(id: number, data: any) {
    return await this.supabase.updateTipoVeiculo(id, data);
  }

  async getAllTipoVeiculo() {
    return await this.supabase.getAllTipoVeiculo();
  }

  async deleteTipoVeiculo(id: number) {
    return await this.supabase.deleteTipoVeiculo(id);
  }

  async createTipoEstabelecimento(data: any) {
    return await this.supabase.createTipoEstabelecimento(data);
  }

  async updateTipoEstabelecimento(id: number, data: any) {
    return await this.supabase.updateTipoEstabelecimento(id, data);
  }

  async getAllTipoEstabelecimento() {
    return await this.supabase.getAllTipoEstabelecimento();
  }

  async deleteTipoEstabelecimento(id: number) {
    return await this.supabase.deleteTipoEstabelecimento(id);
  }

  async createEstadoEntregaRecolha(data: any) {
    return await this.supabase.createEstadoEntregaRecolha(data);
  }

  async updateEstadoEntregaRecolha(id: number, data: any) {
    return await this.supabase.updateEstadoEntregaRecolha(id, data);
  }

  async getAllEstadoEntregaRecolha() {
    return await this.supabase.getAllEstadoEntregaRecolha();
  }

  async deleteEstadoEntregaRecolha(id: number) {
    return await this.supabase.deleteEstadoEntregaRecolha(id);
  }

  async createEstadoGrupo(data: any) {
    return await this.supabase.createEstadoGrupo(data);
  }

  async updateEstadoGrupo(id: number, data: any) {
    return await this.supabase.updateEstadoGrupo(id, data);
  }

  async getAllEstadoGrupo() {
    return await this.supabase.getAllEstadoGrupo();
  }

  async deleteEstadoGrupo(id: number) {
    return await this.supabase.deleteEstadoGrupo(id);
  }

  async createEstadoPercurso(data: any) {
    return await this.supabase.createEstadoPercurso(data);
  }

  async updateEstadoPercurso(id: number, data: any) {
    return await this.supabase.updateEstadoPercurso(id, data);
  }

  async getAllEstadoPercurso() {
    return await this.supabase.getAllEstadoPercurso();
  }

  async deleteEstadoPercurso(id: number) {
    return await this.supabase.deleteEstadoPercurso(id);
  }

  async createEstadoConta(data: any) {
    return await this.supabase.createEstadoConta(data);
  }

  async updateEstadoConta(id: number, data: any) {
    return await this.supabase.updateEstadoConta(id, data);
  }

  async getAllEstadoConta() {
    return await this.supabase.getAllEstadoConta();
  }

  async deleteEstadoConta(id: number) {
    return await this.supabase.deleteEstadoConta(id);
  }

  async createEstadoEmpresa(data: any) {
    return await this.supabase.createEstadoEmpresa(data);
  }

  async updateEstadoEmpresa(id: number, data: any) {
    return await this.supabase.updateEstadoEmpresa(id, data);
  }

  async getAllEstadoEmpresa() {
    return await this.supabase.getAllEstadoEmpresa();
  }

  async deleteEstadoEmpresa(id: number) {
    return await this.supabase.deleteEstadoEmpresa(id);
  }

  async createEstadoEstabelecimento(data: any) {
    return await this.supabase.createEstadoEstabelecimento(data);
  }

  async updateEstadoEstabelecimento(id: number, data: any) {
    return await this.supabase.updateEstadoEstabelecimento(id, data);
  }

  async getAllEstadoEstabelecimento() {
    return await this.supabase.getAllEstadoEstabelecimento();
  }

  async deleteEstadoEstabelecimento(id: number) {
    return await this.supabase.deleteEstadoEstabelecimento(id);
  }

  async createEstadoVeiculo(data: any) {
    return await this.supabase.createEstadoVeiculo(data);
  }

  async updateEstadoVeiculo(id: number, data: any) {
    return await this.supabase.updateEstadoVeiculo(id, data);
  }

  async getAllEstadoVeiculo() {
    return await this.supabase.getAllEstadoVeiculo();
  }

  async deleteEstadoVeiculo(id: number) {
    return await this.supabase.deleteEstadoVeiculo(id);
  }

  async createDificuldadePercurso(data: any) {
    return await this.supabase.createDificuldadePercurso(data);
  }

  async updateDificuldadePercurso(id: number, data: any) {
    return await this.supabase.updateDificuldadePercurso(id, data);
  }

  async getAllDificuldadePercurso() {
    return await this.supabase.getAllDificuldadePercurso();
  }

  async deleteDificuldadePercurso(id: number) {
    return await this.supabase.deleteDificuldadePercurso(id);
  }

  async createInfoPercurso(data: any) {
    return await this.supabase.createInfoPercurso(data);
  }

  async updateInfoPercurso(id: number, data: any) {
    return await this.supabase.updateInfoPercurso(id, data);
  }

  async getAllInfoPercurso() {
    return await this.supabase.getAllInfoPercurso();
  }

  async deleteInfoPercurso(id: number) {
    return await this.supabase.deleteInfoPercurso(id);
  }
}