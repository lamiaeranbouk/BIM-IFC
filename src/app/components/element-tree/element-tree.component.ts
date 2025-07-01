import { Component, Input } from '@angular/core';
import { IfcType } from '../../models/interfaces';

@Component({
  selector: 'app-element-tree',
  template: `
    <div *ngIf="isOpen" class="modal">
      <h2>Element Tree</h2>
      <button (click)="isOpen = false">Close</button>
      <ul>
        <li *ngFor="let type of types">
          <div>{{ type.type }} ({{ type.expressID }})</div>
          <ul *ngIf="type.children && type.selfExtracted">
            <li *ngFor="let child of type.children">
              {{ child.type }} ({{ child.expressID }})
            </li>
          </ul>
        </li>
      </ul>
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
    ul {
      list-style: none;
      padding-left: 20px;
    }
  `]
})
export class ElementTreeComponent {
  @Input() types: IfcType[] = [];
  @Input() isOpen = false;
}
