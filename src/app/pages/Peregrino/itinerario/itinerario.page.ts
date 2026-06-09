import { Component, OnInit } from '@angular/core';
import { HttpApiService } from '../../../services/http-api/http-api.service';
import { TranslationService } from '../../../services/translations/translation.service';

@Component({
  selector: 'app-itinerario',
  templateUrl: './itinerario.page.html',
  styleUrls: ['./itinerario.page.scss'],
  standalone: false
})
export class ItinerarioPage implements OnInit {
  public routeStops: Array<{ title: string; lat?: number; lon?: number; locId?: string }> = [];
  public loadingRoute = false;

  public notes: any[] = [];
  public newNoteText = '';
  public newNoteTitle = '';
  public loadingNotes = false;

  constructor(private httpApi: HttpApiService, private translation: TranslationService) { }

  ngOnInit() {
    this.loadActiveRouteAndStops();
    this.loadNotes();
  }

  t(key: string) {
    return this.translation.translate(key);
  }

  private getCurrentUserId(): number | null {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        return parsed?.id_utilizador ?? null;
      }
    } catch (e) {}
    return null;
  }

  async loadActiveRouteAndStops() {
    this.loadingRoute = true;
    try {
      const gpData: any = await this.httpApi.getAll('grupo-percurso');
      const grupoPercursos = Array.isArray(gpData) ? gpData : (gpData?.data || []);
      const ongoing = grupoPercursos.find((g: any) =>
        Number(g.id_estado) === 2 || Number(g.estado) === 2 ||
        (g.estado === undefined && !!g.data_hora_inicio) ||
        (g.id_estado === undefined && !!g.data_inicio)
      );
      if (!ongoing) {
        this.routeStops = [];
        return;
      }
      const percursoId = ongoing.id_percurso || ongoing.id_percrso || ongoing.id_percrso || ongoing.id_percurso;
      if (!percursoId) { this.routeStops = []; return; }

      const etapasPercursoData: any = await this.httpApi.getAll('etapas-percurso');
      const etapasPercurso = Array.isArray(etapasPercursoData) ? etapasPercursoData : (etapasPercursoData?.data || []);
      const etapasFor = etapasPercurso.filter((ep: any) => String(ep.id_percurso || ep.id_percrso || ep.id_percurso) === String(percursoId));
      if (!etapasFor.length) { this.routeStops = []; return; }

      const allEtapasData: any = await this.httpApi.getAllEtapas();
      const etapas = Array.isArray(allEtapasData) ? allEtapasData : (allEtapasData?.data || []);
      const allEstabelecimentosData: any = await this.httpApi.getAllEstabelecimento();
      const estabelecimentos = Array.isArray(allEstabelecimentosData) ? allEstabelecimentosData : (allEstabelecimentosData?.data || []);

      const orderedEtapasRefs = etapasFor
        .map((ep: any) => ({ ...ep, etapaId: ep.id_etapa || ep.id_etap || ep.etapa }))
        .filter((ep: any) => ep.etapaId !== undefined && ep.etapaId !== null)
        .sort((a: any, b: any) => Number(a.etapaId) - Number(b.etapaId));

      const allStops: Array<{ lat: number; lon: number; title: string; locId: string; etapaId: number | string }> = [];
      let currentIndex = 0;
      for (const epRef of orderedEtapasRefs) {
        const etapa = etapas.find((e: any) => String(e.id_etapa || e.id_etap || e.id) === String(epRef.etapaId));
        if (!etapa) continue;
        const estabelecimentoId = etapa.id_estabelecimento ?? etapa.id_estab ?? etapa.estabelecimento_id;
        if (!estabelecimentoId) continue;
        const estabelecimento = estabelecimentos.find((e: any) => String(e.id_estabelecimento ?? e.id ?? e.id_localizacao) === String(estabelecimentoId));
        if (!estabelecimento) continue;
        const lat = Number(estabelecimento.lat || estabelecimento.latitude || 0) || 0;
        const lon = Number(estabelecimento.lon || estabelecimento.longitude || 0) || 0;
        const title = (estabelecimento.nome || estabelecimento.descr || estabelecimento.name || `Ponto ${currentIndex + 1}`);
        if (!allStops.length || allStops[allStops.length - 1].lat !== lat || allStops[allStops.length - 1].lon !== lon) {
          allStops.push({ lat, lon, title, locId: String(estabelecimento.id_estabelecimento || estabelecimento.id || `stop-${currentIndex}`), etapaId: epRef.etapaId });
          currentIndex++;
        }
      }

      this.routeStops = allStops.map(s => ({ title: s.title, lat: s.lat, lon: s.lon, locId: s.locId }));
    } catch (e) {
      console.warn('Error loading active route', e);
      this.routeStops = [];
    } finally {
      this.loadingRoute = false;
    }
  }

  async loadNotes() {
    const userId = this.getCurrentUserId();
    if (!userId) { this.notes = []; return; }
    this.loadingNotes = true;
    try {
      const data: any = await this.httpApi.getNotesByUser(userId);
      const notes = Array.isArray(data) ? data : (data?.data || []);
      this.notes = notes.map((note: any) => ({
        ...note,
        isEditing: false,
        editTitle: note.title || '',
        editContent: note.content || ''
      }));
    } catch (e) {
      console.warn('Error loading notes', e);
      this.notes = [];
    } finally { this.loadingNotes = false; }
  }

  editNote(note: any) {
    if (!note) { return; }
    note.isEditing = true;
    note.editTitle = note.title || '';
    note.editContent = note.content || '';
  }

  cancelEdit(note: any) {
    if (!note) { return; }
    note.isEditing = false;
  }

  async saveNote(note: any) {
    if (!note || !note._id) { return; }
    const title = note.editTitle || '';
    const content = note.editContent || '';
    try {
      const payload = { title, content };
      const updated: any = await this.httpApi.updateNote(note._id, payload);
      if (updated) {
        note.title = updated.title || title;
        note.content = updated.content || content;
        note.updatedAt = updated.updatedAt || note.updatedAt;
        note.isEditing = false;
      }
    } catch (e) {
      console.warn('Error updating note', e);
    }
  }

  async addNote() {
    const userId = this.getCurrentUserId();
    if (!userId) return;
    if (!this.newNoteText || !this.newNoteText.trim()) return;
    try {
      const payload = { userId, title: this.newNoteTitle || '', content: this.newNoteText };
      const saved: any = await this.httpApi.createNote(payload);
      if (saved) {
        this.newNoteText = '';
        this.newNoteTitle = '';
        await this.loadNotes();
      }
    } catch (e) { console.warn('Error saving note', e); }
  }

  async deleteNote(note: any) {
    try {
      if (!note || !note._id) return;
      await this.httpApi.deleteNote(note._id);
      await this.loadNotes();
    } catch (e) { console.warn('Error deleting note', e); }
  }

}
