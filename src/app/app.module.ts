import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {EngineComponent} from './components/engine/engine.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { ElementListComponent } from './components/element-list/element-list.component';
import { ElementDetailsComponent } from './components/element-details/element-details.component';
import { ElementTreeComponent } from './components/element-tree/element-tree.component';
import { SearchComponent } from './components/search/search.component';
import { MetadataComponent } from './components/metadata/metadata.component';

@NgModule({
  declarations: [
    AppComponent,
    EngineComponent,
    ControlPanelComponent,
    ElementListComponent,
    ElementDetailsComponent,
    ElementTreeComponent,
    SearchComponent,
    MetadataComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
