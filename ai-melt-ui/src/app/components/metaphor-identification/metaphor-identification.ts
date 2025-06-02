// src/app/components/metaphor-identification/metaphor-identification.ts

import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule, MatTableDataSource }     from '@angular/material/table';
import { MatCheckboxModule }  from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule }      from '@angular/material/card';
import { SelectionModel }     from '@angular/cdk/collections';

import { StageService } from '../../services/stage.service';
import { Metaphor }     from '../../models/metaphor.model';


/** Componente para el diálogo de confirmación genérico */
@Component({
  selector: 'confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card class="confirm-card">
      <mat-card-content>
        <h2>{{ data.title }}</h2>
        <p>{{ data.message }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="onConfirm()">OK</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .confirm-card {
      max-width: 400px;
      margin: auto;
      padding: 1rem;
    }
    mat-card-actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class ConfirmDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string },
    private dialogRef: MatDialogRef<ConfirmDialog>
  ) {}

  onConfirm() {
    this.dialogRef.close(true);
  }
  onCancel() {
    this.dialogRef.close(false);
  }
}


@Component({
  selector: 'app-metaphor-identification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule,
    MatCardModule
  ],
  templateUrl: './metaphor-identification.html',
  styleUrls: ['./metaphor-identification.scss']
})
export class MetaphorIdentification implements OnInit, AfterViewInit {
  /** Batches y configuración que vienen de DocumentUpload */
  batches: string[] = [];
  promptTokens = 100;

  /** El código generado en DocumentUpload */
  processingCode = '';

  /** DataSource para la tabla (grid) de la página actual */
  dataSource = new MatTableDataSource<Metaphor>([]);

  /** Columnas de la tabla */
  displayedColumns: string[] = [
    'select',
    'expression',
    'targetDomain',
    'sourceDomain',
    'conceptualMetaphor',
    'type'
  ];

  /** Control de selección (checkboxes) */
  selection = new SelectionModel<Metaphor>(true, []);

  /** Progreso de la llamada al backend (0‒100) */
  batchProgressValue = 0;

  /** Para deshabilitar botones mientras se procesa */
  isProcessing = false;

  /** Paginador: una página = un batch */
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  currentPageIndex = 0;     // Índice actual
  totalPages = 0;           // Total de páginas (= batches.length)

