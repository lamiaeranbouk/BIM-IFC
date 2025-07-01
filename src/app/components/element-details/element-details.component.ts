import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-element-details',
  template: `
    <div *ngIf="isOpen" class="modal">
      <h2>Element Details ({{ elementIfcType }})</h2>
      <button (click)="isOpen = false">Close</button>
      <table>
        <tr>
          <th>Property</th>
          <th>Value</th>
        </tr>
        <tr *ngFor="let detail of details">
          <td>{{ detail.name }}</td>
          <td>{{ detail.value || 'N/A' }}</td>
        </tr>
      </table>
    </div>
  `,
  styles: [`
    .modal {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      padding: 20px;
      border: 1px solid #ccc;
      z-index: 1000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
    }
  `]
})
export class ElementDetailsComponent {
  @Input() details: any[] = [];
  @Input() elementIfcType: string = '';
  @Input() isOpen = false;
}
