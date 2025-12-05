import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables, DatalabelsPlugin);

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {

  // Variable para almacenar totales de usuarios
  public total_user: any = {};

  //Histograma
  lineChartData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data:[89, 34, 43, 54, 28, 74, 93],
        label: 'Registro de materias',
        backgroundColor: '#F88406'
      }
    ]
  }
  lineChartOption = {
    responsive:false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  //Barras
  barChartData = {
    labels: ["Congreso", "FePro", "Presentación Doctoral", "Feria Matemáticas", "T-System"],
    datasets: [
      {
        data:[34, 43, 54, 28, 74],
        label: 'Eventos Académicos',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5',
          '#2AD84A'
        ]
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular - CON DATOS REALES
  pieChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0], // Se actualizarán con datos reales
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  }
  pieChartOption = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  // Doughnut - CON DATOS REALES
  doughnutChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0], // Se actualizarán con datos reales
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  }
  doughnutChartOption = {
    responsive:false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private estadisticasService: EstadisticasService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers(){
    console.log("Iniciando obtención de estadísticas...");

    this.estadisticasService.getTotalUsuarios().subscribe(
      (response)=>{
        console.log("Respuesta recibida del backend:", response);
        console.log("Admins:", response.admins);
        console.log("Maestros:", response.maestros);
        console.log("Alumnos:", response.alumnos);

        this.total_user = response;

        // Actualizar gráficas de usuarios con datos reales
        // Creamos nuevos objetos para forzar la detección de cambios
        this.pieChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data:[response.admins, response.maestros, response.alumnos],
              label: 'Registro de usuarios',
              backgroundColor: [
                '#FCFF44',
                '#F1C8F2',
                '#31E731'
              ]
            }
          ]
        };

        this.doughnutChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data:[response.admins, response.maestros, response.alumnos],
              label: 'Registro de usuarios',
              backgroundColor: [
                '#F88406',
                '#FCFF44',
                '#31E7E7'
              ]
            }
          ]
        };

        console.log("pieChartData actualizado:", this.pieChartData);
        console.log("doughnutChartData actualizado:", this.doughnutChartData);
      }, (error)=>{
        console.error("Error al obtener total de usuarios:", error);
        console.error("Status:", error.status);
        console.error("Message:", error.message);
        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }

}
