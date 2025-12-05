import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface EliminarUsuarioData {
  id: number;
  nombre: string;
  tipo: 'administrador' | 'maestro' | 'alumno';
}

@Component({
  selector: 'app-eliminar-usuario-modal',
  templateUrl: './eliminar-usuario-modal.component.html',
  styleUrls: ['./eliminar-usuario-modal.component.scss']
})
export class EliminarUsuarioModalComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<EliminarUsuarioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EliminarUsuarioData
  ) { }

  ngOnInit(): void {
  }

  public cerrar_modal() {
    this.dialogRef.close({ isDelete: false });
  }

  public confirmarEliminacion() {
    // Solo confirma que el usuario quiere eliminar
    this.dialogRef.close({ isDelete: true });
  }
}
