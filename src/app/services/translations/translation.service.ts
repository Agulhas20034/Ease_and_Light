import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Lang = 'pt' | 'en';

@Injectable({providedIn: 'root'})
export class TranslationService {
  private lang$ = new BehaviorSubject<Lang>(this.getStoredLang());

  private translations: Record<string, { pt: string; en: string }> = {
    inbox: { pt: 'Caixa de Entrada', en: 'Inbox' },
    welcome_back: { pt: 'Bem-vindo de volta', en: 'Welcome Back' },
    email: { pt: 'Email', en: 'Email' },
    password: { pt: 'Palavra-passe', en: 'Password' },
    login: { pt: 'Iniciar Sessão', en: 'Login' },
    register: { pt: 'Criar Conta', en: 'Register' },
    create_account: { pt: 'Criar Conta', en: 'Create Account' },
    create_new_account: { pt: 'Criar Nova Conta', en: 'Create New Account' },
    logout: { pt: 'Sair', en: 'Logout' },
    items_from_tipo_perfil: { pt: 'Itens de tipo_perfil:', en: 'Items from tipo_perfil:' },
    no_items_found: { pt: 'Nenhum item encontrado', en: 'No items found' },
    passwords_match: { pt: 'As palavras-passe coincidem', en: 'Passwords match' },
    passwords_not_match: { pt: 'As palavras-passe não coincidem', en: 'Passwords do not match' },
    or: { pt: 'ou', en: 'or' },
    already_have_account: { pt: 'Já tem uma conta?', en: 'Already have an account?' },
    name: { pt: 'Nome', en: 'Name' },
    pw_len: { pt: 'A palavra-passe deve ter pelo menos 8 caracteres', en: 'Password must be at least 8 characters long' },
    pw_upper: { pt: 'Deve conter uma letra maiúscula', en: 'Password must contain at least one uppercase letter' },
    pw_lower: { pt: 'Deve conter uma letra minúscula', en: 'Password must contain at least one lowercase letter' },
    pw_number: { pt: 'Deve conter um número', en: 'Password must contain at least one number' },
    pw_special: { pt: 'Deve conter um carácter especial', en: 'Password must contain at least one special character' },
    status: { pt: 'Estado', en: 'Status' },
    accuracy: { pt: 'Precisão', en: 'Accuracy' },
    coords: { pt: 'Coordenadas', en: 'Coordinates' },
    refresh_location: { pt: 'Atualizar Localização', en: 'Refresh Location' },
    location_cached: { pt: 'Localização em cache. Buscando atualização...', en: 'Cached location. Fetching fresher fix...' },
    location_live: { pt: 'Localização ao vivo', en: 'Live location' },
    permission_denied: { pt: 'Permissão negada. Permita o acesso à localização e tente novamente.', en: 'Permission denied. Allow location access and retry.' },
    geolocation_not_supported: { pt: 'Geolocalização não suportada', en: 'Geolocation not supported' },
    phone: { pt: 'Telefone', en: 'Phone' },
    nationality: { pt: 'Nacionalidade', en: 'Nationality' },
    type: { pt: 'Tipo', en: 'Type' },
    nif: { pt: 'NIF', en: 'NIF' },
    passport: { pt: 'Passaporte', en: 'Passport' },
    confirm_password: { pt: 'Confirmar Palavra-passe', en: 'Confirm Password' },
    phone_invalid: { pt: 'Telefone inválido (mínimo 9 dígitos apenas números)', en: 'Invalid phone (minimum 9 digits, numbers only)' },
    nif_invalid: { pt: 'NIF inválido (exactamente 9 dígitos)', en: 'Invalid NIF (exactly 9 digits)' },
    provide_nif_or_passport: { pt: 'Forneça NIF ou Passaporte', en: 'Provide NIF or Passport' },
    type_peregrino: { pt: 'Peregrino', en: 'Peregrino' },
    type_dono_estabelecimento: { pt: 'Dono Estabelecimento', en: 'Establishment Owner' },
    type_dono_empresa_transportes: { pt: 'Dono Empresa Transportes', en: 'Transport Company Owner' },
    profile_options: { pt: 'Opções de Perfil', en: 'Profile Options' },
    guest: { pt: 'Convidado', en: 'Guest' },
    map: { pt: 'Mapa', en: 'Map' },
    client_dashboard: { pt: 'Painel Cliente', en: 'Client Dashboard' },
    admin_panel: { pt: 'Painel Admin', en: 'Admin Panel' },
    manager_dashboard: { pt: 'Painel Gestor', en: 'Manager Dashboard' },

    /* Peregrino */
    create_route: { pt: 'Criar Percurso', en: 'Create Route' },
    manage_routes: { pt: 'Gerir Percursos', en: 'Manage Routes' },
    create_group: { pt: 'Criar Grupo', en: 'Create Group' },
    manage_groups: { pt: 'Gerir Grupos', en: 'Manage Groups' },
    my_backpacks: { pt: 'Minhas Mochilas', en: 'My Backpacks' },
    create_collection_client: { pt: 'Criar Recolha (Cliente)', en: 'Create Collection (Client)' },
    create_collection_courier: { pt: 'Criar Recolha (Estafeta)', en: 'Create Collection (Courier)' },
    create_delivery_client: { pt: 'Criar Entrega (Cliente)', en: 'Create Delivery (Client)' },
    create_delivery_courier: { pt: 'Criar Entrega (Estafeta)', en: 'Create Delivery (Courier)' },
    register_backpack: { pt: 'Registar Mochila', en: 'Register Backpack' },
    register_backpack_sub: { pt: 'Registe uma mochila para um peregrino', en: 'Register a backpack for a pilgrim' },
    select_owner: { pt: 'Selecionar Dono', en: 'Select Owner' },
    owner_filter_placeholder: { pt: 'Filtrar por email ou nome', en: 'Filter by email or name' },
    select_owner_required: { pt: 'Selecione um dono', en: 'Please select an owner' },
    no_peregrino_accounts: { pt: 'Nenhuma conta de Peregrino encontrada', en: 'No peregrino accounts found' },
    weight: { pt: 'Peso (kg)', en: 'Weight (kg)' },
    weight_placeholder: { pt: 'Introduza o peso', en: 'Enter weight' },
    weight_required: { pt: 'Peso obrigatório', en: 'Weight is required' },
    color: { pt: 'Cor', en: 'Color' },
    color_placeholder: { pt: 'Ex: Azul, Vermelho', en: 'Eg: Blue, Red' },
    save: { pt: 'Guardar', en: 'Save' },
    cancel: { pt: 'Cancelar', en: 'Cancel' },
    backpack_created: { pt: 'Mochila registada', en: 'Backpack registered' },
    save_error: { pt: 'Erro ao guardar', en: 'Error saving' },
    backpack_owner: { pt: 'Dono da Mochila', en: 'Backpack Owner' },
    backpack_weight: { pt: 'Peso', en: 'Weight' },
    backpack_color: { pt: 'Cor', en: 'Color' },
    no_backpacks: { pt: 'Nenhuma mochila encontrada', en: 'No backpacks found' },
    loading: { pt: 'A carregar...', en: 'Loading...' },
    employees: { pt: 'Funcionários', en: 'Employees' },
    orders: { pt: 'Pedidos', en: 'Orders' },
    create_accounts: { pt: 'Criar Contas', en: 'Create Accounts' },
    folder: { pt: 'Pasta', en: 'Folder' },
    splash: { pt: 'Splash', en: 'Splash' },
    add_employee: { pt: 'Adicionar Funcionário', en: 'Add Employee' },
    list_requests: { pt: 'Lista de Pedidos', en: 'Orders' },
    assign_requests: { pt: 'Atribuir Pedido', en: 'Assign Order' },
    edit_group: { pt: 'Editar Grupo', en: 'Edit Group' },
    list_backpacks: { pt: 'Lista de Mochilas', en: 'Backpacks' },
    employees_list: { pt: 'Lista de Empregados', en: 'Employees' },
    create_employee: { pt: 'Criar Empregado', en: 'Create Employee' },
    edit_employee: { pt: 'Editar Empregado', en: 'Edit Employee' },
    locations_list: { pt: 'Lista de Localizações', en: 'Locations' },
    create_location: { pt: 'Criar Localização', en: 'Create Location' },
    edit_location: { pt: 'Editar Localização', en: 'Edit Location' }
  };

  constructor() {}

  getLang() {
    return this.lang$.value;
  }

  setLang(lang: Lang) {
    this.lang$.next(lang);
    localStorage.setItem('lang', lang);
  }

  toggleLang() {
    const next: Lang = this.getLang() === 'pt' ? 'en' : 'pt';
    this.setLang(next);
  }

  translate(key: string): string {
    const entry = this.translations[key];
    if (!entry) return key;
    return entry[this.getLang()];
  }

  asObservable() {
    return this.lang$.asObservable();
  }

  private getStoredLang(): Lang {
    const stored = (localStorage.getItem('lang') || 'pt') as Lang;
    return stored;
  }
}
