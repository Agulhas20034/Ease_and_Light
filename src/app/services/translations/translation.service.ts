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
    pw_special: { pt: 'Deve conter um carácter especial', en: 'Password must contain at least one special character' }
  };

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
