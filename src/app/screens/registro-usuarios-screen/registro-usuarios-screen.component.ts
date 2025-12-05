import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { Location } from '@angular/common';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-registro-usuarios-screen',
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit {

  public tipo:string = "registro-usuarios";
  public editar:boolean = false;
  public rol:string = "";
  public idUser:number = 0;

  //Banderas para el tipo de usuario
  public isAdmin:boolean = false;
  public isAlumno:boolean = false;
  public isMaestro:boolean = false;

  public tipo_user:string = "";

  //JSON para el usuario
  public user : any = {};

  // Propiedades computadas para verificar permisos
  get canRegisterAdmin(): boolean {
    const userRole = this.facadeService.getUserGroup();
    console.log("canRegisterAdmin - userRole:", userRole);
    return !userRole || userRole === 'Administrador';
  }

  get canRegisterMaestro(): boolean {
    const userRole = this.facadeService.getUserGroup();
    console.log("canRegisterMaestro - userRole:", userRole);
    return !userRole || userRole === 'Administrador' || userRole === 'Maestro';
  }

  constructor(
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private alumnosService: AlumnosService,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    // Debug: Verificar el rol del usuario
    console.log("DEBUG - Rol del usuario:", this.facadeService.getUserGroup());
    console.log("DEBUG - Tipo de dato:", typeof this.facadeService.getUserGroup());

    // Detectar si viene del modo editar
    this.activatedRoute.queryParams.subscribe(params => {
      if(params['id'] && params['tipo'] && params['editar']){
        console.log("MODO EDITAR detectado");
        console.log("ID:", params['id']);
        console.log("Tipo:", params['tipo']);

        this.editar = true;
        this.idUser = parseInt(params['id']);
        this.tipo_user = params['tipo'];

        // Cargar datos del usuario según el tipo
        if(params['tipo'] === 'administrador'){
          this.isAdmin = true;
          this.isAlumno = false;
          this.isMaestro = false;
          this.cargarAdministrador(this.idUser);
        }else if(params['tipo'] === 'maestro'){
          this.isAdmin = false;
          this.isAlumno = false;
          this.isMaestro = true;
          this.cargarMaestro(this.idUser);
        }else if(params['tipo'] === 'alumno'){
          this.isAdmin = false;
          this.isAlumno = true;
          this.isMaestro = false;
          this.cargarAlumno(this.idUser);
        }
      }
    });
  }

  // Cargar datos del administrador
  private cargarAdministrador(id: number): void {
    console.log("Cargando administrador ID:", id);
    this.facadeService.obtenerAdminPorId(id).subscribe({
      next: (response) => {
        console.log("Administrador cargado:", response);
        // Mapear los datos del usuario anidado al nivel superior
        this.user = {
          ...response,
          first_name: response.user?.first_name || '',
          last_name: response.user?.last_name || '',
          email: response.user?.email || '',
          tipo_usuario: 'administrador'
        };
        this.rol = "Administrador";
      },
      error: (error) => {
        console.error("Error al cargar administrador:", error);
        alert("Error al cargar los datos del administrador");
        this.goBack();
      }
    });
  }

  // Cargar datos del maestro
  private cargarMaestro(id: number): void {
    console.log("Cargando maestro ID:", id);
    this.maestrosService.obtenerMaestroPorId(id).subscribe({
      next: (response) => {
        console.log("Maestro cargado:", response);
        // Mapear los datos del usuario anidado al nivel superior
        this.user = {
          ...response,
          first_name: response.user?.first_name || '',
          last_name: response.user?.last_name || '',
          email: response.user?.email || '',
          tipo_usuario: 'maestro'
        };
        this.rol = "Maestro";
      },
      error: (error) => {
        console.error("Error al cargar maestro:", error);
        alert("Error al cargar los datos del maestro");
        this.goBack();
      }
    });
  }

  // Cargar datos del alumno
  private cargarAlumno(id: number): void {
    console.log("Cargando alumno ID:", id);
    this.alumnosService.obtenerAlumnoPorId(id).subscribe({
      next: (response) => {
        console.log("Alumno cargado:", response);
        // Mapear los datos del usuario anidado al nivel superior
        this.user = {
          ...response,
          first_name: response.user?.first_name || '',
          last_name: response.user?.last_name || '',
          email: response.user?.email || '',
          tipo_usuario: 'alumno'
        };
        this.rol = "Alumno";
      },
      error: (error) => {
        console.error("Error al cargar alumno:", error);
        alert("Error al cargar los datos del alumno");
        this.goBack();
      }
    });
  }

  // Función para conocer que usuario se ha elegido
  public radioChange(event: MatRadioChange) {
    if(event.value == "administrador"){
      this.isAdmin = true;
      this.isAlumno = false;
      this.isMaestro = false;
      this.tipo_user = "administrador";
    }else if (event.value == "alumno"){
      this.isAdmin = false;
      this.isAlumno = true;
      this.isMaestro = false;
      this.tipo_user = "alumno";
    }else if (event.value == "maestro"){
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = true;
      this.tipo_user = "maestro";
    }
  }
  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}
