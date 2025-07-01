import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  template: `
    <div *ngIf="isOpen" class="modal">
      <h2>Search</h2>
      <button (click)="isOpen = false">Close</button>
      <input
        type="text"
        [(ngModel)]="searchString"
        (ngModelChange)="search.emit(searchString)"
        placeholder="Enter search term"
      />
      <div *ngIf="showLoading">Searching...</div>
      <div *ngFor="let result of results">
        <p>IFC Type: {{ result.type }}</p>
        <p>Express ID: {{ result.expressID }}</p>
        <p *ngIf="result.name">Property Name: {{ result.name }}</p>
        <p *ngIf="result.value">Property Value: {{ result.value }}</p>
      </div>
      <p *ngIf="errorMessage">{{ errorMessage }}</p>
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
    input {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
    }
  `]
})
export class SearchComponent {
  @Input() searchString: string = '';
  @Input() results: any[] = [];
  @Input() errorMessage: string = '';
  @Input() showLoading = false;
  @Input() isOpen = false;
  @Output() search = new EventEmitter<string>();
}
