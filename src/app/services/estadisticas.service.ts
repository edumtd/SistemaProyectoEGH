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
   * Obtiene el token de sesión de las cookies
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

    console.log("Token encontrado:", token ? "Sí" : "No");

    // Hacer 3 llamadas en paralelo a los endpoints existentes
    return forkJoin({
      admins: this.http.get<any[]>(`${environment.url_api}/lista-admins/`, { headers }).pipe(
        catchError((error) => {
          console.error("Error en /lista-admins/:", error.status);
          return of([]);
        })
      ),
      maestros: this.http.get<any[]>(`${environment.url_api}/lista-maestros/`, { headers }).pipe(
        catchError((error) => {
          console.error("Error en /lista-maestros/:", error.status);
          return of([]);
        })
      ),
      alumnos: this.http.get<any[]>(`${environment.url_api}/lista-alumnos/`, { headers }).pipe(
        catchError((error) => {
          console.error("Error en /lista-alumnos/:", error.status);
          return of([]);
        })
      )
    }).pipe(
      map(result => {
        console.log("Resultado forkJoin:", {
          admins: result.admins.length,
          maestros: result.maestros.length,
          alumnos: result.alumnos.length
        });

        return {
          admins: result.admins?.length || 0,
          maestros: result.maestros?.length || 0,
          alumnos: result.alumnos?.length || 0
        };
      })
    );
  }
}
