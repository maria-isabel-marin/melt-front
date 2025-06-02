// src/app/components/metaphor-identification/metaphor-identification.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { MatTableModule }  from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }   from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { StageService, MetaphorRecord,UploadResult} from '../../services/stage.service';

/**
 * Mock del servicio que llamaría al back-end para procesar un batch y devolver un array de MetaphorRecord.
 * En producción, reemplázalo por un HTTP service real.
 */
function fakeProcessBatch(
  batchText: string,
  promptTokens: number
): Promise<MetaphorRecord[]> {
  return new Promise((resolve) => {
    // Simular 1.5s de demora
    setTimeout(() => {
      // Genera de ejemplo 5 registros "falsos"
      const results: MetaphorRecord[] = Array.from({ length: 5 }).map((_, i) => ({
        expression: `Expression ${i + 1} from batch`,
        sourceDomain: `SourceDom${i + 1}`,
        targetDomain: `TargetDom${i + 1}`,
        conceptualMetaphor: `Conceptual ${i + 1}`,
        type: i % 2 === 0 ? 'Conventional' : 'Novel',
        confirmed: false
      }));
      resolve(results);
    }, 1500);
  });
}

@Component({
  selector: 'app-metaphor-identification',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './metaphor-identification.html',
  styleUrls: ['./metaphor-identification.scss']
})
export class MetaphorIdentification implements OnInit {
  /** 1) Recibir de StageService el array de batches (texto fragmentado). */
  batches: string[] = []; // se inyecta en ngOnInit() desde StageService (o passedData)
  totalPages = 0;
  currentPageIndex = 0;
  processingCode = '';
  promptTokens: number = 0;

  /** 2) Estado de procesamiento */
  isProcessing = false;
  batchProgressValue = 0;

  /** 3) Metáforas devueltas para la página actual */
  metaphorsForPage: MetaphorRecord[] = [];

  /** 4) DataSource + columnas para material-table */
  displayedColumns: string[] = [
    'select',
    'expression',
    'targetDomain',
    'sourceDomain',
    'conceptualMetaphor',
    'type'
  ];
  dataSource: MatTableDataSource<MetaphorRecord> = new MatTableDataSource<MetaphorRecord>([]);

  /** 5) Conjunto de filas seleccionadas en la página actual */
  selection: Set<MetaphorRecord> = new Set<MetaphorRecord>();

  /** 6) Lista global de metáforas confirmadas (hasta ahora) – que alimentará el StageService */
  confirmedGlobal: MetaphorRecord[] = [];

  constructor(
    private stageService: StageService,
    private snackBar: MatSnackBar
  ) {this.stageService.data$.subscribe((data: UploadResult | null) => {
      if (data) {
        this.batches = data.batches;
        this.promptTokens = data.promptTokens;
      }
    });}

  ngOnInit(): void {
    // 1) Traer batches (que DocumentUpload almacenó en StageService):
    //    asumimos que StageService los guardó en algún lugar (podría ser un BehaviorSubject).
    //    En nuestro ejemplo, simularé que StageService ya expone un método getBatches().
    //    Si no está implementado, se debe almacenar el array this.batches en StageService
    //    al terminar DocumentUpload. Aquí lo "tomamos":

    // Por simplicidad, supongamos:
    this.batches = this.stageService.getBatchesArray();
    if (!this.batches || this.batches.length === 0) {
      this.snackBar.open('No batches available. Please upload a document first.', 'Close', 
        { verticalPosition: 'top',horizontalPosition: 'center',panelClass: ['custom-snackbar'], duration: 3000 });
      return;
    }

    // Simulamos 10 batches si es que no existen:
    if (this.batches.length === 0) {
      this.batches = Array(10).fill(''); // placeholder vacío, en producción vendría del servicio
    }
    this.totalPages = this.batches.length;

    // 2) Traer el código compartido
    this.processingCode = this.stageService.getProcessingCode();
  }

  /** Recalcular dataSource cada vez que metaphorsForPage cambia */
  private updateTableData(): void {
    this.dataSource.data = this.metaphorsForPage;
    this.selection.clear();
  }

  /** 3) Procesar el batch actual, llamar al back-end (fake) */
  async onProcessCurrentBatch() {
    this.isProcessing = true;
    this.batchProgressValue = 0;
    this.metaphorsForPage = [];
    this.updateTableData();

    // Simular progreso incremental mientras esperamos
    const progressInterval = setInterval(() => {
      if (this.batchProgressValue < 90) {
        this.batchProgressValue += 10;
      }
    }, 200);

    try {
      const promptTokens =  // en realidad, vendría de StageService o de un campo de config
        // Ejemplo por defecto:
        200;
      const batchText = this.batches[this.currentPageIndex] || '';
      const result: MetaphorRecord[] = await fakeProcessBatch(batchText, promptTokens);

      clearInterval(progressInterval);
      this.batchProgressValue = 100;

      this.metaphorsForPage = result;
      this.updateTableData();
      this.isProcessing = false;
    } catch (err: any) {
      clearInterval(progressInterval);
      this.isProcessing = false;
      this.snackBar.open(`Error processing batch: ${err.message}`, 'Close', { duration: 3000 });
    }
  }

