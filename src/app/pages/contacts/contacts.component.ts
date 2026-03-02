import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

// AG Grid importları
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { ICellRendererAngularComp } from 'ag-grid-angular';

// DİKKAT: Aşağıdaki 3 import senin projendeki dosya yollarına göre değişiklik gösterebilir!
// Kendi yolların (path) neyse onları kullan.
import { ContactDto, ContactsService } from '../../services/contacts.service'; 
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { ContactDialogComponent } from './contact-dialog.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    AgGridAngular,
    TranslateModule
  ],
  templateUrl: './contacts.component.html'
})
export class ContactsComponent implements OnInit {
  // 1. Servisleri Dahil Etme (Inject)
  private svc = inject(ContactsService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  // 2. Değişkenler
  rows: ContactDto[] = [];
  isLoading = true;
  colDefs: ColDef[] = []; 
  
  // AG Grid'in varsayılan sütun ayarları (Sıralama ve Filtreleme açık)
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  // 3. Constructor (Dil ayarları ve sütun dinleyicisi)
  constructor() {
    this.translate.setDefaultLang('tr');
    this.translate.use('tr');

    // Dil her değiştiğinde tablo sütunlarını yeniden çiz
    this.translate.onLangChange.subscribe(() => {
      this.updateTableHeaders();
    });
  }

  ngOnInit() {
    this.load();
  }

  // 4. Dil Değiştirme Fonksiyonu
  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  // 5. Dinamik Sütun Başlıkları ve Butonların Eklenmesi
  updateTableHeaders() {
    this.colDefs = [
      { field: 'id', headerName: 'ID', width: 70 },
      { field: 'firstName', headerName: this.translate.instant('COL_FIRSTNAME') },
      { field: 'lastName', headerName: this.translate.instant('COL_LASTNAME') },
      { field: 'phone', headerName: this.translate.instant('COL_PHONE') },
      { field: 'email', headerName: this.translate.instant('COL_EMAIL') },
      { field: 'address', headerName: this.translate.instant('COL_ADDRESS') },
      { 
        headerName: this.translate.instant('COL_ACTIONS'), 
        field: 'actions',
        cellRenderer: ActionRendererComponent, // Alttaki buton bileşenini kullanıyoruz
        cellRendererParams: {
          // Butonlara basıldığında çalışacak fonksiyonları gönderiyoruz
          onEdit: (row: ContactDto) => this.openCreate(row), 
          onDelete: (row: ContactDto) => this.confirmDelete(row) 
        },
        width: 150,
        sortable: false,
        filter: false
      }
    ];
  }

  // 6. Verileri API'den Çekme
  load() {
    this.isLoading = true;
    this.svc.getAll().subscribe({
      next: (data) => {
        this.rows = [...data];
        this.isLoading = false;
        this.cdr.detectChanges(); // Ekranı zorla güncelle
      },
      error: (err) => {
        console.error('API Hatası:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 7. Ekleme veya Düzenleme Penceresini Açma
  openCreate(row?: ContactDto) {
    const dialogData = {
      mode: row ? 'edit' : 'create',
      value: row ? row : undefined
    };

    const ref = this.dialog.open(ContactDialogComponent, {
      width: '500px',
      data: dialogData 
    });

    ref.afterClosed().subscribe(res => {
      if (res) { 
        
        if (row) {
          this.svc.update(row.id, res).subscribe({
            next: () => {
              this.toast('Kişi başarıyla güncellendi');
              this.load();
            },
            error: () => this.toast('Güncelleme başarısız!', true)
          });
        } else {
          this.svc.create(res).subscribe({
            next: () => {
              this.toast('Yeni kişi başarıyla eklendi');
              this.load(); 
            },
            error: () => this.toast('Ekleme başarısız!', true)
          });
        }
        
      }
    });
  }

  // 8. Silme Onayı ve İşlemi
  confirmDelete(row: ContactDto) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: { message: `${row.firstName} ${row.lastName} silinsin mi?` }
    });

    ref.afterClosed().subscribe((ok: any) => {
      if (ok === true) { // Kesinlikle true dönmesini bekliyoruz
        this.svc.delete(row.id).subscribe({
          next: () => {
            this.toast('Kişi silindi');
            this.load();
          },
          error: () => this.toast('Silme başarısız', true)
        });
      }
    });
  }

  // 9. Bilgi Mesajı (Toast) Fonksiyonu
  toast(msg: string, isError = false) {
    this.snack.open(msg, 'Kapat', {
      duration: 3000,
      panelClass: isError ? ['mat-toolbar', 'mat-warn'] : ['mat-toolbar', 'mat-primary']
    });
  }
}

// =========================================================================
// TABLO İÇİNDEKİ "DÜZENLE" VE "SİL" BUTONLARINI ÇİZEN YARDIMCI BİLEŞEN
// =========================================================================
@Component({
  selector: 'app-action-renderer',
  standalone: true,
  imports: [TranslateModule], // Çeviri pipe'ını kullanabilmek için ekledik
  template: `
    <div style="display: flex; gap: 8px; align-items: center; height: 100%;">
      <button style="cursor: pointer; padding: 2px 8px;" (click)="edit()">
        {{ 'BTN_EDIT' | translate }}
      </button>
      <button style="cursor: pointer; color: red; padding: 2px 8px;" (click)="delete()">
        {{ 'BTN_DELETE' | translate }}
      </button>
    </div>
  `
})
export class ActionRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  edit() {
    if (this.params.onEdit) {
      this.params.onEdit(this.params.data);
    }
  }

  delete() {
    if (this.params.onDelete) {
      this.params.onDelete(this.params.data);
    }
  }
}