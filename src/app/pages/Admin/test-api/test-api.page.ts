import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase/supabase';
import { ToastController } from '@ionic/angular';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-test-api',
  templateUrl: './test-api.page.html',
  styleUrls: ['./test-api.page.scss'],
  standalone: false,
})
export class TestApiPage implements OnInit {
  selectedTable = '';
  operation = 'create'; // create, read, update, delete (muda consoante escolha na dropbox)
  formData: any = {};
  selectedDeleteRow: any = null;
  result: any = null;
  loading = false;
  tableData: any[] = [];
  dropdownData: { [key: string]: any[] } = {};

  tables = [
    'users',
    'empresa_transportes',
    'estabelecimento',
    'veiculos',
    'entregas_recolhas',
    'mochilas',
    'percurso',
    'grupo',
    'tipo_perfil',
    'tipo_veiculo',
    'tipo_estabelecimento',
    'estado_entrega_recolha',
    'estado_grupo',
    'estado_percurso',
    'dificuldade_percurso',
    'etapas',
    'info_percurso'
  ];

  private fieldDependencies: { [key: string]: { [key: string]: string } } = {
    users: { id_tipo: 'tipo_perfil' },
    empresa_transportes: {},
    estabelecimento: { id_tipo_estabelecimento: 'tipo_estabelecimento' },
    veiculos: { id_tipo: 'tipo_veiculo', id_empresa: 'empresa_transportes' },
    entregas_recolhas: { id_tipo: 'tipo_entrega_recolha', id_estado: 'estado_entrega_recolha', id_estabelecimento: 'estabelecimento', id_user: 'users' },
    mochilas: { id_user: 'users' },
    percurso: { id_dificuldade: 'dificuldade_percurso', id_estado: 'estado_percurso' },
    grupo: { id_estado: 'estado_grupo' },
    tipo_perfil: {},
    tipo_veiculo: {},
    tipo_estabelecimento: {},
    estado_entrega_recolha: {},
    estado_grupo: {},
    estado_percurso: {},
    dificuldade_percurso: {},
    etapas: {},
    info_percurso: { id_percurso: 'percurso' }
  };

  constructor(
    private supabase: SupabaseService,
    private toastCtrl: ToastController,
    public t: TranslationService
  ) {}

  ngOnInit() {}

  async onTableChange() {
    this.resetForm();
    await this.loadDropdownData();
    if (this.operation === 'delete') {
      await this.loadTableData();
    }
  }

  async onOperationChange() {
    this.resetForm();
    if (this.operation === 'delete') {
      await this.loadTableData();
    }
    if (this.operation === 'update') {
      await this.loadTableData(); // For selecting which record to update
    }
  }

  async onUpdateRecordSelected(record: any) {
    if (!record) {
      this.formData = {};
      return;
    }
    
    // Pre-fill form with existing data
    this.formData = { ...record };
    
    // Load dropdown data first
    await this.loadDropdownData();
    
    // For foreign key fields, map the IDs to the actual objects for proper dropdown selection
    if (this.fieldDependencies[this.selectedTable]) {
      for (const [field, table] of Object.entries(this.fieldDependencies[this.selectedTable])) {
        if (record[field] && this.dropdownData[field]) {
          // Find the matching object in dropdown data
          const matchingOption = this.dropdownData[field].find((option: any) => 
            option.id === record[field] || option[field] === record[field]
          );
          if (matchingOption) {
            this.formData[field] = matchingOption;
          }
        }
      }
    }
  }

  private async loadDropdownData() {
    if (!this.selectedTable || !this.fieldDependencies[this.selectedTable]) return;

    this.dropdownData = {};
    const dependencies = this.fieldDependencies[this.selectedTable];

    for (const [field, table] of Object.entries(dependencies)) {
      try {
        const data = await (this.supabase as any)[this.getLoadMethod(table)]();
        this.dropdownData[field] = data || [];
      } catch (error) {
        console.error(`Error loading ${table}:`, error);
        this.dropdownData[field] = [];
      }
    }
  }

  private async loadTableData() {
    if (!this.selectedTable) return;

    try {
      const methodMap: { [key: string]: string } = {
        users: 'getAllUsers',
        empresa_transportes: 'getAllEmpresaTransportes',
        estabelecimento: 'getAllEstabelecimento',
        veiculos: 'getAllVeiculos',
        entregas_recolhas: 'getAllEntregasRecolhas',
        mochilas: 'getAllMochilas',
        percurso: 'getAllPercurso',
        grupo: 'getAllGrupo',
        tipo_perfil: 'getAllTipoPerfil',
        tipo_veiculo: 'getAllTipoVeiculo',
        tipo_estabelecimento: 'getAllTipoEstabelecimento',
        estado_entrega_recolha: 'getAllEstadoEntregaRecolha',
        estado_grupo: 'getAllEstadoGrupo',
        estado_percurso: 'getAllEstadoPercurso',
        dificuldade_percurso: 'getAllDificuldadePercurso',
        etapas: 'getAllEtapas',
        info_percurso: 'getAllInfoPercurso'
      };
      const method = methodMap[this.selectedTable];
      this.tableData = (await (this.supabase as any)[method]()) || [];
    } catch (error) {
      console.error('Error loading table data:', error);
      this.tableData = [];
    }
  }

