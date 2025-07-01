import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IfcCategory } from '../../models/interfaces';

@Component({
  selector: 'app-element-list',
  template: `
    <div *ngIf="isOpen" class="modal">
      <h2>Element List</h2>
      <button (click)="isOpen = false">Close</button>
      <div *ngFor="let type of types; let i = index">
        <label>
          <input
            type="checkbox"
            [checked]="type.checked"
            (change)="onCheckboxChange(type, $event.target.checked)"
          />
          {{ type.type }}
        </label>
      </div>
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
export class ElementListComponent {
  @Input() types: any[] = [];
  @Input() categories: IfcCategory[] = [];
  @Input() isOpen = false;
  @Output() checkboxChange = new EventEmitter<{ category: IfcCategory, checked: boolean }>();

  onCheckboxChange(type: any, checked: boolean) {
    const category = this.categories.find(cat => cat.type === type.type);
    if (category) {
      this.checkboxChange.emit({ category, checked });
    }
  }
}
