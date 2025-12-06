import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const session_cookie_name = 'app-movil-escolar-token';

@Injectable({
  providedIn: 'root'
})
export class MaestrosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private cookieService: CookieService
  ) { }

  private getSessionToken(): string {
    return this.cookieService.get(session_cookie_name);
  }

  public esquemaMaestro() {
    return {
      'clave_maestro': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'fecha_nacimiento': '',
      'curp': '',
      'rfc': '',
      'edad': '',
      'telefono': '',
      'ocupacion': '',
      'direccion': ''
    }
  }

  public validarMaestro(data: any, editar: boolean) {
    let error: any = {};

    if (!this.validatorService.required(data["clave_maestro"])) {
      error["clave_maestro"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["first_name"])) {
      error["first_name"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["last_name"])) {
      error["last_name"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["email"])) {
      error["email"] = this.errorService.required;
    } else if (!this.validatorService.max(data["email"], 40)) {
      error["email"] = this.errorService.max(40);
    } else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    if (!editar) {
      if (!this.validatorService.required(data["password"])) {
        error["password"] = this.errorService.required;
      }

      if (!this.validatorService.required(data["confirmar_password"])) {
        error["confirmar_password"] = this.errorService.required;
      }
    }

    if (!this.validatorService.required(data["curp"])) {
      error["curp"] = this.errorService.required;
    } else if (!this.validatorService.min(data["curp"], 18)) {
      error["curp"] = this.errorService.min(18);
    } else if (!this.validatorService.max(data["curp"], 18)) {
      error["curp"] = this.errorService.max(18);
    }

    if (!this.validatorService.required(data["rfc"])) {
      error["rfc"] = this.errorService.required;
    } else if (!this.validatorService.min(data["rfc"], 12)) {
      error["rfc"] = this.errorService.min(12);
    } else if (!this.validatorService.max(data["rfc"], 13)) {
      error["rfc"] = this.errorService.max(13);
    }

    if (!this.validatorService.required(data["edad"])) {
      error["edad"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["edad"])) {
      error["edad"] = "El formato es solo números";
    }

    if (!this.validatorService.required(data["telefono"])) {
      error["telefono"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["fecha_nacimiento"])) {
      error["fecha_nacimiento"] = this.errorService.required;
    }

    return error;
  }

  // ========== SERVICIOS HTTP ==========

  public registrarMaestro(data: any): Observable<any> {
    return this.http.post<any>(`${environment.url_api}/api/maestro/registro/`, data, httpOptions);
  }

  public obtenerMaestros(): Observable<any> {
    const token = this.getSessionToken();
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + token });
    return this.http.get<any>(`${environment.url_api}/lista-maestros/`, { headers: headers });
  }

  public obtenerMaestroPorId(id: number): Observable<any> {
    const token = this.getSessionToken();
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + token });
    return this.http.get<any>(`${environment.url_api}/maestro-edit/${id}/`, { headers: headers });
  }

  public actualizarMaestro(id: number, data: any): Observable<any> {
    const token = this.getSessionToken();
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' });
    return this.http.put<any>(`${environment.url_api}/maestro-edit/${id}/`, data, { headers: headers });
  }

  public eliminarMaestro(id: number): Observable<any> {
    const token = this.getSessionToken();
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + token });
    return this.http.delete<any>(`${environment.url_api}/maestro-edit/${id}/`, { headers: headers });
  }
}