  private getLoadMethod(table: string): string {
    const methodMap: { [key: string]: string } = {
      users: 'getAllUsers',
      empresa_transportes: 'getAllEmpresaTransportes',
      estabelecimento: 'getAllEstabelecimento',
      veiculos: 'getAllVeiculos',
      entregas_recolhas: 'getAllEntregasRecolhas',
      mochilas: 'getAllMochilas',
      percurso: 'getAllPercurso',
      grupo: 'getAllGrupo',
      tipo_perfil: 'getAllTipoPerfil',
      tipo_veiculo: 'getAllTipoVeiculo',
      tipo_estabelecimento: 'getAllTipoEstabelecimento',
      estado_entrega_recolha: 'getAllEstadoEntregaRecolha',
      estado_grupo: 'getAllEstadoGrupo',
      estado_percurso: 'getAllEstadoPercurso',
      dificuldade_percurso: 'getAllDificuldadePercurso',
      etapas: 'getAllEtapas',
      info_percurso: 'getAllInfoPercurso',
      tipo_entrega_recolha: 'getAllTipoEntregaRecolha'
    };
    return methodMap[table] || 'getAllUsers';
  }

  getDropdownOptions(field: string): any[] {
    return this.dropdownData[field] || [];
  }

  getDisplayLabel(item: any): string {
    if (!item) return '';
    
    // For tipo and estado tables, show only the Descr field
    if (this.selectedTable.startsWith('estado_') || this.selectedTable.startsWith('tipo_') || this.selectedTable === 'dificuldade_percurso') {
      return item.Descr || item.descr || item.estado || item.tipo || item.dificuldade || item.nome || JSON.stringify(item).substring(0, 50);
    }
    
    // For other tables, try common display fields
    return item.nome || item.tipo || item.estado || item.dificuldade || item.marca || item.email || JSON.stringify(item).substring(0, 50);
  }

  getIdField(): string {
    const idFieldMap: { [key: string]: string } = {
      users: 'id_utilizador',
      empresa_transportes: 'id_empresa',
      estabelecimento: 'id_estabelecimento',
      veiculos: 'matricula',
      entregas_recolhas: 'id_entrega_recolha',
      mochilas: 'id_mochila',
      percurso: 'id_percurso',
      grupo: 'id_grupo',
      tipo_perfil: 'id_tipo',
      tipo_veiculo: 'id_tipo',
      tipo_estabelecimento: 'id_tipo',
      estado_entrega_recolha: 'id_estado',
      estado_grupo: 'id_estado',
      estado_percurso: 'id_estado',
      dificuldade_percurso: 'id_dificuldade',
      etapas: 'id_etapa',
      info_percurso: 'id_info_percurso'
    };
    return idFieldMap[this.selectedTable] || 'id';
  }

  async executeOperation() {
    if (!this.selectedTable) {
      this.showToast(this.t.translate('select_table'), 'warning');
      return;
    }

    if (this.operation === 'delete') {
      this.showToast(this.t.translate('select_item_to_delete'), 'warning');
      return;
    }

    if (!this.confirmOperation()) {
      return;
    }

    this.loading = true;
    this.result = null;

    try {
      let response;

      if (this.operation === 'create') {
        response = await this.callCreateMethod();
      } else if (this.operation === 'read') {
        response = await this.callReadMethod();
      } else if (this.operation === 'update') {
        response = await this.callUpdateMethod();
      }

      this.result = response;
      this.showToast(this.t.translate('operation_success'), 'success');
    } catch (error: any) {
      this.result = { error: error.message };
      this.showToast(`${this.t.translate('operation_error')}: ${error.message}`, 'danger');
    } finally {
      this.loading = false;
    }
  }

  async deleteSelectedRow() {
    if (!this.selectedDeleteRow) {
      this.showToast(this.t.translate('select_item_to_delete'), 'warning');
      return;
    }

    const confirmMessage = this.t.translate('confirm_delete_api');
    if (!confirm(confirmMessage)) {
      return;
    }

    this.loading = true;
    this.result = null;

    try {
      const response = await this.callDeleteMethod();
      this.result = response;
      this.showToast(this.t.translate('operation_success'), 'success');
      this.selectedDeleteRow = null;
      await this.loadTableData();
    } catch (error: any) {
      this.result = { error: error.message };
      this.showToast(`${this.t.translate('operation_error')}: ${error.message}`, 'danger');
    } finally {
      this.loading = false;
    }
  }