  constructor(
    private stageService: StageService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // 1) Leer batches y promptTokens de StageService
    this.batches = this.stageService.getBatches() || [];
    this.promptTokens = this.stageService.getPromptTokens() || 100;

    // 2) Leer processingCode
    this.processingCode = this.stageService.getProcessingCode() || '';

    // 3) Configurar totalPages
    this.totalPages = this.batches.length;

    // 4) Inicializar dataSource vacío
    this.dataSource.data = [];
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /** Devuelve únicamente las metáforas de la página actual (batch actual) */
  get metaphorsForPage(): Metaphor[] {
    return this.dataSource.data;
  }

  /** Se llama al hacer clic en “Process” */
  onProcessCurrentBatch() {
    if (this.batches.length === 0) {
      return;
    }
    this.isProcessing = true;
    this.batchProgressValue = 0;
    this.dataSource.data = [];
    this.selection.clear();

    const batchText = this.batches[this.currentPageIndex];

    // Simulación de llamada "asíncrona" al backend (cada 200ms actualiza progreso)
    const totalSteps = 10;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      this.batchProgressValue = Math.round((step / totalSteps) * 100);

      if (step >= totalSteps) {
        clearInterval(timer);
        // Simula datos recibidos del backend:
        const received = this.mockFetchMetaphors(batchText);

        // Inicializar confirmed=false en cada uno:
        received.forEach(m => m.confirmed = false);

        // Ponerlos en la tabla
        this.dataSource.data = received;
        this.isProcessing = false;
      }
    }, 200);
  }

  /** Simulación de “fetch” desde el backend */
  private mockFetchMetaphors(_batch: string): Metaphor[] {
    return [
      {
        expression: 'life is a journey',
        sourceDomain: 'journey',
        targetDomain: 'life',
        conceptualMetaphor: 'LIFE IS A JOURNEY',
        type: 'conventional',
        confirmed: false
      },
      {
        expression: 'the heart of the matter',
        sourceDomain: 'heart',
        targetDomain: 'matter',
        conceptualMetaphor: 'MATTER HAS A HEART',
        type: 'novel',
        confirmed: false
      }
    ];
  }

  /** Seleccionar/des-seleccionar todas las filas del grid */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  /** Comprueba si todas las filas disponibles están seleccionadas */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  /** Comprueba si hay selección parcial */
  isPartialSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected > 0 && numSelected < numRows;
  }

  /** Alterna selección de un row individual (clic en checkbox de fila) */
  toggleSelection(row: Metaphor) {
    this.selection.toggle(row);
  }

  /** Comprueba si en la página actual existe al menos una metáfora ya confirmada */
  hasAnyConfirmedThisPage(): boolean {
    return this.dataSource.data.some(m => m.confirmed);
  }

  /** “Accept Selected”: marca confirmed en los seleccionados de esta página y los añade al global */
  onAcceptSelection() {
    // 1) Anula confirmados en la página actual
    this.dataSource.data.forEach(m => m.confirmed = false);

    // 2) Confirma únicamente los seleccionados
    this.selection.selected.forEach(m => m.confirmed = true);

    // 3) Filtra los confirmados en esta página
    const confirmedInPage = this.dataSource.data.filter(m => m.confirmed);

    // 4) Agrega estos a la lista global en StageService
    this.stageService.appendConfirmed(confirmedInPage);

    this.snackBar.open(
      `${confirmedInPage.length} metaphors accepted this batch.`,
      'Close',
      { duration: 3000 }
    );
  }

  /** Exportar sólo los seleccionados a Excel/XLSX */
  exportSelected() {
    import('xlsx').then(XLSX => {
      const selected = this.dataSource.data.filter(m => this.selection.isSelected(m));
      if (selected.length === 0) {
        this.snackBar.open('No metaphors selected for export.', 'Close', { duration: 3000 });
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(
        selected.map(m => ({
          Expression: m.expression,
          'Target Domain': m.targetDomain,
          'Source Domain': m.sourceDomain,
          'Conceptual Metaphor': m.conceptualMetaphor,
          Type: m.type
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'SelectedMetaphors');
      const wbout: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      import('file-saver').then(FileSaver => {
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        FileSaver.saveAs(blob, `metaphors_${this.processingCode}_selection.xlsx`);
      });
    });
  }

  /** Exportar todas las filas de la página actual a Excel */
  exportAll() {
    import('xlsx').then(XLSX => {
      const allData = this.dataSource.data;
      if (allData.length === 0) {
        this.snackBar.open('No metaphors to export.', 'Close', { duration: 3000 });
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(
        allData.map(m => ({
          Expression: m.expression,
          'Target Domain': m.targetDomain,
          'Source Domain': m.sourceDomain,
          'Conceptual Metaphor': m.conceptualMetaphor,
          Type: m.type
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'AllMetaphors');
      const wbout: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      import('file-saver').then(FileSaver => {
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        FileSaver.saveAs(blob, `metaphors_${this.processingCode}_all.xlsx`);
      });
    });
  }

  /** “Send to DB”: abre diálogo, confirma y envía seleccionados + processingCode */
  onSendToDB() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Confirm Send to Database',
        message: 'Selected metaphors will be sent to the database. Continue?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const toSend = this.dataSource.data.filter(m => m.confirmed);
        if (toSend.length === 0) {
          this.snackBar.open('No confirmed metaphors to send.', 'Close', { duration: 3000 });
          return;
        }

        // Simulación de envío a BD con barra de progreso
        this.batchProgressValue = 0;
        let step = 0;
        const totalSteps = 10;
        const timer = setInterval(() => {
          step++;
          this.batchProgressValue = Math.round((step / totalSteps) * 100);
          if (step >= totalSteps) {
            clearInterval(timer);
            // Aquí, en producción, se invocaría un servicio real
            this.snackBar.open(
              `${toSend.length} confirmed metaphors sent to DB.`,
              'Close',
              { duration: 3000 }
            );
          }
        }, 200);
      }
    });
  }

  /** Navegar a la página/batch anterior */
  prevPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.resetPageState();
    }
  }

  /** Navegar a la página/batch siguiente */
  nextPage() {
    if (this.currentPageIndex < this.totalPages - 1) {
      this.currentPageIndex++;
      this.resetPageState();
    }
  }

  /** Resetea el estado de la tabla/selección cuando se cambia de página */
  private resetPageState() {
    this.isProcessing = false;
    this.batchProgressValue = 0;
    this.dataSource.data = [];
    this.selection.clear();
  }

  /** “Finish Identification”: verifica que haya metáforas confirmadas globales */
  onFinishIdentification() {
    const allConfirmed = this.stageService.getConfirmedMetaphors();
    if (allConfirmed.length === 0) {
      this.snackBar.open(
        'No confirmed metaphors. Cannot proceed to next stage.',
        'Close',
        { duration: 4000 }
      );
      return;
    }

    // Diálogo de confirmación
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Finalize Metaphor Identification',
        message: 'Are you sure you want to finish this stage?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Avanza a siguiente etapa
        this.stageService.setStage('scenario-identification');
        this.snackBar.open(
          'Metaphor Identification finished. You may proceed.',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }
}
