import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metadata',
  template: `
    <div *ngIf="isOpen" class="modal">
      <h2>IFC Model Metadata</h2>
      <button (click)="isOpen = false">Close</button>
      <h3>File Details</h3>
      <p>Name: {{ ifcFileName }}</p>
      <h3>Application Details</h3>
      <p *ngFor="let detail of ifcApplication">{{ detail.name }}: {{ detail.value || 'N/A' }}</p>
      <h3>Organization Details</h3>
      <p *ngFor="let detail of ifcOrganization">{{ detail.name }}: {{ detail.value || 'N/A' }}</p>
      <h3>Address Details</h3>
      <p *ngFor="let detail of ifcPostalAddress">{{ detail.name }}: {{ detail.value || 'N/A' }}</p>
      <h3>Contact Details</h3>
      <p *ngFor="let detail of ifcTelecomAddress">{{ detail.name }}: {{ detail.value || 'N/A' }}</p>
      <h3>Person Details</h3>
      <p *ngFor="let detail of ifcPerson">{{ detail.name }}: {{ detail.value || 'N/A' }}</p>
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
  `]
})
export class MetadataComponent {
  @Input() ifcFileName: string = '';
  @Input() ifcApplication: any[] = [];
  @Input() ifcOrganization: any[] = [];
  @Input() ifcPostalAddress: any[] = [];
  @Input() ifcTelecomAddress: any[] = [];
  @Input() ifcPerson: any[] = [];
  @Input() isOpen = false;
}
