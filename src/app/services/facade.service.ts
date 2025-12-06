import { Injectable } from '@angular/core';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

//Estas son variables para las cookies de sesión
const session_cookie_name = 'app-movil-escolar-token';
const user_email_cookie_name = 'app-movil-escolar-email';
const user_id_cookie_name = 'app-movil-escolar-user_id';
const user_complete_name_cookie_name = 'app-movil-escolar-user_complete_name';
const group_name_cookie_name = 'app-movil-escolar-group_name';
const codigo_cookie_name = 'app-movil-escolar-codigo';

@Injectable({
  providedIn: 'root'
})
export class FacadeService {

  constructor(
    private http: HttpClient,
    public router: Router,
    private cookieService: CookieService,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,

  ) { }

  //Funcion para validar login
  public validarLogin(username: String, password: String){
    let data = {
      "username": username,
      "password": password
    };

    let error: any = {};

    if(!this.validatorService.required(data["username"])){
      error["username"] = this.errorService.required;
    }else if(!this.validatorService.max(data["username"], 40)){
      error["username"] = this.errorService.max(40);
    }else if (!this.validatorService.email(data['username'])) {
      error['username'] = this.errorService.email;
    }

    if(!this.validatorService.required(data["password"])){
      error["password"] = this.errorService.required;
    }

    return error;

  }

  // Servicio para iniciar sesión
  public iniciarSesion(username: string, password: string){
    return this.http.post<any>(`${environment.url_api}/login/`, {
      email: username,
      password: password
    }, httpOptions);
  }

  // Funciones para utilizar las cookies en web
  retrieveSignedUser(){
    var headers: any;
    var token = this.getSessionToken();
    headers = new HttpHeaders({'Authorization': 'Bearer '+token});
    return this.http.get<any>(`${environment.url_api}/me/`,{headers:headers});
  }

  getCookieValue(key:string){
    return this.cookieService.get(key);
  }

  saveCookieValue(key:string, value:string){
    var secure = environment.url_api.indexOf("https")!=-1;
    this.cookieService.set(key, value, undefined, undefined, undefined, secure, secure?"None":"Lax");
  }

  getSessionToken(){
    return this.cookieService.get(session_cookie_name);
  }

  saveUserData(user_data: any) {
    var secure = environment.url_api.indexOf("https") !== -1;

    // Manejar diferentes estructuras de respuesta del backend
    // Para login: {id, email, first_name, last_name, token, rol}
    // Para update: {token, user: {user: {id, email, first_name, last_name}}}
    let id = user_data.id || user_data.user?.user?.id || user_data.user?.id;
    let email = user_data.email || user_data.user?.user?.email || user_data.user?.email;
    let first_name = user_data.first_name || user_data.user?.user?.first_name || user_data.user?.first_name || '';
    let last_name = user_data.last_name || user_data.user?.user?.last_name || user_data.user?.last_name || '';
    let name = (first_name + " " + last_name).trim();
    let rol = user_data.rol || this.getUserGroup(); // Mantener el rol actual si no viene en la respuesta

    this.cookieService.set(user_id_cookie_name, id, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(user_email_cookie_name, email, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(user_complete_name_cookie_name, name, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(session_cookie_name, user_data.token, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
    this.cookieService.set(group_name_cookie_name, rol, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
  }

  // Actualizar solo el token sin cambiar los datos del usuario actual
  updateSessionToken(token: string) {
    var secure = environment.url_api.indexOf("https") !== -1;
    this.cookieService.set(session_cookie_name, token, undefined, undefined, undefined, secure, secure ? "None" : "Lax");
  }

  destroyUser(){
    this.cookieService.deleteAll();
  }

  getUserEmail(){
    return this.cookieService.get(user_email_cookie_name);
  }

  getUserCompleteName(){
    return this.cookieService.get(user_complete_name_cookie_name);
  }

  getUserId(){
    return this.cookieService.get(user_id_cookie_name);
  }

  getUserGroup(){
    return this.cookieService.get(group_name_cookie_name);
  }

  /**
   * Verifica si el usuario tiene un token de sesión válido
   * @returns true si hay sesión activa, false si no
   */
  public isAuthenticated(): boolean {
    const token = this.getSessionToken();
    return !!token; // Convierte a boolean
  }

  /**
   * Verifica si el usuario tiene uno de los roles permitidos
   * @param allowedRoles Array de roles permitidos
   * @returns true si el usuario tiene permiso, false si no
   */
  public hasRole(allowedRoles: string[]): boolean {
    const userRole = this.getUserGroup();

    if (!userRole) {
      return false;
    }

    return allowedRoles.includes(userRole);
  }

  /**
   * Redirige al usuario a su página principal según su rol
   */
  public redirectToHomePage(): void {
    const role = this.getUserGroup();

    switch(role) {
      case 'Administrador':
        this.router.navigate(['/administradores']);
        break;
      case 'Maestro':
        this.router.navigate(['/maestros']);
        break;
      case 'Alumno':
        this.router.navigate(['/alumnos']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  /**
   * Verifica autenticación y permisos - usado por el guard
   * @param allowedRoles Roles permitidos para la ruta (opcional)
   * @returns true si tiene acceso, false si no
   */
  public canAccess(allowedRoles?: string[]): boolean {
    // Verificar si hay token
    if (!this.isAuthenticated()) {
      console.warn('No hay sesión activa, redirigiendo a login');
      this.router.navigate(['/login']);
      return false;
    }

    // Si no hay roles requeridos, solo verifica autenticación
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // Verificar rol
    const userRole = this.getUserGroup();

    if (!userRole) {
      console.warn('No se pudo obtener el rol del usuario');
      this.router.navigate(['/login']);
      return false;
    }

    if (!allowedRoles.includes(userRole)) {
      console.warn(`Acceso denegado: Usuario con rol "${userRole}" intentó acceder a ruta que requiere roles: ${allowedRoles.join(', ')}`);
      alert('No tienes permisos para acceder a esta página');
      this.redirectToHomePage();
      return false;
    }

    return true;
  }

  // ========== SERVICIOS PARA ADMINISTRADORES ==========

  public registrarAdmin(data: any){
    return this.http.post<any>(`${environment.url_api}/api/administrador/registro/`, data, httpOptions);
  }

  public obtenerAdministradores(){
    var token = this.getSessionToken();   // Obtener el token de las cookies
    var headers = new HttpHeaders({'Authorization': 'Bearer '+token});   // Crear headers HTTP con autenticación Bearer
    return this.http.get<any>(`${environment.url_api}/lista-admins/`, {headers: headers}); //Se hace la peticion get al back
  }

  public obtenerAdminPorId(id: number){
    var token = this.getSessionToken();
    var headers = new HttpHeaders({'Authorization': 'Bearer '+token});
    return this.http.get<any>(`${environment.url_api}/administrador-edit/${id}/`, {headers: headers});
  }

  public actualizarAdmin(id: number, data: any){
    var token = this.getSessionToken();
    var headers = new HttpHeaders({'Authorization': 'Bearer '+token, 'Content-Type': 'application/json'});
    return this.http.put<any>(`${environment.url_api}/administrador-edit/${id}/`, data, {headers: headers});
  }

  public eliminarAdmin(id: number){
    var token = this.getSessionToken();
    var headers = new HttpHeaders({'Authorization': 'Bearer '+token});
    return this.http.delete<any>(`${environment.url_api}/administrador-edit/${id}/`, {headers: headers});
  }

}
