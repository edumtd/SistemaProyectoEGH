import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent implements OnInit {
  /** Datos del formulario */
  public username:string = "";
  public password:string = "";
  public type: string = "password";
  public errors:any = {};
  public load:boolean = false;

  constructor(
    public router: Router,
    private facadeService: FacadeService
  ) { }

  ngOnInit(): void {
  }

  public login(){
    this.errors = {};
    this.errors = this.facadeService.validarLogin(this.username, this.password);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Mostrar loading
    this.load = true;

    // Llamar al servicio de login
    this.facadeService.iniciarSesion(this.username, this.password).subscribe(
      (response) => {
        console.log("Login exitoso:", response);

        // Guardar datos del usuario en cookies
        this.facadeService.saveUserData(response);

        // Redirigir según el rol
        const rol = response.rol || response.user?.rol;

        if (rol === 'Administrador') {
          this.router.navigate(['/administradores']);
        } else if (rol === 'Maestro') {
          this.router.navigate(['/maestros']);
        } else if (rol === 'Alumno') {
          this.router.navigate(['/alumnos']);
        } else {
          // Por defecto ir a administradores
          this.router.navigate(['/administradores']);
        }

        this.load = false;
      },
      (error) => {
        console.error("Error en login:", error);
        this.load = false;

        if (error.status === 0) {
          alert(`ERROR: No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${environment.url_api}`);
        } else if (error.status === 401 || error.status === 400) {
          this.errors['username'] = 'Usuario o contraseña incorrectos';
        } else if (error.status === 404) {
          alert("ERROR: El endpoint de login no existe. Verifica la URL del backend.");
        } else {
          alert(`Error al iniciar sesión: ${error.message || 'Error desconocido'}`);
        }
      }
    );
  }

  public showPassword(){
    this.type = this.type === "password" ? "text" : "password";
  }

  public registrar(){
    this.router.navigate(["registro-usuarios"]);
  }
}