  private async callCreateMethod() {
    // Validation for users table
    if (this.selectedTable === 'users') {
      if (this.formData.email) {
        const emailTaken = await this.supabase.getUserByEmail(this.formData.email);
        if (emailTaken) {
          throw new Error('Email already exists');
        }
      }
      if (this.formData.nif) {
        const nifTaken = await this.supabase.isNifTaken(this.formData.nif);
        if (nifTaken) {
          throw new Error('NIF already exists');
        }
      }
      if (this.formData.passaporte) {
        const passaporteTaken = await this.supabase.isPassaporteTaken(this.formData.passaporte);
        if (passaporteTaken) {
          throw new Error('Passport already exists');
        }
      }
    }

    const methodMap: { [key: string]: string } = {
      users: 'createUser',
      empresa_transportes: 'createEmpresaTransportes',
      estabelecimento: 'createEstabelecimento',
      veiculos: 'createVeiculo',
      entregas_recolhas: 'createEntregaRecolha',
      mochilas: 'createMochila',
      percurso: 'createPercurso',
      grupo: 'createGrupo',
      tipo_perfil: 'createTipoPerfil',
      tipo_veiculo: 'createTipoVeiculo',
      tipo_estabelecimento: 'createTipoEstabelecimento',
      estado_entrega_recolha: 'createEstadoEntregaRecolha',
      estado_grupo: 'createEstadoGrupo',
      estado_percurso: 'createEstadoPercurso',
      dificuldade_percurso: 'createDificuldadePercurso',
      etapas: 'createEtapa',
      info_percurso: 'createInfoPercurso'
    };
    const method = methodMap[this.selectedTable];
    return await (this.supabase as any)[method](this.formData);
  }

  private async callReadMethod() {
    const methodMap: { [key: string]: string } = {
      users: 'getAllUsers',
      empresa_transportes: 'getAllEmpresaTransportes',
      estabelecimento: 'getAllEstabelecimento',
      veiculos: 'getAllVeiculos',
      entregas_recolhas: 'getAllEntregasRecolhas',
      mochilas: 'getAllMochilas',
      percurso: 'getAllPercurso',
      grupo: 'getAllGrupo',
      tipo_perfil: 'getAllTipoPerfil',
      tipo_veiculo: 'getAllTipoVeiculo',
      tipo_estabelecimento: 'getAllTipoEstabelecimento',
      estado_entrega_recolha: 'getAllEstadoEntregaRecolha',
      estado_grupo: 'getAllEstadoGrupo',
      estado_percurso: 'getAllEstadoPercurso',
      dificuldade_percurso: 'getAllDificuldadePercurso',
      etapas: 'getAllEtapas',
      info_percurso: 'getAllInfoPercurso'
    };
    const method = methodMap[this.selectedTable];
    return await (this.supabase as any)[method]();
  }

  private async callUpdateMethod() {
    const id = this.getIdFromFormData();
    if (!id) throw new Error('ID necessário para update');

    // Validation for users table
    if (this.selectedTable === 'users') {
      if (this.formData.email) {
        const emailTaken = await this.supabase.getUserByEmail(this.formData.email);
        if (emailTaken) {
          throw new Error('Email already exists for another user');
        }
      }
      if (this.formData.nif) {
        const nifTaken = await this.supabase.isNifTakenByOther(this.formData.nif, id);
        if (nifTaken) {
          throw new Error('NIF already exists for another user');
        }
      }
      if (this.formData.passaporte) {
        const passaporteTaken = await this.supabase.isPassaporteTakenByOther(this.formData.passaporte, id);
        if (passaporteTaken) {
          throw new Error('Passport already exists for another user');
        }
      }
    }

    const methodMap: { [key: string]: string } = {
      users: 'updateUser',
      empresa_transportes: 'updateEmpresaTransportes',
      estabelecimento: 'updateEstabelecimento',
      veiculos: 'updateVeiculo',
      entregas_recolhas: 'updateEntregaRecolha',
      mochilas: 'updateMochila',
      percurso: 'updatePercurso',
      grupo: 'updateGrupo',
      tipo_perfil: 'updateTipoPerfil',
      tipo_veiculo: 'updateTipoVeiculo',
      tipo_estabelecimento: 'updateTipoEstabelecimento',
      estado_entrega_recolha: 'updateEstadoEntregaRecolha',
      estado_grupo: 'updateEstadoGrupo',
      estado_percurso: 'updateEstadoPercurso',
      dificuldade_percurso: 'updateDificuldadePercurso',
      etapas: 'updateEtapa',
      info_percurso: 'updateInfoPercurso'
    };
    const method = methodMap[this.selectedTable];
    return await (this.supabase as any)[method](id, this.formData);
  }

