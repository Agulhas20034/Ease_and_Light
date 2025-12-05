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
        autoRefreshToken: false  // Disable auto-refresh to avoid lock manager timeout errors
      }
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  
  async fetchAll(table: string) {
    const { data, error } = await this.supabase.from(table).select('*');
    if (error) throw error;
    return data;
  }

  
  async registerUser(email: string, password: string, nome: string = '') {
   
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    const { data, error } = await this.supabase.from('users').insert([{
      email,
      password: hashedPassword,
      nome,
      id_tipo: 5, 
      id_establecimento: null
    }]);
    
    if (error) throw error;
    return data;
  }

  
  async loginUser(email: string, password: string) {
   
    const { data, error } = await this.supabase.from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) throw new Error('User not found');
    
    const isValid = await bcryptjs.compare(password, data.password);
    if (!isValid) throw new Error('Invalid password');
    
    return { id_utilizador: data.id_utilizador, email: data.email, nome: data.nome };
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
}