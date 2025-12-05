import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface EliminarEventoData {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-eliminar-evento-modal',
  templateUrl: './eliminar-evento-modal.component.html',
  styleUrls: ['./eliminar-evento-modal.component.scss']
})
export class EliminarEventoModalComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<EliminarEventoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EliminarEventoData
  ) { }

  ngOnInit(): void {
  }

  public cerrar_modal() {
    this.dialogRef.close({ isDelete: false });
  }

  public confirmarEliminacion() {
    // Confirma que el usuario quiere eliminar
    this.dialogRef.close({ isDelete: true });
  }
}