  private async callDeleteMethod() {
    const idField = this.getIdField();
    const id = this.selectedDeleteRow[idField];
    if (!id) throw new Error('ID necessário para delete');

    const methodMap: { [key: string]: string } = {
      users: 'deleteUser',
      empresa_transportes: 'deleteEmpresaTransportes',
      estabelecimento: 'deleteEstabelecimento',
      veiculos: 'deleteVeiculo',
      entregas_recolhas: 'deleteEntregaRecolha',
      mochilas: 'deleteMochila',
      percurso: 'deletePercurso',
      grupo: 'deleteGrupo',
      tipo_perfil: 'deleteTipoPerfil',
      tipo_veiculo: 'deleteTipoVeiculo',
      tipo_estabelecimento: 'deleteTipoEstabelecimento',
      estado_entrega_recolha: 'deleteEstadoEntregaRecolha',
      estado_grupo: 'deleteEstadoGrupo',
      estado_percurso: 'deleteEstadoPercurso',
      dificuldade_percurso: 'deleteDificuldadePercurso',
      etapas: 'deleteEtapa',
      info_percurso: 'deleteInfoPercurso'
    };
    const method = methodMap[this.selectedTable];
    return await (this.supabase as any)[method](id);
  }

  private getIdFromFormData(): any {
    const idField = this.getIdField();
    return this.formData[idField];
  }

  getFormFields(): string[] {
    const baseFields: { [key: string]: string[] } = {
      users: ['id_utilizador', 'email', 'password', 'nome', 'telefone', 'nif', 'passaporte', 'nacionalidade', 'id_tipo', 'estado'],
      empresa_transportes: ['id_empresa', 'nome', 'telefone', 'email', 'nif'],
      estabelecimento: ['id_estabelecimento', 'nome', 'telefone', 'email', 'nif', 'hora_abertura', 'hora_fecho', 'link_google', 'rua', 'codigo_postal', 'id_tipo_estabelecimento'],
      veiculos: ['matricula', 'vin', 'marca', 'modelo', 'cor', 'id_tipo', 'id_empresa'],
      entregas_recolhas: ['id_entrega_recolha', 'id_tipo', 'id_estado', 'id_estabelecimento', 'id_user', 'data_hora'],
      mochilas: ['id_mochila', 'peso', 'cor', 'id_user'],
      percurso: ['id_percurso', 'nome', 'descricao', 'distancia', 'duracao_estimada', 'id_dificuldade', 'id_estado'],
      grupo: ['id_grupo', 'nome', 'id_estado', 'data_criacao'],
      tipo_perfil: ['id_tipo', 'tipo'],
      tipo_veiculo: ['id_tipo', 'tipo'],
      tipo_estabelecimento: ['id_tipo', 'tipo'],
      estado_entrega_recolha: ['id_estado', 'estado'],
      estado_grupo: ['id_estado', 'estado'],
      estado_percurso: ['id_estado', 'estado'],
      dificuldade_percurso: ['id_dificuldade', 'dificuldade'],
      etapas: ['id_etapa', 'nome', 'descricao', 'coordenadas'],
      info_percurso: ['id_info_percurso', 'titulo', 'conteudo', 'id_percurso']
    };

    if (this.operation === 'read') {
      return [];
    }

    const fields = baseFields[this.selectedTable] || [];

    if (this.operation === 'create') {
      // Exclude autoincrement primary key fields from create operations
      const autoincrementFields = ['id_utilizador', 'id_empresa', 'id_estabelecimento', 'id_entrega_recolha', 'id_mochila', 'id_percurso', 'id_grupo', 'id_etapa', 'id_info_percurso', 'matricula'];
      
      return fields.filter(f => !autoincrementFields.includes(f));
    }

    return fields;
  }

  isDropdownField(field: string): boolean {
    return this.fieldDependencies[this.selectedTable]?.hasOwnProperty(field) || false;
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
  }

  resetForm() {
    this.formData = {};
    this.selectedDeleteRow = null;
    this.result = null;
    this.tableData = [];
    this.dropdownData = {};
  }

  getFieldLabel(field: string): string {
    const label = this.t.translate(field);
    return label === field ? field : label;
  }

  confirmOperation(): boolean {
    if (this.operation === 'read') {
      return true;
    }
    const confirmKey = `confirm_${this.operation}`;
    const message = this.t.translate(confirmKey);
    if (!message) {
      return true;
    }
    return confirm(message);
  }

  compareDropdownFields(obj1: any, obj2: any): boolean {
    if (!obj1 || !obj2) return obj1 === obj2;
    
    // If both are objects, compare by id field
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
      return obj1.id === obj2.id;
    }
    
    // Fallback to JSON comparison
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}
