import { Component, Input, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit, OnChanges {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //Para contraseñas de mostrar/ocultar
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno:any= {
    matricula: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmar_password: '',
    fecha_nacimiento: null,
    curp: '',
    rfc: '',
    edad: null,
    telefono: '',
    ocupacion: '',
    semestre: null,
    carrera: ''
  };
  public token: string = "";
  public errors:any={};
  public editar:boolean = false;
  public idUser: Number = 0;

  // Opciones para los selects
  public carreras: any[] = [
    {value: 'Ingeniería en Sistemas', viewValue: 'Ingeniería en Sistemas'},
    {value: 'Ingeniería en Software', viewValue: 'Ingeniería en Software'},
    {value: 'Ingeniería en Computación', viewValue: 'Ingeniería en Computación'},
    {value: 'Ingeniería en Datos', viewValue: 'Ingeniería en Datos'},
    {value: 'Licenciatura en Informática', viewValue: 'Licenciatura en Informática'},
  ];

  public semestres: any[] = [
    {value: 1, viewValue: '1'},
    {value: 2, viewValue: '2'},
    {value: 3, viewValue: '3'},
    {value: 4, viewValue: '4'},
    {value: 5, viewValue: '5'},
    {value: 6, viewValue: '6'},
    {value: 7, viewValue: '7'},
    {value: 8, viewValue: '8'},
    {value: 9, viewValue: '9'},
  ];

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
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
          console.log("Datos recibidos del padre:", this.datos_user);

          // Actualizar propiedades del objeto existente
          this.alumno.first_name = this.datos_user.first_name || this.datos_user.user?.first_name || '';
          this.alumno.last_name = this.datos_user.last_name || this.datos_user.user?.last_name || '';
          this.alumno.email = this.datos_user.email || this.datos_user.user?.email || '';
          this.alumno.matricula = this.datos_user.matricula || '';
          this.alumno.fecha_nacimiento = this.datos_user.fecha_nacimiento ? new Date(this.datos_user.fecha_nacimiento) : null;
          this.alumno.curp = this.datos_user.curp || '';
          this.alumno.rfc = this.datos_user.rfc || '';
          this.alumno.edad = this.datos_user.edad || null;
          this.alumno.telefono = this.datos_user.telefono || '';
          this.alumno.ocupacion = this.datos_user.ocupacion || '';
          this.alumno.semestre = this.datos_user.semestre || null;
          this.alumno.carrera = this.datos_user.carrera || '';

          // Forzar detección de cambios
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 0);
        }else{
          // Sino, cargamos desde el servicio
          this.cargarAlumno();
        }
      }else{
        // Modo registro normal
        this.alumno = { semestre: null };
      }
    });
    console.log("Alumno después de ngOnInit:", this.alumno);
  }

  ngOnChanges(): void {
    // Detectar cambios en datos_user cuando viene del padre
    if(this.datos_user && Object.keys(this.datos_user).length > 0){
      console.log("Datos actualizados del padre:", this.datos_user);

      // Actualizar propiedades del objeto existente
      this.alumno.first_name = this.datos_user.first_name || this.datos_user.user?.first_name || '';
      this.alumno.last_name = this.datos_user.last_name || this.datos_user.user?.last_name || '';
      this.alumno.email = this.datos_user.email || this.datos_user.user?.email || '';
      this.alumno.matricula = this.datos_user.matricula || '';
      this.alumno.fecha_nacimiento = this.datos_user.fecha_nacimiento ? new Date(this.datos_user.fecha_nacimiento) : null;
      this.alumno.curp = this.datos_user.curp || '';
      this.alumno.rfc = this.datos_user.rfc || '';
      this.alumno.edad = this.datos_user.edad || null;
      this.alumno.telefono = this.datos_user.telefono || '';
      this.alumno.ocupacion = this.datos_user.ocupacion || '';
      this.alumno.semestre = this.datos_user.semestre || null;
      this.alumno.carrera = this.datos_user.carrera || '';

      console.log("Alumno actualizado:", this.alumno);

      // Forzar detección de cambios
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }
  }

  private cargarAlumno(): void {
    this.alumnosService.obtenerAlumnoPorId(Number(this.idUser)).subscribe({
      next: (response) => {
        console.log("Alumno cargado para editar:", response);

        // Actualizar propiedades del objeto existente
        this.alumno.first_name = response.first_name || response.user?.first_name || '';
        this.alumno.last_name = response.last_name || response.user?.last_name || '';
        this.alumno.email = response.email || response.user?.email || '';
        this.alumno.matricula = response.matricula || '';
        this.alumno.fecha_nacimiento = response.fecha_nacimiento ? new Date(response.fecha_nacimiento) : null;
        this.alumno.curp = response.curp || '';
        this.alumno.rfc = response.rfc || '';
        this.alumno.edad = response.edad || null;
        this.alumno.telefono = response.telefono || '';
        this.alumno.ocupacion = response.ocupacion || '';
        this.alumno.semestre = response.semestre || null;
        this.alumno.carrera = response.carrera || '';

        console.log("Alumno mapeado:", this.alumno);
      },
      error: (error) => {
        console.error("Error al cargar alumno:", error);
        alert("Error al cargar los datos");
        this.regresar();
      }
    });
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    console.log("=== INICIANDO REGISTRO DE ALUMNO ===");
    console.log("Datos del alumno:", this.alumno);

    // Validar que las contraseñas coincidan
    if(this.alumno.password != this.alumno.confirmar_password){
      alert("Las contraseñas no coinciden");
      console.error("ERROR: Las contraseñas no coinciden");
      return;
    }

    // Validar campos requeridos
    this.errors = {};
    if(!this.alumno.matricula){
      this.errors.matricula = "La matrícula es requerida";
    }
    if(!this.alumno.first_name){
      this.errors.first_name = "El nombre es requerido";
    }
    if(!this.alumno.last_name){
      this.errors.last_name = "Los apellidos son requeridos";
    }
    if(!this.alumno.email){
      this.errors.email = "El correo electrónico es requerido";
    }
    if(!this.alumno.password){
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
      first_name: this.alumno.first_name,
      last_name: this.alumno.last_name,
      email: this.alumno.email,
      password: this.alumno.password,
      rol: "Alumno",
      matricula: this.alumno.matricula,
      fecha_nacimiento: this.alumno.fecha_nacimiento ?
        (this.alumno.fecha_nacimiento instanceof Date ?
          this.alumno.fecha_nacimiento.toISOString().split('T')[0] :
          this.alumno.fecha_nacimiento) : null,
      curp: this.alumno.curp || null,
      rfc: this.alumno.rfc || null,
      edad: this.alumno.edad || null,
      telefono: this.alumno.telefono || null,
      ocupacion: this.alumno.ocupacion || null
    };

    console.log("Validación exitosa");
    console.log("Payload a enviar:", JSON.stringify(payload, null, 2));
    console.log("URL del API:", `${environment.url_api}/api/alumno/registro/`);

    // Llamar al servicio
    this.alumnosService.registrarAlumno(payload).subscribe(
      (response) => {
        console.log("ÉXITO - Respuesta del servidor:", response);
        alert("Alumno registrado correctamente con ID: " + response.alumno_created_id);
        this.alumno = { semestre: null };
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
          alert("Error al registrar el alumno. Verifica la consola del navegador para más detalles.");
        }
      }
    );
  }

  public actualizar(){
    console.log("=== INICIANDO ACTUALIZACIÓN DE ALUMNO ===");
    console.log("ID:", this.idUser);
    console.log("Datos del alumno:", this.alumno);

    this.errors = {};

    // Validar campos requeridos
    if(!this.alumno.first_name){
      this.errors.first_name = "El nombre es requerido";
    }
    if(!this.alumno.last_name){
      this.errors.last_name = "Los apellidos son requeridos";
    }
    if(!this.alumno.email){
      this.errors.email = "El correo es requerido";
    }

    // Validar contraseña solo si se ingresó una nueva
    if(this.alumno.password && this.alumno.password !== this.alumno.confirmar_password){
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
      first_name: this.alumno.first_name,
      last_name: this.alumno.last_name,
      email: this.alumno.email,
      matricula: this.alumno.matricula || null,
      fecha_nacimiento: this.alumno.fecha_nacimiento ?
        (this.alumno.fecha_nacimiento instanceof Date ?
          this.alumno.fecha_nacimiento.toISOString().split('T')[0] :
          this.alumno.fecha_nacimiento) : null,
      curp: this.alumno.curp || null,
      rfc: this.alumno.rfc || null,
      edad: this.alumno.edad || null,
      telefono: this.alumno.telefono || null,
      ocupacion: this.alumno.ocupacion || null
    };

    // Solo incluir password si se ingresó uno nuevo
    if(this.alumno.password){
      dataToUpdate.password = this.alumno.password;
    }

    console.log("Validación exitosa");
    console.log("Datos a actualizar:", JSON.stringify(dataToUpdate, null, 2));

    this.alumnosService.actualizarAlumno(Number(this.idUser), dataToUpdate).subscribe({
      next: (response) => {
        // Si el backend retorna un nuevo token, actualizarlo sin cambiar la sesión del usuario actual
        if(response.token){
          this.facadeService.updateSessionToken(response.token);
        }

        alert('Alumno actualizado con éxito');
        this.router.navigate(['alumnos']);
      },
      error: (error) => {
        console.error("ERROR al actualizar:", error);

        if(error.status === 0){
          alert("ERROR: No se puede conectar con el servidor");
        }else if(error.status === 404){
          alert("ERROR: Alumno no encontrado");
        }else if(error.error && error.error.message){
          alert("Error: " + error.error.message);
        }else{
          alert('Error al actualizar el alumno');
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
  public changeFecha(event: any){
    console.log(event);
    console.log(event.value.toISOString());

    this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.alumno.fecha_nacimiento);

    // Calcular edad automáticamente
    this.calcularEdad(event.value);
  }

  // Función para calcular la edad basada en la fecha de nacimiento
  public calcularEdad(fechaNacimiento: Date): void {
    if (!fechaNacimiento) {
      return;
    }

    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    // Ajustar si aún no ha cumplido años este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    this.alumno.edad = edad;
    console.log("Edad calculada:", edad);

    // Validar edad mayor a 18 años
    if (edad < 18) {
      this.errors.edad = 'La edad debe ser mayor o igual a 18 años';
    } else {
      delete this.errors.edad;
    }
  }

  // Función para contar dígitos del teléfono
  public contarDigitosTelefono(): number {
    if (!this.alumno.telefono) {
      return 0;
    }
    return this.alumno.telefono.replace(/[^0-9]/g, '').length;
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
