import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService,
    private validatorService: ValidatorService,
    private errorService: ErrorsService
  ) { }

  public esquemaEvento() {
    return {
      'nombre_evento': '',
      'tipo_evento': '',
      'fecha_realizacion': '',
      'hora_inicio': '',
      'hora_fin': '',
      'lugar': '',
      'publico_objetivo': [],
      'programa_educativo': '',
      'responsable': '',
      'descripcion': '',
      'cupo_maximo': null
    };
  }

  public validarEvento(data: any, editar: boolean) {
    let error: any = {};

    if (!this.validatorService.required(data['nombre_evento'])) {
      error['nombre_evento'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['tipo_evento'])) {
      error['tipo_evento'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['fecha_realizacion'])) {
      error['fecha_realizacion'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['hora_inicio'])) {
      error['hora_inicio'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['hora_fin'])) {
      error['hora_fin'] = this.errorService.required;
    }

    if (data['hora_inicio'] && data['hora_fin']) {
      if (data['hora_inicio'] >= data['hora_fin']) {
        error['hora_fin'] = 'La hora de fin debe ser posterior a la hora de inicio';
      }
    }

    if (!this.validatorService.required(data['lugar'])) {
      error['lugar'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['publico_objetivo']) || data['publico_objetivo'].length === 0) {
      error['publico_objetivo'] = 'Debe seleccionar al menos un público objetivo';
    }

    if (data['publico_objetivo'] && data['publico_objetivo'].includes('Estudiantes')) {
      if (!this.validatorService.required(data['programa_educativo'])) {
        error['programa_educativo'] = 'Debe seleccionar un programa educativo cuando el público objetivo incluye estudiantes';
      }
    }

    if (!this.validatorService.required(data['responsable'])) {
      error['responsable'] = this.errorService.required;
    }

    if (!this.validatorService.required(data['descripcion'])) {
      error['descripcion'] = this.errorService.required;
    } else if (!this.validatorService.max(data['descripcion'], 300)) {
      error['descripcion'] = this.errorService.max(300);
    }

    if (!this.validatorService.required(data['cupo_maximo'])) {
      error['cupo_maximo'] = this.errorService.required;
    } else if (data['cupo_maximo'] <= 0) {
      error['cupo_maximo'] = 'El cupo debe ser mayor a 0';
    }

    return error;
  }

  private getHeaders(): HttpHeaders {
    const token = this.facadeService.getSessionToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
  }

  public getEventos(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.url_api}/eventos-academicos/`, { headers });
  }

  public getEventoById(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${environment.url_api}/evento-academico/?id=${id}`, { headers });
  }

  public registrarEvento(evento: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.url_api}/evento-academico/`, evento, { headers });
  }

  public actualizarEvento(id: number, evento: any): Observable<any> {
    const headers = this.getHeaders();
    const eventoConId = { ...evento, id: id };
    return this.http.put<any>(`${environment.url_api}/evento-academico/`, eventoConId, { headers });
  }

  public eliminarEvento(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.url_api}/evento-academico/?id=${id}`, { headers });
  }

  public getMaestrosYAdministradores(): Observable<any> {
    const headers = this.getHeaders();
    return new Observable((observer) => {
      Promise.all([
        this.http.get<any>(`${environment.url_api}/lista-maestros/`, { headers }).toPromise(),
        this.http.get<any>(`${environment.url_api}/lista-admins/`, { headers }).toPromise()
      ]).then(([maestros, admins]) => {
        observer.next({ maestros, admins });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
