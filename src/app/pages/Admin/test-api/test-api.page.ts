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
    'etapas',
    'grupo_user',
    'etapas_percurso',
    'users_empresa_transportes',
    'users_estabelecimento',
    'tipo_perfil',
    'tipo_veiculo',
    'tipo_estabelecimento',
    'estado_entrega_recolha',
    'estado_grupo',
    'estado_percurso',
    'estado_conta',
    'estado_empresa',
    'estado_estabelecimento',
    'estado_veiculo',
    'dificuldade_percurso',
    'info_percurso'
  ];

  private fieldDependencies: { [key: string]: { [key: string]: string } } = {
    users: { id_tipo: 'tipo_perfil', estado: 'estado_conta' },
    empresa_transportes: { estado: 'estado_empresa' },
    estabelecimento: { id_tipo_estabelecimento: 'tipo_estabelecimento', estado: 'estado_estabelecimento' },
    veiculos: { id_tipo: 'tipo_veiculo', id_empresa: 'empresa_transportes', estado: 'estado_veiculo' },
    entregas_recolhas: { id_estabelecimento_r: 'estabelecimento', id_estabelecimento_e: 'estabelecimento', id_veiculo: 'veiculos', id_mochila: 'mochilas', id_estafeta: 'users', id_empresa: 'empresa_transportes', id_estado: 'estado_entrega_recolha' },
    mochilas: { id_user: 'users' },
    percurso: { id_dificuldade: 'dificuldade_percurso', id_estado: 'estado_percurso' },
    grupo: { id_estado: 'estado_grupo' },
    etapas: {},
    grupo_user: { id_grupo: 'grupo', id_user: 'users' },
    etapas_percurso: { id_percurso: 'percurso', id_etapa: 'etapas' },
    users_empresa_transportes: { id_utilizador: 'users', id_empresa: 'empresa_transportes' },
    users_estabelecimento: { id_utilizador: 'users', id_estabelecimento: 'estabelecimento' },
    tipo_perfil: {},
    tipo_veiculo: {},
    tipo_estabelecimento: {},
    estado_entrega_recolha: {},
    estado_grupo: {},
    estado_percurso: {},
    estado_conta: {},
    estado_empresa: {},
    estado_estabelecimento: {},
    estado_veiculo: {},
    dificuldade_percurso: {},
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
    await this.loadDropdownData();
    if (this.operation === 'delete') {
      await this.loadTableData();
    }
    if (this.operation === 'update') {
      await this.loadTableData();
    }
  }

  async onUpdateRecordSelected(record: any) {
    if (!record) {
      this.formData = {};
      return;
    }
    
    // preencher formData com os dados do registo selecionado para update
    this.formData = { ...record };
    
    //carregar dados para dropdowns relacionados se existirem
    await this.loadDropdownData();
    
    // para foreign keys, substituir o valor do id pelo objeto correspondente do dropdown para mostrar o valor legível no form
    if (this.fieldDependencies[this.selectedTable]) {
      for (const [field, table] of Object.entries(this.fieldDependencies[this.selectedTable])) {
        if (record[field] && this.dropdownData[field]) {
          // procurar o objeto no dropdownData que corresponde ao id do record[field] e substituir o valor no formData por esse objeto
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
    
    // Mapping para determinar o campo de ID correto para cada tabela, já que nem todas usam 'id' como chave primária e isso é necessário para comparar os objetos do dropdown com os valores do record para update/delete
    const idFieldMap: { [key: string]: string } = {
      users: 'id_utilizador',
      empresa_transportes: 'id_empresa',
      estabelecimento: 'id_estabelecimento',
      veiculos: 'matricula',
      entregas_recolhas: 'id_entrega_recolha',
      mochilas: 'id_mochila',
      percurso: 'id_percurso',
      grupo: 'id_grupo',
      etapas: 'id_etapa',
      grupo_user: 'id_grupo',
      etapas_percurso: 'id_percurso',
      users_empresa_transportes: 'id_utilizador',
      users_estabelecimento: 'id_utilizador',
      tipo_perfil: 'id_tipo',
      tipo_veiculo: 'id_tipo',
      tipo_estabelecimento: 'id_tipo',
      estado_entrega_recolha: 'id_estado',
      estado_grupo: 'id_estado',
      estado_percurso: 'id_estado',
      estado_conta: 'id_estado',
      estado_empresa: 'id_estado',
      estado_estabelecimento: 'id_estado',
      estado_veiculo: 'id_estado',
      dificuldade_percurso: 'id_dificuldade',
      info_percurso: 'id_info_percurso'
    };

    for (const [field, table] of Object.entries(dependencies)) {
      try {
        const method = this.getLoadMethod(table);
        let data;
        
        if (method === 'fetchAll') {
          //Para tabelas de associação, usar o método genérico fetchAll com o nome da tabela para obter os dados
          data = await this.supabase.fetchAll(table);
        } else {
          data = await (this.supabase as any)[method]();
        }
        
        const idField = idFieldMap[table] || 'id';
        //Normalizar os dados do dropdown para ter um campo 'id' que é usado para comparação e seleção, já que as chaves primárias têm nomes diferentes em cada tabela
        this.dropdownData[field] = (data || []).map((item: any) => ({
          ...item,
          id: item[idField]
        }));
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
        etapas: 'getAllEtapas',
        tipo_perfil: 'getAllTipoPerfil',
        tipo_veiculo: 'getAllTipoVeiculo',
        tipo_estabelecimento: 'getAllTipoEstabelecimento',
        estado_entrega_recolha: 'getAllEstadoEntregaRecolha',
        estado_grupo: 'getAllEstadoGrupo',
        estado_percurso: 'getAllEstadoPercurso',
        dificuldade_percurso: 'getAllDificuldadePercurso',
        info_percurso: 'getAllInfoPercurso',
        grupo_user: 'fetchAll',
        etapas_percurso: 'fetchAll',
        users_empresa_transportes: 'fetchAll',
        users_estabelecimento: 'fetchAll'
      };
      const method = methodMap[this.selectedTable];
      
      if (method === 'fetchAll') {
        //Para tabelas de associação, usar o método genérico fetchAll com o nome da tabela para obter os dados
        this.tableData = (await this.supabase.fetchAll(this.selectedTable)) || [];
      } else {
        this.tableData = (await (this.supabase as any)[method]()) || [];
      }
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
      etapas: 'getAllEtapas',
      tipo_perfil: 'getAllTipoPerfil',
      tipo_veiculo: 'getAllTipoVeiculo',
      tipo_estabelecimento: 'getAllTipoEstabelecimento',
      estado_entrega_recolha: 'getAllEstadoEntregaRecolha',
      estado_grupo: 'getAllEstadoGrupo',
      estado_percurso: 'getAllEstadoPercurso',
      estado_conta: 'getAllEstadoConta',
      estado_empresa: 'getAllEstadoEmpresa',
      estado_estabelecimento: 'getAllEstadoEstabelecimento',
      estado_veiculo: 'getAllEstadoVeiculo',
      dificuldade_percurso: 'getAllDificuldadePercurso',
      info_percurso: 'getAllInfoPercurso',
      tipo_entrega_recolha: 'getAllTipoEntregaRecolha',
      grupo_user: 'fetchAll',
      etapas_percurso: 'fetchAll',
      users_empresa_transportes: 'fetchAll',
      users_estabelecimento: 'fetchAll'
    };
    return methodMap[table] || 'getAllUsers';
  }

  getDropdownOptions(field: string): any[] {
    return this.dropdownData[field] || [];
  }

  getDisplayLabel(item: any, field?: string): string {
    if (!item) return '';
    
    // Determinar a tabela de origem do campo para tentar mostrar um label mais correto, especialmente para campos de estados e tipos que têm uma descrição
    let sourceTable = '';
    if (field && this.fieldDependencies[this.selectedTable]?.[field]) {
      sourceTable = this.fieldDependencies[this.selectedTable][field];
    } else if (this.selectedTable) {
      sourceTable = this.selectedTable;
    }
    
    // Mostrar um campo específico para tabelas de estados e tipos, ou fallback para um campo comum ou o JSON stringificado
    if (sourceTable.startsWith('estado_') || sourceTable.startsWith('tipo_') || sourceTable === 'dificuldade_percurso') {
      return item.descr || JSON.stringify(item).substring(0, 50);
    }
    
    // Para outras tabelas, tentar mostrar um campos comum como nome, tipo ou estado, ou fallback para o primeiro campo disponível
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
      etapas: 'id_etapa',
      grupo_user: 'id_grupo', 
      etapas_percurso: 'id_percurso', 
      users_empresa_transportes: 'id_utilizador', 
      users_estabelecimento: 'id_utilizador', 
      tipo_perfil: 'id_tipo',
      tipo_veiculo: 'id_tipo',
      tipo_estabelecimento: 'id_tipo',
      estado_entrega_recolha: 'id_estado',
      estado_grupo: 'id_estado',
      estado_percurso: 'id_estado',
      estado_conta: 'id_estado',
      estado_empresa: 'id_estado',
      estado_estabelecimento: 'id_estado',
      estado_veiculo: 'id_estado',
      dificuldade_percurso: 'id_dificuldade',
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
        this.tableData = response;
        if (!response || response.length === 0) {
          response = { message: this.t.translate('no_registries_found') };
        }
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
    // Validação para users - verificar se email, nif ou passaporte já existem antes de criar
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

    // Converter campos de dropdown de objetos para seus IDs antes de enviar para a API
    const submitData = this.extractIdsFromDropdownFields({ ...this.formData });

    const methodMap: { [key: string]: string } = {
      users: 'createUser',
      empresa_transportes: 'createEmpresaTransportes',
      estabelecimento: 'createEstabelecimento',
      veiculos: 'createVeiculo',
      entregas_recolhas: 'createEntregaRecolha',
      mochilas: 'createMochila',
      percurso: 'createPercurso',
      grupo: 'createGrupo',
      etapas: 'createEtapa',
      grupo_user: 'insertOne',
      etapas_percurso: 'insertOne',
      users_empresa_transportes: 'insertOne',
      users_estabelecimento: 'insertOne',
      tipo_perfil: 'createTipoPerfil',
      tipo_veiculo: 'createTipoVeiculo',
      tipo_estabelecimento: 'createTipoEstabelecimento',
      estado_entrega_recolha: 'createEstadoEntregaRecolha',
      estado_grupo: 'createEstadoGrupo',
      estado_percurso: 'createEstadoPercurso',
      estado_conta: 'createEstadoConta',
      estado_empresa: 'createEstadoEmpresa',
      estado_estabelecimento: 'createEstadoEstabelecimento',
      estado_veiculo: 'createEstadoVeiculo',
      dificuldade_percurso: 'createDificuldadePercurso',
      info_percurso: 'createInfoPercurso'
    };
    const method = methodMap[this.selectedTable];
    
    if (method === 'insertOne') {
      return await this.supabase.insertOne(this.selectedTable, submitData);
    }
    return await (this.supabase as any)[method](submitData);
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
      etapas: 'getAllEtapas',
      grupo_user: 'fetchAll',
      etapas_percurso: 'fetchAll',
      users_empresa_transportes: 'fetchAll',
      users_estabelecimento: 'fetchAll',
      tipo_perfil: 'getAllTipoPerfil',
      tipo_veiculo: 'getAllTipoVeiculo',
      tipo_estabelecimento: 'getAllTipoEstabelecimento',
      estado_entrega_recolha: 'getAllEstadoEntregaRecolha',
      estado_grupo: 'getAllEstadoGrupo',
      estado_percurso: 'getAllEstadoPercurso',
      estado_conta: 'getAllEstadoConta',
      estado_empresa: 'getAllEstadoEmpresa',
      estado_estabelecimento: 'getAllEstadoEstabelecimento',
      estado_veiculo: 'getAllEstadoVeiculo',
      dificuldade_percurso: 'getAllDificuldadePercurso',
      info_percurso: 'getAllInfoPercurso'
    };
    const method = methodMap[this.selectedTable];
    return await (this.supabase as any)[method]();
  }

  private async callUpdateMethod() {
    const id = this.getIdFromFormData();
    if (!id) throw new Error('ID necessário para update');

    // Validação pra tabela users - verificar se email, nif ou passaporte já existem para outro utilizador
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

    //Converter campos de dropdown de objetos para seus IDs antes de enviar para a API
    const submitData = this.extractIdsFromDropdownFields({ ...this.formData });

    const methodMap: { [key: string]: string } = {
      users: 'updateUser',
      empresa_transportes: 'updateEmpresaTransportes',
      estabelecimento: 'updateEstabelecimento',
      veiculos: 'updateVeiculo',
      entregas_recolhas: 'updateEntregaRecolha',
      mochilas: 'updateMochila',
      percurso: 'updatePercurso',
      grupo: 'updateGrupo',
      etapas: 'updateEtapa',
      grupo_user: 'updateOne',
      etapas_percurso: 'updateOne',
      users_empresa_transportes: 'updateOne',
      users_estabelecimento: 'updateOne',
      tipo_perfil: 'updateTipoPerfil',
      tipo_veiculo: 'updateTipoVeiculo',
      tipo_estabelecimento: 'updateTipoEstabelecimento',
      estado_entrega_recolha: 'updateEstadoEntregaRecolha',
      estado_grupo: 'updateEstadoGrupo',
      estado_percurso: 'updateEstadoPercurso',
      estado_conta: 'updateEstadoConta',
      estado_empresa: 'updateEstadoEmpresa',
      estado_estabelecimento: 'updateEstadoEstabelecimento',
      estado_veiculo: 'updateEstadoVeiculo',
      dificuldade_percurso: 'updateDificuldadePercurso',
      info_percurso: 'updateInfoPercurso'
    };
    const method = methodMap[this.selectedTable];
    return await (this.supabase as any)[method](id, submitData);
  }

  private extractIdsFromDropdownFields(data: any): any {
    const submitData = { ...data };
    if (this.fieldDependencies[this.selectedTable]) {
      for (const field of Object.keys(this.fieldDependencies[this.selectedTable])) {
        // Se o campo existe no formData e é um objeto com um campo 'id', substituir o valor pelo id para enviar para a API
        if (submitData[field] && typeof submitData[field] === 'object' && submitData[field].id !== undefined) {
          submitData[field] = submitData[field].id;
        }
      }
    }
    return submitData;
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
      etapas: 'deleteEtapa',
      grupo_user: 'deleteByPk',
      etapas_percurso: 'deleteByPk',
      users_empresa_transportes: 'deleteByPk',
      users_estabelecimento: 'deleteByPk',
      tipo_perfil: 'deleteTipoPerfil',
      tipo_veiculo: 'deleteTipoVeiculo',
      tipo_estabelecimento: 'deleteTipoEstabelecimento',
      estado_entrega_recolha: 'deleteEstadoEntregaRecolha',
      estado_grupo: 'deleteEstadoGrupo',
      estado_percurso: 'deleteEstadoPercurso',
      estado_conta: 'deleteEstadoConta',
      estado_empresa: 'deleteEstadoEmpresa',
      estado_estabelecimento: 'deleteEstadoEstabelecimento',
      estado_veiculo: 'deleteEstadoVeiculo',
      dificuldade_percurso: 'deleteDificuldadePercurso',
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
      users: ['email', 'password', 'nome', 'telefone', 'nif', 'passaporte', 'nacionalidade', 'id_tipo', 'estado'],
      empresa_transportes: ['nome', 'telefone', 'email', 'nif','estado'],
      estabelecimento: ['nome', 'telefone', 'email', 'nif', 'hora_abertura', 'hora_fecho', 'link_google', 'rua', 'codigo_postal', 'id_tipo_estabelecimento', 'estado'],
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

    if (this.operation === 'read') {
      return [];
    }

    const fields = baseFields[this.selectedTable] || [];

    if (this.operation === 'create') {
  //apenas excluir primary keys das proprias tabelas
      const primaryKeyMap: { [key: string]: string } = {
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
        estado_conta: 'id_estado',
        estado_empresa: 'id_estado',
        estado_estabelecimento: 'id_estado',
        estado_veiculo: 'id_estado',
        dificuldade_percurso: 'id_dificuldade',
        etapas: 'id_etapa',
        info_percurso: 'id_info_percurso'
      };
      const primaryKey = primaryKeyMap[this.selectedTable];
      return primaryKey ? fields.filter(f => f !== primaryKey) : fields;
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
    
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
      return obj1.id === obj2.id;
    }
    
    // Fallback
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
}
