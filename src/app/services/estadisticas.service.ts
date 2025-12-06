import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TotalUsuarios } from '../interfaces/total-usuarios.interface';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  /**
   * Obtiene el token de sesión de las cookies de navegador
   */
  private getSessionToken(): string {
    return this.cookieService.get('app-movil-escolar-token');
  }

  /**
   * Obtiene el total de usuarios por tipo (admins, maestros, alumnos)
   * Hace llamadas a los endpoints individuales y cuenta los resultados
   * @returns Observable con los totales
   */
  getTotalUsuarios(): Observable<TotalUsuarios> {
    // Obtener el token para autenticación
    const token = this.getSessionToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return forkJoin({
      admins: this.http.get<any[]>(`${environment.url_api}/lista-admins/`, { headers }).pipe(
        catchError(() => of([]))
      ),
      maestros: this.http.get<any[]>(`${environment.url_api}/lista-maestros/`, { headers }).pipe(
        catchError(() => of([]))
      ),
      alumnos: this.http.get<any[]>(`${environment.url_api}/lista-alumnos/`, { headers }).pipe(
        catchError(() => of([]))
      )
    }).pipe(
      map(result => {
        return {
          admins: result.admins?.length || 0,
          maestros: result.maestros?.length || 0,
          alumnos: result.alumnos?.length || 0
        };
      })
    );
  }
}
