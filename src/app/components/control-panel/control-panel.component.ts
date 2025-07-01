import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-control-panel',
  template: `
    <div *ngIf="isOpen" class="modal">
      <h2>Control Panel</h2>
      <label>
        <input type="checkbox" [checked]="isBasePlaneOn" (change)="controlChange.emit('base_plane')" /> Base Plane
      </label>
      <label>
        <input type="checkbox" [checked]="isAxesHelperOn" (change)="controlChange.emit('axes_helper')" /> Axes Helper
      </label>
      <label>
        <input type="checkbox" [checked]="isLiveDetailsOn" (change)="controlChange.emit('live_details')" /> Live Details
      </label>
      <button (click)="fullScreen.emit()">Toggle Fullscreen</button>
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
export class ControlPanelComponent {
  @Input() isBasePlaneOn: boolean;
  @Input() isAxesHelperOn: boolean;
  @Input() isLiveDetailsOn: boolean;
  @Input() isOpen = false;
  @Output() controlChange = new EventEmitter<string>();
  @Output() fullScreen = new EventEmitter<void>();
}
