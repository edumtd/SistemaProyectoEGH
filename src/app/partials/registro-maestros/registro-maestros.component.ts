import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MaestrosService } from 'src/app/services/maestros.service';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit, OnChanges {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro:any = {
    clave_maestro: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmar_password: '',
    fecha_nacimiento: null,
    telefono: '',
    rfc: '',
    cubiculo: '',
    area_investigacion: '',
    materias: []
  };
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;


  //Para el select
  public areas: any[] = [
    {value: '1', viewValue: 'Desarrollo Web'},
    {value: '2', viewValue: 'Programación'},
    {value: '3', viewValue: 'Bases de datos'},
    {value: '4', viewValue: 'Redes'},
    {value: '5', viewValue: 'Matemáticas'},
  ];

  public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private maestrosService: MaestrosService,
    private facadeService: FacadeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Detectar si viene desde el modo editar
    this.activatedRoute.queryParams.subscribe(params => {
      if(params['id'] && params['editar']){
        this.editar = true;
        this.idUser = parseInt(params['id']);
        console.log("MODO EDITAR - ID User:", this.idUser);

        // Si datos_user viene del parent, lo usamos
        if(this.datos_user && Object.keys(this.datos_user).length > 0){
          this.mapearDatosUser();
        }else{
          // Sino, cargamos desde el servicio
          this.cargarMaestro();
        }
      }else{
        // Modo registro normal
        this.maestro = { materias: [] };
      }
    });
    console.log("Maestro:", this.maestro);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectar cuando datos_user cambia desde el componente padre
    if(changes['datos_user'] && changes['datos_user'].currentValue){
      console.log("OnChanges detectado - datos_user:", changes['datos_user'].currentValue);
      this.mapearDatosUser();
    }
  }

  private mapearDatosUser(): void {
    console.log("Mapeando datos_user:", this.datos_user);

    // Actualizar las propiedades del objeto existente sin reemplazarlo
    this.maestro.first_name = this.datos_user.first_name || this.datos_user.user?.first_name || '';
    this.maestro.last_name = this.datos_user.last_name || this.datos_user.user?.last_name || '';
    this.maestro.email = this.datos_user.email || this.datos_user.user?.email || '';
    this.maestro.clave_maestro = this.datos_user.clave_maestro || '';
    this.maestro.fecha_nacimiento = this.datos_user.fecha_nacimiento ? new Date(this.datos_user.fecha_nacimiento) : null;
    this.maestro.telefono = this.datos_user.telefono || '';
    this.maestro.rfc = this.datos_user.rfc || '';
    this.maestro.cubiculo = this.datos_user.cubiculo || '';
    this.maestro.area_investigacion = this.datos_user.area_investigacion || '';

    // Transformar materias al formato esperado (array de strings con nombres)
    let materiasData = this.datos_user.materias;

    // Si materias viene como string JSON, parsearlo
    if (typeof materiasData === 'string') {
      try {
        materiasData = JSON.parse(materiasData);
      } catch (e) {
        console.error('Error al parsear materias:', e);
        materiasData = [];
      }
    }

    if (Array.isArray(materiasData)) {
      this.maestro.materias = materiasData.map((materia: any) => {
        // Si es un objeto con propiedad nombre, extraer el nombre
        if (typeof materia === 'object' && materia.nombre) {
          return materia.nombre;
        }
        // Si es un string, devolverlo tal cual
        if (typeof materia === 'string') {
          return materia;
        }
        // Si es un ID, buscar el nombre en el array de materias disponibles
        if (typeof materia === 'number') {
          const materiaObj = this.materias.find(m => m.value === materia.toString());
          return materiaObj ? materiaObj.nombre : null;
        }
        return null;
      }).filter(m => m !== null); // Filtrar valores nulos
    } else {
      this.maestro.materias = [];
    }

    console.log("Maestro mapeado:", this.maestro);

    // Forzar detección de cambios para que Angular Material actualice los labels
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  private cargarMaestro(): void {
    this.maestrosService.obtenerMaestroPorId(Number(this.idUser)).subscribe({
      next: (response) => {
        console.log("Maestro cargado para editar:", response);

        // Actualizar las propiedades del objeto existente sin reemplazarlo
        this.maestro.first_name = response.first_name || response.user?.first_name || '';
        this.maestro.last_name = response.last_name || response.user?.last_name || '';
        this.maestro.email = response.email || response.user?.email || '';
        this.maestro.clave_maestro = response.clave_maestro || '';
        this.maestro.fecha_nacimiento = response.fecha_nacimiento ? new Date(response.fecha_nacimiento) : null;
        this.maestro.telefono = response.telefono || '';
        this.maestro.rfc = response.rfc || '';
        this.maestro.cubiculo = response.cubiculo || '';
        this.maestro.area_investigacion = response.area_investigacion || '';

        // Transformar materias al formato esperado (array de strings con nombres)
        let materiasData = response.materias;
        console.log("Materias originales del backend:", materiasData);
        console.log("Tipo de materias:", typeof materiasData);

        // Si materias viene como string JSON, parsearlo
        if (typeof materiasData === 'string') {
          try {
            materiasData = JSON.parse(materiasData);
            console.log("Materias después de parsear JSON:", materiasData);
          } catch (e) {
            console.error('Error al parsear materias:', e);
            materiasData = [];
          }
        }

        if (Array.isArray(materiasData)) {
          this.maestro.materias = materiasData.map((materia: any) => {
            console.log("Procesando materia individual:", materia, "Tipo:", typeof materia);
            // Si es un objeto con propiedad nombre, extraer el nombre
            if (typeof materia === 'object' && materia.nombre) {
              console.log("Es objeto con nombre:", materia.nombre);
              return materia.nombre;
            }
            // Si es un string, devolverlo tal cual
            if (typeof materia === 'string') {
              console.log("Es string:", materia);
              return materia;
            }
            // Si es un ID, buscar el nombre en el array de materias disponibles
            if (typeof materia === 'number') {
              const materiaObj = this.materias.find(m => m.value === materia.toString());
              console.log("Es número, buscando en materias:", materia, "Encontrado:", materiaObj);
              return materiaObj ? materiaObj.nombre : null;
            }
            console.log("No se pudo procesar la materia");
            return null;
          }).filter(m => m !== null); // Filtrar valores nulos
          console.log("Materias finales asignadas:", this.maestro.materias);
        } else {
          console.log("materias NO es un array, asignando array vacío");
          this.maestro.materias = [];
        }

        console.log("Maestro mapeado:", this.maestro);

        // Forzar detección de cambios para que Angular Material actualice los labels
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error("Error al cargar maestro:", error);
        alert("Error al cargar los datos");
        this.regresar();
      }
    });
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    console.log("=== INICIANDO REGISTRO DE MAESTRO ===");
    console.log("Datos del maestro:", this.maestro);

    // Validar que las contraseñas coincidan
    if(this.maestro.password != this.maestro.confirmar_password){
      alert("Las contraseñas no coinciden");
      console.error("ERROR: Las contraseñas no coinciden");
      return;
    }

    // Validar campos requeridos
    this.errors = {};
    if(!this.maestro.clave_maestro){
      this.errors.clave_maestro = "El ID de trabajador es requerido";
    }
    if(!this.maestro.first_name){
      this.errors.first_name = "El nombre es requerido";
    }
    if(!this.maestro.last_name){
      this.errors.last_name = "Los apellidos son requeridos";
    }
    if(!this.maestro.email){
      this.errors.email = "El correo electrónico es requerido";
    }
    if(!this.maestro.password){
      this.errors.password = "La contraseña es requerida";
    }

    // Si hay errores, detener
    if(Object.keys(this.errors).length > 0){
      console.error("ERRORES DE VALIDACIÓN:", this.errors);
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    // Preparar el payload según la documentación de la API
    let payload = {
      first_name: this.maestro.first_name,
      last_name: this.maestro.last_name,
      email: this.maestro.email,
      password: this.maestro.password,
      rol: "Maestro",
      clave_maestro: this.maestro.clave_maestro,
      fecha_nacimiento: this.maestro.fecha_nacimiento ?
        (this.maestro.fecha_nacimiento instanceof Date ?
          this.maestro.fecha_nacimiento.toISOString().split('T')[0] :
          this.maestro.fecha_nacimiento) : null,
      telefono: this.maestro.telefono || null,
      rfc: this.maestro.rfc || null,
      cubiculo: this.maestro.cubiculo || null,
      area_investigacion: this.maestro.area_investigacion || null,
      materias: JSON.stringify(this.maestro.materias || [])
    };

    console.log("Validación exitosa");
    console.log("Payload a enviar:", JSON.stringify(payload, null, 2));
    console.log("URL del API:", `${environment.url_api}/api/maestro/registro/`);

    // Llamar al servicio
    this.maestrosService.registrarMaestro(payload).subscribe(
      (response) => {
        console.log("ÉXITO - Respuesta del servidor:", response);
        alert("Maestro registrado correctamente con ID: " + response.maestro_created_id);
        this.maestro = { materias: [] };
        this.regresar();
      },
      (error) => {
        console.error("ERROR COMPLETO:", error);
        console.error("Status:", error.status);
        console.error("Status Text:", error.statusText);
        console.error("Error body:", error.error);
        console.error("URL intentada:", error.url);

        if(error.status === 0){
          alert(`ERROR: No se puede conectar con el servidor. Asegúrate de que el backend esté corriendo en ${environment.url_api}`);
        } else if(error.error && error.error.message){
          alert("Error: " + error.error.message);
        } else if(error.error){
          // Mostrar errores de validación
          this.errors = error.error;
          console.log("Errores de validación del backend:", this.errors);
          let errorMsg = "Errores de validación:\n";
          for(let key in this.errors){
            errorMsg += `- ${key}: ${this.errors[key]}\n`;
          }
          alert(errorMsg);
        } else {
          alert("Error al registrar el maestro. Verifica la consola del navegador para más detalles.");
        }
      }
    );
  }

  public actualizar(){
    console.log("=== INICIANDO ACTUALIZACIÓN DE MAESTRO ===");
    console.log("ID:", this.idUser);
    console.log("Datos del maestro:", this.maestro);

    this.errors = {};

    // Validar campos requeridos
    if(!this.maestro.first_name){
      this.errors.first_name = "El nombre es requerido";
    }
    if(!this.maestro.last_name){
      this.errors.last_name = "Los apellidos son requeridos";
    }
    if(!this.maestro.email){
      this.errors.email = "El correo es requerido";
    }

    // Validar contraseña solo si se ingresó una nueva
    if(this.maestro.password && this.maestro.password !== this.maestro.confirmar_password){
      alert('Las contraseñas no coinciden');
      return;
    }

    if(Object.keys(this.errors).length > 0){
      console.error("ERRORES DE VALIDACIÓN:", this.errors);
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    // Preparar datos para actualizar
    let dataToUpdate: any = {
      first_name: this.maestro.first_name,
      last_name: this.maestro.last_name,
      email: this.maestro.email,
      clave_maestro: this.maestro.clave_maestro || null,
      fecha_nacimiento: this.maestro.fecha_nacimiento ?
        (this.maestro.fecha_nacimiento instanceof Date ?
          this.maestro.fecha_nacimiento.toISOString().split('T')[0] :
          this.maestro.fecha_nacimiento) : null,
      telefono: this.maestro.telefono || null,
      rfc: this.maestro.rfc || null,
      cubiculo: this.maestro.cubiculo || null,
      area_investigacion: this.maestro.area_investigacion || null,
      materias: JSON.stringify(this.maestro.materias || [])
    };

    // Solo incluir password si se ingresó uno nuevo
    if(this.maestro.password){
      dataToUpdate.password = this.maestro.password;
    }

    console.log("Validación exitosa");
    console.log("Datos a actualizar:", JSON.stringify(dataToUpdate, null, 2));

    this.maestrosService.actualizarMaestro(Number(this.idUser), dataToUpdate).subscribe({
      next: (response) => {
        // Si el backend retorna un nuevo token, actualizarlo sin cambiar la sesión del usuario actual
        if(response.token){
          this.facadeService.updateSessionToken(response.token);
        }

        alert('Maestro actualizado con éxito');
        this.router.navigate(['maestros']);
      },
      error: (error) => {
        console.error("ERROR al actualizar:", error);

        if(error.status === 0){
          alert("ERROR: No se puede conectar con el servidor");
        }else if(error.status === 404){
          alert("ERROR: Maestro no encontrado");
        }else if(error.error && error.error.message){
          alert("Error: " + error.error.message);
        }else{
          alert('Error al actualizar el maestro');
        }
      }
    });
  }

  //Funciones para password
  showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    console.log(event);
    console.log(event.value.toISOString());

    this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.maestro.fecha_nacimiento);
  }


  // Funciones para los checkbox
  public checkboxChange(event:any){
    console.log("Evento: ", event);
    if(event.checked){
      this.maestro.materias.push(event.source.value)
    }else{
      console.log(event.source.value);
      this.maestro.materias.forEach((materia, i) => {
        if(materia == event.source.value){
          this.maestro.materias.splice(i,1)
        }
      });
    }
    console.log("Array materias: ", this.maestro);
  }

  public revisarSeleccion(nombre: string){
    if(this.maestro.materias && Array.isArray(this.maestro.materias)){
      var busqueda = this.maestro.materias.find((element)=>element==nombre);
      if(busqueda != undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }
}
