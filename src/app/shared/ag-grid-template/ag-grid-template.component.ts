import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
    selector: 'app-ag-grid-template',
    standalone: true,
    imports: [CommonModule, AgGridAngular],
    templateUrl: './ag-grid-template.component.html',
    styleUrls: ['./ag-grid-template.component.scss']
})
export class AgGridTemplateComponent {
    columnDefs: ColDef[] = [
        { field: 'make', headerName: 'Make' },
        { field: 'model', headerName: 'Model' },
        { field: 'price', headerName: 'Price' }
    ];

    rowData = [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 }
    ];
}