  /** 4) Selección de checkbox “Select All” */
  isAllSelected(): boolean {
    return this.selection.size === this.metaphorsForPage.length && this.metaphorsForPage.length > 0;
  }

  isPartialSelected(): boolean {
    return this.selection.size > 0 && this.selection.size < this.metaphorsForPage.length;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.metaphorsForPage.forEach(row => this.selection.add(row));
    }
  }

  toggleSelection(row: MetaphorRecord) {
    if (this.selection.has(row)) {
      this.selection.delete(row);
    } else {
      this.selection.add(row);
    }
  }

  /** 5) “Accept Selected”: marca confirmed=true para los seleccionados (y false para los no seleccionados) */
  onAcceptSelection() {
    // Primero, todos false en la página actual:
    this.metaphorsForPage.forEach(r => (r.confirmed = false));

    // Luego, los seleccionados => confirmed=true:
    this.selection.forEach(r => (r.confirmed = true));

    // Finalmente, agregarlos a la lista global (solo los confirmados):
    const confirmedNow = this.metaphorsForPage.filter(r => r.confirmed);
    this.confirmedGlobal.push(...confirmedNow);

    // Guardamos la lista global en StageService:
    this.stageService.addConfirmedMetaphors(confirmedNow);

    // Feedback:
    this.snackBar.open('Selected metaphors marked as confirmed.', 'Close', { duration: 2000 });
  }

  /** ¿Alguna fila de la página actual está ya confirmada? */
  hasAnyConfirmedThisPage(): boolean {
    return this.metaphorsForPage.some(r => r.confirmed);
  }

  /** 6) Exportar seleccionado a Excel (CSV simplificado) */
  exportSelected() {
    const rows = Array.from(this.selection);
    this.generateCsvExport(rows, 'selected_metaphors.csv');
  }

  /** 7) Exportar todo (la página actual) */
  exportAll() {
    this.generateCsvExport(this.metaphorsForPage, 'all_metaphors.csv');
  }

  /** Función auxiliar para generar CSV y forzar descarga */
  private generateCsvExport(records: MetaphorRecord[], filename: string) {
    if (!records || records.length === 0) {
      this.snackBar.open('No records to export.', 'Close', { duration: 2000 });
      return;
    }
    const header = [
      'Expression',
      'TargetDomain',
      'SourceDomain',
      'ConceptualMetaphor',
      'Type',
      'Confirmed'
    ];
    const csvRows = [header.join(',')];

    records.forEach(r => {
      const row = [
        `"${r.expression.replace(/"/g, '""')}"`,
        `"${r.targetDomain}"`,
        `"${r.sourceDomain}"`,
        `"${r.conceptualMetaphor}"`,
        `"${r.type}"`,
        `"${r.confirmed}"`
      ].join(',');
      csvRows.push(row);
    });

    const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    link.click();
    URL.revokeObjectURL(url);
  }

  /** 8) “Send to DB” -> diálogo de confirmación, luego se envía al back */
  onSendToDB() {
    const toSend: MetaphorRecord[] = this.metaphorsForPage.filter(r => r.confirmed);

    if (toSend.length === 0) {
      this.snackBar.open('No confirmed records on this page to send.', 'Close', { duration: 2000 });
      return;
    }

    if (!confirm('You are about to send ONLY selected records from this page to the database. Continue?')) {
      return;
    }

    // Simular envío a back:
    this.isProcessing = true;
    this.batchProgressValue = 0;

    const progressInterval = setInterval(() => {
      if (this.batchProgressValue < 90) {
        this.batchProgressValue += 10;
      }
    }, 200);

    // Simular delay de 1.3s
    setTimeout(() => {
      clearInterval(progressInterval);
      this.batchProgressValue = 100;
      this.isProcessing = false;
      this.snackBar.open(`Sent ${toSend.length} records to DB with code ${this.processingCode}`, 'Close', { duration: 3000 });
    }, 1300);
  }

  /** 9) Navegación entre páginas */
  prevPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.resetPageState();
    }
  }
  nextPage() {
    if (this.currentPageIndex < this.totalPages - 1) {
      this.currentPageIndex++;
      this.resetPageState();
    }
  }

  private resetPageState() {
    this.metaphorsForPage = [];
    this.dataSource.data = [];
    this.selection.clear();
    this.batchProgressValue = 0;
  }

  /** 10) “Finish identification” */
  onFinishIdentification() {
    const allConfirmedList = this.stageService.getAllConfirmedMetaphors();
    if (!allConfirmedList || allConfirmedList.length === 0) {
      alert('No metaphors have been confirmed yet. Cannot proceed to the next MELT stage.');
      return;
    }
    if (!confirm('Are you sure you want to finish this stage?')) {
      return;
    }
    // Se asume que la siguiente etapa es “scenario-identification”
    this.stageService.setStage('scenario-identification');
    this.snackBar.open('Metaphor identification stage finished. Proceeding to Scenario Identification.', 'Close', { duration: 3000 });
  }
}
